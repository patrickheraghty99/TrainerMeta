# backend/models.py
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Listing(BaseModel):
    id: str
    source_code: str
    title: str
    condition: Optional[str]
    price_cents: int
    shipping_cents: Optional[int] = None
    currency: str = "USD"
    url: Optional[str] = None
    fetched_at: str

class Card(BaseModel):
    id: str
    name: str
    set_name: str
    set_code: str
    number: str
    rarity: str | None = None
    image_url: str | None = None
    lang: str = "EN"
    ptcg_id: str | None = None

class CardWithListings(BaseModel):
    card: Card
    listings: List[Listing]
    last_updated_by_source: Dict[str, str]


class HealthResponse(BaseModel):
    ok: bool
    demo_mode: bool

class CardsResponse(BaseModel):
    cards: List[Card]

class SealedItem(BaseModel):
    id: str
    name: str
    keywords: str
    image_url: str | None = None

class SealedListResponse(BaseModel):
    sealed: List[SealedItem]

class SealedWithListings(BaseModel):
    sealed: SealedItem
    listings: List[Listing]
    last_updated_by_source: Dict[str, str]

