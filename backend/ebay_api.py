def search_ebay_listings(make, model, year=None, limit=5):
    token = get_ebay_access_token()

    query = f"{make} {model} car"
    if year:
        query = f"{make} {model} {year} car"

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
        value = price.get("value")

        # Skip listings with no price
        if value is None:
            continue

        # Keep only listings priced 1000 or above.
        # This helps remove low-price parts/accessories.
        if float(value) < 1000:
            continue

        results.append({
            "title": item.get("title"),
            "price": value,
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
