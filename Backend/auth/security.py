from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import hashlib

SECRET_KEY = "COLLISION_SECRET"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    # Pre-hash with SHA-256 to handle any length password
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    hashed = pwd_context.hash(password_hash)
    return hashed

def verify_password(plain: str, hashed: str) -> bool:
    # Pre-hash the plain password the same way
    password_hash = hashlib.sha256(plain.encode()).hexdigest()
    return pwd_context.verify(password_hash, hashed)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
