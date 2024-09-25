# functions.py

import os
from werkzeug.utils import secure_filename
from models import db, Invoice, Expense, Income, Transaction, Email
from services.invoice import InvoiceReader
from services.transactions import TransactionService
from services.notify import send_discord_notification
from services.emails import EmailService
from flask import current_app
from datetime import datetime
import uuid
import base64
import json

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

transaction_service = TransactionService()

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_invoice_file(file):
    if file.filename == '':
        return {'message': 'No file selected'}, 400

    if file and allowed_file(file.filename):
        filename = secure_filename(uuid.uuid4().hex + '.pdf')
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Process the invoice using your InvoiceReader
        invoice_data = InvoiceReader.read(filepath)

        # Create a new Invoice object and save it to the database
        new_invoice = Invoice(
            issuer=invoice_data.name,
            amount=invoice_data.data.get('amount', 0.0),
            ocr=str(invoice_data.data.get('ocr', '')),
            bankgiro=invoice_data.data.get('bankgiro', ''),
            plusgiro=invoice_data.data.get('plusgiro', ''),
            due_date=invoice_data.data.get('due_date'),
            filename=filename
        )
        db.session.add(new_invoice)
        db.session.commit()



        return {'message': 'Invoice uploaded and processed successfully'}, 201
    else:
        return {'message': 'Allowed file types are pdf'}, 400

def manual_invoice(data):
    new_invoice = Invoice(
        issuer=data.get('issuer'),
        amount=data.get('amount'),
        ocr=data.get('ocr'),
        bankgiro=data.get('bankgiro'),
        plusgiro=data.get('plusgiro'),
        due_date=datetime.strptime(data.get('due_date'), '%Y-%m-%d').date()
    )
    db.session.add(new_invoice)
    db.session.commit()

    return {'message': 'Invoice created successfully'}, 201

def get_all_invoices():
    invoices = Invoice.query.all()
    return [invoice.to_dict() for invoice in invoices]

def get_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        invoice_dict = invoice.to_dict()
        filename = secure_filename(invoice_dict.get('filename'))
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if os.path.exists(filepath):
            with open(filepath, 'rb') as f:
                pdf_data = f.read()
            pdf_data = base64.b64encode(pdf_data).decode('utf-8')
            invoice_dict['pdf_data'] = pdf_data
        else:
            invoice_dict['pdf_data'] = None
        
        return invoice_dict
    else:
        return {'message': 'Invoice not found'}, 404

def delete_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        filename = secure_filename(invoice.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        if os.path.exists(filepath):
            os.remove(filepath)
        db.session.delete(invoice)
        db.session.commit()
        return {'message': f'Invoice {invoice_id} deleted'}, 200
    else:
        return {'message': 'Invoice not found'}, 404

def create_expense(data):
    new_expense = Expense(
        category=data.get('category'),
        description=data.get('description'),
        amount=data.get('amount'),
        date=datetime.strptime(data.get('date'), '%Y-%m-%d').date()
    )
    db.session.add(new_expense)
    db.session.commit()
    return {'message': 'Expense created successfully'}, 201

def get_all_expenses():
    expenses = Expense.query.all()
    return [expense.to_dict() for expense in expenses]

def get_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if expense:
        return expense.to_dict()
    else:
        return {'message': 'Expense not found'}, 404

def delete_expense(expense_id):
    expense = Expense.query.get(expense_id)
    if expense:
        db.session.delete(expense)
        db.session.commit()
        return {'message': f'Expense {expense_id} deleted'}, 200
    else:
        return {'message': 'Expense not found'}, 404

def create_income(data):
    new_income = Income(
        source=data.get('source'),
        description=data.get('description'),
        amount=data.get('amount'),
        date=datetime.strptime(data.get('date'), '%Y-%m-%d').date()
    )
    db.session.add(new_income)
    db.session.commit()
    return {'message': 'Income created successfully'}, 201

def get_all_incomes():
    incomes = Income.query.all()
    return [income.to_dict() for income in incomes]

def get_income(income_id):
    income = Income.query.get(income_id)
    if income:
        return income.to_dict()
    else:
        return {'message': 'Income not found'}, 404

def delete_income(income_id):
    income = Income.query.get(income_id)
    if income:
        db.session.delete(income)
        db.session.commit()
        return {'message': f'Income {income_id} deleted'}, 200
    else:
        return {'message': 'Income not found'}, 404

def update_invoice(invoice_id, data):
    invoice = Invoice.query.get(invoice_id)
    if invoice:
        # Update fields if they are provided in data
        for field in ['issuer', 'amount', 'ocr', 'bankgiro', 'plusgiro', 'due_date', 'status']:
            if field in data:
                if field == 'due_date' and data[field]:
                    # Parse date string to date object if necessary
                    if isinstance(data[field], str):
                        try:
                            invoice.due_date = datetime.strptime(data[field], '%Y-%m-%d').date()
                        except ValueError:
                            return {'message': 'Invalid date format. Use YYYY-MM-DD.'}, 400
                    else:
                        invoice.due_date = data[field]
                else:
                    setattr(invoice, field, data[field])
        db.session.commit()
        return {'message': f'Invoice {invoice_id} updated'}, 200
    else:
        return {'message': 'Invoice not found'}, 404

def update_expense(expense_id, data):
    expense = Expense.query.get(expense_id)
    if expense:
        # Update fields if they are provided in data
        for field in ['category', 'description', 'amount', 'date']:
            if field in data:
                if field == 'date' and data[field]:
                    # Parse date string to date object if necessary
                    if isinstance(data[field], str):
                        try:
                            expense.date = datetime.strptime(data[field], '%Y-%m-%d').date()
                        except ValueError:
                            return {'message': 'Invalid date format. Use YYYY-MM-DD.'}, 400
                    else:
                        expense.date = data[field]
                else:
                    setattr(expense, field, data[field])
        db.session.commit()
        return {'message': f'Expense {expense_id} updated'}, 200
    else:
        return {'message': 'Expense not found'}, 404

def get_statistics():
    total_income = db.session.query(db.func.sum(Income.amount)).scalar()
    total_expenses = db.session.query(db.func.sum(Expense.amount)).scalar()
    total_invoices = db.session.query(db.func.count(Invoice.id)).scalar()
    total_invoices_amount = db.session.query(db.func.sum(Invoice.amount)).scalar()
    balance = get_balance()
    return {
        'total_income': total_income,
        'total_expenses': total_expenses,
        'total_invoices': total_invoices,
        'total_invoices_amount': total_invoices_amount,
        'balance': balance
    }

# def tmp_transaction_data():
#     import json
#     with open('transactions.json', 'r') as f:
#         data = json.load(f)
#     return data

def get_transactions(date_from, date_to):
    transactions = db.session.query(Transaction).filter(Transaction.date >= date_from, Transaction.date <= date_to).all()
    if not transactions or transactions[0].created_at.date() != datetime.today().date():
        date_from_str = transactions[0].date.strftime('%Y-%m-%d')
        date_to_str = datetime.today().strftime('%Y-%m-%d')
        try:
            transactions = transaction_service.get_all(date_from=date_from_str, date_to=date_to_str)
            # transactions = tmp_transaction_data()
            for transaction in transactions.get('transactions').get('booked'):
                new_transaction = Transaction(
                    transaction_id=transaction.get('internalTransactionId'),
                    date=datetime.strptime(transaction.get('bookingDate'), '%Y-%m-%d').date(),
                    amount=float(transaction.get('transactionAmount').get('amount')),
                    description=transaction.get('remittanceInformationUnstructured'),
                    debtor=transaction.get('debtorName'),
                    additional_info=transaction.get('additionalInformation')

                )
                db.session.add(new_transaction)
            db.session.commit()
        except Exception as e:
            print("Failed to fetch transactions from the bank API")
        
    transactions = db.session.query(Transaction).filter(Transaction.date >= date_from, Transaction.date <= date_to).all()
    return [transaction.to_dict() for transaction in transactions]

def get_balance():
    with open('instance/balance.json', 'r') as f:
        data = json.load(f)
    lastCheck = datetime.fromisoformat(data.get('lastCheck'))
    if (datetime.today() - lastCheck).days > 0:
        data = transaction_service.get_balances()
        data['lastCheck'] = datetime.now().isoformat()
        with open('instance/balance.json', 'w') as f:
            json.dump(data, f)
        return data
    return data

def get_details():
    return transaction_service.get_details()

def get_metadata():
    return transaction_service.get_metadata()

def get_all(date_from, date_to):
    return transaction_service.get_all(date_from, date_to)

def due_reminder():
    print("Checking for due invoices...")
    invoices = Invoice.query.all()
    for invoice in invoices:
        if invoice.due_date == datetime.today().date():
            send_discord_notification(f"Reminder: Invoice from {invoice.issuer} is due today!")
        elif invoice.due_date == datetime.today().date() + timedelta(days=1):
            send_discord_notification(f"Reminder: Invoice from {invoice.issuer} is due tomorrow!")
        elif invoice.due_date == datetime.today().date() + timedelta(days=2):
            send_discord_notification(f"Reminder: Invoice from {invoice.issuer} is due in 2 days!")

def scan_emails():
    print("Scanning emails...")
    email_scanner = EmailService()
    date = datetime.today()
    emails = email_scanner.get_emails_from_date(date)
    for email in emails:
        new_email = Email(
            subject=email.get('subject'),
            body=email.get('body')
        )
        db.session.add(new_email)
    db.session.commit()

def get_emails():
    emails = Email.query.all()
    return [email.to_dict() for email in emails]

def delete_email(email_id):
    email = Email.query.get(email_id)
    if email:
        db.session.delete(email)
        db.session.commit()
        return {'message': f'Email {email_id} deleted'}, 200
    else:
        return {'message': 'Email not found'}, 404