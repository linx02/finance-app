import re
import datetime
import pymupdf4llm
from pyzbar.pyzbar import decode
from PIL import Image, ImageEnhance, ImageFilter
import io
import fitz

MONTH_MAP = {
    'januari': 1,
    'februari': 2,
    'mars': 3,
    'april': 4,
    'maj': 5,
    'juni': 6,
    'juli': 7,
    'augusti': 8,
    'september': 9,
    'oktober': 10,
    'november': 11,
    'december': 12
}

class InvoiceReader:
    def __init__(self, filename: str):
        
        qr_data = QRCodeExtractor(filename)

        if qr_data.qr_data_list:
            tmp = qr_data.qr_data_list[0]
            self.data = {
                'amount': tmp['due'] if tmp['due'] else None,
                'bankgiro': tmp['acc'] if tmp['pt'] == 'BG' else None,
                'plusgiro': tmp['acc'] if tmp['pt'] == 'PG' else None,
                'ocr': tmp['iref'] if int(tmp['iref']) else None,
                'due_date': datetime.datetime.strptime(tmp['ddt'], '%Y%m%d') if tmp['ddt'] else None
            }
        else:
            self.data = pymupdf4llm.to_markdown(filename)

    @classmethod
    def read(cls, filename: str):
        """
        Factory method to instantiate the correct issuer class.
        """
        instance = cls(filename)
        return instance.identify_issuer()

    def identify_issuer(self):
        """
        Identify the issuer of the document and return the correct class.
        """

        if type(self.data) == str:
            if 'www.americanexpress.se' in self.data:
                return AmericanExpress(self.data)
            if 'Länsförsäkringar' in self.data:
                return Lansforsakringar(self.data)
            if 'Transportstyrelsen' in self.data:
                return Transportstyrelsen(self.data)
            if 'Telenor' in self.data:
                return Telenor(self.data)
        return Fallback(self.data)
        

class Issuer():
    def __init__(self, patterns: list, format_functions: dict, data: str | dict):
        self.name = self.__class__.__name__
        self.data = data
        if type(self.data) != dict:
            self.patterns = patterns
            self.format_functions = format_functions
            self.data = self.extract_data(self.data)
            self.data = self.format(self.data)

    def format(self, data: dict) -> dict:
        # print(data) # Debug
        for key, value in data.items():
            if key in self.format_functions:
                data[key] = self.format_functions[key](value)
        return data

    def extract_data(self, text: str) -> dict:
        data = {}
        for key, pattern in self.patterns.items():
            match = pattern.search(text)
            if match:
                data[key] = match.group(0)
        return data

class AmericanExpress(Issuer):
    def __init__(self, text: str):
        self.patterns = {
            'amount': re.compile(r'Fakturans\s+saldo\s+(\d{1,3}(?:\.\d{3})*,\d{2})'),
            'bankgiro': re.compile(r'Bankgiro:\s*(\d{4}-\d{4})'),
            'ocr': re.compile(r'OCR:\s*(\d{10,20})'),
            'due_date': re.compile(r'oss\stillhanda\sden\s(\d{2}\.\d{2}\.\d{2})'),
        }

        self.format_functions = {
            'bankgiro': lambda data: data.lower().replace('bankgiro:', '').strip(),
            'ocr': lambda data: int(data.replace('OCR: ', '').replace(' ', '')),
            'amount': lambda data: float(data.replace('Fakturans saldo', '').strip().replace('.', '').replace(',', '.')),
            'due_date': lambda data: datetime.datetime.strptime(data.replace('oss tillhanda den', '').strip(), '%d.%m.%y')
        }

        super().__init__(self.patterns, self.format_functions, text)

class Lansforsakringar(Issuer):
    def __init__(self, text: str):
        self.patterns = {
            'amount': re.compile(r'Summa\satt\sbetala\s(\d{1,3}(?:\s?\d{3})*)'),
            'bankgiro': re.compile(r'(\d{3}-\d{4})\sLänsförsäkringar'),
            'ocr': re.compile(r'OCR-nummer\s+(\d{10,20})'),
            'due_date': re.compile(r'senast\s(\d{4}-\d{2}-\d{2})'),
        }

        self.format_functions = {
            'bankgiro': lambda data: data.replace('Länsförsäkringar', '').strip(),
            'ocr': lambda data: int(data.replace('OCR-nummer', '').strip()),
            'amount': lambda data: float(data.replace('Summa att betala', '').replace(' ', '').strip().replace('.', '').replace(',', '.')),
            'due_date': lambda data: datetime.datetime.strptime(data.replace('senast', '').strip(), '%Y-%m-%d')
        }

        super().__init__(self.patterns, self.format_functions, text)

class Transportstyrelsen(Issuer):
    def __init__(self, text: str):
        self.patterns = {
            'amount': re.compile(r'Summa\satt\sbetala\s(\d+)'),
            'bankgiro': re.compile(r'(\d{3}-\d{4})\swww\.transportstyrelsen\.se'),
            'ocr': re.compile(r'OCR-nummer\s+(\d{10,20})'),
            'due_date': re.compile(r'senast\s(\d{4}-\d{2}-\d{2})'),
        }

        self.format_functions = {
            'bankgiro': lambda data: data.replace('www.transportstyrelsen.se', '').strip(),
            'ocr': lambda data: int(data.replace('OCR-nummer', '').strip()),
            'amount': lambda data: float(data.replace('Summa att betala', '').strip()),
            'due_date': lambda data: datetime.datetime.strptime(data.replace('senast', '').strip(), '%Y-%m-%d')
        }

        super().__init__(self.patterns, self.format_functions, text)

class Telenor(Issuer):
    def __init__(self, text: str):
        self.patterns = {
            'amount': re.compile(r'Summa\satt\sbetala\s(\d{1,3}(?:\.\d{3})*,\d{2})'),
            'bankgiro': re.compile(r'(\d{4}-\d{4})\sTelenor\sSverige\sAB'),
            'ocr': re.compile(r'OCR-nummer:\s*#\s*(\d{10,20})'),
            'due_date': re.compile(r'oss\stillhanda\s(\d{1,2})\s([a-zA-Z]+)\s(\d{4})'),
        }

        self.format_functions = {
            'bankgiro': lambda data: data.replace('Telenor Sverige AB', '').strip(),
            'ocr': lambda data: int(data.replace('OCR-nummer:', '').replace('#', '').strip()),
            'amount': lambda data: float(data.replace('Summa att betala', '').replace(',', '.').strip()),
            'due_date': lambda data: datetime.datetime.strptime(data.replace('oss tillhanda', '').replace(data.split()[3], str(MONTH_MAP[data.split()[3]])).strip().replace(' ', '-'), '%d-%m-%Y')
        }

        super().__init__(self.patterns, self.format_functions, text)

class Fallback(Issuer):
    def __init__(self, text: str):
        self.patterns = {
            'ocr': re.compile(r'#\s*(\d{10,20})\s+#'),
            'amount': re.compile(r'#\s*(\d{1,3}\s+\d{2})\s'),
            'bankgiro': re.compile(r'>\s*(\d{7}|\d{3}-\d{4})')
        }

        self.format_functions = {
            'amount': lambda data: float('.'.join((data.replace('#', '').strip().split(' ')[:2]))) if data else None,
            'ocr': lambda data: int(data.replace('#', '').strip()) if data else None,
            'bankgiro': lambda data: data.replace('>', '').strip()[:3] + '-' + data.replace('>', '').strip()[3:] if data else None,
        }

        super().__init__(self.patterns, self.format_functions, text)

class QRCodeExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.qr_data_list = []
        self.extract_qr_code()

    def extract_qr_code(self):
        images = self.extract_images_from_pdf(self.pdf_path)
        self.qr_data_list = self.decode_qr_from_images(images)
        if not self.qr_data_list:
            # Try rendering pages if no QR code found in images
            self.qr_data_list = self.decode_qr_from_pdf_pages(self.pdf_path)

    def extract_images_from_pdf(self, pdf_path):
        images = []
        pdf_file = fitz.open(pdf_path)
        for page_index in range(len(pdf_file)):
            page = pdf_file[page_index]
            image_list = page.get_images(full=True)
            for img_index, img in enumerate(image_list, start=1):
                xref = img[0]
                base_image = pdf_file.extract_image(xref)
                image_bytes = base_image["image"]
                image = Image.open(io.BytesIO(image_bytes))
                images.append(image)
        return images

    def preprocess_image(self, img):
        # Grayscale conversion
        img_gray = img.convert('L')
        # Contrast enhancement
        enhancer = ImageEnhance.Contrast(img_gray)
        img_contrasted = enhancer.enhance(2.0)
        # Thresholding
        threshold = 128
        img_binarized = img_contrasted.point(lambda p: p > threshold and 255)
        # Median filter
        img_filtered = img_binarized.filter(ImageFilter.MedianFilter(size=3))
        return img_filtered

    def decode_qr_from_images(self, images):
        qr_data_list = []
        for img in images:
            img_preprocessed = self.preprocess_image(img)
            decoded_objects = decode(img_preprocessed)
            for obj in decoded_objects:
                if obj.type == 'QRCODE':
                    qr_data = obj.data.decode('utf-8')
                    qr_data_list.append(eval(qr_data))
        return qr_data_list if qr_data_list else None

    def decode_qr_from_pdf_pages(self, pdf_path):
        pdf_file = fitz.open(pdf_path)
        qr_data_list = []
        for page_index in range(len(pdf_file)):
            page = pdf_file[page_index]
            zoom = 3  # Increase zoom factor
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            img = Image.open(io.BytesIO(pix.tobytes()))
            img_preprocessed = self.preprocess_image(img)
            decoded_objects = decode(img_preprocessed)
            for obj in decoded_objects:
                if obj.type == 'QRCODE':
                    qr_data = obj.data.decode('utf-8')
        return qr_data_list if qr_data_list else None