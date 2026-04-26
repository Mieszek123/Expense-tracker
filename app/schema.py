from pydantic import BaseModel, EmailStr
from datetime import date

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class CategoryCreate(BaseModel):
    name: str
    color: str

class TransactionCreate(BaseModel):
    transaction_name : str
    transaction_amount: float
    transaction_type: str
    transaction_category_id: int
    transaction_date: date