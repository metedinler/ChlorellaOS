"""
Karlılık Analizi ve Fizibilite Modülü (Profitability Analysis)
Maliyet-fayda analizi, ROI hesaplamaları ve fizibilite çalışmaları

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime
from typing import Dict, List, Optional
import math


class ProfitabilityAnalyzer:
    """Karlılık analiz sistemi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
    
    def calculate_gross_profit(self, revenue: float, cost_of_goods_sold: float) -> Dict:
        """
        Brüt kar hesapla
        
        Args:
            revenue: Gelir
            cost_of_goods_sold: Satılan malın maliyeti
        """
        gross_profit = revenue - cost_of_goods_sold
        gross_profit_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
        
        return {
            'revenue': revenue,
            'cost_of_goods_sold': cost_of_goods_sold,
            'gross_profit': gross_profit,
            'gross_profit_margin_percent': gross_profit_margin
        }
    
    def calculate_operating_profit(self, gross_profit: float, 
                                  operating_expenses: float) -> Dict:
        """Faaliyet karı hesapla"""
        operating_profit = gross_profit - operating_expenses
        
        return {
            'gross_profit': gross_profit,
            'operating_expenses': operating_expenses,
            'operating_profit': operating_profit,
            'operating_profit_margin_percent': 
                (operating_profit / (gross_profit + operating_expenses) * 100)
                if (gross_profit + operating_expenses) > 0 else 0
        }
    
    def calculate_net_profit(self, operating_profit: float,
                           taxes: float, interest: float) -> Dict:
        """Net kar hesapla"""
        net_profit = operating_profit - taxes - interest
        
        return {
            'operating_profit': operating_profit,
            'taxes': taxes,
            'interest': interest,
            'net_profit': net_profit
        }
    
    def analyze_batch_profitability(self, total_revenue: float,
                                   total_costs: float,
                                   biomass_produced_kg: float) -> Dict:
        """Batch karlılık analizi"""
        profit = total_revenue - total_costs
        profit_margin = (profit / total_revenue * 100) if total_revenue > 0 else 0
        profit_per_kg = profit / biomass_produced_kg if biomass_produced_kg > 0 else 0
        
        return {
            'batch_id': self.batch_id,
            'total_revenue': total_revenue,
            'total_costs': total_costs,
            'profit': profit,
            'profit_margin_percent': profit_margin,
            'biomass_produced_kg': biomass_produced_kg,
            'profit_per_kg': profit_per_kg,
            'analysis_date': datetime.now().isoformat()
        }


class ROICalculator:
    """Yatırım Getirisi (ROI) hesaplayıcı"""
    
    @staticmethod
    def calculate_roi(gain_from_investment: float, 
                     cost_of_investment: float) -> Dict:
        """
        ROI hesapla
        
        ROI = (Yatırım Getirisi - Yatırım Maliyeti) / Yatırım Maliyeti * 100
        """
        if cost_of_investment <= 0:
            return {'error': 'Investment cost must be positive'}
        
        roi = ((gain_from_investment - cost_of_investment) / 
               cost_of_investment * 100)
        
        return {
            'gain_from_investment': gain_from_investment,
            'cost_of_investment': cost_of_investment,
            'roi_percent': roi,
            'net_return': gain_from_investment - cost_of_investment
        }
    
    @staticmethod
    def calculate_payback_period(initial_investment: float,
                               annual_cash_flow: float) -> Dict:
        """
        Geri ödeme süresi hesapla
        
        Args:
            initial_investment: İlk yatırım
            annual_cash_flow: Yıllık nakit akışı
        """
        if annual_cash_flow <= 0:
            return {'error': 'Annual cash flow must be positive'}
        
        payback_years = initial_investment / annual_cash_flow
        payback_months = payback_years * 12
        
        return {
            'initial_investment': initial_investment,
            'annual_cash_flow': annual_cash_flow,
            'payback_period_years': payback_years,
            'payback_period_months': payback_months
        }
    
    @staticmethod
    def calculate_npv(initial_investment: float, cash_flows: List[float],
                     discount_rate: float) -> Dict:
        """
        Net Bugünkü Değer (NPV) hesapla
        
        Args:
            initial_investment: İlk yatırım
            cash_flows: Yıllık nakit akışları listesi
            discount_rate: İskonto oranı (örn: 0.10 = %10)
        """
        npv = -initial_investment
        
        for year, cash_flow in enumerate(cash_flows, start=1):
            npv += cash_flow / math.pow(1 + discount_rate, year)
        
        return {
            'initial_investment': initial_investment,
            'discount_rate_percent': discount_rate * 100,
            'npv': npv,
            'is_profitable': npv > 0,
            'years_analyzed': len(cash_flows)
        }
    
    @staticmethod
    def calculate_irr(initial_investment: float, cash_flows: List[float],
                     max_iterations: int = 100) -> Dict:
        """
        İç Verimlilik Oranı (IRR) hesapla (Newton-Raphson yöntemi)
        
        Args:
            initial_investment: İlk yatırım
            cash_flows: Yıllık nakit akışları
            max_iterations: Maksimum iterasyon sayısı
        """
        # Başlangıç tahmini
        irr = 0.1
        tolerance = 0.0001
        
        for _ in range(max_iterations):
            npv = -initial_investment
            npv_derivative = 0
            
            for year, cash_flow in enumerate(cash_flows, start=1):
                npv += cash_flow / math.pow(1 + irr, year)
                npv_derivative -= year * cash_flow / math.pow(1 + irr, year + 1)
            
            if abs(npv) < tolerance:
                break
            
            if npv_derivative == 0:
                return {'error': 'Cannot calculate IRR'}
            
            irr = irr - npv / npv_derivative
        
        return {
            'initial_investment': initial_investment,
            'irr_percent': irr * 100,
            'years_analyzed': len(cash_flows)
        }


class CostBenefitAnalysis:
    """Maliyet-Fayda Analizi"""
    
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.costs = []
        self.benefits = []
    
    def add_cost(self, description: str, amount: float, year: int):
        """Maliyet ekle"""
        self.costs.append({
            'description': description,
            'amount': amount,
            'year': year
        })
    
    def add_benefit(self, description: str, amount: float, year: int):
        """Fayda ekle"""
        self.benefits.append({
            'description': description,
            'amount': amount,
            'year': year
        })
    
    def calculate_benefit_cost_ratio(self, discount_rate: float = 0.1) -> Dict:
        """
        Fayda-Maliyet Oranı hesapla
        
        BCR = Toplam İndirgenmiş Faydalar / Toplam İndirgenmiş Maliyetler
        """
        total_discounted_costs = 0
        total_discounted_benefits = 0
        
        for cost in self.costs:
            discount_factor = 1 / math.pow(1 + discount_rate, cost['year'])
            total_discounted_costs += cost['amount'] * discount_factor
        
        for benefit in self.benefits:
            discount_factor = 1 / math.pow(1 + discount_rate, benefit['year'])
            total_discounted_benefits += benefit['amount'] * discount_factor
        
        bcr = (total_discounted_benefits / total_discounted_costs 
               if total_discounted_costs > 0 else 0)
        
        return {
            'project_name': self.project_name,
            'total_discounted_costs': total_discounted_costs,
            'total_discounted_benefits': total_discounted_benefits,
            'benefit_cost_ratio': bcr,
            'net_benefit': total_discounted_benefits - total_discounted_costs,
            'is_beneficial': bcr > 1.0,
            'discount_rate_percent': discount_rate * 100
        }
    
    def get_summary(self) -> Dict:
        """Analiz özetini getir"""
        total_costs = sum(c['amount'] for c in self.costs)
        total_benefits = sum(b['amount'] for b in self.benefits)
        
        return {
            'project_name': self.project_name,
            'total_costs': total_costs,
            'total_benefits': total_benefits,
            'net_value': total_benefits - total_costs,
            'number_of_costs': len(self.costs),
            'number_of_benefits': len(self.benefits)
        }


class FeasibilityStudy:
    """Fizibilite çalışması"""
    
    def __init__(self, project_name: str):
        self.project_name = project_name
        self.scenarios = []
    
    def add_scenario(self, scenario_name: str, assumptions: Dict,
                    projected_results: Dict):
        """Senaryo ekle"""
        scenario = {
            'name': scenario_name,
            'assumptions': assumptions,
            'projected_results': projected_results,
            'created_at': datetime.now().isoformat()
        }
        self.scenarios.append(scenario)
        return scenario
    
    def compare_scenarios(self) -> List[Dict]:
        """Senaryoları karşılaştır"""
        comparison = []
        
        for scenario in self.scenarios:
            results = scenario['projected_results']
            comparison.append({
                'scenario_name': scenario['name'],
                'npv': results.get('npv', 0),
                'roi': results.get('roi_percent', 0),
                'payback_period_years': results.get('payback_period_years', 0),
                'annual_profit': results.get('annual_profit', 0)
            })
        
        # NPV'ye göre sırala
        comparison.sort(key=lambda x: x['npv'], reverse=True)
        return comparison
    
    def recommend_best_scenario(self) -> Optional[Dict]:
        """En iyi senaryoyu öner"""
        comparison = self.compare_scenarios()
        if not comparison:
            return None
        
        best = comparison[0]
        return {
            'recommended_scenario': best['scenario_name'],
            'reason': f"En yüksek NPV: {best['npv']:.2f}",
            'npv': best['npv'],
            'roi_percent': best['roi'],
            'payback_period_years': best['payback_period_years']
        }
    
    def generate_feasibility_report(self) -> Dict:
        """Fizibilite raporu oluştur"""
        recommendation = self.recommend_best_scenario()
        scenario_comparison = self.compare_scenarios()
        
        return {
            'project_name': self.project_name,
            'report_date': datetime.now().isoformat(),
            'number_of_scenarios': len(self.scenarios),
            'scenarios_analyzed': scenario_comparison,
            'recommendation': recommendation,
            'executive_summary': self._generate_executive_summary(recommendation)
        }
    
    def _generate_executive_summary(self, recommendation: Optional[Dict]) -> str:
        """Yönetici özeti oluştur"""
        if not recommendation:
            return "Analiz için yeterli senaryo bulunmamaktadır."
        
        return (f"Fizibilite analizi sonuçlarına göre '{recommendation['recommended_scenario']}' "
                f"senaryosu önerilmektedir. Bu senaryo {recommendation['npv']:.2f} NPV değeri ile "
                f"en yüksek yatırım getirisini sunmaktadır. "
                f"Yatırım getirisi (ROI) %{recommendation['roi_percent']:.2f} olarak hesaplanmıştır.")


class ProductionSimulator:
    """Üretim simülatörü"""
    
    def __init__(self, facility_name: str):
        self.facility_name = facility_name
    
    def simulate_production(self, 
                          daily_production_kg: float,
                          production_days: int,
                          cost_per_kg: float,
                          selling_price_per_kg: float,
                          fixed_costs_monthly: float) -> Dict:
        """
        Üretim senaryosu simülasyonu
        
        Args:
            daily_production_kg: Günlük üretim (kg)
            production_days: Üretim günü sayısı
            cost_per_kg: Kg başına maliyet
            selling_price_per_kg: Kg başına satış fiyatı
            fixed_costs_monthly: Aylık sabit maliyetler
        """
        total_production_kg = daily_production_kg * production_days
        
        variable_costs = total_production_kg * cost_per_kg
        months = production_days / 30
        total_fixed_costs = fixed_costs_monthly * months
        total_costs = variable_costs + total_fixed_costs
        
        revenue = total_production_kg * selling_price_per_kg
        profit = revenue - total_costs
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0
        
        return {
            'facility_name': self.facility_name,
            'simulation_parameters': {
                'daily_production_kg': daily_production_kg,
                'production_days': production_days,
                'cost_per_kg': cost_per_kg,
                'selling_price_per_kg': selling_price_per_kg,
                'fixed_costs_monthly': fixed_costs_monthly
            },
            'simulation_results': {
                'total_production_kg': total_production_kg,
                'variable_costs': variable_costs,
                'fixed_costs': total_fixed_costs,
                'total_costs': total_costs,
                'revenue': revenue,
                'profit': profit,
                'profit_margin_percent': profit_margin
            }
        }
    
    def simulate_scale_effects(self,
                              base_daily_production_kg: float,
                              scale_factors: List[float],
                              cost_per_kg: float,
                              selling_price_per_kg: float) -> List[Dict]:
        """Ölçek etkilerini simüle et"""
        results = []
        
        for scale_factor in scale_factors:
            scaled_production = base_daily_production_kg * scale_factor
            
            # Ölçek ekonomisi etkisi (üretim arttıkça birim maliyet düşer)
            cost_reduction = 1 - (0.05 * (scale_factor - 1))  # Her katlanmada %5 düşüş
            adjusted_cost = cost_per_kg * max(cost_reduction, 0.7)  # Minimum %30 düşüş
            
            simulation = self.simulate_production(
                daily_production_kg=scaled_production,
                production_days=365,
                cost_per_kg=adjusted_cost,
                selling_price_per_kg=selling_price_per_kg,
                fixed_costs_monthly=10000 * scale_factor
            )
            
            simulation['scale_factor'] = scale_factor
            results.append(simulation)
        
        return results


__all__ = [
    'ProfitabilityAnalyzer',
    'ROICalculator',
    'CostBenefitAnalysis',
    'FeasibilityStudy',
    'ProductionSimulator'
]
