"""
ChlorellaOS Sistem Konfigürasyonu
© 2025 Mete Dinler. All rights reserved.
"""

# Veritabanı Ayarları
DATABASE_CONFIG = {
    'type': 'sqlite',  # 'sqlite' veya 'postgresql'
    'sqlite': {
        'database': 'chlorellaos_data.db'
    },
    'postgresql': {
        'host': 'localhost',
        'port': 5432,
        'database': 'chlorellaos',
        'user': 'chlorella_user',
        'password': ''  # Çevre değişkeninden okunmalı
    }
}

# Üretim Parametreleri
PRODUCTION_SETTINGS = {
    'default_culture_volume_liters': 1000,
    'optimal_temperature_celsius': 25,
    'optimal_ph': 7.5,
    'optimal_light_intensity_lux': 5000,
    'target_biomass_density_g_per_l': 5.0,
    'harvest_threshold_g_per_l': 4.5
}

# Kalite Kontrol Eşikleri
QUALITY_THRESHOLDS = {
    'protein_content': {
        'min': 45,
        'max': 65,
        'unit': 'percentage'
    },
    'chlorophyll_content': {
        'min': 10,
        'unit': 'mg/g'
    },
    'contamination': {
        'bacterial_count_max': 1000,
        'fungal_count_max': 100,
        'unit': 'cfu/g'
    },
    'heavy_metals': {
        'lead_max_ppm': 0.3,
        'mercury_max_ppm': 0.1,
        'cadmium_max_ppm': 0.2
    }
}

# Finansal Ayarlar
FINANCIAL_SETTINGS = {
    'default_currency': 'TRY',
    'supported_currencies': ['TRY', 'USD', 'EUR'],
    'default_discount_rate': 0.10,  # %10
    'default_tax_rate': 0.20  # %20
}

# Raporlama Ayarları
REPORTING_SETTINGS = {
    'export_formats': ['json', 'csv', 'pdf'],
    'default_export_path': './reports/',
    'auto_backup': True,
    'backup_interval_hours': 24
}

# Lisans Ayarları
LICENSE_SETTINGS = {
    'require_license': True,
    'license_check_interval_days': 30,
    'trial_period_days': 0,  # Trial süresi yok
    'license_server_url': None  # Gelecekte eklenebilir
}

# Sistem Ayarları
SYSTEM_SETTINGS = {
    'version': '1.0.0',
    'author': 'Zuhtu Mete Dinler',
    'copyright': '© 2025 Mete Dinler. All rights reserved.',
    'license': 'Proprietary - Commercial License Required',
    'contact_email': 'contact@chlorellaos.com',
    'support_url': 'https://github.com/metedinler/ChlorellaOS'
}

# Güvenlik Ayarları
SECURITY_SETTINGS = {
    'enable_encryption': True,
    'enable_audit_log': True,
    'session_timeout_minutes': 30,
    'password_min_length': 8,
    'require_strong_password': True
}

# Uyarı Ayarları
ALERT_SETTINGS = {
    'enable_email_alerts': False,
    'enable_sms_alerts': False,
    'alert_recipients': [],
    'critical_alert_immediate': True,
    'alert_history_days': 90
}

def get_config(section: str):
    """Belirli bir konfigürasyon bölümünü getir"""
    configs = {
        'database': DATABASE_CONFIG,
        'production': PRODUCTION_SETTINGS,
        'quality': QUALITY_THRESHOLDS,
        'financial': FINANCIAL_SETTINGS,
        'reporting': REPORTING_SETTINGS,
        'license': LICENSE_SETTINGS,
        'system': SYSTEM_SETTINGS,
        'security': SECURITY_SETTINGS,
        'alerts': ALERT_SETTINGS
    }
    return configs.get(section, {})

def get_all_configs():
    """Tüm konfigürasyonları getir"""
    return {
        'database': DATABASE_CONFIG,
        'production': PRODUCTION_SETTINGS,
        'quality': QUALITY_THRESHOLDS,
        'financial': FINANCIAL_SETTINGS,
        'reporting': REPORTING_SETTINGS,
        'license': LICENSE_SETTINGS,
        'system': SYSTEM_SETTINGS,
        'security': SECURITY_SETTINGS,
        'alerts': ALERT_SETTINGS
    }
