import requests
from dotenv import load_dotenv
import os

load_dotenv()


def send_discord_notification(message):
    """Send a notification to the Discord channel via webhook."""
    data = {
        "content": message,
    }
    headers = {
        "Content-Type": "application/json"
    }

    response = requests.post(os.getenv('DISCORD_WEBHOOK'), json=data, headers=headers)

    if response.status_code == 204:
        print("Message sent successfully!")
    else:
        print(f"Failed to send message: {response.status_code}, {response.text}")