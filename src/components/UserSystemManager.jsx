import React, { useState, useEffect } from 'react';
import { User, Settings, Star, Save, History, Download, Upload, Trash2, Award, Target, TrendingUp, Clock, CheckCircle, AlertCircle, Info, Plus, Edit2, X, Zap, Database, Beaker, FlaskConical } from 'lucide-react';
import { handleNumberInputFocus } from '../utils/inputHelpers';
import { getAllUnifiedChemicals, searchChemicals } from '../utils/unifiedChemicalDatabase';
import {
  exportChemicalDatabase,
  exportTankData,
  exportMediaDatabase,
  exportAllSystemData,
  importTankData,
  importFullSystemData,
  clearTankData
} from '../utils/databaseManager.js';
import {
  getUserProfile,
  updateUserProfile,
  resetUserProfile,
  getPreferences,
  updatePreferences,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getCustomRecipes,
  addCustomRecipe,
  updateCustomRecipe,
  deleteCustomRecipe,
  getUsageHistory,
  getPersonalizedRecommendations,
  clearAllUserData,
  exportUserData,
  importUserData
} from '../utils/userManager.js';

const UserSystemManager = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [favorites, setFavorites] = useState(null);
  const [customRecipes, setCustomRecipes] = useState([]);
  const [usageHistory, setUsageHistory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  
  // Veri yükleme
  useEffect(() => {
    loadAllData();
  }, []);
  
  const loadAllData = () => {
    setProfile(getUserProfile());
    setPreferences(getPreferences());
    setFavorites(getFavorites());
    setCustomRecipes(getCustomRecipes());
    setUsageHistory(getUsageHistory());
    setRecommendations(getPersonalizedRecommendations());
  };
  
  // Profil güncelleme
  const handleProfileUpdate = (field, value) => {
    const updated = updateUserProfile({ [field]: value });
    setProfile(updated);
    setRecommendations(getPersonalizedRecommendations());
  };
  
  // Tercih güncelleme
  const handlePreferenceUpdate = (field, value) => {
    const updated = updatePreferences({ [field]: value });
    setPreferences(updated);
  };
  
  // Favori ekleme/çıkarma
  const toggleFavorite = (category, item) => {
    if (isFavorite(category, item)) {
      removeFavorite(category, item);
    } else {
      addFavorite(category, item);
    }
    setFavorites(getFavorites());
  };
  
  // Özel tarif kaydetme
  const handleSaveRecipe = (recipe) => {
    if (editingRecipe) {
      updateCustomRecipe(editingRecipe.id, recipe);
    } else {
      addCustomRecipe(recipe);
    }
    setCustomRecipes(getCustomRecipes());
    setEditingRecipe(null);
    setShowRecipeForm(false);
  };
  
  // Tarif silme
  const handleDeleteRecipe = (recipeId) => {
    if (window.confirm('Bu tarifi silmek istediğinizden emin misiniz?')) {
      deleteCustomRecipe(recipeId);
      setCustomRecipes(getCustomRecipes());
    }
  };
  
  // Veri dışa aktarma
  const handleExport = () => {
    const data = exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chlorella_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Veri içe aktarma
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (importUserData(data)) {
            loadAllData();
            alert('Veriler başarıyla içe aktarıldı!');
          } else {
            alert('Veri içe aktarma başarısız!');
          }
        } catch (error) {
          alert('Geçersiz dosya formatı!');
        }
      };
      reader.readAsText(file);
    }
  };
  
  // Tüm verileri temizle
  const handleClearAll = () => {
    if (window.confirm('TÜM kullanıcı verileriniz silinecek! Emin misiniz?')) {
      if (window.confirm('Bu işlem GERİ ALINAMAZ! Devam etmek istiyor musunuz?')) {
        clearAllUserData();
        loadAllData();
        alert('Tüm veriler temizlendi!');
      }
    }
  };

  // ========================================
  // DATABASE MANAGEMENT HANDLERS (Task 3-4)
  // ========================================
  
  const handleExportChemicals = async () => {
    const result = await exportChemicalDatabase();
    if (result.success) {
      alert(`✅ Kimyasal database başarıyla dışa aktarıldı!\n${result.count} kimyasal`);
    } else {
      alert(`❌ Hata: ${result.error}`);
    }
  };

  const handleExportTanks = () => {
    const result = exportTankData();
    if (result.success) {
      alert(`✅ Tank verileri başarıyla dışa aktarıldı!\nToplam: ${result.stats.totalTanks} tank\nAktif: ${result.stats.activeTanks} tank`);
    } else {
      alert(`❌ Hata: ${result.error}`);
    }
  };

  const handleExportMedia = async () => {
    const result = await exportMediaDatabase();
    if (result.success) {
      alert(`✅ Medya database başarıyla dışa aktarıldı!\n${result.count} besin ortamı`);
    } else {
      alert(`❌ Hata: ${result.error}`);
    }
  };

  const handleExportFullSystem = async () => {
    const result = await exportAllSystemData();
    if (result.success) {
      alert(`✅ TAM SİSTEM YEDEĞİ ALINDI!\n\nTanklar: ${result.stats.totalTanks}\nAktif Tanklar: ${result.stats.activeTanks}\nÖzel Tarifler: ${result.stats.totalRecipes}\nKimyasallar: ${result.stats.chemicals}\nBesin Ortamları: ${result.stats.mediaRecipes}`);
    } else {
      alert(`❌ Hata: ${result.error}`);
    }
  };

  const handleImportTanks = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const result = await importTankData(file);
      if (result.success) {
        alert(`✅ Tank verileri başarıyla geri yüklendi!\n\nSayfa yenileniyor...`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ İçe aktarma hatası: ${error.message || error.error}`);
    }
    event.target.value = '';
  };

  const handleImportFullSystem = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!window.confirm('UYARI: Tüm mevcut veriler silinecek ve yedekten geri yüklenecek!\n\nDevam etmek istiyor musunuz?')) {
      event.target.value = '';
      return;
    }
    
    try {
      const result = await importFullSystemData(file);
      if (result.success) {
        alert(`✅ TAM SİSTEM GERİ YÜKLENDİ!\n\nSayfa yenileniyor...`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ İçe aktarma hatası: ${error.message || error.error}`);
    }
    event.target.value = '';
  };

  const handleClearTanks = () => {
    if (window.confirm('TÜM TANK VERİLERİ SİLİNECEK!\n\nBu işlem tank durumlarını, detaylarını ve özel formülasyonları silecek.\n\nEmin misiniz?')) {
      const result = clearTankData();
      if (result.success) {
        alert('✅ Tüm tank verileri temizlendi!');
        setTimeout(() => window.location.reload(), 500);
      } else {
        alert(`❌ Hata: ${result.error}`);
      }
    }
  };
  
  if (!profile || !preferences) {
    return <div className="p-6">Yükleniyor...</div>;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">👤 Kullanıcı Sistemi & Kişiselleştirme</h2>
        <p className="text-blue-100">Profil, Tercihler, Favoriler, Özel Tarifler</p>
      </div>
      
      {/* Öneriler Kartı */}
      {recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
            <Award className="w-6 h-6 mr-2" />
            Kişiselleştirilmiş Öneriler
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.priority === 'high' ? 'bg-red-50 border-red-500' :
                  rec.priority === 'medium' ? 'bg-blue-50 border-blue-500' :
                  'bg-gray-50 border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-gray-800">{rec.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{rec.message}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                    rec.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {rec.priority === 'high' ? 'YÜKSEK' : rec.priority === 'medium' ? 'ORTA' : 'DÜŞÜK'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Menü */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('profile')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-5 h-5" />Profil
          </button>
          <button
            onClick={() => setActiveSection('preferences')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'preferences' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Settings className="w-5 h-5" />Tercihler
          </button>
          <button
            onClick={() => setActiveSection('favorites')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'favorites' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className="w-5 h-5" />Favoriler
          </button>
          <button
            onClick={() => setActiveSection('recipes')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'recipes' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Save className="w-5 h-5" />Özel Tarifler
          </button>
          <button
            onClick={() => setActiveSection('history')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'history' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <History className="w-5 h-5" />Geçmiş
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'data' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Download className="w-5 h-5" />Veri Yönetimi
          </button>
          <button
            onClick={() => setActiveSection('database')}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
              activeSection === 'database' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
            }`}
          >
            <Database className="w-5 h-5" />Veritabanı Sistemi
          </button>
        </div>
      </div>
      
      {/* Profil Bölümü */}
      {activeSection === 'profile' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <User className="w-7 h-7 mr-2 text-blue-600" />
            Kullanıcı Profili
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={profile.username}
                onChange={(e) => handleProfileUpdate('username', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deneyim Seviyesi
              </label>
              <select
                value={profile.experienceLevel}
                onChange={(e) => handleProfileUpdate('experienceLevel', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">🌱 Yeni Başlayan</option>
                <option value="intermediate">📚 Orta Seviye</option>
                <option value="advanced">🎓 İleri Seviye</option>
                <option value="industrial">🏭 Endüstriyel</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birincil Hedef
              </label>
              <select
                value={profile.primaryGoal}
                onChange={(e) => handleProfileUpdate('primaryGoal', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="research">🔬 Araştırma</option>
                <option value="production">🏭 Üretim</option>
                <option value="education">📚 Eğitim</option>
                <option value="commercial">💼 Ticari</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hedef Türler (virgülle ayırın)
              </label>
              <input
                type="text"
                value={profile.targetSpecies.join(', ')}
                onChange={(e) => handleProfileUpdate('targetSpecies', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Chlorella vulgaris, Spirulina platensis"
              />
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Toplam Oturum</div>
              <div className="text-3xl font-bold text-blue-700">{profile.totalSessions}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Kayıt Tarihi</div>
              <div className="text-sm font-bold text-green-700">
                {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Son Giriş</div>
              <div className="text-sm font-bold text-purple-700">
                {new Date(profile.lastLogin).toLocaleString('tr-TR')}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tercihler Bölümü */}
      {activeSection === 'preferences' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Settings className="w-7 h-7 mr-2 text-blue-600" />
            Sistem Tercihleri
          </h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsayılan Hacim (Litre)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={preferences.defaultVolume}
                  onChange={(e) => handlePreferenceUpdate('defaultVolume', parseFloat(e.target.value))}
                  onFocus={handleNumberInputFocus}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsayılan Besin Ortamı
                </label>
                <select
                  value={preferences.defaultMedia}
                  onChange={(e) => handlePreferenceUpdate('defaultMedia', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BBM">BBM</option>
                  <option value="BG-11">BG-11</option>
                  <option value="JM">JM</option>
                  <option value="TAP">TAP</option>
                  <option value="Zarrouk">Zarrouk</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={preferences.costCurrency}
                  onChange={(e) => handlePreferenceUpdate('costCurrency', e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TL">TL (Türk Lirası)</option>
                  <option value="USD">USD (Dolar)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Otomatik Kayıt Aralığı (saniye)
                </label>
                <input
                  type="number"
                  value={preferences.autoSaveInterval}
                  onChange={(e) => handlePreferenceUpdate('autoSaveInterval', parseInt(e.target.value))}
                  onFocus={handleNumberInputFocus}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showTutorials}
                  onChange={(e) => handlePreferenceUpdate('showTutorials', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Öğretici ipuçlarını göster</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.compactMode}
                  onChange={(e) => handlePreferenceUpdate('compactMode', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Kompakt görünüm modu</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.notificationsEnabled}
                  onChange={(e) => handlePreferenceUpdate('notificationsEnabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-700">Bildirimler etkin</span>
              </label>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  Gelişmiş Kullanım Özellikleri
                </h4>
                
                <label className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={preferences.autoClearZero}
                    onChange={(e) => handlePreferenceUpdate('autoClearZero', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">Auto-Clear Zero:</span> Sayı girişlerinde 0 değerini otomatik sil
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.autoSelectText}
                    onChange={(e) => handlePreferenceUpdate('autoSelectText', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-700">
                    <span className="font-medium">Auto-Select Text:</span> Input'a tıklayınca metni otomatik seç
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Favoriler Bölümü */}
      {activeSection === 'favorites' && favorites && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Star className="w-7 h-7 mr-2 text-yellow-600" />
            Favorilerim
          </h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="font-bold text-lg text-gray-700 mb-3">Besin Ortamları</h4>
              {favorites.media.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {favorites.media.map((mediaId, idx) => (
                    <div key={idx} className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 flex items-center justify-between">
                      <span className="font-medium">{mediaId}</span>
                      <button
                        onClick={() => toggleFavorite('media', mediaId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Henüz favori ortam eklemediniz.</div>
              )}
            </div>
            
            <div>
              <h4 className="font-bold text-lg text-gray-700 mb-3">Kaydedilmiş Tarifler</h4>
              {favorites.recipes.length > 0 ? (
                <div className="space-y-2">
                  {favorites.recipes.map((recipeId, idx) => (
                    <div key={idx} className="bg-purple-50 border-2 border-purple-300 rounded-lg p-3 flex items-center justify-between">
                      <span className="font-medium">{recipeId}</span>
                      <button
                        onClick={() => toggleFavorite('recipes', recipeId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic">Henüz favori tarif eklemediniz.</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Özel Tarifler Bölümü */}
      {activeSection === 'recipes' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Save className="w-7 h-7 mr-2 text-green-600" />
              Özel Tariflerim
            </h3>
            <button
              onClick={() => {
                setShowRecipeForm(true);
                setEditingRecipe(null);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Tarif
            </button>
          </div>
          
          {showRecipeForm ? (
            <RecipeForm
              recipe={editingRecipe}
              onSave={handleSaveRecipe}
              onCancel={() => {
                setShowRecipeForm(false);
                setEditingRecipe(null);
              }}
            />
          ) : (
            <div>
              {customRecipes.length > 0 ? (
                <div className="space-y-4">
                  {customRecipes.map((recipe) => (
                    <div key={recipe.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800">{recipe.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>Oluşturan: {recipe.createdBy}</span>
                            <span>Tarih: {new Date(recipe.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingRecipe(recipe);
                              setShowRecipeForm(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Save className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Henüz özel tarif oluşturmadınız.</p>
                  <p className="text-gray-400 text-sm mt-2">Kendi besin ortamı formülasyonlarınızı kaydedin!</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Geçmiş Bölümü */}
      {activeSection === 'history' && usageHistory && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <History className="w-7 h-7 mr-2 text-purple-600" />
            Kullanım Geçmişi
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Toplam Analiz</div>
              <div className="text-3xl font-bold text-blue-700">{usageHistory.statistics.totalAnalyses}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Oluşturulan Tank</div>
              <div className="text-3xl font-bold text-green-700">{usageHistory.statistics.totalTanksCreated}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Kaydedilen Tarif</div>
              <div className="text-3xl font-bold text-purple-700">{usageHistory.statistics.totalRecipesSaved}</div>
            </div>
          </div>
          
          {usageHistory.recentMedia.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-lg text-gray-700 mb-3">Son Kullanılan Ortamlar</h4>
              <div className="flex flex-wrap gap-2">
                {usageHistory.recentMedia.slice(0, 10).map((mediaId, idx) => (
                  <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {mediaId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Veri Yönetimi Bölümü */}
      {activeSection === 'data' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Download className="w-7 h-7 mr-2 text-indigo-600" />
            Veri Yönetimi
          </h3>
          
          <div className="space-y-4">
            <div className="border-2 border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-lg text-blue-800 mb-2">Veriyi Dışa Aktar</h4>
              <p className="text-sm text-gray-600 mb-4">
                Tüm profilinizi, tercihlerinizi, favorilerinizi ve tariflerinizi JSON dosyası olarak kaydedin.
              </p>
              <button
                onClick={handleExport}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                JSON Olarak İndir
              </button>
            </div>
            
            <div className="border-2 border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-lg text-green-800 mb-2">Veriyi İçe Aktar</h4>
              <p className="text-sm text-gray-600 mb-4">
                Daha önce dışa aktardığınız yedek dosyasını yükleyin.
              </p>
              <label className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 cursor-pointer inline-flex">
                <Upload className="w-5 h-5" />
                Dosya Seç
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="border-2 border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-lg text-red-800 mb-2">Tüm Verileri Temizle</h4>
              <p className="text-sm text-gray-600 mb-4">
                ⚠️ DİKKAT: Bu işlem GERİ ALINAMAZ! Tüm profiliniz, tarifleriniz ve geçmişiniz silinecek.
              </p>
              <button
                onClick={handleClearAll}
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Tüm Verileri Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database System Section (Task 3-4) */}
      {activeSection === 'database' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Database className="w-7 h-7 mr-2 text-purple-600" />
            Veritabanı Yönetim Sistemi
          </h3>
          
          <div className="space-y-6">
            {/* Tank Data Section */}
            <div className="border-2 border-purple-300 rounded-lg p-5 bg-purple-50">
              <h4 className="font-bold text-xl text-purple-900 mb-3 flex items-center gap-2">
                <Database className="w-6 h-6" />
                Tank Verileri
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                Tüm tank durumları, detaylar ve özel formülasyonlar. 58 tank sisteminin tam yedeği.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportTanks}
                  className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-purple-700 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Tank Verilerini Dışa Aktar
                </button>
                <label className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Tank Verilerini İçe Aktar
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportTanks}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleClearTanks}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Tüm Tank Verilerini Temizle
                </button>
              </div>
            </div>

            {/* Chemical Database Section */}
            <div className="border-2 border-orange-300 rounded-lg p-5 bg-orange-50">
              <h4 className="font-bold text-xl text-orange-900 mb-3 flex items-center gap-2">
                <Beaker className="w-6 h-6" />
                Kimyasal Database
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                30+ kimyasal bileşen database (NaNO₃, KH₂PO₄, MgSO₄, vb.). Sadece export (sistem dosyası).
              </p>
              <button
                onClick={handleExportChemicals}
                className="bg-orange-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-orange-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Kimyasal Database'i Dışa Aktar
              </button>
            </div>

            {/* Media Database Section */}
            <div className="border-2 border-teal-300 rounded-lg p-5 bg-teal-50">
              <h4 className="font-bold text-xl text-teal-900 mb-3 flex items-center gap-2">
                <FlaskConical className="w-6 h-6" />
                Besin Ortamı Database
              </h4>
              <p className="text-sm text-gray-700 mb-4">
                30 besin ortamı tarifi (BBM, BG-11, F/2, Zarrouk, vb.). Sadece export (sistem dosyası).
              </p>
              <button
                onClick={handleExportMedia}
                className="bg-teal-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-teal-700 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Besin Ortamı Database'i Dışa Aktar
              </button>
            </div>

            {/* LocalStorage Materials Data Section - YENİ EKLENEN */}
            <div className="border-4 border-pink-400 rounded-lg p-5 bg-pink-50">
              <h4 className="font-bold text-2xl text-pink-900 mb-3 flex items-center gap-2">
                <Database className="w-7 h-7" />
                MALZEME VERİTABANI YEDEĞİ
              </h4>
              <p className="text-sm text-gray-800 mb-4 font-medium">
                📦 Malzeme Envanteri + Alışveriş Listesi + Özel Formülasyonlar (LocalStorage verileri)
              </p>
              
              {/* Mevcut Veri Durumu */}
              <div className="bg-white rounded-lg p-4 mb-4 border-2 border-pink-200">
                <h5 className="font-bold text-pink-800 mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Mevcut Veri Durumu
                </h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-pink-100 rounded p-2">
                    <div className="font-semibold text-pink-900">Malzemeler</div>
                    <div className="text-2xl font-bold text-pink-700">
                      {(() => {
                        const materials = localStorage.getItem('chlorellaMaterials');
                        return materials ? JSON.parse(materials).length : 0;
                      })()}
                    </div>
                  </div>
                  <div className="bg-pink-100 rounded p-2">
                    <div className="font-semibold text-pink-900">Alışveriş</div>
                    <div className="text-2xl font-bold text-pink-700">
                      {(() => {
                        const shopping = localStorage.getItem('chlorellaShoppingList');
                        return shopping ? JSON.parse(shopping).length : 0;
                      })()}
                    </div>
                  </div>
                  <div className="bg-pink-100 rounded p-2">
                    <div className="font-semibold text-pink-900">Formülasyonlar</div>
                    <div className="text-2xl font-bold text-pink-700">
                      {(() => {
                        const formulations = localStorage.getItem('customFormulations');
                        return formulations ? JSON.parse(formulations).length : 0;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    try {
                      const materials = localStorage.getItem('chlorellaMaterials');
                      const shopping = localStorage.getItem('chlorellaShoppingList');
                      const formulations = localStorage.getItem('customFormulations');
                      
                      const backup = {
                        timestamp: new Date().toISOString(),
                        version: '1.0',
                        type: 'materials_backup',
                        data: {
                          materials: materials ? JSON.parse(materials) : [],
                          shopping: shopping ? JSON.parse(shopping) : [],
                          formulations: formulations ? JSON.parse(formulations) : []
                        }
                      };
                      
                      const dataStr = JSON.stringify(backup, null, 2);
                      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                      const fileName = `malzeme_yedek_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
                      
                      const link = document.createElement('a');
                      link.setAttribute('href', dataUri);
                      link.setAttribute('download', fileName);
                      link.click();
                      
                      alert(`✅ Malzeme verileri yedeklendi!\n\n📦 ${backup.data.materials.length} malzeme\n🛒 ${backup.data.shopping.length} alışveriş\n🧪 ${backup.data.formulations.length} formülasyon\n\nDosya: ${fileName}`);
                    } catch (error) {
                      alert(`❌ Yedekleme hatası: ${error.message}`);
                    }
                  }}
                  className="bg-pink-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-pink-700 flex items-center gap-2 text-lg"
                >
                  <Download className="w-6 h-6" />
                  MALZEME YEDEĞİ AL
                </button>
                
                <label className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2 cursor-pointer text-lg">
                  <Upload className="w-6 h-6" />
                  MALZEME GERİ YÜKLE
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        try {
                          const backup = JSON.parse(event.target.result);
                          
                          if (!backup.data) {
                            throw new Error('Geçersiz yedek dosyası formatı!');
                          }
                          
                          const confirmMsg = `⚠️ VERİ GERİ YÜKLEME ONAYI\n\n` +
                            `Mevcut veriler silinecek!\n\n` +
                            `📦 ${backup.data.materials?.length || 0} malzeme\n` +
                            `🛒 ${backup.data.shopping?.length || 0} alışveriş\n` +
                            `🧪 ${backup.data.formulations?.length || 0} formülasyon\n\n` +
                            `Yedek Tarihi: ${new Date(backup.timestamp).toLocaleString('tr-TR')}\n\n` +
                            `Devam etmek istiyor musunuz?`;
                          
                          if (!window.confirm(confirmMsg)) return;
                          
                          if (backup.data.materials) {
                            localStorage.setItem('chlorellaMaterials', JSON.stringify(backup.data.materials));
                          }
                          if (backup.data.shopping) {
                            localStorage.setItem('chlorellaShoppingList', JSON.stringify(backup.data.shopping));
                          }
                          if (backup.data.formulations) {
                            localStorage.setItem('customFormulations', JSON.stringify(backup.data.formulations));
                          }
                          
                          alert(`✅ Malzeme verileri geri yüklendi!\n\n🔄 Sayfa 3 saniye içinde yenilenecek...`);
                          
                          setTimeout(() => {
                            window.location.reload();
                          }, 3000);
                          
                        } catch (error) {
                          alert(`❌ Yükleme hatası: ${error.message}`);
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={() => {
                    const materials = localStorage.getItem('chlorellaMaterials');
                    const shopping = localStorage.getItem('chlorellaShoppingList');
                    const formulations = localStorage.getItem('customFormulations');
                    
                    const materialCount = materials ? JSON.parse(materials).length : 0;
                    const shoppingCount = shopping ? JSON.parse(shopping).length : 0;
                    const formulationCount = formulations ? JSON.parse(formulations).length : 0;
                    
                    const confirmMsg = `🚨 TÜM MALZEME VERİLERİ SİLİNECEK! 🚨\n\n` +
                      `📦 ${materialCount} malzeme\n` +
                      `🛒 ${shoppingCount} alışveriş\n` +
                      `🧪 ${formulationCount} formülasyon\n\n` +
                      `Bu işlem GERİ ALINAMAZ!\n` +
                      `Önce yedek aldınız mı?\n\n` +
                      `EMİN MİSİNİZ?`;
                    
                    if (!window.confirm(confirmMsg)) return;
                    
                    if (!window.confirm(`⚠️ SON ONAY ⚠️\n\nTüm malzeme verileri KALİCİ OLARAK SİLİNECEK!\n\nEMİN MİSİNİZ?`)) return;
                    
                    localStorage.removeItem('chlorellaMaterials');
                    localStorage.removeItem('chlorellaShoppingList');
                    localStorage.removeItem('customFormulations');
                    
                    alert(`✅ Tüm malzeme verileri silindi!\n\n🔄 Sayfa 2 saniye içinde yenilenecek...`);
                    
                    setTimeout(() => {
                      window.location.reload();
                    }, 2000);
                  }}
                  className="bg-red-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-800 flex items-center gap-2 text-lg"
                >
                  <Trash2 className="w-6 h-6" />
                  MALZEME VERİLERİNİ TEMİZLE
                </button>
              </div>
            </div>

            {/* Full System Backup Section */}
            <div className="border-4 border-indigo-400 rounded-lg p-5 bg-indigo-100">
              <h4 className="font-bold text-2xl text-indigo-900 mb-3 flex items-center gap-2">
                <Database className="w-7 h-7" />
                TAM SİSTEM YEDEĞİ
              </h4>
              <p className="text-sm text-gray-800 mb-4 font-medium">
                🔥 TÜM verilerin tek dosyada yedeği: Kullanıcı profili + Tank verileri + Kimyasal DB + Besin Ortamı DB + Malzeme Envanteri
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportFullSystem}
                  className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-800 flex items-center gap-2 text-lg"
                >
                  <Download className="w-6 h-6" />
                  TAM SİSTEM YEDEĞİ AL
                </button>
                <label className="bg-green-700 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 flex items-center gap-2 cursor-pointer text-lg">
                  <Upload className="w-6 h-6" />
                  TAM SİSTEM GERİ YÜKLE
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFullSystem}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Warning Info */}
            <div className="border-2 border-yellow-400 rounded-lg p-4 bg-yellow-50">
              <h4 className="font-bold text-lg text-yellow-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Önemli Bilgiler
              </h4>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>JSON dosyaları indirme klasörünüze kaydedilir</li>
                <li>İçe aktarma işlemi mevcut verilerin üzerine yazar</li>
                <li>Kritik değişiklikler öncesi mutlaka yedek alın</li>
                <li>Tam sistem yedeği tüm verileri tek dosyada toplar</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tarif formu bileşeni
const RecipeForm = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState(recipe || {
    name: '',
    description: '',
    volume: 1,
    notes: '',
    pH: { optimal: 7.0, range: [6.5, 7.5] },
    macronutrients: {},
    hasFullStoichiometry: false
  });
  
  const [currentCompound, setCurrentCompound] = useState({
    formula: '',
    amount: '',
    unit: 'g/L',
    element: 'N'
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Elementel katkıları hesapla
    const processedData = {
      ...formData,
      hasFullStoichiometry: Object.keys(formData.macronutrients).length > 0
    };
    
    // Her bir bileşen için provides değerini hesapla
    if (processedData.macronutrients) {
      Object.keys(processedData.macronutrients).forEach(compound => {
        const data = processedData.macronutrients[compound];
        // Basit hesaplama - gerçek moleküler ağırlık oranlarıyla yapılmalı
        const elementFractions = {
          'N': { 'NaNO3': 0.165, 'KNO3': 0.138, '(NH4)2SO4': 0.212, 'Urea': 0.466 },
          'P': { 'K2HPO4': 0.178, 'KH2PO4': 0.228, 'NaH2PO4': 0.258 },
          'K': { 'K2HPO4': 0.449, 'KH2PO4': 0.287, 'KNO3': 0.387 },
          'Mg': { 'MgSO4·7H2O': 0.099, 'MgSO4': 0.202 },
          'Ca': { 'CaCl2·2H2O': 0.272, 'CaCl2': 0.361 },
          'S': { 'MgSO4·7H2O': 0.130, '(NH4)2SO4': 0.243 }
        };
        
        const element = data.element;
        const fraction = elementFractions[element]?.[compound] || 0.1; // Default 10%
        processedData.macronutrients[compound].provides = data.amount * 1000 * fraction; // g/L to mg/L
      });
    }
    
    onSave(processedData);
  };
  
  const addCompound = () => {
    if (currentCompound.formula && currentCompound.amount) {
      setFormData({
        ...formData,
        macronutrients: {
          ...formData.macronutrients,
          [currentCompound.formula]: {
            amount: parseFloat(currentCompound.amount),
            unit: currentCompound.unit,
            element: currentCompound.element,
            provides: 0 // Sonra hesaplanacak
          }
        }
      });
      setCurrentCompound({ formula: '', amount: '', unit: 'g/L', element: 'N' });
    }
  };
  
  const removeCompound = (formula) => {
    const updated = { ...formData.macronutrients };
    delete updated[formula];
    setFormData({ ...formData, macronutrients: updated });
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
      <h4 className="text-xl font-bold text-gray-800 mb-4">
        {recipe ? 'Tarifi Düzenle' : 'Yeni Tarif Oluştur'}
      </h4>
      
      <div className="space-y-4">
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarif Adı *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Örn: Özel BBM Modifikasyonu"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Optimal pH
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.pH.optimal}
              onChange={(e) => setFormData({
                ...formData,
                pH: { ...formData.pH, optimal: parseFloat(e.target.value) }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Tarifin özelliklerini ve kullanım amacını açıklayın..."
          />
        </div>
        
        {/* Kimyasal Bileşenler */}
        <div className="border-t-2 border-gray-300 pt-4">
          <h5 className="font-bold text-lg text-gray-800 mb-3">🧪 Kimyasal Formülasyon</h5>
          
          {/* Bileşen Ekleme */}
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Formül / Kimyasal Adı</label>
                <input
                  type="text"
                  list="chemicalList"
                  value={currentCompound.formula}
                  onChange={(e) => setCurrentCompound({ ...currentCompound, formula: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="NaNO3 veya Sodyum Nitrat"
                />
                <datalist id="chemicalList">
                  {getAllUnifiedChemicals().slice(0, 50).map((chem) => (
                    <option key={chem.formula} value={chem.formula}>
                      {chem.name} - {chem.formula}
                    </option>
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Miktar</label>
                <input
                  type="number"
                  step="0.001"
                  value={currentCompound.amount}
                  onChange={(e) => setCurrentCompound({ ...currentCompound, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                  placeholder="1.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Birim</label>
                <select
                  value={currentCompound.unit}
                  onChange={(e) => setCurrentCompound({ ...currentCompound, unit: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="g/L">g/L</option>
                  <option value="mg/L">mg/L</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Element</label>
                <select
                  value={currentCompound.element}
                  onChange={(e) => setCurrentCompound({ ...currentCompound, element: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-sm"
                >
                  <option value="N">Azot (N)</option>
                  <option value="P">Fosfor (P)</option>
                  <option value="K">Potasyum (K)</option>
                  <option value="Mg">Magnezyum (Mg)</option>
                  <option value="Ca">Kalsiyum (Ca)</option>
                  <option value="S">Kükürt (S)</option>
                  <option value="Na">Sodyum (Na)</option>
                  <option value="Cl">Klor (Cl)</option>
                  <option value="C">Karbon (C)</option>
                  <option value="Fe">Demir (Fe)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addCompound}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Ekle
                </button>
              </div>
            </div>
          </div>
          
          {/* Eklenen Bileşenler */}
          {Object.keys(formData.macronutrients).length > 0 ? (
            <div className="space-y-2">
              <div className="font-medium text-sm text-gray-700 mb-2">Eklenen Bileşenler:</div>
              {Object.entries(formData.macronutrients).map(([formula, data]) => (
                <div key={formula} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex-1">
                    <span className="font-bold text-gray-800">{formula}</span>
                    <span className="text-gray-600 ml-2">
                      {data.amount} {data.unit} → {data.element}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCompound(formula)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 italic text-sm">
              Henüz kimyasal bileşen eklemediniz. Yukarıdaki formu kullanarak ekleyin.
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hazırlık Notları & Uyarılar
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="Hazırlama talimatları, otoklav süresi, filtre boyutu vb..."
          />
        </div>
        
        <div className="flex gap-3 pt-4 border-t-2">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Kaydet
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-500 flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            İptal
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserSystemManager;
