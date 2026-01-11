from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserCreate, UserLogin, Token
import operations.userAuth as userAuth
from auth.security import create_access_token

router = APIRouter()

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = userAuth.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = userAuth.create_user(db, user.username, user.email, user.password)
    token = create_access_token({"sub": str(new_user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username
        }
    }

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    authenticated = userAuth.authenticate_user(db, user.email, user.password)
    if not authenticated:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(authenticated.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": authenticated.id,
            "email": authenticated.email,
            "username": authenticated.username
        }
    }