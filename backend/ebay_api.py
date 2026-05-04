import os
import base64
import requests
from dotenv import load_dotenv

load_dotenv()


def get_ebay_access_token():
    client_id = os.getenv("EBAY_CLIENT_ID")
    client_secret = os.getenv("EBAY_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise ValueError("Missing eBay API credentials")

    credentials = f"{client_id}:{client_secret}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()

    url = "https://api.ebay.com/identity/v1/oauth2/token"

    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}"
    }

    data = {
        "grant_type": "client_credentials",
        "scope": "https://api.ebay.com/oauth/api_scope"
    }

    response = requests.post(url, headers=headers, data=data, timeout=20)
    response.raise_for_status()

    return response.json()["access_token"]


def search_ebay_listings(make, model, year=None, limit=5):
    token = get_ebay_access_token()

    query = f"{make} {model}"
    if year:
        query = f"{query} {year}"

    url = "https://api.ebay.com/buy/browse/v1/item_summary/search"

    headers = {
        "Authorization": f"Bearer {token}",
        "X-EBAY-C-MARKETPLACE-ID": os.getenv("EBAY_MARKETPLACE", "EBAY_GB")
    }

    params = {
        "q": query,
        "limit": limit,
        "filter": "buyingOptions:{FIXED_PRICE}"
    }

    response = requests.get(url, headers=headers, params=params, timeout=20)
    response.raise_for_status()

    data = response.json()
    results = []

    for item in data.get("itemSummaries", []):
        price = item.get("price", {})

        results.append({
            "title": item.get("title"),
            "price": price.get("value"),
            "currency": price.get("currency"),
            "url": item.get("itemWebUrl"),
            "condition": item.get("condition"),
            "location": item.get("itemLocation", {}).get("country")
        })

    return {
        "query": query,
        "total": data.get("total", 0),
        "items": results
    }
