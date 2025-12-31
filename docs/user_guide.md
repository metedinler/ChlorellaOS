# ChlorellaOS Kullanım Kılavuzu

© 2025 Mete Dinler. All rights reserved.

## İçindekiler

1. [Giriş](#giriş)
2. [Sistem Gereksinimleri](#sistem-gereksinimleri)
3. [Kurulum](#kurulum)
4. [Modüller](#modüller)
5. [Kullanım Örnekleri](#kullanım-örnekleri)
6. [Lisans ve Telif Hakları](#lisans-ve-telif-hakları)

## Giriş

ChlorellaOS, Chlorella Vulgaris endüstriyel üretimi için geliştirilmiş kapsamlı bir izleme ve yönetim sistemidir. Sistem, üretim sürecinin tüm aşamalarını kapsayan 5 ana modülden oluşmaktadır.

### Temel Özellikler

- **Yetiştiricilik İzleme**: Ortam parametreleri, büyüme takibi, hasat yönetimi
- **Analiz ve Ölçüm**: Biyokütle analizi, kalite kontrol, verimlilik hesaplamaları
- **Kayıt Sistemi**: Merkezi veri yönetimi, raporlama, izlenebilirlik
- **Muhasebe**: Maliyet takibi, stok yönetimi, finansal raporlama
- **Karlılık Analizi**: ROI, fizibilite, üretim simülasyonları

## Sistem Gereksinimleri

### Donanım
- Minimum 4GB RAM
- 10GB boş disk alanı
- İnternet bağlantısı (lisans doğrulama için)

### Yazılım
- Python 3.8 veya üzeri
- SQLite veya PostgreSQL
- İşletim Sistemi: Windows 10+, Linux, macOS

## Kurulum

⚠️ **ÖNEMLİ**: Bu sistem ticari bir üründür ve **GEÇERLİ BİR LİSANS GEREKTİRİR**.

### Adım 1: Depoyu Klonlama

```bash
# YETKİSİZ KULLANILAMAZ
git clone https://github.com/metedinler/ChlorellaOS.git
cd ChlorellaOS
```

### Adım 2: Bağımlılıkları Yükleme

```bash
pip install -r requirements.txt
```

### Adım 3: Lisans Anahtarı Ayarlama

```bash
# Lisans anahtarı çevre değişkeni olarak ayarlanmalıdır
export CHLORELLA_LICENSE_KEY="your-license-key-here"
```

### Adım 4: Veritabanını Başlatma

```bash
python -m chlorellaos.setup
```

## Modüller

### 1. Yetiştiricilik Modülü (Cultivation)

Üretim ortamı izleme ve yönetimi için kullanılır.

**Sınıflar:**
- `CultivationEnvironment`: Ortam parametrelerini kaydet
- `GrowthTracker`: Büyüme verilerini takip et
- `ImmobilizationProcess`: İmmobilizasyon prosesi kontrolü
- `HarvestManager`: Hasat planlama ve yönetimi

**Örnek Kullanım:**

```python
from chlorellaos.cultivation import CultivationEnvironment

# Ortam oluştur
env = CultivationEnvironment(batch_id="BATCH001", location="Tank-A")

# Ortam parametrelerini kaydet
env.record_environment(
    temperature=25.5,
    ph=7.5,
    light_intensity=5000,
    nutrient_concentration=2.5
)

# Ortalama koşulları al
avg_conditions = env.get_average_conditions()
```

### 2. Analiz ve Ölçüm Modülü (Analysis)

Biyokütle yoğunluğu, kalite kontrol ve verimlilik analizleri.

**Sınıflar:**
- `BiomassAnalyzer`: Biyokütle analizi
- `QualityControl`: Kalite kontrol testleri
- `ProductivityCalculator`: Verimlilik hesaplamaları
- `LabTestIntegration`: Laboratuvar entegrasyonu
- `RealTimeMonitor`: Gerçek zamanlı izleme

**Örnek Kullanım:**

```python
from chlorellaos.analysis import BiomassAnalyzer, QualityControl

# Biyokütle analizi
analyzer = BiomassAnalyzer(batch_id="BATCH001")
analyzer.measure_dry_weight(sample_volume=100, dry_weight=0.5)

# Kalite kontrol
qc = QualityControl(batch_id="BATCH001")
qc.test_protein_content(protein_percentage=55.2)
qc.test_chlorophyll_content(chlorophyll_mg_per_g=12.5)

# Kalite skoru
quality_score = qc.get_overall_quality_score()
```

### 3. Kayıt Sistemi (Recording)

Tüm üretim verilerinin merkezi kaydı ve yönetimi.

**Sınıflar:**
- `DataRecorder`: Merkezi veri kayıt sistemi
- `TimeSeriesManager`: Zaman serisi veri yönetimi
- `ReportGenerator`: Raporlama sistemi
- `TraceabilitySystem`: İzlenebilirlik sistemi

**Örnek Kullanım:**

```python
from chlorellaos.recording import DataRecorder, ReportGenerator

# Veri kaydedici
recorder = DataRecorder()

# Batch oluştur
recorder.create_batch(
    batch_id="BATCH001",
    location="Tank-A",
    metadata={'capacity': 1000, 'type': 'photobioreactor'}
)

# Veri kaydet
recorder.record_data(
    batch_id="BATCH001",
    record_type="cultivation",
    module="environment",
    data={'temperature': 25.5, 'ph': 7.5}
)

# Rapor oluştur
reporter = ReportGenerator(recorder)
report = reporter.generate_batch_report("BATCH001")
```

### 4. Muhasebe Modülü (Accounting)

Maliyet takibi, stok yönetimi ve finansal raporlama.

**Sınıflar:**
- `AccountingManager`: Muhasebe yönetimi
- `CostTracker`: Maliyet takibi
- `InventoryManager`: Stok yönetimi
- `FinancialReporter`: Mali raporlama

**Örnek Kullanım:**

```python
from chlorellaos.accounting import (
    AccountingManager, CostTracker, 
    TransactionType, CostCategory
)

# Muhasebe yöneticisi
accounting = AccountingManager(facility_id="Facility-1")

# Gider kaydet
accounting.record_transaction(
    transaction_type=TransactionType.EXPENSE,
    amount=5000,
    currency="TRY",
    category="raw_materials",
    description="Nutrient purchase"
)

# Maliyet takip
cost_tracker = CostTracker(batch_id="BATCH001")
cost_tracker.add_cost(
    category=CostCategory.RAW_MATERIALS,
    amount=5000,
    currency="TRY",
    description="Nutrients",
    quantity=100,
    unit="kg"
)

# Toplam maliyet
total_cost = cost_tracker.get_total_cost()
```

### 5. Karlılık Analizi Modülü (Profitability)

ROI hesaplamaları, fizibilite çalışmaları ve üretim simülasyonları.

**Sınıflar:**
- `ProfitabilityAnalyzer`: Karlılık analizi
- `ROICalculator`: ROI hesaplamaları
- `CostBenefitAnalysis`: Maliyet-fayda analizi
- `FeasibilityStudy`: Fizibilite çalışması
- `ProductionSimulator`: Üretim simülatörü

**Örnek Kullanım:**

```python
from chlorellaos.profitability import (
    ProfitabilityAnalyzer, ROICalculator, FeasibilityStudy
)

# Karlılık analizi
analyzer = ProfitabilityAnalyzer(batch_id="BATCH001")
profitability = analyzer.analyze_batch_profitability(
    total_revenue=50000,
    total_costs=30000,
    biomass_produced_kg=1000
)

# ROI hesaplama
roi = ROICalculator.calculate_roi(
    gain_from_investment=50000,
    cost_of_investment=30000
)

# Fizibilite çalışması
study = FeasibilityStudy(project_name="New Production Line")
study.add_scenario(
    scenario_name="Optimistic",
    assumptions={'production_kg_day': 50, 'price_per_kg': 100},
    projected_results={'npv': 500000, 'roi_percent': 35}
)

# En iyi senaryoyu öner
recommendation = study.recommend_best_scenario()
```

## API Referansı

Detaylı API dokümantasyonu için `docs/api_reference.md` dosyasına bakınız.

## Veri Yapıları

### Batch Bilgisi

```python
{
    'batch_id': 'BATCH001',
    'start_date': '2025-01-01T00:00:00',
    'status': 'active',  # 'active', 'harvested', 'completed'
    'location': 'Tank-A',
    'metadata': {}
}
```

### Ortam Ölçümü

```python
{
    'timestamp': '2025-01-01T12:00:00',
    'temperature': 25.5,
    'ph': 7.5,
    'light_intensity': 5000,
    'nutrient_concentration': 2.5
}
```

### Kalite Test Sonucu

```python
{
    'timestamp': '2025-01-01T12:00:00',
    'test_type': 'protein_content',
    'value': 55.2,
    'unit': 'percentage',
    'status': 'pass'  # 'pass' veya 'fail'
}
```

## Güvenlik ve Yedekleme

### Veri Güvenliği

- Tüm hassas veriler şifreli olarak saklanır
- Kullanıcı kimlik doğrulaması zorunludur
- Tüm işlemler audit log'da kaydedilir

### Yedekleme

```bash
# Manuel yedekleme
python -m chlorellaos.backup --create

# Yedekleme geri yükleme
python -m chlorellaos.backup --restore backup_file.db
```

## Sorun Giderme

### Lisans Hatası

```
⚠️ CHLORELLAOS - LİSANS GEREKLİ
```

**Çözüm**: Geçerli bir lisans anahtarı ayarlayın:
```bash
export CHLORELLA_LICENSE_KEY="your-key"
```

### Veritabanı Bağlantı Hatası

**Çözüm**: Veritabanı ayarlarını kontrol edin: `config/settings.py`

## Destek ve İletişim

- Repository: https://github.com/metedinler/ChlorellaOS
- Email: contact@chlorellaos.com

## Lisans ve Telif Hakları

```
© 2025 Mete Dinler. All rights reserved.
This repository is private and confidential.
Unauthorized copying, modification, or distribution is prohibited.

Bu sistem KULLANIMA AÇIK DEĞİLDİR.
ÜCRET ÖDEMEDEN KULLANILAMAZ.
Tüm hakları ZUHTU METE DINLER tarafından saklıdır.
```

### Lisans Alma

Lisans satın almak ve kullanım hakları hakkında bilgi almak için iletişime geçiniz.

---

**ChlorellaOS v1.0.0**  
Geliştirildi ve sahiplik hakları: Zuhtu Mete Dinler  
© 2025. Tüm hakları saklıdır.
