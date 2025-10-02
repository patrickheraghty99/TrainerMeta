# TrainerMeta (Prototype)

Public metasearch prototype for trading card prices (singles & sealed).

## Quick start (Mac)

### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DEMO_MODE=1
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
# Set the API base for server-side fetches
# echo 'NEXT_PUBLIC_API_BASE=http://localhost:8000' > .env.local
npm run dev
```

Open http://localhost:3000

### eBay Sandbox (optional)
```bash
# in backend terminal
export EBAY_SANDBOX_BEARER="your-oauth-token"
export EBAY_SANDBOX_MARKETPLACE="EBAY_US"
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# refresh data
curl -X POST http://localhost:8000/api/refresh-all
```

### Going public
- Deploy backend to Railway. Set ENV: DEMO_MODE=1, (optional) API_SHARED_KEY, ALLOWED_ORIGIN=https://www.trainermeta.gg
- Deploy frontend to Vercel. Set ENV: NEXT_PUBLIC_API_BASE=<your Railway URL>, API_SHARED_KEY (same value)
- Point trainermeta.gg DNS to Vercel (Domains tab)
