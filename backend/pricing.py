from database import get_connection


MIN_SAMPLES = 5


def run_market_query(cur, make, model, engine_min=None, engine_max=None,
                     mileage_min=None, mileage_max=None,
                     year_min=None, year_max=None):

    query = """
        SELECT
            percentile_cont(0.5) WITHIN GROUP (ORDER BY price) AS median_price,
            AVG(price),
            COUNT(*)
        FROM market_listings
        WHERE LOWER(make) = LOWER(%s)
        AND LOWER(model) = LOWER(%s)
    """

    params = [make, model]

    if engine_min is not None and engine_max is not None:
        query += " AND engine_size BETWEEN %s AND %s"
        params.extend([engine_min, engine_max])

    if mileage_min is not None and mileage_max is not None:
        query += " AND mileage BETWEEN %s AND %s"
        params.extend([mileage_min, mileage_max])

    if year_min is not None and year_max is not None:
        query += " AND year BETWEEN %s AND %s"
        params.extend([year_min, year_max])

    cur.execute(query, params)
    result = cur.fetchone()

    if result[2] == 0:
        return None

    return {
        "median_price": round(result[0], 2),
        "avg_price": round(result[1], 2),
        "samples": result[2]
    }


def get_market_stats(make, model, engine_size, mileage, year=None):

    conn = get_connection()
    cur = conn.cursor()

    try:
        # LEVEL 1: strict match
        
        if year is not None:
            level_1 = run_market_query(
                cur,
                make,
                model,
                engine_size - 0.2,
                engine_size + 0.2,
                mileage - 15000,
                mileage + 15000,
                year - 5,
                year + 5
            )

            if level_1 and level_1["samples"] >= MIN_SAMPLES:
                level_1["match_type"] = "Strict match"
                return level_1

        # LEVEL 2: wider match
        
        if year is not None:
            level_2 = run_market_query(
                cur,
                make,
                model,
                engine_size - 0.5,
                engine_size + 0.5,
                mileage - 30000,
                mileage + 30000,
                year - 10,
                year + 10
            )

            if level_2 and level_2["samples"] >= MIN_SAMPLES:
                level_2["match_type"] = "Wider match"
                return level_2

        # LEVEL 3: basic match
        level_3 = run_market_query(
            cur,
            make,
            model
        )

        if level_3 and level_3["samples"] >= MIN_SAMPLES:
            level_3["match_type"] = "Make/model only"
            return level_3

        return None

    finally:
        cur.close()
        conn.close()


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
