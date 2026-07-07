import pandas as pd
import numpy as np
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.database import JournalEntry, SentimentMetrics, TopicMetrics

def get_analytics_dataframe(db: Session) -> pd.DataFrame:
    """
    Veritabanındaki tüm günlükleri ve duygu skorlarını bir Pandas DataFrame'ine dönüştürür.
    """
    entries = db.query(JournalEntry).order_by(JournalEntry.created_at.asc()).all()
    if not entries:
        return pd.DataFrame()

    data = []
    for entry in entries:
        metrics = entry.sentiment_metrics
        row = {
            "id": entry.id,
            "created_at": entry.created_at,
            "sentiment_score": entry.sentiment_score,
            "joy": metrics.joy if metrics else 0.0,
            "trust": metrics.trust if metrics else 0.0,
            "fear": metrics.fear if metrics else 0.0,
            "surprise": metrics.surprise if metrics else 0.0,
            "sadness": metrics.sadness if metrics else 0.0,
            "disgust": metrics.disgust if metrics else 0.0,
            "anger": metrics.anger if metrics else 0.0,
            "anticipation": metrics.anticipation if metrics else 0.0,
            "summary": entry.summary
        }
        data.append(row)
        
    df = pd.DataFrame(data)
    df["created_at"] = pd.to_datetime(df["created_at"])
    return df


def calculate_trends_and_anomalies(db: Session, window_size: int = 3) -> List[Dict[str, Any]]:
    """
    Zaman serisi trend analizi ve anomali tespiti yapar.
    - Hareketli ortalama (Rolling Mean) ile dalgalanmalar yumuşatılır.
    - Z-Skoru ile duygu durumundaki istatistiksel sapmalar (anomaliler) tespit edilir.
    """
    df = get_analytics_dataframe(db)
    if df.empty:
        return []

    # 1. Hareketli Ortalama Hesaplama (Rolling Average)
    # Veri boyutu window_size'dan küçükse minimum periyot 1 olarak ayarlanır.
    df["rolling_sentiment"] = df["sentiment_score"].rolling(window=window_size, min_periods=1).mean()

    # 2. İstatistiksel Anomali Tespiti (Anomaly Detection)
    # En az 5 veri noktası varsa standart sapma üzerinden anomali aranır.
    df["is_anomaly"] = False
    if len(df) >= 5:
        mean_val = df["sentiment_score"].mean()
        std_val = df["sentiment_score"].std()
        
        # Standart sapma sıfır değilse, ortalamadan 1.5 kat standart sapma uzaklıktaki değerler anomali sayılır
        if std_val > 0.01:
            threshold = 1.5
            df["z_score"] = (df["sentiment_score"] - mean_val) / std_val
            df["is_anomaly"] = df["z_score"].abs() > threshold
            
            # Veritabanında da güncelliyoruz
            for _, row in df.iterrows():
                db_entry = db.query(JournalEntry).filter(JournalEntry.id == int(row["id"])).first()
                if db_entry:
                    db_entry.is_anomaly = bool(row["is_anomaly"])
            db.commit()

    # Sonuçları listeye dönüştürme
    results = []
    for _, row in df.iterrows():
        results.append({
            "id": int(row["id"]),
            "date": row["created_at"].strftime("%Y-%m-%d"),
            "sentiment_score": float(row["sentiment_score"]),
            "rolling_sentiment": float(row["rolling_sentiment"]),
            "is_anomaly": bool(row["is_anomaly"]),
            "joy": float(row["joy"]),
            "trust": float(row["trust"]),
            "fear": float(row["fear"]),
            "surprise": float(row["surprise"]),
            "sadness": float(row["sadness"]),
            "disgust": float(row["disgust"]),
            "anger": float(row["anger"]),
            "anticipation": float(row["anticipation"]),
            "summary": row["summary"]
        })
    return results


def get_topic_emotion_correlations(db: Session) -> List[Dict[str, Any]]:
    """
    Konu-Duygu ilişkilerini hesaplar.
    Her bir konunun hangi duygularla daha çok bağdaştığını (ortalama skorlarını) bulur.
    """
    topics = db.query(TopicMetrics).all()
    if not topics:
        return []

    # Konuları toplayalım
    topic_data = []
    for t in topics:
        metrics = db.query(SentimentMetrics).filter(SentimentMetrics.entry_id == t.entry_id).first()
        if metrics:
            topic_data.append({
                "topic": t.topic,
                "score": t.score,
                "joy": metrics.joy,
                "trust": metrics.trust,
                "fear": metrics.fear,
                "surprise": metrics.surprise,
                "sadness": metrics.sadness,
                "disgust": metrics.disgust,
                "anger": metrics.anger,
                "anticipation": metrics.anticipation
            })

    df = pd.DataFrame(topic_data)
    if df.empty:
        return []

    # Konulara göre gruplayıp ortalamalarını alalım
    grouped = df.groupby("topic").mean().reset_index()

    # Çıktı listesini hazırlayalım
    correlations = []
    for _, row in grouped.iterrows():
        correlations.append({
            "topic": row["topic"],
            "joy": round(float(row["joy"]), 2),
            "trust": round(float(row["trust"]), 2),
            "fear": round(float(row["fear"]), 2),
            "surprise": round(float(row["surprise"]), 2),
            "sadness": round(float(row["sadness"]), 2),
            "disgust": round(float(row["disgust"]), 2),
            "anger": round(float(row["anger"]), 2),
            "anticipation": round(float(row["anticipation"]), 2)
        })
    return correlations


def get_past_memory_context(db: Session, limit: int = 5) -> str:
    """
    Insights Ajanı (Koç) için geçmiş bellek (hafıza) özetini hazırlar.
    Son günlüklerin duygu skorlarını ve özetlerini tek bir metinde birleştirir.
    """
    entries = db.query(JournalEntry).order_by(JournalEntry.created_at.desc()).limit(limit).all()
    if not entries:
        return "Geçmiş günlere ait veri henüz yok. Bu kullanıcının ilk günlüğü."

    memory_lines = []
    for entry in reversed(entries):
        date_str = entry.created_at.strftime("%Y-%m-%d")
        summary = entry.summary if entry.summary else "Özet yok."
        sentiment = f"Genel Duygu Puanı: {entry.sentiment_score:.2f}"
        memory_lines.append(f"- {date_str}: {summary} ({sentiment})")

    return "\n".join(memory_lines)
