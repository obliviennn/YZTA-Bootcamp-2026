import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Gemini API Client kurulumu
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

def get_gemini_client():
    if not GEMINI_API_KEY:
        # API key bulunamazsa geliştirme amaçlı mock/test modunda veya hata fırlatarak çalışabiliriz
        raise ValueError("GEMINI_API_KEY bulunamadı. Lütfen .env dosyasını veya çevre değişkenlerini ayarlayın.")
    return genai.Client(api_key=GEMINI_API_KEY)


class SentimentAnalysisSchema(BaseModel):
    joy: float = Field(..., description="Neşe (Joy) skoru 0.0 - 1.0 arası")
    trust: float = Field(..., description="Güven (Trust) skoru 0.0 - 1.0 arası")
    fear: float = Field(..., description="Korku (Fear) skoru 0.0 - 1.0 arası")
    surprise: float = Field(..., description="Şaşkınlık (Surprise) skoru 0.0 - 1.0 arası")
    sadness: float = Field(..., description="Üzüntü (Sadness) skoru 0.0 - 1.0 arası")
    disgust: float = Field(..., description="İğrenme (Disgust) skoru 0.0 - 1.0 arası")
    anger: float = Field(..., description="Öfke (Anger) skoru 0.0 - 1.0 arası")
    anticipation: float = Field(..., description="Beklenti (Anticipation) skoru 0.0 - 1.0 arası")
    overall_sentiment: float = Field(..., description="Genel duygu skoru 0.0 (en kötü/üzgün) ile 1.0 (en iyi/mutlu) arası")
    topics: List[str] = Field(..., description="Metinden çıkarılan anahtar konular (örn: İş, Aile, Sınav, Arkadaşlar, Sağlık, İlişki)")
    topic_weights: List[float] = Field(..., description="Her konunun ağırlığı 0.0 - 1.0 arası, topics listesiyle aynı sırada olmalı")
    summary: str = Field(..., description="Günlük metninin 1-2 cümlelik kısa ve tarafsız Türkçe özeti")


class AuraAgentOrchestrator:
    def __init__(self):
        try:
            self.client = get_gemini_client()
            self.mock_mode = False
        except ValueError:
            self.client = None
            self.mock_mode = True
            print("WARNING: Gemini Client Mock Modda çalışıyor. Lütfen API Key girin.")

    def run_ingestion_agent(self, content: str) -> bool:
        """
        1. Ajan: Veri Kalitesi & Giriş Kontrol Ajanı
        Kullanıcının yazdığı yazının geçerli olup olmadığını (anlamsız rastgele tuşlar mı, çok mu kısa) kontrol eder.
        """
        cleaned = content.strip()
        if len(cleaned) < 15:
            return False
        # Eğer harf dışı rastgele sembollerden oluşuyorsa elemek için basit kontrol
        letters = [c for c in cleaned if c.isalpha()]
        if len(letters) / len(cleaned) < 0.4:
            return False
        return True

    def run_extraction_agent(self, content: str) -> SentimentAnalysisSchema:
        """
        2. Ajan: Duygu ve Konu Analiz Ajanı (Gemini API)
        Plutchik modülüne göre 8 duyguyu analiz eder, konuları ve özetleri çıkarır.
        """
        if self.mock_mode:
            # Geliştirme sürecinde API key yoksa test çıktısı döner
            return SentimentAnalysisSchema(
                joy=0.6, trust=0.7, fear=0.2, surprise=0.1,
                sadness=0.1, disgust=0.0, anger=0.1, anticipation=0.5,
                overall_sentiment=0.75,
                topics=["Geliştirme", "Yapay Zeka"],
                topic_weights=[0.8, 0.6],
                summary="Kullanıcı yapay zeka sistemi geliştirme konusunda heyecanlı ve umutlu."
            )

        prompt = f"""
        Aşağıdaki günlük metnini analiz et. 
        Metinden Plutchik'in 8 temel duygu boyutunu 0.0 ile 1.0 arasında skorla. 
        Anahtar konuları ve ağırlıklarını belirle.
        Metnin kısa bir Türkçe özetini çıkar.

        Günlük Metni:
        \"\"\"{content}\"\"\"
        """
        
        response = self.client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SentimentAnalysisSchema,
                temperature=0.1
            ),
        )
        # Gemini'dan dönen JSON metnini şemaya parse eder
        return SentimentAnalysisSchema.model_validate_json(response.text)

    def run_insights_agent(self, current_content: str, current_analysis: SentimentAnalysisSchema, past_memory_context: str) -> str:
        """
        4. Ajan: Kişisel Koç Ajanı (Gemini API)
        Kullanıcının bugünkü yazısını, analiz sonuçlarını ve geçmiş hafızasını (Memory) harmanlayarak
        CBT (Bilişsel Davranışçı Terapi) prensiplerine uygun, destekleyici ve yapıcı bir yanıt üretir.
        """
        if self.mock_mode:
            return "Harika bir gelişim gösteriyorsun! Geçmiş verilerine baktığımda benzer durumlarda başarılı olduğunu gördüm. Kendine zaman ayırmaya devam et."

        prompt = f"""
        Sen Aura AI isimli, bilişsel davranışçı terapi (CBT) yaklaşımlarına hakim, empatik ve destekleyici bir Kişisel Mental Koç Ajanısın.
        Kullanıcının bugünkü günlük yazısını, bugünkü duygu analizi skorlarını ve geçmiş günlere ait bellek özetlerini analiz ederek ona özel bir değerlendirme ve öneri yaz.
        
        Kurallar:
        - Samimi, empatik ancak profesyonel bir dil kullan (Sen dili).
        - Geçmiş bellekte (Hafıza) verilen bilgilere mutlaka atıfta bulun (örn: 'Geçen hafta sınav stresinden bahsetmiştin, bugün ise...').
        - Kullanıcının duygu grafiğindeki eğilime göre motivasyon ver veya sakinleştirici öneriler sun (nefes egzersizi, yürüyüş, planlama vb.).
        - Yanıtını 4-5 cümleyi geçmeyecek şekilde kompakt tut.

        ---
        Bugünkü Günlük Yazısı:
        \"\"\"{current_content}\"\"\"

        Bugünkü Duygu Skorları:
        {current_analysis.model_dump_json(indent=2)}

        Geçmiş Günlüklerin Özeti (Semantik Hafıza):
        {past_memory_context}
        ---
        """

        response = self.client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7
            )
        )
        return response.text
