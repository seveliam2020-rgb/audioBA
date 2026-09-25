import os
import logging
import secrets
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Annotated, Optional

import bcrypt
import jwt
from bson import ObjectId
from dotenv import load_dotenv
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict, EmailStr
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
LOCKOUT_LIMIT = 5
LOCKOUT_WINDOW = timedelta(minutes=15)
EXTRA_BOOK_PRICE = 8.99

logger = logging.getLogger("booklab")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def get_jwt_secret() -> str:
    return os.environ["JWT_SECRET"]


def oid_to_str(v):
    return str(v) if isinstance(v, ObjectId) else v


PyObjectId = Annotated[str, BeforeValidator(oid_to_str)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        if not data.get("_id"):
            data.pop("_id", None)
        return data

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls(**doc)


# ---------------- Pydantic models ----------------

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotRequest(BaseModel):
    email: EmailStr


class ResetRequest(BaseModel):
    token: str
    password: str = Field(min_length=8, max_length=128)


class WaitlistCreate(BaseModel):
    email: EmailStr
    preference: str = Field(default="Headphones", pattern="^(Headphones|Hi-Fi Speakers|Commute)$")


class ShelfAdd(BaseModel):
    book_id: str


class ProgressUpdate(BaseModel):
    book_id: str
    position: float = Field(ge=0)


# ---------------- Password + JWT helpers ----------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
        "type": "access",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh",
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookies(response: Response, user_id: str, email: str):
    access = create_access_token(user_id, email)
    refresh = create_refresh_token(user_id)
    response.set_cookie(key="access_token", value=access, httponly=True, secure=True, samesite="none", max_age=900, path="/")
    response.set_cookie(key="refresh_token", value=refresh, httponly=True, secure=True, samesite="none", max_age=604800, path="/")


def user_out(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "member"),
        "credits": user.get("credits", 1),
    }


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    try:
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    except Exception:
        user = None
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def check_lockout(identifier: str):
    doc = await db.login_attempts.find_one({"identifier": identifier})
    if doc and doc.get("count", 0) >= LOCKOUT_LIMIT:
        last = doc.get("last_attempt")
        if isinstance(last, datetime) and datetime.now(timezone.utc) - last < LOCKOUT_WINDOW:
            raise HTTPException(status_code=429, detail="Too many attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})


async def reset_monthly_credit(user: dict) -> dict:
    now = datetime.now(timezone.utc)
    last = user.get("credit_reset_at")
    last_dt = None
    if isinstance(last, datetime):
        last_dt = last
    elif isinstance(last, str):
        try:
            last_dt = datetime.fromisoformat(last)
        except ValueError:
            last_dt = None
    if not last_dt or now - last_dt > timedelta(days=30):
        iso = now.isoformat()
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"credits": 1, "credit_reset_at": iso}})
        user["credits"] = 1
        user["credit_reset_at"] = iso
    return user


# ---------------- Catalog (seeded) ----------------

BOOKS = [
    {
        "id": "neon-horizon-2099", "rank": 1,
        "title": "Neon Horizon 2099", "author": "Elena Vance", "narrator": "Marcus Thorne",
        "genre": "Cyberpunk", "duration": "14h 32m", "rating": 4.9, "reviews_count": 1840,
        "synopsis": "In a city that never sleeps, a rogue signal-jockey discovers the frequency that could reboot civilization.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/d435987be390656d9d9b4daeb88c845fa592a693823c91d57179fc5755fd2123.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
        "id": "silent-blade-obsidian", "rank": 2,
        "title": "The Silent Blade of Obsidian", "author": "Kaelen Drake", "narrator": "Sienna Sterling",
        "genre": "Dark Fantasy", "duration": "18h 15m", "rating": 4.8, "reviews_count": 2150,
        "synopsis": "A disgraced blade-sworn must carve her name back into history — one shadow at a time.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/5f0264e9198ef23e30e057d16ead935ba3a1d09b5e7739e17db7d268f79b963c.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
        "id": "echoes-acoustic-void", "rank": 3,
        "title": "Echoes in the Acoustic Void", "author": "Dr. Aris Thorne", "narrator": "Jonathan Pryce",
        "genre": "Cosmic Non-Fiction", "duration": "9h 45m", "rating": 5.0, "reviews_count": 3400,
        "synopsis": "An awe-struck tour of the soundscapes of deep space, from pulsar drums to the hum of the early universe.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/42a238417bc99c0a7a44b4b15a4e049718818cace36a580deed2da4d6b193ca6.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
        "id": "chrono-resonance", "rank": 4,
        "title": "Chrono Resonance", "author": "Maya Lin", "narrator": "Devon Miller",
        "genre": "Techno Thriller", "duration": "12h 10m", "rating": 4.7, "reviews_count": 920,
        "synopsis": "A quantum clock leaks twelve minutes into the future — and someone is already spending them.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/af59f362f4b0b31241691d40baf6cd7b9db799f8421be361d1f2b578eb91edc4.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
        "id": "architects-of-silence", "rank": 5,
        "title": "Architects of Silence", "author": "Julian Mercer", "narrator": "Clara Higgins",
        "genre": "Psych Fiction", "duration": "11h 05m", "rating": 4.9, "reviews_count": 1420,
        "synopsis": "A sound designer retreats into a brutalist tower to record silence, and finds it listening back.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/480d1b6aced4852df6684f99d176e82c6f3ea66f8850a50e1b13222151691528.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
    {
        "id": "golden-frequency", "rank": 6,
        "title": "The Golden Frequency", "author": "Sebastian Vance", "narrator": "Oliver Grant",
        "genre": "History & Mystery", "duration": "16h 40m", "rating": 4.8, "reviews_count": 1890,
        "synopsis": "A coded broadcast hidden in a 1930s radio dial leads a historian into the century's strangest mystery.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/be3c2f3d77adf3c375f675dfdc32f6f42dc5682967f147c7ae5b302ba923cf5a.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    },
    {
        "id": "subterranean-mind", "rank": 7,
        "title": "Subterranean Mind", "author": "Dr. Lyra Cross", "narrator": "Evelyn Reed",
        "genre": "Neuroscience", "duration": "8h 50m", "rating": 4.9, "reviews_count": 2780,
        "synopsis": "Descend into the living cave of neurons where memory, myth and mechanics entwine.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/fff45bae55c311d0db3d848c6ba89d7fab56f714bb4fb8e81f29321621757193.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    },
    {
        "id": "velvet-monolith", "rank": 8,
        "title": "The Velvet Monolith", "author": "Arthur Sterling", "narrator": "Benjamin Cross",
        "genre": "Gothic Thriller", "duration": "13h 25m", "rating": 4.8, "reviews_count": 1650,
        "synopsis": "When the monolith appears in the forest, the village's oldest secret begins to speak.",
        "cover_url": "https://static.prod-images.emergentagent.com/jobs/2a50c63c-7b7b-4527-80d9-fc8281119b8b/images/683ff460391bcc71276824f76fb74249a2607477c1a45925c0109c02e2bfd257.jpeg",
        "sample_audio": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    },
]


# ---------------- Routes ----------------

@api_router.get("/")
async def root():
    return {"message": "Booklab Audio API", "status": "ok"}


# ---- Auth ----

@api_router.post("/auth/register")
async def register(payload: UserCreate, response: Response):
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    now = datetime.now(timezone.utc).isoformat()
    doc = {
        "name": payload.name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "member",
        "credits": 1,
        "credit_reset_at": now,
        "created_at": now,
    }
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)
    set_auth_cookies(response, user_id, email)
    return user_out({**doc, "_id": result.inserted_id})


@api_router.post("/auth/login")
async def login(payload: UserLogin, request: Request, response: Response):
    email = payload.email.lower()
    ip = request.client.host if request.client else "unknown"
    identifier = f"{ip}:{email}"
    await check_lockout(identifier)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"last_attempt": datetime.now(timezone.utc)}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    user = await reset_monthly_credit(user)
    set_auth_cookies(response, str(user["_id"]), email)
    return user_out(user)


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/", secure=True, httponly=True, samesite="none")
    response.delete_cookie("refresh_token", path="/", secure=True, httponly=True, samesite="none")
    return {"ok": True}


@api_router.post("/auth/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, get_jwt_secret(), algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    set_auth_cookies(response, str(user["_id"]), user["email"])
    return user_out(user)


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    user = await reset_monthly_credit(user)
    return user_out(user)


@api_router.post("/auth/forgot-password")
async def forgot_password(payload: ForgotRequest):
    email = payload.email.lower()
    user = await db.users.find_one({"email": email})
    if user:
        token = secrets.token_urlsafe(32)
        await db.password_reset_tokens.insert_one({
            "token": token,
            "email": email,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
        })
        logger.info(f"Password reset link for {email}: /reset?token={token}")
    return {"ok": True, "message": "If that email exists, a reset link has been sent."}


@api_router.post("/auth/reset-password")
async def reset_password(payload: ResetRequest):
    doc = await db.password_reset_tokens.find_one({"token": payload.token, "used": False})
    if not doc or doc.get("expires_at", datetime.min.replace(tzinfo=timezone.utc)) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    await db.users.update_one({"email": doc["email"]}, {"$set": {"password_hash": hash_password(payload.password)}})
    await db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return {"ok": True}


# ---- Books ----

@api_router.get("/books")
async def get_books():
    docs = await db.books.find({}, {"_id": 0}).sort("rank", 1).to_list(50)
    return docs


# ---- Waitlist ----

@api_router.post("/waitlist")
async def join_waitlist(payload: WaitlistCreate):
    email = payload.email.lower()
    await db.waitlist.update_one(
        {"email": email},
        {"$setOnInsert": {"email": email, "preference": payload.preference, "created_at": datetime.now(timezone.utc).isoformat()}},
        upsert=True,
    )
    total = await db.waitlist.count_documents({})
    return {"ok": True, "total": total}


@api_router.get("/waitlist/count")
async def waitlist_count():
    return {"total": await db.waitlist.count_documents({})}


# ---- Shelf ----

@api_router.get("/shelf")
async def get_shelf(user: dict = Depends(get_current_user)):
    user = await reset_monthly_credit(user)
    uid = str(user["_id"])
    items = await db.shelf.find({"user_id": uid}).sort([("last_played_at", -1), ("added_at", -1)]).to_list(100)
    book_ids = [i["book_id"] for i in items]
    books = {b["id"]: b for b in await db.books.find({"id": {"$in": book_ids}}, {"_id": 0}).to_list(50)}
    out = []
    for i in items:
        b = books.get(i["book_id"])
        if not b:
            continue
        out.append({
            **b,
            "used_credit": i.get("used_credit", False),
            "price": i.get("price", 0),
            "position": i.get("position", 0),
            "last_played_at": i.get("last_played_at"),
            "added_at": i.get("added_at"),
        })
    return {"credits": user.get("credits", 1), "items": out}


@api_router.post("/shelf")
async def add_to_shelf(payload: ShelfAdd, user: dict = Depends(get_current_user)):
    book = await db.books.find_one({"id": payload.book_id})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    uid = str(user["_id"])
    if await db.shelf.find_one({"user_id": uid, "book_id": payload.book_id}):
        raise HTTPException(status_code=409, detail="This book is already on your shelf")
    user = await reset_monthly_credit(user)
    credits = user.get("credits", 1)
    if credits >= 1:
        used_credit, price, new_credits = True, 0.0, credits - 1
    else:
        used_credit, price, new_credits = False, EXTRA_BOOK_PRICE, credits
    await db.shelf.insert_one({
        "user_id": uid,
        "book_id": payload.book_id,
        "used_credit": used_credit,
        "price": price,
        "added_at": datetime.now(timezone.utc).isoformat(),
    })
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"credits": new_credits}})
    return {"ok": True, "used_credit": used_credit, "price": price, "credits": new_credits}


@api_router.delete("/shelf/{book_id}")
async def remove_from_shelf(book_id: str, user: dict = Depends(get_current_user)):
    await db.shelf.delete_one({"user_id": str(user["_id"]), "book_id": book_id})
    return {"ok": True}


@api_router.post("/shelf/progress")
async def save_progress(payload: ProgressUpdate, user: dict = Depends(get_current_user)):
    result = await db.shelf.update_one(
        {"user_id": str(user["_id"]), "book_id": payload.book_id},
        {"$set": {"position": payload.position, "last_played_at": datetime.now(timezone.utc).isoformat()}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Book not on your shelf")
    return {"ok": True, "position": payload.position}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Admin",
            "role": "admin",
            "credits": 1,
            "credit_reset_at": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing.get("password_hash", "")):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    for b in BOOKS:
        await db.books.update_one({"id": b["id"]}, {"$set": b}, upsert=True)
    await seed_admin(db)
    logger.info("Booklab Audio API ready")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
