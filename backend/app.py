from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db
import os
from services.schedule import ScheduledJob

app = Flask(__name__)

app.config['SECRET_KEY'] = 'your_secret_key_here' 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

from functions import (
    process_invoice_file, get_all_invoices, get_invoice, delete_invoice,
    create_expense, get_all_expenses, get_expense, delete_expense,
    create_income, get_all_incomes, get_income, delete_income, manual_invoice,
    get_statistics, update_invoice, get_transactions, get_balance, due_reminder,
    scan_emails, get_emails, delete_email, update_expense
)

with app.app_context():
    db.create_all()

due_date_scheduler = ScheduledJob(due_reminder, hour=10, minute=0)
email_scheduler = ScheduledJob(scan_emails, hour=10, minute=0)

@app.route('/api/invoices', methods=['GET'])
def api_get_invoices():
    invoices = get_all_invoices()
    return jsonify(invoices), 200

@app.route('/api/invoices', methods=['POST'])
def api_create_invoice():
    if not 'data' in request.json:
        return jsonify({'message': 'No data in the request'}), 400

    response, status_code = manual_invoice(request.json['data'])
    return jsonify(response), status_code

@app.route('/api/invoices/upload', methods=['POST'])
def api_upload_invoice():
    if 'invoice' in request.files:
        file = request.files['invoice']
        response, status_code = process_invoice_file(file)
        return jsonify(response), status_code
    else:
        return jsonify({'message': 'No file in the request'}), 400

@app.route('/api/invoices/<int:invoice_id>', methods=['GET'])
def api_get_invoice(invoice_id):
    response = get_invoice(invoice_id)
    status_code = 200 if 'id' in response else 404
    return jsonify(response), status_code

@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
def api_delete_invoice(invoice_id):
    response, status_code = delete_invoice(invoice_id)
    return jsonify(response), status_code

@app.route('/api/expenses', methods=['GET'])
def api_get_expenses():
    expenses = get_all_expenses()
    return jsonify(expenses), 200

@app.route('/api/expenses', methods=['POST'])
def api_create_expense():
    data = request.get_json()
    response, status_code = create_expense(data)
    return jsonify(response), status_code

@app.route('/api/expenses/<int:expense_id>', methods=['GET'])
def api_get_expense(expense_id):
    response = get_expense(expense_id)
    status_code = 200 if 'id' in response else 404
    return jsonify(response), status_code

@app.route('/api/expenses/<int:expense_id>', methods=['PATCH'])
def api_update_expense(expense_id):
    data = request.get_json()
    response, status_code = update_expense(expense_id, data)
    return jsonify(response), status_code

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def api_delete_expense(expense_id):
    response, status_code = delete_expense(expense_id)
    return jsonify(response), status_code

@app.route('/api/incomes', methods=['GET'])
def api_get_incomes():
    incomes = get_all_incomes()
    return jsonify(incomes), 200

@app.route('/api/incomes', methods=['POST'])
def api_create_income():
    data = request.get_json()
    response, status_code = create_income(data)
    return jsonify(response), status_code

@app.route('/api/incomes/<int:income_id>', methods=['GET'])
def api_get_income(income_id):
    response = get_income(income_id)
    status_code = 200 if 'id' in response else 404
    return jsonify(response), status_code

@app.route('/api/incomes/<int:income_id>', methods=['DELETE'])
def api_delete_income(income_id):
    response, status_code = delete_income(income_id)
    return jsonify(response), status_code

@app.route('/api/statistics', methods=['GET'])
def api_get_statistics():
    response = get_statistics()
    return jsonify(response), 200

@app.route('/api/invoices/<int:invoice_id>', methods=['PATCH'])
def api_update_invoice(invoice_id):
    data = request.get_json()
    response, status_code = update_invoice(invoice_id, data)
    return jsonify(response), status_code

@app.route('/api/transactions/<string:date_from>/<string:date_to>', methods=['GET'])
def api_get_transactions(date_from, date_to):
    response = get_transactions(date_from, date_to)
    return jsonify(response), 200

@app.route('/api/balance', methods=['GET'])
def api_get_balance():
    response = get_balance()
    return jsonify(response), 200

@app.route('/api/scan-emails', methods=['POST'])
def api_scan_emails():
    response = scan_emails()
    return jsonify(response), 200

@app.route('/api/emails', methods=['GET'])
def api_get_emails():
    response = get_emails()
    return jsonify(response), 200

@app.route('/api/emails/<string:email_id>', methods=['DELETE'])
def api_delete_email(email_id):
    response, status_code = delete_email(email_id)
    return jsonify(response), status_code

if __name__ == '__main__':
    app.run(debug=True)