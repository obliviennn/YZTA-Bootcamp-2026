import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.models.database import Base, JournalEntry, SentimentMetrics, TopicMetrics
from backend.app.services.analytics import calculate_trends_and_anomalies, get_topic_emotion_correlations

# Geçici in-memory SQLite veritabanı kurma
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


def test_analytics_calculations(db_session):
    # 1. Test verisi oluşturma (5 adet ardışık günlük kaydı)
    # Duygu skorları: 0.8, 0.7, 0.9, 0.1 (anomali olmalı), 0.85
    scores = [0.8, 0.7, 0.9, 0.1, 0.85]
    base_date = datetime.utcnow() - timedelta(days=6)

    for i, score in enumerate(scores):
        entry = JournalEntry(
            content=f"Test günlüğü içeriği {i}. Bu bir test yazısıdır.",
            sentiment_score=score,
            summary=f"Özet {i}",
            created_at=base_date + timedelta(days=i),
            is_anomaly=False
        )
        db_session.add(entry)
        db_session.flush()

        metrics = SentimentMetrics(
            entry_id=entry.id,
            joy=score, trust=0.8, fear=0.1, surprise=0.1,
            sadness=0.1, disgust=0.0, anger=0.0, anticipation=0.5
        )
        db_session.add(metrics)

        # Konu ekleme
        topic = TopicMetrics(
            entry_id=entry.id,
            topic="TestKonu",
            score=0.9
        )
        db_session.add(topic)

    db_session.commit()

    # 2. İstatistiksel Hesaplamaları Çalıştır (Hareketli ortalama & Anomali)
    trends = calculate_trends_and_anomalies(db_session, window_size=3)

    # 3. Doğrulamalar
    assert len(trends) == 5
    
    # 4. Hareketli ortalama kontrolü
    # 3. günün ortalaması (0.8 + 0.7 + 0.9) / 3 = 0.80
    assert abs(trends[2]["rolling_sentiment"] - 0.80) < 0.01

    # 5. Anomali kontrolü
    # 0.1 puanı (4. gün - index 3) ortalamanın (0.67) oldukça altında olduğu için anomali olmalı
    # Not: Standart sapma üzerinden hesaplandığı için is_anomaly durumunu kontrol ediyoruz
    assert trends[3]["is_anomaly"] is True

    # 6. Konu-Duygu ilişkisi doğrulaması
    correlations = get_topic_emotion_correlations(db_session)
    assert len(correlations) > 0
    assert correlations[0]["topic"] == "TestKonu"
    # Ortalama neşe skoru (0.8+0.7+0.9+0.1+0.85)/5 = 0.67
    assert abs(correlations[0]["joy"] - 0.67) < 0.05
