/**
 * ============================================
 * 🧪 INTERVENTION MANAGER
 * ============================================
 * 
 * Fed-batch müdahalelerini structured data olarak yönet
 * Model V3'ün otomatik kalibrasyonu için kritik altyapı
 * 
 * Veri Modeli:
 * {
 *   id: unique string,
 *   tankId: string,
 *   date: ISO string,
 *   type: 'fedbatch' | 'chemical_dosage' | 'waterchange' | 'topup' | 'harvest' | 'flocculation' | 'deflocculation' | 'pH' | 'light' | 'temp' | 'co2' | 'aeration' | 'mixing' | 'salinity_adjust' | 'tds_adjust' | 'dechlorination' | 'shock_control' | 'cold_chain_transfer' | 'incident_recovery' | 'other',
 *   parameters: {
 *     // Fed-batch için
 *     nutrient?: 'N' | 'P' | 'K' | 'C' | 'Mg' | 'Na' | 'Ca' | 'B' | 'Mo' | 'Fe' | 'Mn' | 'Zn' | 'Co' | 'Cu' | 'S' | 'Cl' | 'trace_mix',
 *     amount?: number,
 *     unit?: 'ml' | 'g' | 'L',
 *     concentration?: string,
 *     
 *     // pH için
 *     targetpH?: number,
 *     acidBase?: 'NaOH' | 'HCl' | 'H2SO4' | 'other',
 *     
 *     // Diğer parametreler
 *     newValue?: number,
 *     oldValue?: number
 *   },
 *   reason?: string,
 *   notes?: string,
 *   performedBy?: string
 * }
 */

const STORAGE_KEY = 'tankInterventions';

/**
 * Tüm müdahaleleri getir
 */
export function getAllInterventions() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('❌ Müdahale verisi okunamadı:', error);
    return [];
  }
}

/**
 * Belirli bir tank için müdahaleleri getir
 */
export function getInterventionsByTank(tankId) {
  const all = getAllInterventions();
  return all.filter(i => i.tankId === tankId);
}

/**
 * Belirli tarih aralığında müdahaleleri getir
 */
export function getInterventionsByDateRange(tankId, startDate, endDate) {
  const interventions = getInterventionsByTank(tankId);
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return interventions.filter(i => {
    const date = new Date(i.date);
    return date >= start && date <= end;
  });
}

/**
 * Yeni müdahale ekle
 */
export function addIntervention(intervention) {
  try {
    const all = getAllInterventions();
    
    // Unique ID oluştur
    const newIntervention = {
      id: `INT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...intervention
    };
    
    all.push(newIntervention);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    
    console.log('✅ Müdahale kaydedildi:', newIntervention.id);
    return newIntervention;
  } catch (error) {
    console.error('❌ Müdahale kaydedilemedi:', error);
    throw error;
  }
}

/**
 * Müdahaleyi güncelle
 */
export function updateIntervention(id, updates) {
  try {
    const all = getAllInterventions();
    const index = all.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error(`Müdahale bulunamadı: ${id}`);
    }
    
    all[index] = {
      ...all[index],
      ...updates,
      lastModified: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    console.log('✅ Müdahale güncellendi:', id);
    return all[index];
  } catch (error) {
    console.error('❌ Müdahale güncellenemedi:', error);
    throw error;
  }
}

/**
 * Müdahaleyi sil
 */
export function deleteIntervention(id) {
  try {
    const all = getAllInterventions();
    const filtered = all.filter(i => i.id !== id);
    
    if (all.length === filtered.length) {
      throw new Error(`Müdahale bulunamadı: ${id}`);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    console.log('✅ Müdahale silindi:', id);
    return true;
  } catch (error) {
    console.error('❌ Müdahale silinemedi:', error);
    throw error;
  }
}

/**
 * Fed-batch analizi için özel fonksiyon
 * Model V3'ün ihtiyacı olan formata dönüştürür
 */
export function getFedbatchInterventions(tankId, startDate, endDate) {
  const interventions = getInterventionsByDateRange(tankId, startDate, endDate);
  
  return interventions
    .filter(i => i.type === 'fedbatch')
    .map(i => ({
      date: i.date,
      nutrient: i.parameters.nutrient,
      amount: i.parameters.amount,
      unit: i.parameters.unit,
      concentration: i.parameters.concentration,
      notes: i.notes
    }));
}

/**
 * Müdahale istatistikleri
 */
export function getInterventionStats(tankId, days = 30) {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  
  const interventions = getInterventionsByDateRange(tankId, startDate, endDate);
  
  const stats = {
    total: interventions.length,
    byType: {},
    lastIntervention: null,
    averagePerWeek: 0
  };
  
  // Tipe göre say
  interventions.forEach(i => {
    stats.byType[i.type] = (stats.byType[i.type] || 0) + 1;
  });
  
  // En son müdahale
  if (interventions.length > 0) {
    const sorted = interventions.sort((a, b) => new Date(b.date) - new Date(a.date));
    stats.lastIntervention = sorted[0];
  }
  
  // Haftalık ortalama
  stats.averagePerWeek = (interventions.length / days) * 7;
  
  return stats;
}

/**
 * Export all data (backup için)
 */
export function exportInterventions() {
  const all = getAllInterventions();
  const dataStr = JSON.stringify(all, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `interventions_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  console.log('✅ Müdahale verisi export edildi');
}

/**
 * Import data (restore için)
 */
export function importInterventions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        
        if (!Array.isArray(imported)) {
          throw new Error('Geçersiz format - array bekleniyor');
        }
        
        // Mevcut verilerle merge
        const existing = getAllInterventions();
        const merged = [...existing];
        
        imported.forEach(item => {
          // Duplicate kontrolü (ID veya timestamp bazlı)
          const exists = merged.find(m => m.id === item.id);
          if (!exists) {
            merged.push(item);
          }
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        console.log(`✅ ${imported.length} müdahale import edildi`);
        resolve(merged.length - existing.length); // Yeni eklenen sayısı
      } catch (error) {
        console.error('❌ Import başarısız:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export default {
  getAllInterventions,
  getInterventionsByTank,
  getInterventionsByDateRange,
  addIntervention,
  updateIntervention,
  deleteIntervention,
  getFedbatchInterventions,
  getInterventionStats,
  exportInterventions,
  importInterventions
};
