import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, Float, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

# SQLite veritabanı dosyasının belirlenmesi
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "aura_ai.db"))
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    sentiment_score = Column(Float, default=0.0) # 0.0 (Kötü) ile 1.0 (Çok İyi) arası
    summary = Column(Text, nullable=True)
    is_anomaly = Column(Boolean, default=False)

    # İlişkiler
    sentiment_metrics = relationship("SentimentMetrics", back_populates="entry", uselist=False, cascade="all, delete-orphan")
    topics = relationship("TopicMetrics", back_populates="entry", cascade="all, delete-orphan")
    insight = relationship("CoachInsight", back_populates="entry", uselist=False, cascade="all, delete-orphan")


class SentimentMetrics(Base):
    """
    Plutchik'in 8 Temel Duygu Boyutu (0.0 - 1.0 arası)
    """
    __tablename__ = "sentiment_metrics"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    joy = Column(Float, default=0.0)         # Neşe
    trust = Column(Float, default=0.0)       # Güven
    fear = Column(Float, default=0.0)        # Korku
    surprise = Column(Float, default=0.0)    # Şaşkınlık
    sadness = Column(Float, default=0.0)     # Üzüntü
    disgust = Column(Float, default=0.0)     # İğrenme
    anger = Column(Float, default=0.0)       # Öfke
    anticipation = Column(Float, default=0.0) # Beklenti

    entry = relationship("JournalEntry", back_populates="sentiment_metrics")


class TopicMetrics(Base):
    """
    Metinden çıkarılan ana konular ve ağırlıkları
    """
    __tablename__ = "topic_metrics"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(50), nullable=False) # örn: İş, Aile, Sağlık, Sınav
    score = Column(Float, default=0.0)

    entry = relationship("JournalEntry", back_populates="topics")


class CoachInsight(Base):
    """
    Mental Koç Ajanının ürettiği kişiselleştirilmiş geri bildirim ve öneriler
    """
    __tablename__ = "coach_insights"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, unique=True)
    insight = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    entry = relationship("JournalEntry", back_populates="insight")


# Veritabanını oluşturma fonksiyonu
def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
