"""
ChlorellaOS - Kullanım Örneği 2: Fizibilite Çalışması

Bu örnek, yeni bir Chlorella üretim tesisi için kapsamlı bir 
fizibilite analizi gösterir.

© 2025 Mete Dinler. All rights reserved.
"""

from chlorellaos.profitability import (
    ROICalculator, CostBenefitAnalysis, FeasibilityStudy, ProductionSimulator
)


def main():
    print("="*70)
    print("ChlorellaOS - Fizibilite Çalışması Örneği")
    print("© 2025 Mete Dinler. All rights reserved.")
    print("="*70)
    print()
    
    # PROJEBİLGİLERİ
    project_name = "Yeni Chlorella Üretim Tesisi"
    print(f"Proje: {project_name}")
    print()
    
    # 1. İLK YATIRIM HESAPLAMA
    print("1. İlk Yatırım Analizi")
    print("-" * 50)
    
    initial_investments = {
        'Arazi ve Altyapı': 500000,
        'Photobioreactor Sistemleri': 1000000,
        'Hasat ve İşleme Ekipmanları': 300000,
        'Laboratuvar Ekipmanları': 200000,
        'Bina ve Tesis': 400000,
        'İşletme Sermayesi': 100000
    }
    
    total_investment = sum(initial_investments.values())
    
    for item, cost in initial_investments.items():
        print(f"  • {item}: {cost:,.0f} TRY")
    print(f"\n  TOPLAM İLK YATIRIM: {total_investment:,.0f} TRY")
    print()
    
    # 2. ÜRETİM SİMÜLASYONU - 3 SENARYO
    print("2. Üretim Senaryoları Simülasyonu")
    print("-" * 50)
    
    simulator = ProductionSimulator("Yeni Tesis")
    
    scenarios = {
        'Muhafazakar': {
            'daily_production_kg': 30,
            'selling_price_per_kg': 4000,
            'description': 'Düşük kapasite, mevcut pazar fiyatı'
        },
        'Gerçekçi': {
            'daily_production_kg': 50,
            'selling_price_per_kg': 4500,
            'description': 'Orta kapasite, gelişen pazar'
        },
        'İyimser': {
            'daily_production_kg': 70,
            'selling_price_per_kg': 5000,
            'description': 'Yüksek kapasite, premium pazar'
        }
    }
    
    scenario_results = {}
    
    for scenario_name, params in scenarios.items():
        print(f"\n{scenario_name} Senaryo:")
        print(f"  Tanım: {params['description']}")
        
        result = simulator.simulate_production(
            daily_production_kg=params['daily_production_kg'],
            production_days=330,  # 11 ay (bakım için 1 ay kapalı)
            cost_per_kg=2000,  # Üretim maliyeti
            selling_price_per_kg=params['selling_price_per_kg'],
            fixed_costs_monthly=80000
        )
        
        sim = result['simulation_results']
        print(f"  • Yıllık üretim: {sim['total_production_kg']:,.0f} kg")
        print(f"  • Yıllık gelir: {sim['revenue']:,.0f} TRY")
        print(f"  • Yıllık maliyet: {sim['total_costs']:,.0f} TRY")
        print(f"  • Yıllık kar: {sim['profit']:,.0f} TRY")
        print(f"  • Kar marjı: {sim['profit_margin_percent']:.1f}%")
        
        scenario_results[scenario_name] = sim
    
    print()
    
    # 3. ROI VE GERİ ÖDEME SÜRESİ
    print("3. ROI ve Geri Ödeme Süresi Analizi")
    print("-" * 50)
    
    for scenario_name, sim in scenario_results.items():
        print(f"\n{scenario_name} Senaryo:")
        
        # 5 yıllık kazanç
        five_year_gain = sim['profit'] * 5
        
        # ROI hesapla
        roi = ROICalculator.calculate_roi(
            gain_from_investment=five_year_gain,
            cost_of_investment=total_investment
        )
        
        print(f"  • 5 yıllık toplam kazanç: {five_year_gain:,.0f} TRY")
        print(f"  • ROI: {roi['roi_percent']:.2f}%")
        
        # Geri ödeme süresi
        payback = ROICalculator.calculate_payback_period(
            initial_investment=total_investment,
            annual_cash_flow=sim['profit']
        )
        
        print(f"  • Geri ödeme süresi: {payback['payback_period_years']:.2f} yıl")
        print(f"    ({payback['payback_period_months']:.1f} ay)")
    
    print()
    
    # 4. NPV VE IRR HESAPLAMA
    print("4. NPV ve IRR Analizi (Gerçekçi Senaryo)")
    print("-" * 50)
    
    # 10 yıllık nakit akışı projeksiyonu (Gerçekçi senaryo)
    annual_profit = scenario_results['Gerçekçi']['profit']
    
    # İlk 3 yıl %80, sonra tam kapasite
    cash_flows = [
        annual_profit * 0.80,  # Yıl 1
        annual_profit * 0.80,  # Yıl 2
        annual_profit * 0.80,  # Yıl 3
        annual_profit,         # Yıl 4
        annual_profit,         # Yıl 5
        annual_profit,         # Yıl 6
        annual_profit,         # Yıl 7
        annual_profit,         # Yıl 8
        annual_profit,         # Yıl 9
        annual_profit,         # Yıl 10
    ]
    
    # NPV hesapla (%10 iskonto oranı)
    npv_result = ROICalculator.calculate_npv(
        initial_investment=total_investment,
        cash_flows=cash_flows,
        discount_rate=0.10
    )
    
    print(f"  • İskonto oranı: {npv_result['discount_rate_percent']:.0f}%")
    print(f"  • NPV: {npv_result['npv']:,.0f} TRY")
    print(f"  • Karlı mı?: {'✓ Evet' if npv_result['is_profitable'] else '✗ Hayır'}")
    
    # IRR hesapla
    irr_result = ROICalculator.calculate_irr(
        initial_investment=total_investment,
        cash_flows=cash_flows
    )
    
    print(f"  • IRR: {irr_result['irr_percent']:.2f}%")
    print()
    
    # 5. MALİYET-FAYDA ANALİZİ
    print("5. Maliyet-Fayda Analizi")
    print("-" * 50)
    
    cba = CostBenefitAnalysis(project_name)
    
    # Maliyetler
    cba.add_cost("İlk Yatırım", total_investment, 0)
    for year in range(1, 11):
        annual_cost = scenario_results['Gerçekçi']['total_costs']
        cba.add_cost(f"İşletme Maliyeti Yıl {year}", annual_cost, year)
    
    # Faydalar
    for year in range(1, 11):
        annual_revenue = scenario_results['Gerçekçi']['revenue']
        if year <= 3:
            annual_revenue *= 0.80  # İlk 3 yıl %80 kapasite
        cba.add_benefit(f"Gelir Yıl {year}", annual_revenue, year)
    
    bcr_result = cba.calculate_benefit_cost_ratio(discount_rate=0.10)
    
    print(f"  • Toplam indirgenmiş maliyet: {bcr_result['total_discounted_costs']:,.0f} TRY")
    print(f"  • Toplam indirgenmiş fayda: {bcr_result['total_discounted_benefits']:,.0f} TRY")
    print(f"  • Fayda/Maliyet Oranı: {bcr_result['benefit_cost_ratio']:.2f}")
    print(f"  • Net fayda: {bcr_result['net_benefit']:,.0f} TRY")
    print(f"  • Faydalı mı?: {'✓ Evet' if bcr_result['is_beneficial'] else '✗ Hayır'}")
    print()
    
    # 6. FİZİBİLİTE ÇALIŞMASI
    print("6. Kapsamlı Fizibilite Değerlendirmesi")
    print("-" * 50)
    
    study = FeasibilityStudy(project_name)
    
    # Senaryoları ekle
    for scenario_name, sim in scenario_results.items():
        # Her senaryo için NPV hesapla
        annual_cf = sim['profit']
        cf_list = [annual_cf * 0.8] * 3 + [annual_cf] * 7
        
        npv = ROICalculator.calculate_npv(
            initial_investment=total_investment,
            cash_flows=cf_list,
            discount_rate=0.10
        )
        
        roi = ROICalculator.calculate_roi(
            gain_from_investment=sum(cf_list),
            cost_of_investment=total_investment
        )
        
        payback = ROICalculator.calculate_payback_period(
            initial_investment=total_investment,
            annual_cash_flow=annual_cf
        )
        
        study.add_scenario(
            scenario_name=scenario_name,
            assumptions={
                'daily_production_kg': scenarios[scenario_name]['daily_production_kg'],
                'selling_price_per_kg': scenarios[scenario_name]['selling_price_per_kg']
            },
            projected_results={
                'npv': npv['npv'],
                'roi_percent': roi['roi_percent'],
                'payback_period_years': payback['payback_period_years'],
                'annual_profit': annual_cf
            }
        )
    
    # Senaryoları karşılaştır
    comparison = study.compare_scenarios()
    
    print("\nSenaryo Karşılaştırması:")
    print(f"{'Senaryo':<15} {'NPV (TRY)':<15} {'ROI (%)':<10} {'Geri Ödeme (yıl)':<18}")
    print("-" * 70)
    
    for comp in comparison:
        print(f"{comp['scenario_name']:<15} {comp['npv']:>13,.0f}  "
              f"{comp['roi']:>8.1f}  {comp['payback_period_years']:>16.2f}")
    
    # Öneri
    recommendation = study.recommend_best_scenario()
    
    print(f"\n✓ ÖNERİLEN SENARYO: {recommendation['recommended_scenario']}")
    print(f"  Sebep: {recommendation['reason']}")
    print()
    
    # 7. FİNAL DEĞERLENDİRME
    print("7. Final Değerlendirme ve Sonuç")
    print("-" * 50)
    
    feasibility_report = study.generate_feasibility_report()
    
    print("\nYÖNETİCİ ÖZETİ:")
    print(feasibility_report['executive_summary'])
    print()
    
    print("KRİTİK BAŞARI FAKTÖRLERİ:")
    print("  1. İlk 3 yıl en az %80 kapasite kullanımı")
    print("  2. Kg başına satış fiyatını 4000+ TRY seviyesinde tutmak")
    print("  3. Üretim maliyetlerini kontrol altında tutmak")
    print("  4. Kaliteli ürün ve istikrarlı tedarik sağlamak")
    print()
    
    print("RİSK DEĞERLENDİRMESİ:")
    print("  • Pazar riski: ORTA (artan talep trendi)")
    print("  • Teknoloji riski: DÜŞÜK (kanıtlanmış teknoloji)")
    print("  • Finansal risk: ORTA (yüksek ilk yatırım)")
    print("  • Operasyonel risk: DÜŞÜK (standart prosesler)")
    print()
    
    print("SONUÇ:")
    if npv_result['is_profitable'] and bcr_result['is_beneficial']:
        print("  ✓ Proje FİZİBLE - Yatırım önerilir")
        print(f"  ✓ Beklenen NPV: {npv_result['npv']:,.0f} TRY")
        print(f"  ✓ Beklenen IRR: {irr_result['irr_percent']:.2f}%")
    else:
        print("  ✗ Proje FİZİBLE DEĞİL - Tekrar değerlendirme gerekli")
    
    print()
    print("="*70)
    print("© 2025 Mete Dinler. All rights reserved.")
    print("="*70)


if __name__ == "__main__":
    from chlorellaos import LicenseManager
    
    LicenseManager.show_copyright()
    
    if not LicenseManager.verify_license():
        print("\nÖrnek çalıştırılamıyor: Geçerli lisans gerekli")
        print("Demo amaçlı çalıştırmak için CHLORELLA_LICENSE_KEY ayarlayın")
    else:
        main()
