# backend/fetchers_ebay_sandbox.py
import os, asyncio, httpx
from datetime import datetime, timezone

EBAY_SANDBOX_BEARER = os.getenv("EBAY_SANDBOX_BEARER")
EBAY_MARKETPLACE = os.getenv("EBAY_SANDBOX_MARKETPLACE","EBAY_US")

def now_iso():
    return datetime.now(timezone.utc).isoformat()

async def search(query: str, limit: int = 5):
    if not EBAY_SANDBOX_BEARER:
        return []
    url = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
    params = {"q": query, "limit": str(limit)}
    headers = {
        "Authorization": f"Bearer {EBAY_SANDBOX_BEARER}",
        "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKETPLACE,
        "Accept":"application/json"
    }
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(url, params=params, headers=headers)
            r.raise_for_status()
            js = r.json()
    except Exception:
        return []
    out = []
    for it in js.get("itemSummaries") or []:
        price = it.get("price") or {}
        cents = int(round(float(price.get("value",0))*100)) if price else 0
        ship = None
        so = (it.get("shippingOptions") or [None])[0]
        if so and isinstance(so, dict):
            sc = so.get("shippingCost")
            if sc:
                try:
                    ship = int(round(float(sc.get("value",0))*100))
                except Exception:
                    ship = None
        out.append({
            "source_listing_id": it.get("itemId",""),
            "title": it.get("title",""),
            "price_cents": cents,
            "shipping_cents": ship,
            "currency": price.get("currency","USD"),
            "url": it.get("itemWebUrl") or it.get("itemHref"),
            "fetched_at": now_iso()
        })
    return out
