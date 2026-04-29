from database import get_connection

def get_market_stats(make, model, engine_size, mileage):

    conn = get_connection()
    cur = conn.cursor()

    mileage_min = mileage - 10000
    mileage_max = mileage + 10000

    cur.execute("""
        SELECT
            percentile_cont(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
            AVG(price),
            COUNT(*)
        FROM market_listings
        WHERE make = %s
        AND model = %s
        AND engine_size BETWEEN %s AND %s
        AND mileage BETWEEN %s AND %s
    """, (
        make,
        model,
        engine_size - 0.2,
        engine_size + 0.2,
        mileage_min,
        mileage_max
    ))

    result = cur.fetchone()

    cur.close()
    conn.close()

    if result[2] == 0:
        return None

    return {
        "median_price": round(result[0], 2),
        "avg_price": round(result[1], 2),
        "samples": result[2]
    }




def calculate_deal_score(listing_price, market_data):

    if market_data is None:
        return {
            "score": None,
            "rating": "Not enough data",
            "confidence": "Low"
        }

    market_price = market_data["median_price"]
    samples = market_data["samples"]

    difference = market_price - listing_price
    percent = (difference / market_price) * 100

    if percent > 20:
        rating = "Excellent Deal"
    elif percent > 10:
        rating = "Good Deal"
    elif percent > -5:
        rating = "Fair Price"
    else:
        rating = "Overpriced"

    # confidence based on sample size
    if samples > 150:
        confidence = "Very High"
    elif samples > 60:
        confidence = "High"
    elif samples > 25:
        confidence = "Medium"
    else:
        confidence = "Low"

    return {
        "score": round(percent, 1),
        "rating": rating,
        "confidence": confidence
    }
