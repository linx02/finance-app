from nordigen import NordigenClient
# from uuid import uuid4
from dotenv import load_dotenv
import os

load_dotenv()

class TransactionService:
    def __init__(self):
        self.client = NordigenClient(
            secret_id=os.getenv('NORDIGEN_SECRET_ID'),
            secret_key=os.getenv('NORDIGEN_SECRET_KEY')
        )

        self.token_data = self.client.generate_token()
        self.account = self.client.account_api(id=os.getenv('NORDIGEN_ACCOUNT_ID'))

    def get_transactions(self, date_from: str, date_to: str):
        transactions = self.account.get_transactions(date_from=date_from, date_to=date_to)
        return transactions

    def get_balances(self):
        balances = self.account.get_balances()
        return balances

    def get_details(self):
        details = self.account.get_details()
        return details

    def get_metadata(self):
        meta_data = self.account.get_metadata()
        return meta_data

    def get_all(self, date_from: str, date_to: str):
        return {
            'metadata': self.get_metadata(),
            'details': self.get_details(),
            'balances': self.get_balances(),
            'transactions': self.get_transactions(date_from, date_to)
        }


# client = NordigenClient(
#     secret_id=os.getenv('NORDIGEN_SECRET_ID'),
#     secret_key=os.getenv('NORDIGEN_SECRET_KEY')
# )

# token_data = client.generate_token()

# institution_id = client.institution.get_institution_id_by_name(
#     country="SE",
#     institution="Nordea Personal"
# )

# init = client.initialize_session(
#     # institution id
#     institution_id=institution_id,
#     # redirect url after successful authentication
#     redirect_uri="http://localhost:5173",
#     # additional layer of unique ID defined by you
#     reference_id=str(uuid4())
# )

# print(init.link)
# input("Press Enter to continue...")

# accounts = client.requisition.get_requisition_by_id(
#     requisition_id=init.requisition_id
# )

# account_id = accounts["accounts"][0]

# # Create account instance and provide your account id from previous step
# account = client.account_api(id=os.getenv('NORDIGEN_ACCOUNT_ID'))

# # Fetch account metadata
# meta_data = account.get_metadata()
# # Fetch details
# details = account.get_details()
# # Fetch balances
# balances = account.get_balances()
# # Filter transactions by specific date range
# transactions = account.get_transactions(date_from="2024-08-01", date_to="2024-09-01")

# print(meta_data)
# print(details)
# print(balances)
# print(transactions)