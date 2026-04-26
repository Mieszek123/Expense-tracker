from fastapi import Request
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from app.database import get_db
from app.models import User
from sqlalchemy.orm import Session
from fastapi import Depends

SECRET_KEY = "twoj-sekretny-klucz"
ALGORITHM = "HS256"
EXPIRE_MINUTES = 30

def create_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    payload["exp"] = expire
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

async def get_current_user_from_cookie(request: Request, db: Session = Depends(get_db)):
    token_with_prefix = request.cookies.get("access_token")
    if not token_with_prefix:
        return None
    
    token = token_with_prefix.replace("Bearer ", "")
    
    try:
        payload = decode_token(token)
        # Wyciągamy ID, które zapisałeś w polu "sub" podczas logowania
        user_id: str = payload.get("sub")
        
        if user_id is None:
            return None
            
        # Szukamy całego użytkownika w bazie danych po ID
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user # Zwracamy obiekt User (ma id, username, email itd.)
        
    except (JWTError, ValueError):
        return None