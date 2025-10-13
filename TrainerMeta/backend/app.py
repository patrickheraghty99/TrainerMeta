# backend/app.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models import Card, CardWithListings, HealthResponse, CardsResponse, SealedItem, SealedListResponse, SealedWithListings
from settings import settings
import httpx, asyncio
from typing import Dict, Any, List
from datetime import datetime, timezone
from time import time

from demo_cards import DEMO_CARDS
from demo_sealed import SEALED
from fetchers_ebay_sandbox import search as ebay_search

app = FastAPI(title="TrainerMeta API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.ALLOWED_ORIGIN] if settings.ALLOWED_ORIGIN else ["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Simple guards
RATE_BUCKET: Dict[str, tuple[int, float]] = {}
MAX_REQ = 120
WINDOW = 300

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def check_rate(ip: str) -> bool:
    now = time()
    cnt, start = RATE_BUCKET.get(ip, (0, now))
    if now - start > WINDOW:
        RATE_BUCKET[ip] = (1, now)
        return True
    cnt += 1
    RATE_BUCKET[ip] = (cnt, start)
    return cnt <= MAX_REQ

async def guard(request: Request):
    ip = request.client.host if request.client else "unknown"
    if not check_rate(ip):
        return JSONResponse({"error":"rate_limited"}, status_code=429)
    if settings.API_SHARED_KEY:
        if request.headers.get("x-trainermeta-key") != settings.API_SHARED_KEY:
            return JSONResponse({"error":"auth_required"}, status_code=401)
    return None

PTCG_BASE = "https://api.pokemontcg.io/v2/cards"
headers_ptcg = {}
if settings.POKEMONTCG_API_KEY:
    headers_ptcg["X-Api-Key"] = settings.POKEMONTCG_API_KEY

# ---- DEMO MODE in-memory stores ----
CARDS: Dict[str, Dict[str, Any]] = {}
LISTINGS: Dict[str, List[Dict[str, Any]]] = {}
LAST_BY_SOURCE: Dict[str, Dict[str, str]] = {}

SEALED_MAP: Dict[str, Dict[str, Any]] = {}
SEALED_LISTINGS: Dict[str, List[Dict[str, Any]]] = {}
SEALED_LAST: Dict[str, Dict[str, str]] = {}

# Initialize demo singles
for obj in DEMO_CARDS:
    cid = obj["id"]
    CARDS[cid] = {**obj, "ptcg_id": None, "image_url": None}
    LISTINGS[cid] = []
    LAST_BY_SOURCE[cid] = {}

# Initialize demo sealed
for s in SEALED:
    sid = s["id"]
    SEALED_MAP[sid] = {**s, "image_url": "/box.svg"}
    SEALED_LISTINGS[sid] = []
    SEALED_LAST[sid] = {}

async def ptcg_fetch_card_image_and_price(card: Dict[str, Any]):
    qnum = card["number"].split("/")[0] if "/" in card["number"] else card["number"]
    params = {"q": f'name:"{card["name"]}" set.name:"{card["set_name"]}" number:"{qnum}"'}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            r = await client.get(PTCG_BASE, params=params, headers=headers_ptcg)
            r.raise_for_status()
            data = r.json().get("data", [])
            if not data:
                return
            c0 = data[0]
            imgs = c0.get("images") or {}
            card["image_url"] = imgs.get("small") or imgs.get("large")
            tp = (c0.get("tcgplayer") or {}).get("prices") or {}
            price = None
            for k in ("holofoil","reverseHolofoil","normal","1stEditionHolofoil","unlimitedHolofoil"):
                if k in tp and "market" in tp[k]:
                    price = tp[k]["market"]
                    break
            if price:
                price_cents = int(round(price*100))
                lst = [l for l in LISTINGS[card["id"]] if l.get("source_code")!="ptcg"]
                lst.append({
                    "id": f"ptcg-{card['id']}",
                    "source_code": "ptcg",
                    "title": f"{card['name']} {card['set_name']} {card['number']}",
                    "condition": None,
                    "price_cents": price_cents,
                    "shipping_cents": None,
                    "currency": "USD",
                    "url": None,
                    "fetched_at": now_iso(),
                })
                LISTINGS[card["id"]] = sorted(lst, key=lambda x: (x["price_cents"], x["fetched_at"]))
                LAST_BY_SOURCE.setdefault(card["id"], {})["ptcg"] = now_iso()
    except Exception:
        return

async def ebay_fetch_for_card(card: Dict[str, Any]):
    q = f'Pokemon {card["name"]} {card["set_name"]} {card["number"]}'
    rows = await ebay_search(q, limit=5)
    if not rows: return
    lst = [l for l in LISTINGS[card["id"]] if l.get("source_code")!="ebay_sandbox"]
    for r in rows:
        lst.append({
            "id": f"ebay-{card['id']}-{r['source_listing_id']}",
            "source_code": "ebay_sandbox",
            "title": r["title"],
            "condition": None,
            "price_cents": r["price_cents"],
            "shipping_cents": r["shipping_cents"],
            "currency": r["currency"],
            "url": r["url"],
            "fetched_at": r["fetched_at"],
        })
    LISTINGS[card["id"]] = sorted(lst, key=lambda x: (x["price_cents"], x["fetched_at"]))
    LAST_BY_SOURCE.setdefault(card["id"], {})["ebay_sandbox"] = now_iso()

async def ebay_fetch_for_sealed(item: Dict[str, Any]):
    rows = await ebay_search(item["keywords"], limit=5)
    if not rows: return
    lst = [l for l in SEALED_LISTINGS[item["id"]] if l.get("source_code")!="ebay_sandbox"]
    for r in rows:
        lst.append({
            "id": f"ebay-{item['id']}-{r['source_listing_id']}",
            "source_code": "ebay_sandbox",
            "title": r["title"],
            "condition": None,
            "price_cents": r["price_cents"],
            "shipping_cents": r["shipping_cents"],
            "currency": r["currency"],
            "url": r["url"],
            "fetched_at": r["fetched_at"],
        })
    SEALED_LISTINGS[item["id"]] = sorted(lst, key=lambda x: (x["price_cents"], x["fetched_at"]))
    SEALED_LAST.setdefault(item["id"], {})["ebay_sandbox"] = now_iso()

@app.get("/api/health", response_model=HealthResponse)
async def health():
    return {"ok": True, "demo_mode": settings.DEMO_MODE}

@app.get("/api/cards", response_model=CardsResponse)
async def list_cards(request: Request):
    g = await guard(request)
    if g: return g
    return {"cards": list(CARDS.values())}


@app.get("/api/cards/{card_id}", response_model=CardWithListings)
async def card_detail(card_id: str, request: Request):
    g = await guard(request)
    if g:
        return g
    if card_id not in CARDS:
        raise HTTPException(status_code=404, detail="Card not found")
    card = CARDS[card_id]
    # Fetch image if not already present
    if not card.get("image_url"):
        await ptcg_fetch_card_image_and_price(card)
    return {
        "card": card,
        "listings": LISTINGS.get(card_id, []),
        "last_updated_by_source": LAST_BY_SOURCE.get(card_id, {})
    }

@app.get("/api/sealed", response_model=SealedListResponse)
async def list_sealed(request: Request):
    g = await guard(request)
    if g: return g
    return {"sealed": list(SEALED_MAP.values())}

@app.get("/api/sealed/{sealed_id}", response_model=SealedWithListings)
async def sealed_detail(sealed_id: str, request: Request):
    g = await guard(request)
    if g: return g
    if sealed_id not in SEALED_MAP:
        raise HTTPException(status_code=404, detail="Sealed item not found")
    return {"sealed": SEALED_MAP[sealed_id], "listings": SEALED_LISTINGS.get(sealed_id, []), "last_updated_by_source": SEALED_LAST.get(sealed_id, {})}

@app.post("/api/refresh-all")
async def manual_refresh_all(request: Request):
    g = await guard(request)
    if g: return g
    tasks = []
    for c in CARDS.values():
        tasks.append(ptcg_fetch_card_image_and_price(c))
        tasks.append(ebay_fetch_for_card(c))
    for s in SEALED_MAP.values():
        tasks.append(ebay_fetch_for_sealed(s))
    await asyncio.gather(*tasks, return_exceptions=True)
    return {"ok": True, "cards": len(CARDS), "sealed": len(SEALED_MAP)}
