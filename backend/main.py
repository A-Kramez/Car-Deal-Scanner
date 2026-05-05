from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from database import get_connection
from pricing import get_market_stats, calculate_deal_score
from ebay_api import search_ebay_listings

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RED_FLAGS = [
    "cat s",
    "cat n",
    "write off",
    "spares or repair",
    "needs work",
    "fault",
    "damaged",
    "engine light",
    "warning light",
    "no service history",
    "non runner",
    "strange noise",
    "crunch",
    "oil leak",
    "coolant leak",

]

POSITIVES = [
    "full service history",
    "service history",
    "one owner",
    "1 owner",
    "recent service",
    "new tyres",
    "long mot",
    "timing belt done",
    "cam belt done",
    "with recipet",
    "ulez compliant",
    "well maintained",
]

def analyse_description(description: str):
    text = description.lower() if description else ""

    red_flags = [word for word in RED_FLAGS if word in text]
    positives = [word for word in POSITIVES if word in text]

    return {
        "red_flags": red_flags,
        "positives": positives,
    }

@app.get("/db-test")
def db_test():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) FROM market_listings")
    result = cur.fetchone()

    cur.close()
    conn.close()

    return {"vehicle_count": result[0]}

@app.post("/analyze-deal")
def analyze_deal(payload: dict = Body(...)):
    make = payload.get("make")
    model = payload.get("model")
    engine_size = float(payload.get("engine_size"))
    mileage = int(payload.get("mileage"))
    price = int(payload.get("price"))
    description = payload.get("description", "")

    year = payload.get("year")
    year = int(year) if year else None

    market_data = get_market_stats(make, model, engine_size, mileage, year)
    deal = calculate_deal_score(price, market_data)
    description_analysis = analyse_description(description)

    return {
        "market_price_median": market_data["median_price"] if market_data else None,
        "market_price_average": market_data["avg_price"] if market_data else None,
        "samples": market_data["samples"] if market_data else 0,
        "match_type": market_data["match_type"] if market_data else None,
        "deal_analysis": deal,
        "description_analysis": description_analysis,
    }

@app.get("/ebay-search")
def ebay_search(make: str, model: str, year: int | None = None, limit: int = 5):
    return search_ebay_listings(make, model, year, limit)