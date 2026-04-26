from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from app.routes import router
from app.database import Base, engine

app = FastAPI()

templates = Jinja2Templates(directory="frontend/templates")
app.include_router(router)
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

@app.get("/")
async def home(request: Request):
    return templates.TemplateResponse(request, "index.html")



Base.metadata.create_all(bind=engine)