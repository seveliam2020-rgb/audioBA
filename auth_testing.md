# Auth Testing Playbook — Booklab Audio

JWT httpOnly-cookie auth (FastAPI + MongoDB). Admin seeded at startup from backend/.env.

## MongoDB verification
mongosh "$MONGO_URL"
use test_database
db.users.find({role:"admin"}).pretty()   # password_hash starts with $2b$
db.login_attempts.find()                 # indexed on identifier
db.users.getIndexes()                    # email unique index

## API flow (external host)
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)

# Register
curl -s -c /tmp/c.txt -X POST "$API_URL/api/auth/register" -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@booklab.audio","password":"password123"}'

# Session check
curl -s -b /tmp/c.txt "$API_URL/api/auth/me"

# Shelf add (uses monthly credit)
curl -s -b /tmp/c.txt -X POST "$API_URL/api/shelf" -H "Content-Type: application/json" -d '{"book_id":"neon-horizon-2099"}'
curl -s -b /tmp/c.txt "$API_URL/api/shelf"

# Waitlist
curl -s -X POST "$API_URL/api/waitlist" -H "Content-Type: application/json" \
  -d '{"email":"listener@example.com","preference":"Headphones"}'

# Login + logout
curl -s -c /tmp/c.txt -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
  -d '{"email":"admin@booklab.audio","password":"Blab-Admin-2026!"}'
curl -s -b /tmp/c.txt -X POST "$API_URL/api/auth/logout"

## Expected
- register/login return user object and set access_token + refresh_token httpOnly cookies (SameSite=None, Secure)
- /api/auth/me returns the same user via cookies
- 5 failed logins on same ip:email → 429 lockout for 15 minutes
- CORS origin restricted to frontend preview URL + localhost:3000 (credentials mode)
