// Veri tabanı yönetim sistemi
// Kimyasal database, tank data ve diğer verilerin export/import işlemleri

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
    
    const tankData = {
      tankStates: tankStates ? JSON.parse(tankStates) : [],
      tankDetails: tankDetails ? JSON.parse(tankDetails) : {},
      customFormulations: customFormulations ? JSON.parse(customFormulations) : [],
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(tankData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tank_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, tankCount: tankData.tankStates.length };
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
export const exportAllSystemData = async () => {
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
    
    // Tüm localStorage anahtarları
    const allKeys = Object.keys(localStorage);
    const chlorellaKeys = allKeys.filter(key => 
      key.startsWith('chlorella') || 
      key === 'tankStates' || 
      key === 'tankDetails' || 
      key === 'customFormulations'
    );
    
    const systemData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      userData: {
        profile: userProfile ? JSON.parse(userProfile) : null,
        preferences: preferences ? JSON.parse(preferences) : null,
        favorites: favorites ? JSON.parse(favorites) : null,
        customRecipes: customRecipes ? JSON.parse(customRecipes) : null,
        usageHistory: usageHistory ? JSON.parse(usageHistory) : null
      },
      tankData: {
        tankStates: tankStates ? JSON.parse(tankStates) : [],
        tankDetails: tankDetails ? JSON.parse(tankDetails) : {},
        customFormulations: customFormulations ? JSON.parse(customFormulations) : []
      },
      allLocalStorageKeys: chlorellaKeys,
      stats: {
        totalTanks: tankStates ? JSON.parse(tankStates).length : 0,
        totalRecipes: customRecipes ? JSON.parse(customRecipes).length : 0,
        activeTanks: tankStates ? JSON.parse(tankStates).filter(t => t.active).length : 0
      }
    };
    
    const dataStr = JSON.stringify(systemData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chlorellaOS_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { 
      success: true, 
      stats: systemData.stats,
      keysCount: chlorellaKeys.length 
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
        const data = JSON.parse(e.target.result);
        
        // Veri doğrulama
        if (!data.tankStates && !data.tankDetails) {
          throw new Error('Geçersiz tank data formatı');
        }
        
        // localStorage'a kaydet
        if (data.tankStates) {
          localStorage.setItem('tankStates', JSON.stringify(data.tankStates));
        }
        if (data.tankDetails) {
          localStorage.setItem('tankDetails', JSON.stringify(data.tankDetails));
        }
        if (data.customFormulations) {
          localStorage.setItem('customFormulations', JSON.stringify(data.customFormulations));
        }
        
        resolve({ 
          success: true, 
          tankCount: data.tankStates ? data.tankStates.length : 0,
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
export const importFullSystemData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        // Versiyon kontrolü
        if (!data.version || !data.exportDate) {
          throw new Error('Geçersiz yedek dosyası formatı');
        }
        
        // Kullanıcı verilerini yükle
        if (data.userData) {
          if (data.userData.profile) {
            localStorage.setItem('chlorella_user_profile', JSON.stringify(data.userData.profile));
          }
          if (data.userData.preferences) {
            localStorage.setItem('chlorella_preferences', JSON.stringify(data.userData.preferences));
          }
          if (data.userData.favorites) {
            localStorage.setItem('chlorella_favorites', JSON.stringify(data.userData.favorites));
          }
          if (data.userData.customRecipes) {
            localStorage.setItem('chlorella_custom_recipes', JSON.stringify(data.userData.customRecipes));
          }
          if (data.userData.usageHistory) {
            localStorage.setItem('chlorella_usage_history', JSON.stringify(data.userData.usageHistory));
          }
        }
        
        // Tank verilerini yükle
        if (data.tankData) {
          if (data.tankData.tankStates) {
            localStorage.setItem('tankStates', JSON.stringify(data.tankData.tankStates));
          }
          if (data.tankData.tankDetails) {
            localStorage.setItem('tankDetails', JSON.stringify(data.tankData.tankDetails));
          }
          if (data.tankData.customFormulations) {
            localStorage.setItem('customFormulations', JSON.stringify(data.tankData.customFormulations));
          }
        }
        
        resolve({ 
          success: true,
          stats: data.stats,
          message: 'Tüm sistem verileri başarıyla geri yüklendi!',
          exportDate: data.exportDate
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
