# ChlorellaOS API Referansı

© 2025 Mete Dinler. All rights reserved.

## Genel Bakış

Bu dokümantasyon, ChlorellaOS sisteminin tüm modülleri ve API'leri hakkında detaylı bilgi içerir.

## Yetiştiricilik Modülü API

### CultivationEnvironment

Üretim ortamı izleme sınıfı.

#### Constructor

```python
CultivationEnvironment(batch_id: str, location: str)
```

**Parametreler:**
- `batch_id` (str): Batch kimliği
- `location` (str): Lokasyon bilgisi

#### Metodlar

##### record_environment()

```python
record_environment(temperature: float, ph: float, 
                  light_intensity: int, nutrient_concentration: float) -> Dict
```

Ortam parametrelerini kaydet.

**Parametreler:**
- `temperature` (float): Sıcaklık (°C)
- `ph` (float): pH değeri
- `light_intensity` (int): Işık yoğunluğu (lux)
- `nutrient_concentration` (float): Besin konsantrasyonu (g/L)

**Dönüş:** Ölçüm dictionary'si

##### get_latest_measurement()

```python
get_latest_measurement() -> Optional[Dict]
```

Son ölçümü getirir.

##### get_average_conditions()

```python
get_average_conditions() -> Dict
```

Ortalama ortam koşullarını hesaplar.

**Dönüş:**
```python
{
    'avg_temperature': float,
    'avg_ph': float,
    'avg_light_intensity': float,
    'avg_nutrient_concentration': float
}
```

### GrowthTracker

Büyüme takip sistemi.

#### Constructor

```python
GrowthTracker(batch_id: str)
```

#### Metodlar

##### record_growth()

```python
record_growth(biomass_density: float, cell_count: int, 
             optical_density: float) -> Dict
```

Büyüme verilerini kaydet.

##### calculate_growth_rate()

```python
calculate_growth_rate() -> float
```

Günlük büyüme hızını hesapla (g/L/gün).

##### estimate_harvest_date()

```python
estimate_harvest_date(target_density: float) -> Optional[str]
```

Hedef yoğunluğa göre hasat tarihini tahmin et.

### ImmobilizationProcess

İmmobilizasyon prosesi kontrolü.

#### Constructor

```python
ImmobilizationProcess(batch_id: str, method: str)
```

**Parametreler:**
- `batch_id` (str): Batch kimliği
- `method` (str): İmmobilizasyon metodu ("alginate beads", "membrane", "foam")

#### Metodlar

##### start_process()

```python
start_process(substrate_type: str, cell_density: float) -> Dict
```

İmmobilizasyon prosesini başlat.

##### record_process_step()

```python
record_process_step(step_name: str, parameters: Dict) -> Dict
```

Proses adımını kaydet.

##### complete_process()

```python
complete_process(final_yield: float, quality_score: float) -> Dict
```

Prosesi tamamla.

## Analiz ve Ölçüm Modülü API

### BiomassAnalyzer

Biyokütle yoğunluğu analizi.

#### Constructor

```python
BiomassAnalyzer(batch_id: str)
```

#### Metodlar

##### measure_dry_weight()

```python
measure_dry_weight(sample_volume: float, dry_weight: float) -> Dict
```

Kuru ağırlık ölçümü yapar.

**Parametreler:**
- `sample_volume` (float): Numune hacmi (mL)
- `dry_weight` (float): Kuru ağırlık (g)

**Dönüş:** Yoğunluk ölçümü (g/L)

##### measure_optical_density()

```python
measure_optical_density(od_680: float, calibration_factor: float = 0.5) -> Dict
```

Optik yoğunluk ölçümü (OD680).

##### get_average_density()

```python
get_average_density() -> Optional[float]
```

Ortalama biyokütle yoğunluğunu hesaplar.

### QualityControl

Kalite kontrol sistemi.

#### Metodlar

##### test_protein_content()

```python
test_protein_content(protein_percentage: float) -> Dict
```

Protein içeriği testi (Kabul aralığı: 45-65%).

##### test_chlorophyll_content()

```python
test_chlorophyll_content(chlorophyll_mg_per_g: float) -> Dict
```

Klorofil içeriği testi (Minimum: 10 mg/g).

##### test_contamination()

```python
test_contamination(bacterial_count: int, fungal_count: int) -> Dict
```

Kontaminasyon testi.

##### test_heavy_metals()

```python
test_heavy_metals(lead_ppm: float, mercury_ppm: float, 
                 cadmium_ppm: float) -> Dict
```

Ağır metal testi.

##### get_overall_quality_score()

```python
get_overall_quality_score() -> float
```

Genel kalite skorunu hesaplar (0-100).

### ProductivityCalculator

Verimlilik hesaplayıcı (statik metodlar).

##### calculate_volumetric_productivity()

```python
@staticmethod
calculate_volumetric_productivity(biomass_concentration: float, 
                                 cultivation_time_days: float) -> float
```

Hacimsel verimlilik (g/L/gün).

##### calculate_areal_productivity()

```python
@staticmethod
calculate_areal_productivity(total_biomass_kg: float, 
                            cultivation_area_m2: float,
                            cultivation_time_days: float) -> float
```

Alansal verimlilik (g/m²/gün).

## Kayıt Sistemi API

### DataRecorder

Merkezi veri kayıt sistemi.

#### Constructor

```python
DataRecorder(database_path: str = "chlorellaos_data.db")
```

#### Metodlar

##### create_batch()

```python
create_batch(batch_id: str, location: str, 
            metadata: Optional[Dict] = None) -> Dict
```

Yeni batch oluştur.

##### record_data()

```python
record_data(batch_id: str, record_type: str, module: str,
           data: Dict, created_by: Optional[str] = None) -> int
```

Veri kaydet ve kayıt ID'sini döndür.

##### get_batch_records()

```python
get_batch_records(batch_id: str, 
                 record_type: Optional[str] = None) -> List[Dict]
```

Batch kayıtlarını getir.

##### update_batch_status()

```python
update_batch_status(batch_id: str, status: str)
```

Batch durumunu güncelle.

### ReportGenerator

Raporlama sistemi.

#### Constructor

```python
ReportGenerator(data_recorder: DataRecorder)
```

#### Metodlar

##### generate_batch_report()

```python
generate_batch_report(batch_id: str) -> Dict
```

Detaylı batch raporu oluştur.

##### generate_summary_report()

```python
generate_summary_report(batch_id: str) -> Dict
```

Özet rapor oluştur.

##### export_to_json()

```python
export_to_json(batch_id: str, filepath: str)
```

JSON formatında dışa aktar.

##### export_to_csv()

```python
export_to_csv(batch_id: str, filepath: str)
```

CSV formatında dışa aktar.

## Muhasebe Modülü API

### AccountingManager

Muhasebe yönetim sistemi.

#### Constructor

```python
AccountingManager(facility_id: str)
```

#### Metodlar

##### record_transaction()

```python
record_transaction(transaction_type: TransactionType,
                  amount: float, currency: str, category: str,
                  description: str, batch_id: Optional[str] = None) -> Dict
```

Finansal işlem kaydet.

##### get_transactions()

```python
get_transactions(transaction_type: Optional[TransactionType] = None,
                start_date: Optional[str] = None,
                end_date: Optional[str] = None) -> List[Dict]
```

İşlemleri filtrele ve getir.

##### calculate_balance()

```python
calculate_balance(start_date: Optional[str] = None,
                 end_date: Optional[str] = None) -> Dict
```

Bakiye hesapla.

### CostTracker

Maliyet takip sistemi.

#### Constructor

```python
CostTracker(batch_id: str)
```

#### Metodlar

##### add_cost()

```python
add_cost(category: CostCategory, amount: float,
        currency: str, description: str, quantity: float = 1.0,
        unit: str = "unit") -> Dict
```

Maliyet ekle.

##### get_total_cost()

```python
get_total_cost(category: Optional[CostCategory] = None) -> float
```

Toplam maliyeti hesapla.

##### calculate_cost_per_kg()

```python
calculate_cost_per_kg(total_biomass_kg: float) -> float
```

Kilogram başına maliyeti hesapla.

## Karlılık Analizi Modülü API

### ProfitabilityAnalyzer

Karlılık analiz sistemi.

#### Metodlar

##### analyze_batch_profitability()

```python
analyze_batch_profitability(total_revenue: float,
                           total_costs: float,
                           biomass_produced_kg: float) -> Dict
```

Batch karlılık analizi.

### ROICalculator

ROI hesaplayıcı (statik metodlar).

##### calculate_roi()

```python
@staticmethod
calculate_roi(gain_from_investment: float, 
             cost_of_investment: float) -> Dict
```

ROI hesapla.

**Dönüş:**
```python
{
    'gain_from_investment': float,
    'cost_of_investment': float,
    'roi_percent': float,
    'net_return': float
}
```

##### calculate_npv()

```python
@staticmethod
calculate_npv(initial_investment: float, cash_flows: List[float],
             discount_rate: float) -> Dict
```

Net Bugünkü Değer (NPV) hesapla.

##### calculate_irr()

```python
@staticmethod
calculate_irr(initial_investment: float, cash_flows: List[float],
             max_iterations: int = 100) -> Dict
```

İç Verimlilik Oranı (IRR) hesapla.

### FeasibilityStudy

Fizibilite çalışması.

#### Constructor

```python
FeasibilityStudy(project_name: str)
```

#### Metodlar

##### add_scenario()

```python
add_scenario(scenario_name: str, assumptions: Dict,
            projected_results: Dict) -> Dict
```

Senaryo ekle.

##### compare_scenarios()

```python
compare_scenarios() -> List[Dict]
```

Senaryoları karşılaştır.

##### recommend_best_scenario()

```python
recommend_best_scenario() -> Optional[Dict]
```

En iyi senaryoyu öner.

##### generate_feasibility_report()

```python
generate_feasibility_report() -> Dict
```

Fizibilite raporu oluştur.

## Veri Tipleri

### TransactionType (Enum)

```python
class TransactionType(Enum):
    EXPENSE = "expense"
    REVENUE = "revenue"
    INVESTMENT = "investment"
```

### CostCategory (Enum)

```python
class CostCategory(Enum):
    RAW_MATERIALS = "raw_materials"
    LABOR = "labor"
    ENERGY = "energy"
    EQUIPMENT = "equipment"
    MAINTENANCE = "maintenance"
    OVERHEAD = "overhead"
    OTHER = "other"
```

## Hata Yönetimi

### Yaygın Hatalar

#### ValueError

Geçersiz parametre değerleri için fırlatılır.

```python
try:
    analyzer.measure_dry_weight(sample_volume=-10, dry_weight=0.5)
except ValueError as e:
    print(f"Hata: {e}")
```

#### KeyError

Olmayan kayıtlara erişimde fırlatılır.

```python
try:
    batch = recorder.get_batch_info("NONEXISTENT")
    if batch is None:
        print("Batch bulunamadı")
except KeyError as e:
    print(f"Hata: {e}")
```

## En İyi Uygulamalar

### 1. Veri Kaydı

```python
# Her zaman batch_id ile kayıt yapın
recorder.record_data(
    batch_id="BATCH001",
    record_type="measurement",
    module="cultivation",
    data=measurement_data,
    created_by="operator_name"
)
```

### 2. Hata Kontrolü

```python
# Veri kaydından önce doğrulama yapın
if temperature < 0 or temperature > 50:
    raise ValueError("Sıcaklık geçerli aralıkta değil")
```

### 3. Kaynak Yönetimi

```python
# Veritabanı bağlantılarını düzgün kapatın
recorder = DataRecorder()
try:
    # İşlemler
    pass
finally:
    # Cleanup işlemleri
    pass
```

---

© 2025 Mete Dinler. All rights reserved.
