from models import User
from auth.security import hash_password, verify_password

def get_user_by_email(db, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db, username: str, email: str, password: str):
    user = User(
        username=username,
        email=email,
        hashed_password=hash_password(password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
