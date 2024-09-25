import os.path
import base64
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from datetime import datetime

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class EmailService:
    def __init__(self):
        self.service = self.authenticate_gmail()

    def scan(self, date) -> dict:
        keywords = ['invoice', 'receipt', 'bill', 'faktura', 'kvitto', 'räkning', 'betalning', 'payment', 'betala']
        emails = self.get_emails_from_date(date)

        filtered = []
        for email in emails:
            for keyword in keywords:
                if keyword in email['subject'].lower() or keyword in email['body'].lower():
                    filtered.append(email)
                    break
        
        return filtered

    def authenticate_gmail(self):
        """Authenticate the user via OAuth and return the credentials."""
        creds = None
    
        if os.path.exists('token.json'):
            creds = Credentials.from_authorized_user_file('token.json', SCOPES)
        
    
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
            
                flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
                creds = flow.run_local_server(port=5001)
        
            with open('token.json', 'w') as token:
                token.write(creds.to_json())
        
    
        return build('gmail', 'v1', credentials=creds)

    def get_emails_from_date(self, date):
        """Get a list of email messages from a specific date and return their subject and body."""
        formatted_date = date.strftime('%Y/%m/%d')
        query = f'after:{formatted_date}'

    
        results = self.service.users().messages().list(userId='me', q=query).execute()
        messages = results.get('messages', [])

        email_list = []
        if messages:
            for message in messages:
            
                msg = self.service.users().messages().get(userId='me', id=message['id']).execute()
                subject = self.get_email_subject(msg)
                body = self.get_email_body(msg)
            
                email_list.append({'subject': subject, 'body': body})

        return email_list

    def get_email_subject(self, msg):
        """Extract and return the subject of the email."""
        headers = msg['payload']['headers']
        for header in headers:
            if header['name'] == 'Subject':
                return header['value']
        return "No subject"

    def get_email_body(self, msg):
        """Extract the body of the email, whether it's plain text or HTML."""
        parts = msg['payload'].get('parts')
        
        if parts:
            for part in parts:
            
                if part['mimeType'] == 'text/plain':
                    body_data = part['body'].get('data')
                    if body_data:
                        return base64.urlsafe_b64decode(body_data).decode('utf-8')
            
                elif part['mimeType'] == 'text/html':
                    body_data = part['body'].get('data')
                    if body_data:
                        return base64.urlsafe_b64decode(body_data).decode('utf-8')

    
        return "No body content"


if __name__ == '__main__':

    email_scanner = EmailService()
    date = datetime(2024, 9, 15, 0, 0)

    emails = email_scanner.scan(date)

    for email in emails:
        print(f"Subject: {email['subject']}")
        print("=" * 50)