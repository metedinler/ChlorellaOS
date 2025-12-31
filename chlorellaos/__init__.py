"""
ChlorellaOS - Akıllı Üretim İzleme Sistemi
Chlorella Vulgaris Endüstriyel Üretim ve İmmobilizasyon Prosesi İzleme Sistemi

© 2025 Mete Dinler. All rights reserved.
This software is private and confidential.
Unauthorized copying, modification, or distribution is prohibited.
Usage requires a valid license and payment.
"""

__version__ = "1.0.0"
__author__ = "Zuhtu Mete Dinler"
__copyright__ = "© 2025 Mete Dinler. All rights reserved."
__license__ = "Proprietary - Commercial License Required"

# License verification
import sys
import os

class LicenseManager:
    """
    Lisans yönetim sistemi
    Bu sistem kullanım için geçerli bir lisans anahtarı gerektirir
    """
    
    @staticmethod
    def verify_license():
        """Lisans doğrulama - ücret ödemeden kullanılamaz"""
        license_key = os.environ.get('CHLORELLA_LICENSE_KEY')
        if not license_key:
            print("\n" + "="*70)
            print("⚠️  CHLORELLAOS - LİSANS GEREKLİ")
            print("="*70)
            print("Bu sistem kullanım için ÜCRET ÖDENMESİNİ gerektirir.")
            print("Geçerli bir lisans anahtarı sağlanmadı.")
            print("\nKullanım koşulları:")
            print("- KULLANIMA AÇIK DEĞİLDİR")
            print("- ÜCRET ÖDEMEDEN KULLANILAMAZ")
            print("- Tüm hakları ZUHTU METE DINLER tarafından saklıdır")
            print("\nLisans almak için iletişime geçin.")
            print("© 2025 Mete Dinler. All rights reserved.")
            print("="*70 + "\n")
            return False
        return True

    @staticmethod
    def show_copyright():
        """Telif hakkı bilgisini göster"""
        print("\nChlorellaOS v1.0.0")
        print("© 2025 Mete Dinler. All rights reserved.")
        print("This repository is private and confidential.")
        print("Unauthorized copying, modification, or distribution is prohibited.\n")

# Modül import'ları
from . import cultivation
from . import analysis
from . import recording
from . import accounting
from . import profitability

__all__ = [
    'cultivation',
    'analysis', 
    'recording',
    'accounting',
    'profitability',
    'LicenseManager'
]
