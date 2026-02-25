// Veri tabanı yönetim sistemi
// Kimyasal database, tank data ve diğer verilerin export/import işlemleri

import {
  normalizeTankBackup,
  normalizeFullSystemBackup,
  getTankStats,
  getFullSystemStats
} from './backupSchema';

const parseJSONSafe = (raw, fallback) => {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const CHLORELLA_STORAGE_KEYS = [
  'tankStates',
  'tankDetails',
  'customFormulations',
  'tankInterventions',
  'spectroODMeasurements',
  'chlorellaMonitoringRecords',
  'enforcedChlorellaSystem',
  'chlorellaMaterials',
  'chlorellaShoppingList',
  'chlorella_user_profile',
  'chlorella_preferences',
  'chlorella_favorites',
  'chlorella_custom_recipes',
  'chlorella_usage_history',
  'productionPlans',
  'scaleUpReports',
  'chlorellaDailyStagePlans',
  'chlorellaDailyStageManualChecks',
  'chlorellaDailyStageDailyChecks',
  'learningCenterTopics',
  'chlorellaKnowledgeTopics',
  'chlorellaSpecialStockLibrary',
  'chlorellaFeedingPrograms',
  'chlorellaSpectroMethodLibrary',
  'chlorellaSpectroCalibrationDb',
  'chlorella_calibrations',
  'chlorellaProcessGuardrails',
  'chlorellaDeliverySpecs',
  'chlorellaHarvestBatches',
  'chlorellaIncidentLog',
  'chlorellaODCalibrationProfiles',
  'spectroCalibrations'
];

const collectStorageSnapshot = () => {
  const allKeys = Object.keys(localStorage || {});
  const dynamicChlorellaKeys = allKeys.filter((key) => key.startsWith('chlorella'));
  const keys = Array.from(new Set([...CHLORELLA_STORAGE_KEYS, ...dynamicChlorellaKeys])).filter((key) => localStorage.getItem(key) !== null);

  const snapshot = keys.reduce((acc, key) => {
    acc[key] = parseJSONSafe(localStorage.getItem(key), localStorage.getItem(key));
    return acc;
  }, {});

  return { keys, snapshot };
};

/**
 * Kimyasal database'i dışa aktar
 * chemicalDatabase.js içeriğini JSON olarak indir
 */
export const exportChemicalDatabase = async () => {
  try {
    const { default: chemicalDatabase } = await import('../data/chemicalDatabase.js');
    
    const dataStr = JSON.stringify(chemicalDatabase, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chemical_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, count: Object.keys(chemicalDatabase).length };
  } catch (error) {
    console.error('Chemical database export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Tank verilerini dışa aktar
 * localStorage'daki tankStates ve tankDetails
 */
export const exportTankData = () => {
  try {
    const tankStates = localStorage.getItem('tankStates');
    const tankDetails = localStorage.getItem('tankDetails');
    const customFormulations = localStorage.getItem('customFormulations');
    const tankInterventions = localStorage.getItem('tankInterventions');
    const spectroODMeasurements = localStorage.getItem('spectroODMeasurements');
    const chlorellaMonitoringRecords = localStorage.getItem('chlorellaMonitoringRecords');
    const enforcedChlorellaSystem = localStorage.getItem('enforcedChlorellaSystem');

    const backup = normalizeTankBackup({
      data: {
        tankData: {
      tankStates: tankStates ? JSON.parse(tankStates) : [],
      tankDetails: tankDetails ? JSON.parse(tankDetails) : {},
      customFormulations: customFormulations ? JSON.parse(customFormulations) : [],
          tankInterventions: tankInterventions ? JSON.parse(tankInterventions) : [],
          spectroODMeasurements: spectroODMeasurements ? JSON.parse(spectroODMeasurements) : {},
          chlorellaMonitoringRecords: chlorellaMonitoringRecords ? JSON.parse(chlorellaMonitoringRecords) : [],
          enforcedChlorellaSystem: enforcedChlorellaSystem ? JSON.parse(enforcedChlorellaSystem) : null
        }
      }
    });

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tank_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, stats: getTankStats(backup.data.tankData) };
  } catch (error) {
    console.error('Tank data export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Medya database'i dışa aktar
 * mediaDatabase.js içeriğini JSON olarak indir
 */
export const exportMediaDatabase = async () => {
  try {
    const { default: mediaDatabase } = await import('../data/mediaDatabase.js');
    
    const dataStr = JSON.stringify(mediaDatabase, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `media_database_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, count: Object.keys(mediaDatabase).length };
  } catch (error) {
    console.error('Media database export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * TÜM SİSTEM verilerini tek seferde dışa aktar
 * Kullanıcı profili + Tercihler + Tank data + Kimyasal + Medya
 */
export const exportAllSystemData = async ({ download = true } = {}) => {
  try {
    // Kullanıcı verileri
    const userProfile = localStorage.getItem('chlorella_user_profile');
    const preferences = localStorage.getItem('chlorella_preferences');
    const favorites = localStorage.getItem('chlorella_favorites');
    const customRecipes = localStorage.getItem('chlorella_custom_recipes');
    const usageHistory = localStorage.getItem('chlorella_usage_history');
    
    // Tank verileri
    const tankStates = localStorage.getItem('tankStates');
    const tankDetails = localStorage.getItem('tankDetails');
    const customFormulations = localStorage.getItem('customFormulations');
    const tankInterventions = localStorage.getItem('tankInterventions');
    const spectroODMeasurements = localStorage.getItem('spectroODMeasurements');
    const chlorellaMonitoringRecords = localStorage.getItem('chlorellaMonitoringRecords');
    const enforcedChlorellaSystem = localStorage.getItem('enforcedChlorellaSystem');

    const materials = localStorage.getItem('chlorellaMaterials');
    const shopping = localStorage.getItem('chlorellaShoppingList');
    
    const { default: mediaDatabase } = await import('../data/mediaDatabase.js');
    const { keys: chlorellaKeys, snapshot } = collectStorageSnapshot();
    
    const backup = normalizeFullSystemBackup({
      data: {
        userData: {
          profile: userProfile ? JSON.parse(userProfile) : null,
          preferences: preferences ? JSON.parse(preferences) : null,
          favorites: favorites ? JSON.parse(favorites) : null,
          customRecipes: customRecipes ? JSON.parse(customRecipes) : [],
          usageHistory: usageHistory ? JSON.parse(usageHistory) : null
        },
        tankData: {
          tankStates: tankStates ? JSON.parse(tankStates) : [],
          tankDetails: tankDetails ? JSON.parse(tankDetails) : {},
          customFormulations: customFormulations ? JSON.parse(customFormulations) : [],
          tankInterventions: tankInterventions ? JSON.parse(tankInterventions) : [],
          spectroODMeasurements: spectroODMeasurements ? JSON.parse(spectroODMeasurements) : {},
          chlorellaMonitoringRecords: chlorellaMonitoringRecords ? JSON.parse(chlorellaMonitoringRecords) : [],
          enforcedChlorellaSystem: enforcedChlorellaSystem ? JSON.parse(enforcedChlorellaSystem) : null
        },
        materialsData: {
          materials: materials ? JSON.parse(materials) : [],
          shopping: shopping ? JSON.parse(shopping) : [],
          formulations: customFormulations ? JSON.parse(customFormulations) : []
        },
        databaseData: {
          standardMediaDatabase: mediaDatabase,
          localStorageSnapshot: snapshot
        }
      },
      allLocalStorageKeys: chlorellaKeys
    });

    const stats = getFullSystemStats(backup.data);
    if (download) {
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chlorellaOS_full_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    return { 
      success: true, 
      stats,
      keysCount: chlorellaKeys.length,
      backup
    };
  } catch (error) {
    console.error('Full system export error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Tank verilerini içe aktar (yükle)
 */
export const importTankData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
        const backup = normalizeTankBackup(rawData);
        const tankData = backup.data.tankData;

        // Veri doğrulama
        if (!tankData.tankStates.length && !Object.keys(tankData.tankDetails).length) {
          throw new Error('Geçersiz tank data formatı');
        }

        // localStorage'a kaydet
        localStorage.setItem('tankStates', JSON.stringify(tankData.tankStates));
        localStorage.setItem('tankDetails', JSON.stringify(tankData.tankDetails));
        localStorage.setItem('customFormulations', JSON.stringify(tankData.customFormulations));
        localStorage.setItem('tankInterventions', JSON.stringify(tankData.tankInterventions));
        localStorage.setItem('spectroODMeasurements', JSON.stringify(tankData.spectroODMeasurements));
        localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(tankData.chlorellaMonitoringRecords));
        if (tankData.enforcedChlorellaSystem) {
          localStorage.setItem('enforcedChlorellaSystem', JSON.stringify(tankData.enforcedChlorellaSystem));
        }

        resolve({ 
          success: true, 
          stats: getTankStats(tankData),
          message: 'Tank verileri başarıyla yüklendi!'
        });
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    };
    
    reader.onerror = () => reject({ success: false, error: 'Dosya okuma hatası' });
    reader.readAsText(file);
  });
};

/**
 * Tam sistem yedeğini içe aktar
 */
export const importFullSystemDataFromPayload = async (rawPayload) => {
  const backup = normalizeFullSystemBackup(rawPayload);
  const userData = backup.data.userData;
  const tankData = backup.data.tankData;
  const materialsData = backup.data.materialsData;
  const localSnapshot = rawPayload?.data?.databaseData?.localStorageSnapshot || rawPayload?.databaseData?.localStorageSnapshot || null;

  if (userData) {
    if (userData.profile) localStorage.setItem('chlorella_user_profile', JSON.stringify(userData.profile));
    if (userData.preferences) localStorage.setItem('chlorella_preferences', JSON.stringify(userData.preferences));
    if (userData.favorites) localStorage.setItem('chlorella_favorites', JSON.stringify(userData.favorites));
    if (userData.customRecipes) localStorage.setItem('chlorella_custom_recipes', JSON.stringify(userData.customRecipes));
    if (userData.usageHistory) localStorage.setItem('chlorella_usage_history', JSON.stringify(userData.usageHistory));
  }

  if (tankData) {
    localStorage.setItem('tankStates', JSON.stringify(tankData.tankStates));
    localStorage.setItem('tankDetails', JSON.stringify(tankData.tankDetails));
    localStorage.setItem('customFormulations', JSON.stringify(tankData.customFormulations));
    localStorage.setItem('tankInterventions', JSON.stringify(tankData.tankInterventions));
    localStorage.setItem('spectroODMeasurements', JSON.stringify(tankData.spectroODMeasurements));
    localStorage.setItem('chlorellaMonitoringRecords', JSON.stringify(tankData.chlorellaMonitoringRecords));
    if (tankData.enforcedChlorellaSystem) {
      localStorage.setItem('enforcedChlorellaSystem', JSON.stringify(tankData.enforcedChlorellaSystem));
    }
  }

  if (materialsData) {
    localStorage.setItem('chlorellaMaterials', JSON.stringify(materialsData.materials));
    localStorage.setItem('chlorellaShoppingList', JSON.stringify(materialsData.shopping));
    if (materialsData.formulations.length > 0) {
      localStorage.setItem('customFormulations', JSON.stringify(materialsData.formulations));
    }
  }

  if (localSnapshot && typeof localSnapshot === 'object') {
    Object.entries(localSnapshot).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return {
    success: true,
    stats: getFullSystemStats(backup.data),
    message: 'Tüm sistem verileri başarıyla geri yüklendi!',
    exportDate: backup.createdAt
  };
};

export const importFullSystemData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const rawData = JSON.parse(e.target.result);
        const result = await importFullSystemDataFromPayload(rawData);
        resolve(result);
      } catch (error) {
        reject({ success: false, error: error.message });
      }
    };

    reader.onerror = () => reject({ success: false, error: 'Dosya okuma hatası' });
    reader.readAsText(file);
  });
};

/**
 * Sadece kimyasal database'i temizle (dikkatli kullan!)
 */
export const clearChemicalDatabase = () => {
  // Bu fonksiyon sadece localStorage'daki custom kimyasal eklemelerini temizler
  // Gerçek chemicalDatabase.js dosyası etkilenmez
  const customChemicals = localStorage.getItem('custom_chemicals');
  if (customChemicals) {
    localStorage.removeItem('custom_chemicals');
    return { success: true, message: 'Özel kimyasallar temizlendi' };
  }
  return { success: false, message: 'Temizlenecek özel kimyasal bulunamadı' };
};

/**
 * Sadece tank verilerini temizle
 */
export const clearTankData = () => {
  try {
    localStorage.removeItem('tankStates');
    localStorage.removeItem('tankDetails');
    localStorage.removeItem('customFormulations');
    return { success: true, message: 'Tüm tank verileri temizlendi' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
