"""
Yetiştiricilik Modülü (Cultivation Module)
Chlorella Vulgaris üretim ortamı izleme ve yönetimi

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime
from typing import Dict, List, Optional
import json


class CultivationEnvironment:
    """Üretim ortamı izleme sınıfı"""
    
    def __init__(self, batch_id: str, location: str):
        self.batch_id = batch_id
        self.location = location
        self.measurements = []
        self.created_at = datetime.now()
    
    def record_environment(self, temperature: float, ph: float, 
                          light_intensity: int, nutrient_concentration: float):
        """
        Ortam parametrelerini kaydet
        
        Args:
            temperature: Sıcaklık (°C)
            ph: pH değeri
            light_intensity: Işık yoğunluğu (lux)
            nutrient_concentration: Besin konsantrasyonu (g/L)
        """
        measurement = {
            'timestamp': datetime.now().isoformat(),
            'temperature': temperature,
            'ph': ph,
            'light_intensity': light_intensity,
            'nutrient_concentration': nutrient_concentration
        }
        self.measurements.append(measurement)
        return measurement
    
    def get_latest_measurement(self) -> Optional[Dict]:
        """Son ölçümü getir"""
        return self.measurements[-1] if self.measurements else None
    
    def get_average_conditions(self) -> Dict:
        """Ortalama ortam koşullarını hesapla"""
        if not self.measurements:
            return {}
        
        temps = [m['temperature'] for m in self.measurements]
        phs = [m['ph'] for m in self.measurements]
        lights = [m['light_intensity'] for m in self.measurements]
        nutrients = [m['nutrient_concentration'] for m in self.measurements]
        
        return {
            'avg_temperature': sum(temps) / len(temps),
            'avg_ph': sum(phs) / len(phs),
            'avg_light_intensity': sum(lights) / len(lights),
            'avg_nutrient_concentration': sum(nutrients) / len(nutrients)
        }


class GrowthTracker:
    """Büyüme takip sistemi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.growth_data = []
        self.start_date = datetime.now()
    
    def record_growth(self, biomass_density: float, cell_count: int, 
                     optical_density: float):
        """
        Büyüme verilerini kaydet
        
        Args:
            biomass_density: Biyokütle yoğunluğu (g/L)
            cell_count: Hücre sayısı (cells/mL)
            optical_density: Optik yoğunluk (OD680)
        """
        growth_record = {
            'timestamp': datetime.now().isoformat(),
            'days_since_start': (datetime.now() - self.start_date).days,
            'biomass_density': biomass_density,
            'cell_count': cell_count,
            'optical_density': optical_density
        }
        self.growth_data.append(growth_record)
        return growth_record
    
    def calculate_growth_rate(self) -> float:
        """Büyüme hızını hesapla (günlük)"""
        if len(self.growth_data) < 2:
            return 0.0
        
        first = self.growth_data[0]
        last = self.growth_data[-1]
        
        days_diff = last['days_since_start'] - first['days_since_start']
        if days_diff == 0:
            return 0.0
        
        biomass_change = last['biomass_density'] - first['biomass_density']
        return biomass_change / days_diff
    
    def estimate_harvest_date(self, target_density: float) -> Optional[str]:
        """Hasat tarihini tahmin et"""
        growth_rate = self.calculate_growth_rate()
        if not self.growth_data or growth_rate <= 0:
            return None
        
        current_density = self.growth_data[-1]['biomass_density']
        if current_density >= target_density:
            return "Ready for harvest"
        
        days_to_target = (target_density - current_density) / growth_rate
        harvest_date = datetime.now().timestamp() + (days_to_target * 86400)
        return datetime.fromtimestamp(harvest_date).strftime('%Y-%m-%d')


class ImmobilizationProcess:
    """İmmobilizasyon prosesi kontrolü"""
    
    def __init__(self, batch_id: str, method: str):
        self.batch_id = batch_id
        self.method = method  # Örn: "alginate beads", "membrane", "foam"
        self.process_steps = []
        self.status = "initialized"
    
    def start_process(self, substrate_type: str, cell_density: float):
        """İmmobilizasyon prosesini başlat"""
        step = {
            'timestamp': datetime.now().isoformat(),
            'action': 'start',
            'substrate_type': substrate_type,
            'cell_density': cell_density,
            'status': 'in_progress'
        }
        self.process_steps.append(step)
        self.status = "in_progress"
        return step
    
    def record_process_step(self, step_name: str, parameters: Dict):
        """Proses adımını kaydet"""
        step = {
            'timestamp': datetime.now().isoformat(),
            'step_name': step_name,
            'parameters': parameters
        }
        self.process_steps.append(step)
        return step
    
    def complete_process(self, final_yield: float, quality_score: float):
        """Prosesi tamamla"""
        step = {
            'timestamp': datetime.now().isoformat(),
            'action': 'complete',
            'final_yield': final_yield,
            'quality_score': quality_score,
            'status': 'completed'
        }
        self.process_steps.append(step)
        self.status = "completed"
        return step
    
    def get_process_summary(self) -> Dict:
        """Proses özetini getir"""
        return {
            'batch_id': self.batch_id,
            'method': self.method,
            'status': self.status,
            'total_steps': len(self.process_steps),
            'duration_minutes': self._calculate_duration()
        }
    
    def _calculate_duration(self) -> float:
        """Proses süresini hesapla (dakika)"""
        if len(self.process_steps) < 2:
            return 0.0
        
        start = datetime.fromisoformat(self.process_steps[0]['timestamp'])
        end = datetime.fromisoformat(self.process_steps[-1]['timestamp'])
        return (end - start).total_seconds() / 60


class HarvestManager:
    """Hasat planlama ve yönetimi"""
    
    def __init__(self):
        self.harvest_schedule = []
    
    def schedule_harvest(self, batch_id: str, planned_date: str, 
                        expected_yield: float):
        """Hasat planla"""
        harvest = {
            'batch_id': batch_id,
            'planned_date': planned_date,
            'expected_yield': expected_yield,
            'status': 'scheduled',
            'created_at': datetime.now().isoformat()
        }
        self.harvest_schedule.append(harvest)
        return harvest
    
    def record_harvest(self, batch_id: str, actual_yield: float, 
                      quality_metrics: Dict):
        """Hasat sonuçlarını kaydet"""
        for harvest in self.harvest_schedule:
            if harvest['batch_id'] == batch_id and harvest['status'] == 'scheduled':
                harvest.update({
                    'status': 'completed',
                    'actual_yield': actual_yield,
                    'quality_metrics': quality_metrics,
                    'harvest_date': datetime.now().isoformat()
                })
                return harvest
        return None
    
    def get_upcoming_harvests(self) -> List[Dict]:
        """Yaklaşan hasatları getir"""
        return [h for h in self.harvest_schedule if h['status'] == 'scheduled']
    
    def calculate_harvest_efficiency(self, batch_id: str) -> Optional[float]:
        """Hasat verimliliğini hesapla"""
        for harvest in self.harvest_schedule:
            if harvest['batch_id'] == batch_id and harvest['status'] == 'completed':
                expected = harvest['expected_yield']
                actual = harvest['actual_yield']
                if expected > 0:
                    return (actual / expected) * 100
        return None


__all__ = [
    'CultivationEnvironment',
    'GrowthTracker',
    'ImmobilizationProcess',
    'HarvestManager'
]
