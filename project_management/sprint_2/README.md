# **Sprint 2 Raporu (6 Temmuz - 19 Temmuz)**

Şu an içinde bulunduğumuz 2. Sprint'te ana odak noktamız, veri tabanı modellerini ayağa kaldırmak, backend yapay zeka ajanlarını (Gemini) entegre etmek, zaman serisi analizlerini entegre edip React arayüzü ile interaktif grafikleri birleştirmektir.

---

## **1. Backlog Düzeni ve Story Seçimleri**

Bu sprint için üstlendiğimiz hedefler (User Stories):
*   **Story 5: Backend API & SQLite Modellerinin Kurulması** (5 Puan) - *Tamamlandı (9 Temmuz)*
*   **Story 6: Yapay Zeka Ajanları & Gemini API Orkestrasyonu** (8 Puan) - *Tamamlandı (10 Temmuz)*
*   **Story 7: Zaman Serisi Analitiği (Anomali & Trend)** (5 Puan) - *Tamamlandı (11 Temmuz)*
*   **Story 8: React Projesinin Kurulumu ve Arayüz Kodlaması** (8 Puan) - *Tamamlandı (12 Temmuz)*

**Sprint Planlanan Toplam Puan:** 26 Puan  
**Tamamlanan Puan:** 26 Puan

---

## **2. Daily Scrum (Günlük Toplantı Özetleri)**

*   **6 Temmuz:** Sprint 2 planlama toplantısı yapıldı. Betül görevlerin Jira/Miro üzerinde atanmasını kontrol etti. İlyas API parametrelerinde çıkarılacak duygu ve konu detaylarını netleştirdi. Uğur Can geliştirme ortamını kurdu.
*   **7 Temmuz:** Backend klasör yapısı kuruldu. Veri tabanı şemaları kodlanmaya başlandı. Gemini API entegrasyonu için istem (prompt) şablonları hazırlandı.
*   **8 Temmuz:** Uğur Can SQLite veritabanı modellerini ve SQLAlchemy ORM bağlantılarını kurdu. Betül API uçlarının test senaryolarını hazırladı. İlyas veri formatlarını ve Gemini JSON çıktı yapılarını onayladı.
*   **9 Temmuz:** Uğur Can Gemini entegrasyonu ve çoklu ajan (Ingestion, Extraction, Insights) mimarisini backend tarafında hayata geçirdi. İlk entegrasyon testleri yapıldı.
*   **10 Temmuz:** Uğur Can zaman serisi analiz kodlarını (hareketli ortalama ve Z-skoru tabanlı anomali tespiti) `analytics.py` içerisine ekledi. Pytest birim testleri yazılarak matematiksel modeller doğrulandı.
*   **11 Temmuz:** Uğur Can React projesini kurdu ve Recharts kütüphanesini entegre etti. Plutchik radar grafiği ve zaman serisi grafik bileşenleri kodlandı.
*   **12 Temmuz:** Uğur Can frontend ve backend bağlantılarını kurdu, mock veritabanı mekanizmasını entegre etti. Betül ve İlyas ile birlikte uçtan uca sistem akışı test edildi ve onaylandı.
*   **13 Temmuz (Bugün):** Geliştirici e-posta bilgileri güncellendi. Sistem test edilmeye ve canlı ortama (deployment) taşınmaya hazır hale getirildi. Klasör yapısı düzenlendi.

---

## **3. Sprint Board Durumu (Ekran Görüntüsü)**
*(Sprint board ekran görüntüleri ve Miro linkleri bu kısma eklenecektir.)*
*   [Sprint 2 Miro Tahtası](https://miro.com/app/board/uXjVOSSCpsI=/)
