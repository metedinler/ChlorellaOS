"""
ChlorellaOS - Kullanım Örneği 1: Tam Üretim Döngüsü

Bu örnek, Chlorella üretiminin başlangıcından hasadına kadar 
tüm aşamaları gösterir.

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime, timedelta
from chlorellaos.cultivation import (
    CultivationEnvironment, GrowthTracker, HarvestManager
)
from chlorellaos.analysis import BiomassAnalyzer, QualityControl
from chlorellaos.recording import DataRecorder, ReportGenerator
from chlorellaos.accounting import (
    AccountingManager, CostTracker, TransactionType, CostCategory
)
from chlorellaos.profitability import ProfitabilityAnalyzer


def main():
    """Ana üretim döngüsü örneği"""
    
    print("="*70)
    print("ChlorellaOS - Tam Üretim Döngüsü Örneği")
    print("© 2025 Mete Dinler. All rights reserved.")
    print("="*70)
    print()
    
    # Batch bilgileri
    batch_id = "BATCH001"
    location = "Photobioreactor-Tank-A"
    
    print(f"Batch ID: {batch_id}")
    print(f"Lokasyon: {location}")
    print()
    
    # 1. KAYIT SİSTEMİ BAŞLATMA
    print("1. Kayıt Sistemi Başlatılıyor...")
    recorder = DataRecorder("production_example.db")
    recorder.create_batch(
        batch_id=batch_id,
        location=location,
        metadata={
            'tank_volume_liters': 1000,
            'tank_type': 'photobioreactor',
            'operator': 'Mehmet Demir'
        }
    )
    print(f"✓ Batch {batch_id} oluşturuldu")
    print()
    
    # 2. YETİŞTİRİCİLİK BAŞLATMA
    print("2. Yetiştiricilik Sistemi Başlatılıyor...")
    environment = CultivationEnvironment(batch_id, location)
    growth = GrowthTracker(batch_id)
    
    # İlk ortam ölçümü
    env_data = environment.record_environment(
        temperature=25.0,
        ph=7.5,
        light_intensity=5000,
        nutrient_concentration=2.5
    )
    
    recorder.record_data(
        batch_id=batch_id,
        record_type="environment",
        module="cultivation",
        data=env_data,
        created_by="sensor_system"
    )
    
    print(f"✓ Ortam kayıt edildi: T={env_data['temperature']}°C, pH={env_data['ph']}")
    print()
    
    # 3. BÜYÜME TAKİBİ (Simüle edilmiş 7 gün)
    print("3. Büyüme Takibi (7 gün simülasyonu)...")
    initial_biomass = 0.5  # g/L
    
    for day in range(8):
        # Günlük büyüme (simüle)
        biomass = initial_biomass + (day * 0.6)  # Her gün 0.6 g/L artış
        cell_count = int(biomass * 1e6)  # Yaklaşık hücre sayısı
        optical_density = biomass * 0.2
        
        growth_data = growth.record_growth(
            biomass_density=biomass,
            cell_count=cell_count,
            optical_density=optical_density
        )
        
        recorder.record_data(
            batch_id=batch_id,
            record_type="growth",
            module="cultivation",
            data=growth_data,
            created_by="measurement_system"
        )
        
        if day % 2 == 0:  # Her 2 günde bir göster
            print(f"  Gün {day}: Biyokütle = {biomass:.2f} g/L")
    
    growth_rate = growth.calculate_growth_rate()
    print(f"✓ Ortalama büyüme hızı: {growth_rate:.2f} g/L/gün")
    print()
    
    # 4. BİYOKÜTLE ANALİZİ
    print("4. Biyokütle Analizi...")
    biomass_analyzer = BiomassAnalyzer(batch_id)
    
    # Kuru ağırlık ölçümü
    measurement = biomass_analyzer.measure_dry_weight(
        sample_volume=100,  # mL
        dry_weight=0.48     # g
    )
    print(f"✓ Kuru ağırlık: {measurement['density_g_per_L']:.2f} g/L")
    
    recorder.record_data(
        batch_id=batch_id,
        record_type="analysis",
        module="biomass",
        data=measurement
    )
    print()
    
    # 5. KALİTE KONTROL
    print("5. Kalite Kontrol Testleri...")
    qc = QualityControl(batch_id)
    
    # Protein testi
    protein_test = qc.test_protein_content(protein_percentage=55.2)
    print(f"✓ Protein içeriği: {protein_test['value']}% - {protein_test['status']}")
    
    # Klorofil testi
    chloro_test = qc.test_chlorophyll_content(chlorophyll_mg_per_g=12.5)
    print(f"✓ Klorofil: {chloro_test['value']} mg/g - {chloro_test['status']}")
    
    # Kontaminasyon testi
    contam_test = qc.test_contamination(bacterial_count=500, fungal_count=50)
    print(f"✓ Kontaminasyon: {contam_test['status']}")
    
    quality_score = qc.get_overall_quality_score()
    print(f"✓ Genel kalite skoru: {quality_score:.1f}/100")
    print()
    
    # 6. MALİYET TAKİBİ
    print("6. Maliyet Takibi...")
    cost_tracker = CostTracker(batch_id)
    
    # Maliyetleri kaydet
    costs = [
        (CostCategory.RAW_MATERIALS, 5000, "TRY", "Besin maddeleri", 100, "kg"),
        (CostCategory.ENERGY, 3000, "TRY", "Elektrik (ışık, pompa)", 1000, "kWh"),
        (CostCategory.LABOR, 8000, "TRY", "İşçilik (1 operatör)", 160, "saat"),
        (CostCategory.MAINTENANCE, 1000, "TRY", "Bakım", 1, "ay"),
    ]
    
    for category, amount, currency, desc, quantity, unit in costs:
        cost_tracker.add_cost(category, amount, currency, desc, quantity, unit)
        print(f"  + {desc}: {amount} {currency}")
    
    total_cost = cost_tracker.get_total_cost()
    print(f"✓ Toplam maliyet: {total_cost:.2f} TRY")
    
    # Kg başına maliyet
    final_biomass_kg = 4.8  # Final biyokütle (kg)
    cost_per_kg = cost_tracker.calculate_cost_per_kg(final_biomass_kg)
    print(f"✓ Kg başına maliyet: {cost_per_kg:.2f} TRY/kg")
    print()
    
    # 7. MUHASEBE
    print("7. Muhasebe Kaydı...")
    accounting = AccountingManager(facility_id="Facility-1")
    
    # Giderleri kaydet
    accounting.record_transaction(
        transaction_type=TransactionType.EXPENSE,
        amount=total_cost,
        currency="TRY",
        category="production",
        description=f"Batch {batch_id} üretim maliyeti",
        batch_id=batch_id
    )
    
    # Gelir kaydı (satış)
    selling_price_per_kg = 5000  # TRY/kg
    revenue = final_biomass_kg * selling_price_per_kg
    
    accounting.record_transaction(
        transaction_type=TransactionType.REVENUE,
        amount=revenue,
        currency="TRY",
        category="sales",
        description=f"Batch {batch_id} satışı ({final_biomass_kg} kg)",
        batch_id=batch_id
    )
    
    balance = accounting.calculate_balance()
    print(f"✓ Toplam gelir: {balance['total_revenue']:.2f} TRY")
    print(f"✓ Toplam gider: {balance['total_expense']:.2f} TRY")
    print(f"✓ Net kar: {balance['net_profit']:.2f} TRY")
    print()
    
    # 8. KARLILIK ANALİZİ
    print("8. Karlılık Analizi...")
    profitability = ProfitabilityAnalyzer(batch_id)
    
    analysis = profitability.analyze_batch_profitability(
        total_revenue=revenue,
        total_costs=total_cost,
        biomass_produced_kg=final_biomass_kg
    )
    
    print(f"✓ Kar: {analysis['profit']:.2f} TRY")
    print(f"✓ Kar marjı: {analysis['profit_margin_percent']:.2f}%")
    print(f"✓ Kg başına kar: {analysis['profit_per_kg']:.2f} TRY/kg")
    print()
    
    # 9. HASAT YÖNETİMİ
    print("9. Hasat Kaydı...")
    harvest_mgr = HarvestManager()
    
    harvest = harvest_mgr.record_harvest(
        batch_id=batch_id,
        actual_yield=final_biomass_kg,
        quality_metrics={
            'quality_score': quality_score,
            'protein_percent': 55.2,
            'chlorophyll_mg_g': 12.5
        }
    )
    
    if harvest:
        print(f"✓ Hasat tamamlandı: {final_biomass_kg} kg")
    
    recorder.update_batch_status(batch_id, "completed")
    print()
    
    # 10. RAPOR OLUŞTURMA
    print("10. Rapor Oluşturma...")
    reporter = ReportGenerator(recorder)
    
    summary = reporter.generate_summary_report(batch_id)
    print(f"✓ Batch durumu: {summary['status']}")
    print(f"✓ Süre: {summary['duration_days']} gün")
    print(f"✓ Kayıt sayısı: {summary['cultivation_records'] + summary['analysis_records']}")
    
    # JSON raporu kaydet
    reporter.export_to_json(batch_id, "batch_report.json")
    print("✓ Detaylı rapor: batch_report.json")
    print()
    
    # SONUÇ
    print("="*70)
    print("ÜRETİM DÖNGÜsÜ BAŞARIYLA TAMAMLANDI!")
    print("="*70)
    print()
    print("Özet:")
    print(f"  • Üretilen biyokütle: {final_biomass_kg} kg")
    print(f"  • Toplam maliyet: {total_cost:.2f} TRY")
    print(f"  • Toplam gelir: {revenue:.2f} TRY")
    print(f"  • Net kar: {analysis['profit']:.2f} TRY")
    print(f"  • Kar marjı: {analysis['profit_margin_percent']:.2f}%")
    print(f"  • Kalite skoru: {quality_score:.1f}/100")
    print()
    print("© 2025 Mete Dinler. All rights reserved.")
    print("="*70)


if __name__ == "__main__":
    # Lisans kontrolü
    from chlorellaos import LicenseManager
    
    LicenseManager.show_copyright()
    
    if not LicenseManager.verify_license():
        print("\nÖrnek çalıştırılamıyor: Geçerli lisans gerekli")
        print("Demo amaçlı çalıştırmak için CHLORELLA_LICENSE_KEY ayarlayın")
    else:
        main()
