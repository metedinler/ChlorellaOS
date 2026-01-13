// Kullanıcı profili ve özelleştirme yöneticisi

const USER_STORAGE_KEY = 'chlorella_user_profile';
const FAVORITES_KEY = 'chlorella_favorites';
const CUSTOM_RECIPES_KEY = 'chlorella_custom_recipes';
const USAGE_HISTORY_KEY = 'chlorella_usage_history';
const PREFERENCES_KEY = 'chlorella_preferences';

// Varsayılan kullanıcı profili
const DEFAULT_USER_PROFILE = {
  username: 'Kullanıcı',
  experienceLevel: 'intermediate', // beginner, intermediate, advanced, industrial
  primaryGoal: 'research', // research, production, education, commercial
  targetSpecies: ['Chlorella vulgaris'],
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  totalSessions: 0
};

// Varsayılan tercihler
const DEFAULT_PREFERENCES = {
  defaultVolume: 1,
  preferredUnits: 'metric', // metric, imperial
  autoSaveInterval: 300, // saniye
  showTutorials: true,
  compactMode: false,
  defaultMedia: 'BBM',
  costCurrency: 'TL',
  notificationsEnabled: true,
  autoClearZero: true, // Sayı inputlarında 0 değerini otomatik temizle
  autoSelectText: true // Input focus'ta metni otomatik seç
};

// Kullanıcı profili yönetimi
export const getUserProfile = () => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (stored) {
      const profile = JSON.parse(stored);
      profile.lastLogin = new Date().toISOString();
      profile.totalSessions += 1;
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    }
    return DEFAULT_USER_PROFILE;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return DEFAULT_USER_PROFILE;
  }
};

export const updateUserProfile = (updates) => {
  try {
    const current = getUserProfile();
    const updated = { ...current, ...updates, lastModified: new Date().toISOString() };
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
};

export const resetUserProfile = () => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
    return DEFAULT_USER_PROFILE;
  } catch (error) {
    console.error('Error resetting user profile:', error);
    return null;
  }
};

// Tercihler yönetimi
export const getPreferences = () => {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return DEFAULT_PREFERENCES;
  }
};

export const updatePreferences = (updates) => {
  try {
    const current = getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating preferences:', error);
    return null;
  }
};

// Favoriler yönetimi
export const getFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : {
      media: [],
      analyses: [],
      tanks: [],
      recipes: []
    };
  } catch (error) {
    console.error('Error loading favorites:', error);
    return { media: [], analyses: [], tanks: [], recipes: [] };
  }
};

export const addFavorite = (category, item) => {
  try {
    const favorites = getFavorites();
    if (!favorites[category]) {
      favorites[category] = [];
    }
    
    // Zaten favorilerde yoksa ekle
    const exists = favorites[category].some(fav => 
      typeof fav === 'object' ? fav.id === item.id : fav === item
    );
    
    if (!exists) {
      favorites[category].push(item);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    
    return favorites;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return null;
  }
};

export const removeFavorite = (category, itemId) => {
  try {
    const favorites = getFavorites();
    if (favorites[category]) {
      favorites[category] = favorites[category].filter(item => 
        typeof item === 'object' ? item.id !== itemId : item !== itemId
      );
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return favorites;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return null;
  }
};

export const isFavorite = (category, itemId) => {
  try {
    const favorites = getFavorites();
    if (!favorites[category]) return false;
    return favorites[category].some(item => 
      typeof item === 'object' ? item.id === itemId : item === itemId
    );
  } catch (error) {
    return false;
  }
};

// Özel tarifler yönetimi
export const getCustomRecipes = () => {
  try {
    const stored = localStorage.getItem(CUSTOM_RECIPES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom recipes:', error);
    return [];
  }
};

export const addCustomRecipe = (recipe) => {
  try {
    const recipes = getCustomRecipes();
    const newRecipe = {
      ...recipe,
      id: `custom_${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: getUserProfile().username
    };
    recipes.push(newRecipe);
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
    return newRecipe;
  } catch (error) {
    console.error('Error adding custom recipe:', error);
    return null;
  }
};

export const updateCustomRecipe = (recipeId, updates) => {
  try {
    const recipes = getCustomRecipes();
    const index = recipes.findIndex(r => r.id === recipeId);
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...updates, lastModified: new Date().toISOString() };
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(recipes));
      return recipes[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating custom recipe:', error);
    return null;
  }
};

export const deleteCustomRecipe = (recipeId) => {
  try {
    const recipes = getCustomRecipes();
    const filtered = recipes.filter(r => r.id !== recipeId);
    localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting custom recipe:', error);
    return false;
  }
};

// Kullanım geçmişi
export const getUsageHistory = () => {
  try {
    const stored = localStorage.getItem(USAGE_HISTORY_KEY);
    return stored ? JSON.parse(stored) : {
      recentMedia: [],
      recentAnalyses: [],
      recentTanks: [],
      statistics: {
        totalAnalyses: 0,
        totalTanksCreated: 0,
        totalRecipesSaved: 0,
        mostUsedMedia: null,
        lastActivity: null
      }
    };
  } catch (error) {
    console.error('Error loading usage history:', error);
    return {
      recentMedia: [],
      recentAnalyses: [],
      recentTanks: [],
      statistics: { totalAnalyses: 0, totalTanksCreated: 0, totalRecipesSaved: 0 }
    };
  }
};

export const logActivity = (activityType, data) => {
  try {
    const history = getUsageHistory();
    
    const activity = {
      type: activityType,
      data,
      timestamp: new Date().toISOString()
    };
    
    // Aktivite tipine göre kayıt
    switch (activityType) {
      case 'media_viewed':
        history.recentMedia.unshift(data);
        history.recentMedia = history.recentMedia.slice(0, 20); // Son 20'yi tut
        break;
      case 'analysis_performed':
        history.recentAnalyses.unshift(data);
        history.recentAnalyses = history.recentAnalyses.slice(0, 50);
        history.statistics.totalAnalyses += 1;
        break;
      case 'tank_created':
        history.recentTanks.unshift(data);
        history.recentTanks = history.recentTanks.slice(0, 30);
        history.statistics.totalTanksCreated += 1;
        break;
      case 'recipe_saved':
        history.statistics.totalRecipesSaved += 1;
        break;
    }
    
    history.statistics.lastActivity = new Date().toISOString();
    
    localStorage.setItem(USAGE_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

export const getMostUsedMedia = () => {
  try {
    const history = getUsageHistory();
    const mediaCount = {};
    
    history.recentMedia.forEach(mediaId => {
      mediaCount[mediaId] = (mediaCount[mediaId] || 0) + 1;
    });
    
    const sorted = Object.entries(mediaCount).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { mediaId: sorted[0][0], count: sorted[0][1] } : null;
  } catch (error) {
    return null;
  }
};

// Kişiselleştirilmiş öneriler
export const getPersonalizedRecommendations = () => {
  const profile = getUserProfile();
  const favorites = getFavorites();
  const history = getUsageHistory();
  const mostUsed = getMostUsedMedia();
  
  const recommendations = [];
  
  // Deneyim seviyesine göre
  if (profile.experienceLevel === 'beginner') {
    recommendations.push({
      type: 'tutorial',
      title: 'Başlangıç Rehberi',
      message: 'BBM ve BG-11 gibi standart ortamlarla başlamanızı öneririz.',
      action: 'view_guide',
      priority: 'high'
    });
  }
  
  if (profile.experienceLevel === 'advanced' && favorites.media.length === 0) {
    recommendations.push({
      type: 'feature',
      title: 'Favoriler Özelliği',
      message: 'Sık kullandığınız ortamları favorilere ekleyin!',
      action: 'add_favorites',
      priority: 'medium'
    });
  }
  
  // Kullanım geçmişine göre
  if (history.statistics.totalAnalyses > 10 && history.recentMedia.length > 0) {
    recommendations.push({
      type: 'insight',
      title: 'En Çok Kullandığınız Ortam',
      message: mostUsed ? `${mostUsed.mediaId} ortamını ${mostUsed.count} kez kullandınız.` : 'Henüz ortam kullanmadınız.',
      action: 'view_stats',
      priority: 'low'
    });
  }
  
  // Hedef türe göre
  if (profile.targetSpecies.includes('Chlorella vulgaris')) {
    recommendations.push({
      type: 'media',
      title: 'Chlorella için Öneriler',
      message: 'BBM, BG-11 veya JM ortamları Chlorella vulgaris için idealdir.',
      action: 'view_media',
      priority: 'medium'
    });
  }
  
  // Hiç özel tarif yoksa
  if (profile.experienceLevel === 'advanced' && getCustomRecipes().length === 0) {
    recommendations.push({
      type: 'feature',
      title: 'Özel Tarif Oluşturun',
      message: 'Kendi besin ortamı formülasyonlarınızı kaydedebilirsiniz!',
      action: 'create_recipe',
      priority: 'medium'
    });
  }
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Tüm kullanıcı verilerini temizle
export const clearAllUserData = () => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(CUSTOM_RECIPES_KEY);
    localStorage.removeItem(USAGE_HISTORY_KEY);
    localStorage.removeItem(PREFERENCES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing user data:', error);
    return false;
  }
};

// Veri dışa aktarma (JSON)
export const exportUserData = () => {
  try {
    const data = {
      profile: getUserProfile(),
      favorites: getFavorites(),
      customRecipes: getCustomRecipes(),
      usageHistory: getUsageHistory(),
      preferences: getPreferences(),
      exportedAt: new Date().toISOString()
    };
    return data;
  } catch (error) {
    console.error('Error exporting user data:', error);
    return null;
  }
};

// Veri içe aktarma
export const importUserData = (data) => {
  try {
    if (data.profile) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.profile));
    }
    if (data.favorites) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
    }
    if (data.customRecipes) {
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(data.customRecipes));
    }
    if (data.usageHistory) {
      localStorage.setItem(USAGE_HISTORY_KEY, JSON.stringify(data.usageHistory));
    }
    if (data.preferences) {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(data.preferences));
    }
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
};
