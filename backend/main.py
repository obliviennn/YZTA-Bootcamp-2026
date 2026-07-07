import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.models.database import init_db
from backend.app.api.endpoints import router as journal_router

# Veritabanı tablolarını oluştur
init_db()

app = FastAPI(
    title="Aura AI - Günlük Analizi ve Mental Koç API",
    description="Plutchik Duygu Çemberi ve Çoklu Ajan Destekli Zaman Serisi Günlük Analiz Sistemi",
    version="1.0.0"
)

# CORS Ayarları (React Frontend erişimi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Geliştirme ortamında her kökene izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotaları dahil et
app.include_router(journal_router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Aura AI API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
