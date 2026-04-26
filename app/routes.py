from fastapi import APIRouter, Request, Depends, HTTPException, Response
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse

from app.auth import verify_password, hash_password
from app.models import User, Category, Transaction
from app.schema import UserRegister, UserLogin, CategoryCreate, TransactionCreate
from app.database import get_db
from app.tokens import get_current_user_from_cookie, create_token

from sqlalchemy.orm import Session

router = APIRouter()
templates = Jinja2Templates(directory="frontend/templates")

DEFAULT_CATEGORIES = [
    {"name": "Food & Dining", "color": "#ef4444"},
    {"name": "Transport",     "color": "#3b82f6"},
    {"name": "Shopping",      "color": "#22c55e"},
    {"name": "Bills",         "color": "#eab308"},
]

@router.get("/login")
async def login_page(request: Request):
    return templates.TemplateResponse(request, "login_page.html")

@router.get("/dashboard")
async def dashboard(request: Request, current_user: str = Depends(get_current_user_from_cookie)):
    # Jeśli bramkarz zwrócił None, wywalamy na stronę logowania (kod 303 to standardowy redirect)
    if not current_user:
        return RedirectResponse(url="/login", status_code=303)
    
    # Jeśli tu dotarliśmy, użytkownik jest zalogowany!
    # Możesz przekazać jego dane do Jinja2, żeby np. wyświetlić "Witaj, [nazwa]"
    return templates.TemplateResponse(request, "dashboard.html", {"user": current_user})

@router.post("/api/register")
async def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email już istnieje")
    username_exists = db.query(User).filter(User.username == data.username).first()
    if username_exists:
        raise HTTPException(status_code=400, detail="Nazwa użytkownika już istnieje")
    
    user_upper = data.username[0].upper() + data.username[1:]
    user = User(
        username=user_upper,
        email=data.email,
        hashed_password=hash_password(data.password)
    )
    db.add(user)
    db.flush()

    for cat in DEFAULT_CATEGORIES:
        db.add(Category(user_id=user.id, **cat))

    db.commit()
    return {"status": "ok"}

@router.post("/api/login")
# Poprawka 2: Dodajemy 'response: Response' do argumentów!
async def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    username_upper = data.username[0].upper() + data.username[1:]
    user = db.query(User).filter(User.username == username_upper).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Nieprawidłowe dane logowania")
    
    token = create_token({"sub": str(user.id), "username": user.username})

    # Ustawiamy ciasteczko na obiekcie 'response'
    response.set_cookie(
        key="access_token", 
        value=f"Bearer {token}", 
        httponly=True,
        samesite="lax",
        max_age=3600
    )
    
    # Poprawka 3: Zostawiamy tylko jeden return
    return {"message": "Zalogowano pomyślnie"}

@router.get("/api/logout")
async def logout(response: Response): # Wymaga obiektu Response
    # Tworzymy przekierowanie
    redirect = RedirectResponse(url="/login", status_code=303)
    
    # Usuwamy ciasteczko o nazwie "access_token"
    redirect.delete_cookie(key="access_token")
    
    return redirect

@router.get("/api/data")
async def dashboard_data(current_user: str = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    categories = db.query(Category).filter(Category.user_id == current_user.id).all()
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()

    return {
        "username": current_user.username,
        "categories": [{"id": c.id, "name": c.name, "color": c.color} for c in categories],
        "transactions": [
            {
                "id": t.id,
                "name": t.name,
                "amount": t.amount,
                "type": t.type,
                "category": t.category.name if t.category else None,
                "category_color": t.category.color if t.category else "#fff",
                "date": t.created_at.strftime("%b %d")
            }
            for t in transactions
        ]
    }


@router.post("/api/add_categories")
async def add_category(data: CategoryCreate, current_user: str = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    new_category = Category(
        user_id=current_user.id,
        name=data.name,
        color=data.color
    )
    db.add(new_category)
    db.commit()
    return {"status": "ok"}

@router.delete("/api/del_category/{category_id}")
async def del_category(category_id: int, current_user: str = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id, Category.user_id == current_user.id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(category)
    db.commit()
    return {"status": "ok"}

@router.post("/api/add_transaction")
async def add_category(data: TransactionCreate, current_user: str = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    new_transaction = Transaction(
        user_id=current_user.id,
        category_id=data.transaction_category_id,
        name=data.transaction_name,
        amount=data.transaction_amount,
        type=data.transaction_type,
        created_at=data.transaction_date
    )
    db.add(new_transaction)
    db.commit()
    return {"status": "ok"}

@router.delete("/api/del_transaction/{transaction_id}")
async def del_category(transaction_id: int, current_user: str = Depends(get_current_user_from_cookie), db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(transaction)
    db.commit()
    return {"status": "ok"}