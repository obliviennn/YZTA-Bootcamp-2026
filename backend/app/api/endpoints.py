from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any
from backend.app.models.database import get_db, JournalEntry, SentimentMetrics, TopicMetrics, CoachInsight
from backend.app.services.agents import AuraAgentOrchestrator
from backend.app.services import analytics

router = APIRouter(prefix="/api/journal", tags=["journal"])
orchestrator = AuraAgentOrchestrator()

class JournalCreateRequest(BaseModel):
    content: str

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_journal_entry(payload: JournalCreateRequest, db: Session = Depends(get_db)):
    content = payload.content

    # 1. Ajan: Ingestion (Giriş & Kalite Kontrol)
    if not orchestrator.run_ingestion_agent(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Günlük metni çok kısa veya anlamsız. Lütfen en az 15 karakter içeren anlamlı bir metin yazın."
        )

    try:
        # 2. Ajan: Duygu ve Konu Çıkarımı
        analysis = orchestrator.run_extraction_agent(content)

        # 3. Geçmiş Hafıza (Memory) Çekimi
        past_memory = analytics.get_past_memory_context(db, limit=5)

        # 4. Ajan: Mental Koç Önerileri (Insights)
        coach_feedback = orchestrator.run_insights_agent(content, analysis, past_memory)

        # Veritabanına kaydetme süreci
        db_entry = JournalEntry(
            content=content,
            sentiment_score=analysis.overall_sentiment,
            summary=analysis.summary,
            is_anomaly=False # Başlangıçta False, trend fonksiyonunda hesaplanacak
        )
        db.add(db_entry)
        db.flush() # ID'yi alabilmek için veritabanına gönderiyoruz

        # Duygu metriklerini kaydetme
        db_metrics = SentimentMetrics(
            entry_id=db_entry.id,
            joy=analysis.joy,
            trust=analysis.trust,
            fear=analysis.fear,
            surprise=analysis.surprise,
            sadness=analysis.sadness,
            disgust=analysis.disgust,
            anger=analysis.anger,
            anticipation=analysis.anticipation
        )
        db.add(db_metrics)

        # Konuları kaydetme
        for topic, weight in zip(analysis.topics, analysis.topic_weights):
            db_topic = TopicMetrics(
                entry_id=db_entry.id,
                topic=topic,
                score=weight
            )
            db.add(db_topic)

        # Koç önerisini kaydetme
        db_insight = CoachInsight(
            entry_id=db_entry.id,
            insight=coach_feedback
        )
        db.add(db_insight)
        
        db.commit()
        db.refresh(db_entry)

        # İstatistiksel trendleri ve anomalileri yeniden hesaplama
        analytics.calculate_trends_and_anomalies(db)

        return {
            "id": db_entry.id,
            "created_at": db_entry.created_at,
            "content": db_entry.content,
            "sentiment_score": db_entry.sentiment_score,
            "summary": db_entry.summary,
            "sentiment_metrics": {
                "joy": db_metrics.joy,
                "trust": db_metrics.trust,
                "fear": db_metrics.fear,
                "surprise": db_metrics.surprise,
                "sadness": db_metrics.sadness,
                "disgust": db_metrics.disgust,
                "anger": db_metrics.anger,
                "anticipation": db_metrics.anticipation
            },
            "topics": [{"topic": t.topic, "score": t.score} for t in db_entry.topics],
            "insight": db_insight.insight
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"İşlem sırasında bir hata oluştu: {str(e)}"
        )


@router.get("/entries/")
def get_all_entries(db: Session = Depends(get_db)):
    """
    Kullanıcının yazdığı tüm günlükleri metrikleri ve koç önerileriyle birlikte listeler.
    """
    entries = db.query(JournalEntry).order_by(JournalEntry.created_at.desc()).all()
    
    results = []
    for entry in entries:
        metrics = entry.sentiment_metrics
        topics = entry.topics
        insight = entry.insight
        
        results.append({
            "id": entry.id,
            "created_at": entry.created_at,
            "content": entry.content,
            "sentiment_score": entry.sentiment_score,
            "summary": entry.summary,
            "is_anomaly": entry.is_anomaly,
            "sentiment_metrics": {
                "joy": metrics.joy if metrics else 0.0,
                "trust": metrics.trust if metrics else 0.0,
                "fear": metrics.fear if metrics else 0.0,
                "surprise": metrics.surprise if metrics else 0.0,
                "sadness": metrics.sadness if metrics else 0.0,
                "disgust": metrics.disgust if metrics else 0.0,
                "anger": metrics.anger if metrics else 0.0,
                "anticipation": metrics.anticipation if metrics else 0.0
            } if metrics else None,
            "topics": [{"topic": t.topic, "score": t.score} for t in topics],
            "insight": insight.insight if insight else None
        })
    return results


@router.get("/analytics/")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    """
    Zaman serisi grafikleri ve korelasyon verilerini döner.
    """
    trends = analytics.calculate_trends_and_anomalies(db)
    correlations = analytics.get_topic_emotion_correlations(db)
    return {
        "trends": trends,
        "correlations": correlations
    }


@router.delete("/entry/{entry_id}/")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    Belirli bir günlüğü siler.
    """
    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Günlük bulunamadı."
        )
    try:
        db.delete(entry)
        db.commit()
        # İndisleri güncelle
        analytics.calculate_trends_and_anomalies(db)
        return {"detail": "Günlük başarıyla silindi."}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
