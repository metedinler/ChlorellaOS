import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Beaker, CheckCircle, Filter, Star, Copy, TrendingUp, BarChart3 } from 'lucide-react';
import { MEDIA_CATEGORIES, MEDIA_DATABASE, getMediaByCategory, searchMedia, findSuitableMedia } from '../data/mediaDatabase.js';

/**
 * Birleşik Besin Yeri Kütüphanesi
 * - 30 standart besin ortamı (mediaDatabase)
 * - Kullanıcının özel formülasyonları (localStorage)
 * - Aksiyon butonları: Kullan, Karşılaştır, Şablon Oluştur
 */
const UnifiedMediaLibrary = ({ onSelectMedia, onCompare, onClone }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [showStandardOnly, setShowStandardOnly] = useState(false);
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [customFormulations, setCustomFormulations] = useState([]);
  
  // localStorage'dan özel formülasyonları yükle
  useEffect(() => {
    const saved = localStorage.getItem('customFormulations');
    if (saved) {
      try {
        setCustomFormulations(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading custom formulations:', e);
        setCustomFormulations([]);
      }
    }
  }, []);
  
  // Tüm medyaları birleştir (standart + özel)
  const getAllMedia = () => {
    const standardMedia = Object.values(MEDIA_DATABASE).map(m => ({
      ...m,
      source: 'standard',
      isStandard: true
    }));
    
    const customMedia = customFormulations.map(f => ({
      id: f.id || `custom_${f.name}`,
      name: f.name,
      fullName: f.description || f.name,
      category: 'custom',
      source: 'custom',
      isStandard: false,
      composition: {
        hasFullStoichiometry: true,
        stocks: f.stocks || []
      },
      createdDate: f.createdDate,
      templateId: f.templateId
    }));
    
    return [...standardMedia, ...customMedia];
  };
  
  // Filtrelenmiş medya listesi
  const getFilteredMedia = () => {
    let media = getAllMedia();
    
    // Standart/Özel filtresi
    if (showStandardOnly) {
      media = media.filter(m => m.isStandard);
    } else if (showCustomOnly) {
      media = media.filter(m => !m.isStandard);
    }
    
    // Kategori filtresi
    if (selectedCategory !== 'all' && selectedCategory !== 'custom') {
      media = media.filter(m => m.category === selectedCategory);
    } else if (selectedCategory === 'custom') {
      media = media.filter(m => !m.isStandard);
    }
    
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      media = media.filter(m => 
        m.name.toLowerCase().includes(query) ||
        m.fullName?.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query)
      );
    }
    
    // Tür filtresi
    if (filterSpecies) {
      media = media.filter(m => {
        if (m.suitableFor) {
          return m.suitableFor.some(s => 
            s.toLowerCase().includes(filterSpecies.toLowerCase())
          );
        }
        return false;
      });
    }
    
    return media;
  };
  
  const filteredMedia = getFilteredMedia();
  const standardCount = getAllMedia().filter(m => m.isStandard).length;
  const customCount = getAllMedia().filter(m => !m.isStandard).length;
  
  // Kategori renk eşleştirmesi
  const getCategoryColor = (categoryId) => {
    const colors = {
      standard: 'blue',
      mixotrophic: 'purple',
      specialized: 'green',
      ecological: 'amber',
      advanced: 'pink',
      custom: 'teal'
    };
    return colors[categoryId] || 'gray';
  };
  
  // Kategori badge rengi
  const getCategoryBadgeClass = (categoryId) => {
    const color = getCategoryColor(categoryId);
    const classes = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      green: 'bg-green-100 text-green-800',
      amber: 'bg-amber-100 text-amber-800',
      pink: 'bg-pink-100 text-pink-800',
      teal: 'bg-teal-100 text-teal-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return classes[color] || classes.gray;
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📚 Besin Yeri Kütüphanesi</h2>
        <p className="text-teal-100">
          {standardCount} Standart Besin Ortamı + {customCount} Özel Formülasyon
        </p>
      </div>
      
      {/* Arama ve Filtreler */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          {/* Arama çubuğu */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Besin ortamı ara (isim, özellik, kullanım amacı...)"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          {/* Tür filtresi */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              placeholder="Türe göre filtrele (örn: Chlorella, Spirulina...)"
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          {/* Hızlı filtreler */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowStandardOnly(!showStandardOnly);
                setShowCustomOnly(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showStandardOnly
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Standart ({standardCount})
            </button>
            
            <button
              onClick={() => {
                setShowCustomOnly(!showCustomOnly);
                setShowStandardOnly(false);
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                showCustomOnly
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Özellerim ({customCount})
            </button>
          </div>
          
          {/* Kategori butonları */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gray-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tümü ({filteredMedia.length})
            </button>
            
            {Object.entries(MEDIA_CATEGORIES).map(([key, cat]) => {
              const count = getAllMedia().filter(m => m.category === cat.id).length;
              const color = getCategoryColor(cat.id);
              
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? `bg-${color}-600 text-white shadow-lg`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
            
            {customCount > 0 && (
              <button
                onClick={() => setSelectedCategory('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === 'custom'
                    ? 'bg-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Özel ({customCount})
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Sonuç sayısı */}
      <div className="text-sm text-gray-600">
        {filteredMedia.length} besin ortamı bulundu
      </div>
      
      {/* Medya kartları grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedia.map(media => (
          <div
            key={media.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {media.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {media.fullName || media.description}
                </p>
              </div>
              
              {!media.isStandard && (
                <Star className="w-5 h-5 text-teal-500 flex-shrink-0 ml-2" />
              )}
            </div>
            
            {/* Kategori badge */}
            <div className="mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeClass(media.category)}`}>
                {media.isStandard ? MEDIA_CATEGORIES[media.category.toUpperCase()]?.name || media.category : 'Özel Formülasyon'}
              </span>
            </div>
            
            {/* Stokiyometri durumu */}
            {media.composition?.hasFullStoichiometry && (
              <div className="mb-3 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span>Tam stokiyometrik veri</span>
              </div>
            )}
            
            {/* Template bilgisi */}
            {media.templateId && (
              <div className="mb-3 text-xs text-blue-600">
                ℹ️ Şablon: {media.templateId}
              </div>
            )}
            
            {/* Aksiyon butonları */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => onSelectMedia && onSelectMedia(media)}
                className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Beaker className="w-4 h-4" />
                Kullan
              </button>
              
              <button
                onClick={() => onCompare && onCompare(media)}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => onClone && onClone(media)}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            
            {/* Detay butonu */}
            <button
              onClick={() => setSelectedMedia(selectedMedia?.id === media.id ? null : media)}
              className="w-full mt-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              {selectedMedia?.id === media.id ? 'Detayı Gizle' : 'Detayı Göster'}
            </button>
            
            {/* Detay paneli */}
            {selectedMedia?.id === media.id && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm space-y-2">
                {media.purpose && (
                  <div>
                    <span className="font-semibold">Kullanım Amacı: </span>
                    {media.purpose}
                  </div>
                )}
                {media.suitableFor && (
                  <div>
                    <span className="font-semibold">Uygun Türler: </span>
                    {media.suitableFor.join(', ')}
                  </div>
                )}
                {media.advantages && (
                  <div>
                    <span className="font-semibold text-green-700">Avantajlar: </span>
                    <ul className="list-disc list-inside">
                      {media.advantages.map((adv, i) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Sonuç bulunamadı */}
      {filteredMedia.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">Sonuç bulunamadı</p>
          <p className="text-gray-500 text-sm mt-2">
            Farklı filtreler veya arama terimleri deneyin
          </p>
        </div>
      )}
    </div>
  );
};

export default UnifiedMediaLibrary;
