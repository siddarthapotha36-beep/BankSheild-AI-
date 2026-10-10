from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analyze import router as analyze_router

app = FastAPI(
    title="BankShield AI - Fraud & Phishing Detection API",
    description="Stateless fraud detection engine for bank SMS and WhatsApp messages.",
    version="1.0.0"
)

# Allow requests from Vite React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "BankShield AI Backend"}
