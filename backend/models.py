# models.py

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    issuer = db.Column(db.String(128), nullable=True)
    amount = db.Column(db.Float, nullable=True)
    ocr = db.Column(db.String(64), nullable=True)
    bankgiro = db.Column(db.String(32), nullable=True)
    plusgiro = db.Column(db.String(32), nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    filename = db.Column(db.String(128), nullable=False)
    status = db.Column(db.Boolean, default=False, nullable=False)  # New field

    def to_dict(self):
        return {
            'id': self.id,
            'issuer': self.issuer,
            'amount': self.amount,
            'ocr': self.ocr,
            'bankgiro': self.bankgiro,
            'plusgiro': self.plusgiro,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'filename': self.filename,
            'created_at': self.created_at.isoformat(),
            'status': self.status,  # Include the new field in the dictionary
            'needs_completion': self.needs_completion()
        }

    def needs_completion(self):
        """
        Determine if the invoice needs completion based on certain conditions.
        """
        return not (self.amount and self.amount > 0) or \
               not self.due_date or \
               not self.ocr or \
               self.issuer == 'Fallback' or \
               (not self.bankgiro and not self.plusgiro)

    def __repr__(self):
        return f'<Invoice {self.id} - {self.issuer}>'

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(256), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'description': self.description,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Expense {self.id} - {self.category}>'

class Income(db.Model):
    __tablename__ = 'incomes'
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(64), nullable=False)
    description = db.Column(db.String(256), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, default=datetime.utcnow, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'source': self.source,
            'description': self.description,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Income {self.id} - {self.source}>'


class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.String(64), nullable=False, unique=True)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(256), nullable=True)
    debtor = db.Column(db.String(64), nullable=True)
    additional_info = db.Column(db.String(256), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_id': self.transaction_id,
            'amount': self.amount,
            'date': self.date.isoformat(),
            'description': self.description,
            'debtor': self.debtor,
            'additional_info': self.additional_info,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Transaction {self.id} - {self.amount}>'

class Email(db.Model):
    __tablename__ = 'emails'
    id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(256), nullable=False)
    body = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'subject': self.subject,
            'body': self.body,
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<Email {self.id} - {self.subject}>'