# **Aura AI - Yapay Zeka Destekli Günlük Analizi ve Mental Koç Sistemi**

---

## **Ekip Bilgileri**

| İsim | Rol | E-Posta / İletişim |
| :---: | :---: | :---: |
| **Betül Uçaker** | Scrum Master | [betul.ucaker@example.com] |
| **İlyas Berkay Kutlu** | Product Owner | [ilyas.berkay.kutlu@example.com] |
| **Uğur Can Özen** | Developer (Veri Bilimi Cohort) | [ugur.can.ozen@example.com] |

---

## **Ürün Açıklaması**

Günümüzün yoğun temposunda zihinsel sağlığımızı korumak ve duygusal dalgalanmalarımızı fark etmek her zamankinden daha önemli hale gelmiştir. **Aura AI**, kullanıcının günlük olarak yazdığı kişisel metinleri analiz eden, duygusal durumu Plutchik'in 8 temel duygu boyutu bazında ölçeklendiren ve geçmiş günlerin verileriyle entegre çalışan bir yapay zeka sistemidir.

Sistem, basit bir duygu analizi uygulaması olmanın ötesinde:
1.  Kullanıcının yazdığı metinlerden duyguları ve konuları çıkartır.
2.  Zaman serisi analizi ile haftalık duygu trendlerini hesaplar ve duygu durumundaki ani değişimleri (anomalileri) tespit eder.
3.  **Çoklu Ajan (Multi-Agent)** yapısı ve **Semantik Bellek (Memory)** entegrasyonu sayesinde, kullanıcının geçmişine atıfta bulunarak ona özel kişiselleştirilmiş mental koçluk geri bildirimleri ve bilişsel davranışçı öneriler üretir.

---

## **Ürün Özellikleri**

### 1. Minimalist ve Güvenli Günlük Editörü
*   Kullanıcının günlük düşüncelerini rahatça yazabileceği, dikkati dağıtmayan premium tasarım.
*   Yerel veritabanı (SQLite) entegrasyonu ile tüm verilerin güvenli bir şekilde saklanması.

### 2. Plutchik Modeline Göre Çok Boyutlu Duygu Analizi
*   Geleneksel "olumlu/olumsuz" analizi yerine; **Neşe, Güven, Korku, Öfke, Üzüntü, Şaşkınlık, İğrenme ve Beklenti** boyutlarında detaylı skorlama (0.0 - 1.0 arası).
*   Metin içerisinden çıkarılan ana temalar/konular (örn: İş, Aile, Sağlık, Sınav).

### 3. Analitik Grafik Arayüzü (Veri Bilimi Odaklı)
*   **Haftalık Duygu Değişim Grafiği:** 8 temel duygunun günlere göre değişim trendi.
*   **Trend & Anomali Tespiti:** Duygu durumunda normalin dışına çıkan (anomali) günlerin otomatik tespiti ve grafik üzerinde işaretlenmesi.
*   **Konu-Duygu Korelasyonları:** Hangi konuların hangi duyguları ne oranda tetiklediğinin analizi.

### 4. Bellek Destekli Kişisel Ajan (Mental Koç)
*   Google Gemini API kullanılarak oluşturulan ve geçmiş hafızaya (Semantik Arama) erişebilen kişisel koç.
*   Kullanıcıya özel empati kuran, geçmiş günlerdeki gelişimini takip eden ve buna göre bilimsel öneriler sunan arayüz.

---

## **Hedef Kitle**

*   Zihinsel farkındalık (mindfulness) kazanmak ve duygu durumunu takip etmek isteyenler.
*   Günlük tutma alışkanlığı kazanmak ve geçmişe dönük duygusal analizlerini görmek isteyen bireyler.
*   Stres ve kaygı yönetimi konusunda yapay zeka destekli rehberliğe ihtiyaç duyanlar.

---

## **Product Backlog**

Projemizin yönetim süreçlerini interaktif olarak takip ettiğimiz backlog tahtamıza aşağıdaki bağlantıdan ulaşabilirsiniz:
*   [Aura AI Miro Backlog Board](https://miro.com/app/board/uXjVOSSCpsI=/) *(Örnektir)*

---

## **Sprint Logları**

*   [Sprint 1 Raporu (19 Haziran - 5 Temmuz)](./project_management/sprint_1/README.md)
*   [Sprint 2 Raporu (6 Temmuz - 19 Temmuz)](./project_management/sprint_2/README.md)

---

## **Teknolojik Altyapı**

*   **Frontend:** React (Vite) + Vanilla CSS + Recharts (İnteraktif Grafikler)
*   **Backend:** Python (FastAPI) + Google Gemini API (Orkestrasyon & Ajanlar)
*   **Veritabanı:** SQLite + SQLAlchemy ORM
*   **Veri Bilimi:** Pandas, Numpy, Scikit-learn (Anomali tespiti ve trend analizleri için)
