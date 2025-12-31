"""
Analiz ve Ölçüm Modülü (Analysis & Measurement Module)
Biyokütle yoğunluğu, kalite kontrol ve laboratuvar analizleri

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime
from typing import Dict, List, Optional
import statistics


class BiomassAnalyzer:
    """Biyokütle yoğunluğu analizi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.measurements = []
    
    def measure_dry_weight(self, sample_volume: float, dry_weight: float) -> Dict:
        """
        Kuru ağırlık ölçümü
        
        Args:
            sample_volume: Numune hacmi (mL)
            dry_weight: Kuru ağırlık (g)
        
        Returns:
            Ölçüm sonucu (g/L cinsinden)
        """
        density = (dry_weight / sample_volume) * 1000  # g/L
        measurement = {
            'timestamp': datetime.now().isoformat(),
            'method': 'dry_weight',
            'sample_volume': sample_volume,
            'dry_weight': dry_weight,
            'density_g_per_L': density
        }
        self.measurements.append(measurement)
        return measurement
    
    def measure_optical_density(self, od_680: float, calibration_factor: float = 0.5) -> Dict:
        """
        Optik yoğunluk ölçümü (OD680)
        
        Args:
            od_680: 680nm'de optik yoğunluk
            calibration_factor: Kalibrasyon faktörü (g/L per OD unit)
        """
        estimated_biomass = od_680 * calibration_factor
        measurement = {
            'timestamp': datetime.now().isoformat(),
            'method': 'optical_density',
            'od_680': od_680,
            'calibration_factor': calibration_factor,
            'estimated_biomass_g_per_L': estimated_biomass
        }
        self.measurements.append(measurement)
        return measurement
    
    def get_average_density(self) -> Optional[float]:
        """Ortalama biyokütle yoğunluğunu hesapla"""
        if not self.measurements:
            return None
        
        densities = []
        for m in self.measurements:
            if 'density_g_per_L' in m:
                densities.append(m['density_g_per_L'])
            elif 'estimated_biomass_g_per_L' in m:
                densities.append(m['estimated_biomass_g_per_L'])
        
        return statistics.mean(densities) if densities else None


class QualityControl:
    """Kalite kontrol sistemi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.quality_tests = []
    
    def test_protein_content(self, protein_percentage: float) -> Dict:
        """Protein içeriği testi"""
        status = "pass" if 45 <= protein_percentage <= 65 else "fail"
        test = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'protein_content',
            'value': protein_percentage,
            'unit': 'percentage',
            'acceptable_range': [45, 65],
            'status': status
        }
        self.quality_tests.append(test)
        return test
    
    def test_chlorophyll_content(self, chlorophyll_mg_per_g: float) -> Dict:
        """Klorofil içeriği testi"""
        status = "pass" if chlorophyll_mg_per_g >= 10 else "fail"
        test = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'chlorophyll_content',
            'value': chlorophyll_mg_per_g,
            'unit': 'mg/g',
            'minimum_required': 10,
            'status': status
        }
        self.quality_tests.append(test)
        return test
    
    def test_contamination(self, bacterial_count: int, fungal_count: int) -> Dict:
        """Kontaminasyon testi"""
        bacterial_status = "pass" if bacterial_count < 1000 else "fail"
        fungal_status = "pass" if fungal_count < 100 else "fail"
        overall_status = "pass" if bacterial_status == "pass" and fungal_status == "pass" else "fail"
        
        test = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'contamination',
            'bacterial_count': bacterial_count,
            'fungal_count': fungal_count,
            'bacterial_limit': 1000,
            'fungal_limit': 100,
            'bacterial_status': bacterial_status,
            'fungal_status': fungal_status,
            'status': overall_status
        }
        self.quality_tests.append(test)
        return test
    
    def test_heavy_metals(self, lead_ppm: float, mercury_ppm: float, 
                         cadmium_ppm: float) -> Dict:
        """Ağır metal testi"""
        lead_ok = lead_ppm < 0.3
        mercury_ok = mercury_ppm < 0.1
        cadmium_ok = cadmium_ppm < 0.2
        
        status = "pass" if all([lead_ok, mercury_ok, cadmium_ok]) else "fail"
        
        test = {
            'timestamp': datetime.now().isoformat(),
            'test_type': 'heavy_metals',
            'lead_ppm': lead_ppm,
            'mercury_ppm': mercury_ppm,
            'cadmium_ppm': cadmium_ppm,
            'limits': {'lead': 0.3, 'mercury': 0.1, 'cadmium': 0.2},
            'status': status
        }
        self.quality_tests.append(test)
        return test
    
    def get_overall_quality_score(self) -> float:
        """Genel kalite skorunu hesapla (0-100)"""
        if not self.quality_tests:
            return 0.0
        
        passed = sum(1 for test in self.quality_tests if test['status'] == 'pass')
        return (passed / len(self.quality_tests)) * 100


class ProductivityCalculator:
    """Verimlilik hesaplayıcı"""
    
    @staticmethod
    def calculate_volumetric_productivity(biomass_concentration: float, 
                                         cultivation_time_days: float) -> float:
        """
        Hacimsel verimlilik hesapla
        
        Args:
            biomass_concentration: Biyokütle konsantrasyonu (g/L)
            cultivation_time_days: Yetiştirme süresi (gün)
        
        Returns:
            Verimlilik (g/L/gün)
        """
        if cultivation_time_days <= 0:
            return 0.0
        return biomass_concentration / cultivation_time_days
    
    @staticmethod
    def calculate_areal_productivity(total_biomass_kg: float, 
                                    cultivation_area_m2: float,
                                    cultivation_time_days: float) -> float:
        """
        Alansal verimlilik hesapla
        
        Args:
            total_biomass_kg: Toplam biyokütle (kg)
            cultivation_area_m2: Yetiştirme alanı (m²)
            cultivation_time_days: Yetiştirme süresi (gün)
        
        Returns:
            Verimlilik (g/m²/gün)
        """
        if cultivation_area_m2 <= 0 or cultivation_time_days <= 0:
            return 0.0
        return (total_biomass_kg * 1000) / (cultivation_area_m2 * cultivation_time_days)
    
    @staticmethod
    def calculate_light_conversion_efficiency(biomass_produced_g: float,
                                             light_energy_kwh: float) -> float:
        """
        Işık dönüşüm verimliliği hesapla
        
        Args:
            biomass_produced_g: Üretilen biyokütle (g)
            light_energy_kwh: Kullanılan ışık enerjisi (kWh)
        
        Returns:
            Verimlilik (%)
        """
        if light_energy_kwh <= 0:
            return 0.0
        
        # Biyokütle enerji içeriği yaklaşık 20 MJ/kg (5.56 kWh/kg)
        biomass_energy_kwh = (biomass_produced_g / 1000) * 5.56
        return (biomass_energy_kwh / light_energy_kwh) * 100


class LabTestIntegration:
    """Laboratuvar test sonuçları entegrasyonu"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.lab_results = []
    
    def import_lab_result(self, test_name: str, result_data: Dict,
                         lab_name: str, certified: bool = False) -> Dict:
        """Laboratuvar test sonucunu içe aktar"""
        result = {
            'timestamp': datetime.now().isoformat(),
            'batch_id': self.batch_id,
            'test_name': test_name,
            'lab_name': lab_name,
            'certified': certified,
            'result_data': result_data
        }
        self.lab_results.append(result)
        return result
    
    def get_results_by_test(self, test_name: str) -> List[Dict]:
        """Belirli bir testin tüm sonuçlarını getir"""
        return [r for r in self.lab_results if r['test_name'] == test_name]
    
    def get_certified_results(self) -> List[Dict]:
        """Sertifikalı test sonuçlarını getir"""
        return [r for r in self.lab_results if r['certified']]
    
    def export_results(self) -> str:
        """Test sonuçlarını JSON formatında dışa aktar"""
        import json
        return json.dumps(self.lab_results, indent=2)


class RealTimeMonitor:
    """Gerçek zamanlı izleme sistemi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.sensors = {}
        self.alerts = []
    
    def register_sensor(self, sensor_id: str, sensor_type: str, 
                       threshold_min: float, threshold_max: float):
        """Sensör kaydet"""
        self.sensors[sensor_id] = {
            'type': sensor_type,
            'threshold_min': threshold_min,
            'threshold_max': threshold_max,
            'last_reading': None,
            'status': 'active'
        }
    
    def record_sensor_reading(self, sensor_id: str, value: float) -> Dict:
        """Sensör okuma kaydı"""
        if sensor_id not in self.sensors:
            raise ValueError(f"Sensor {sensor_id} not registered")
        
        sensor = self.sensors[sensor_id]
        sensor['last_reading'] = {
            'timestamp': datetime.now().isoformat(),
            'value': value
        }
        
        # Eşik kontrolü
        if value < sensor['threshold_min'] or value > sensor['threshold_max']:
            alert = {
                'timestamp': datetime.now().isoformat(),
                'sensor_id': sensor_id,
                'sensor_type': sensor['type'],
                'value': value,
                'threshold_min': sensor['threshold_min'],
                'threshold_max': sensor['threshold_max'],
                'severity': 'high' if value < sensor['threshold_min'] * 0.8 or 
                           value > sensor['threshold_max'] * 1.2 else 'medium'
            }
            self.alerts.append(alert)
            return {'status': 'alert', 'alert': alert}
        
        return {'status': 'normal', 'value': value}
    
    def get_active_alerts(self) -> List[Dict]:
        """Aktif alarmları getir"""
        # Son 1 saat içindeki alarmlar
        recent_alerts = []
        current_time = datetime.now()
        for alert in self.alerts:
            alert_time = datetime.fromisoformat(alert['timestamp'])
            if (current_time - alert_time).total_seconds() < 3600:
                recent_alerts.append(alert)
        return recent_alerts


__all__ = [
    'BiomassAnalyzer',
    'QualityControl',
    'ProductivityCalculator',
    'LabTestIntegration',
    'RealTimeMonitor'
]
