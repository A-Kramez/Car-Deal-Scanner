import re
from playwright.sync_api import sync_playwright


# -----------------------------
# HELPER FUNCTIONS (EXTRACTION)
# -----------------------------

def extract_price(text: str):
    """
    Extracts a likely car price from text.

    We look for 4-7 digit numbers because:
    - avoids small numbers like engine size (1.4)
    - avoids years like 2017
    - typical UK car prices fall in this range
    """
    match = re.search(r"\b(\d{4,7})\b", text)
    if match:
        return int(match.group(1))
    return None


def extract_mileage(text: str):
    """
    Extracts mileage values such as:
    '62,000 miles'
    """
    match = re.search(r"([\d,]{2,7})\s*miles", text, re.IGNORECASE)
    if match:
        return int(match.group(1).replace(",", ""))
    return None


def extract_engine_size(text: str):
    """
    Extracts engine sizes like:
    '1.4L', '2.0 L'
    """
    match = re.search(r"(\d\.\d)\s*L", text, re.IGNORECASE)
    if match:
        return float(match.group(1))
    return None


def extract_year(text: str):
    """
    Extracts a 4-digit year (e.g. 2016, 2020)
    """
    match = re.search(r"\b(20\d{2}|19\d{2})\b", text)
    if match:
        return int(match.group(1))
    return None


def extract_make_model(title_text: str):
    """
    Very simple logic:
    - First word = make
    - Second word = model

    Example:
    'Audi A1 Hatchback...' ? make='audi', model='A1'
    """
    if not title_text:
        return None, None

    words = title_text.split()
    if len(words) >= 2:
        return words[0].lower(), words[1]

    return None, None



# MAIN SCRAPER FUNCTION


def scrape_car_data(url: str):
    """
    Main scraper function.

    Steps:
    1. Open AutoTrader page using Playwright (real browser)
    2. Wait for dynamic content to load
    3. Extract visible text from the page
    4. Use regex to extract key values
    5. Return structured data
    """

    # Restrict to AutoTrader only 
    if "autotrader" not in url.lower():
        return {"error": "Only AutoTrader URLs are supported."}

    try:
        with sync_playwright() as p:

            # Launch headless browser (no visible window)
            browser = p.chromium.launch(headless=True)

            # Open new tab
            page = browser.new_page()

            # Navigate to the listing
            page.goto(url, wait_until="domcontentloaded", timeout=30000)

            # Wait for content to load 
            page.wait_for_timeout(4000)

            # Extract all visible text from page
            page_text = page.locator("body").inner_text()

            # Extract page title
            title = page.title()

            
            browser.close()

        
        # EXTRACT DATA FROM TEXT
      

        make, model = extract_make_model(title)
        price = extract_price(page_text)
        mileage = extract_mileage(page_text)
        engine_size = extract_engine_size(page_text)
        year = extract_year(page_text)

      

        return {
            "url": url,
            "title": title,
            "make": make,
            "model": model,
            "year": year,
            "price": price,
            "mileage": mileage,
            "engine_size": engine_size,

            # Shortened description for analysis
            "description": page_text[:2000],

            # Debug preview 
            "page_preview": page_text[:1000]
        }

    except Exception as e:
        return {
            "error": f"Scraping failed: {str(e)}"
        }