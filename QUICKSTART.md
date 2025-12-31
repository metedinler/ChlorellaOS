# ChlorellaOS Hızlı Başlangıç Kılavuzu

© 2025 Mete Dinler. All rights reserved.

## ⚠️ Önemli Uyarı

Bu sistem **KULLANIMA AÇIK DEĞİLDİR** ve **ÜCRET ÖDEMEDEN KULLANILAMAZ**.
Tüm hakları ZUHTU METE DINLER tarafından saklıdır.

## 1. Sistem Gereksinimleri

- Python 3.8 veya üzeri
- 4GB RAM (minimum)
- 10GB disk alanı
- İnternet bağlantısı (lisans doğrulama için)

## 2. Kurulum

```bash
# Repository'yi klonlayın (yetkili kullanıcılar için)
git clone https://github.com/metedinler/ChlorellaOS.git
cd ChlorellaOS

# Bağımlılıkları yükleyin
pip install -r requirements.txt
```

## 3. Lisans Kurulumu

⚠️ **LİSANS GEREKLİDİR**

Sistemi kullanmak için geçerli bir lisans anahtarı ayarlamalısınız:

```bash
# Linux/macOS
export CHLORELLA_LICENSE_KEY="your-license-key-here"

# Windows PowerShell
$env:CHLORELLA_LICENSE_KEY="your-license-key-here"

# Windows CMD
set CHLORELLA_LICENSE_KEY=your-license-key-here
```

Lisans almak için: contact@chlorellaos.com

## 4. İlk Kullanım

### Modül İmport Testi

```python
import chlorellaos

# Sistem bilgilerini göster
print(f"ChlorellaOS v{chlorellaos.__version__}")
print(chlorellaos.__copyright__)

# Lisans kontrolü
if chlorellaos.LicenseManager.verify_license():
    print("✓ Lisans geçerli")
else:
    print("✗ Lisans gerekli")
```

### Basit Batch Oluşturma

```python
from chlorellaos.recording import DataRecorder

# Veritabanı oluştur
recorder = DataRecorder("myproduction.db")

# Yeni batch başlat
batch = recorder.create_batch(
    batch_id="BATCH001",
    location="Tank-A",
    metadata={'capacity': 1000, 'operator': 'John Doe'}
)

print(f"Batch oluşturuldu: {batch['batch_id']}")
```

### Ortam İzleme

```python
from chlorellaos.cultivation import CultivationEnvironment

# Ortam oluştur
env = CultivationEnvironment("BATCH001", "Tank-A")

# Ölçüm kaydet
measurement = env.record_environment(
    temperature=25.0,
    ph=7.5,
    light_intensity=5000,
    nutrient_concentration=2.5
)

print(f"Sıcaklık: {measurement['temperature']}°C")
print(f"pH: {measurement['ph']}")
```

## 5. Örnek Uygulamalar

### Tam Üretim Döngüsü

```bash
# Lisans anahtarını ayarlayın
export CHLORELLA_LICENSE_KEY="your-key"

# Örneği çalıştırın
python examples/full_production_cycle.py
```

Bu örnek şunları gösterir:
- Batch oluşturma
- Ortam izleme
- Büyüme takibi
- Kalite kontrol
- Maliyet takibi
- Karlılık analizi
- Rapor oluşturma

### Fizibilite Çalışması

```bash
python examples/feasibility_study.py
```

Bu örnek şunları gösterir:
- Yatırım analizi
- Üretim simülasyonları
- ROI hesaplamaları
- NPV ve IRR analizi
- Senaryo karşılaştırması

## 6. Temel Modüller

### 1. Cultivation (Yetiştiricilik)
```python
from chlorellaos.cultivation import (
    CultivationEnvironment,
    GrowthTracker,
    HarvestManager
)
```

### 2. Analysis (Analiz)
```python
from chlorellaos.analysis import (
    BiomassAnalyzer,
    QualityControl,
    ProductivityCalculator
)
```

### 3. Recording (Kayıt)
```python
from chlorellaos.recording import (
    DataRecorder,
    ReportGenerator,
    TraceabilitySystem
)
```

### 4. Accounting (Muhasebe)
```python
from chlorellaos.accounting import (
    AccountingManager,
    CostTracker,
    InventoryManager
)
```

### 5. Profitability (Karlılık)
```python
from chlorellaos.profitability import (
    ProfitabilityAnalyzer,
    ROICalculator,
    FeasibilityStudy
)
```

## 7. Konfigürasyon

Sistem ayarları `config/settings.py` dosyasındadır:

```python
from config.settings import get_config

# Üretim ayarlarını al
production_settings = get_config('production')
print(production_settings['optimal_temperature_celsius'])  # 25

# Tüm ayarları al
all_configs = get_all_configs()
```

## 8. Veri Yedekleme

```python
from chlorellaos.recording import DataRecorder

recorder = DataRecorder("production.db")

# Manuel yedekleme
import shutil
shutil.copy("production.db", "backups/production_backup.db")
```

## 9. Sorun Giderme

### Lisans Hatası

**Problem:** `⚠️ CHLORELLAOS - LİSANS GEREKLİ`

**Çözüm:**
```bash
export CHLORELLA_LICENSE_KEY="your-valid-key"
```

### Modül Bulunamadı

**Problem:** `ModuleNotFoundError: No module named 'chlorellaos'`

**Çözüm:**
```bash
# Kurulum yapın
pip install -e .

# Veya PYTHONPATH ekleyin
export PYTHONPATH="${PYTHONPATH}:/path/to/ChlorellaOS"
```

### Veritabanı Hatası

**Problem:** Veritabanı dosyasına erişim hatası

**Çözüm:**
```python
# Tam yol belirtin
recorder = DataRecorder("/full/path/to/database.db")

# Veya yazma izni olan klasör kullanın
import tempfile
db_path = os.path.join(tempfile.gettempdir(), "chlorella.db")
recorder = DataRecorder(db_path)
```

## 10. Dokümantasyon

- **Kullanım Kılavuzu:** `docs/user_guide.md`
- **API Referansı:** `docs/api_reference.md`
- **Örnekler:** `examples/` klasörü

## 11. Destek ve İletişim

- **Repository:** https://github.com/metedinler/ChlorellaOS
- **Email:** contact@chlorellaos.com
- **Telif Hakkı:** Zuhtu Mete Dinler

## 12. Lisans Bilgisi

```
© 2025 Mete Dinler. All rights reserved.
This repository is private and confidential.
Unauthorized copying, modification, or distribution is prohibited.

Bu sistem KULLANIMA AÇIK DEĞİLDİR.
ÜCRET ÖDEMEDEN KULLANILAMAZ.
Tüm hakları ZUHTU METE DINLER tarafından saklıdır.
```

---

**ChlorellaOS v1.0.0**  
Geliştirildi ve sahiplik hakları: Zuhtu Mete Dinler  
© 2025. Tüm hakları saklıdır.
