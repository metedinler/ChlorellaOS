import React, { useState } from 'react';
import { Search, BookOpen, Beaker, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { MEDIA_CATEGORIES, MEDIA_DATABASE, getMediaByCategory, searchMedia, findSuitableMedia } from '../data/mediaDatabase.js';

const MediaCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  
  // Filtrelenmiş medya listesi
  const getFilteredMedia = () => {
    let media = Object.values(MEDIA_DATABASE);
    
    // Kategori filtresi
    if (selectedCategory !== 'all') {
      media = media.filter(m => m.category === selectedCategory);
    }
    
    // Arama filtresi
    if (searchQuery) {
      media = searchMedia(searchQuery);
    }
    
    // Tür filtresi
    if (filterSpecies) {
      media = findSuitableMedia(filterSpecies);
    }
    
    return media;
  };
  
  const filteredMedia = getFilteredMedia();
  
  // Kategori renk eşleştirmesi
  const getCategoryColor = (categoryId) => {
    const colors = {
      standard: 'blue',
      mixotrophic: 'purple',
      specialized: 'green',
      ecological: 'amber',
      advanced: 'pink'
    };
    return colors[categoryId] || 'gray';
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2">📚 30 Besin Ortamı Kütüphanesi</h2>
        <p className="text-teal-100">Kapsamlı Mikroalg Besin Ortamları Kataloğu</p>
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
              Tümü ({Object.keys(MEDIA_DATABASE).length})
            </button>
            
            {Object.entries(MEDIA_CATEGORIES).map(([key, cat]) => {
              const count = getMediaByCategory(cat.id).length;
              const color = getCategoryColor(cat.id);
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === cat.id
                      ? `bg-${color}-600 text-white shadow-lg`
                      : `bg-${color}-50 text-${color}-700 hover:bg-${color}-100`
                  }`}
                  style={{
                    backgroundColor: selectedCategory === cat.id 
                      ? `var(--${color}-600, #4b5563)` 
                      : `var(--${color}-50, #f9fafb)`,
                    color: selectedCategory === cat.id ? 'white' : undefined
                  }}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
          
          {/* Sonuç sayısı */}
          <div className="text-sm text-gray-600">
            {filteredMedia.length} besin ortamı bulundu
          </div>
        </div>
      </div>
      
      {/* Ortam Listesi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMedia.map(media => {
          const categoryInfo = Object.values(MEDIA_CATEGORIES).find(c => c.id === media.category);
          const color = getCategoryColor(media.category);
          
          return (
            <div
              key={media.id}
              onClick={() => setSelectedMedia(media)}
              className={`bg-white p-6 rounded-lg shadow-lg border-2 cursor-pointer transition-all hover:shadow-xl ${
                selectedMedia?.id === media.id
                  ? `border-${color}-500 ring-4 ring-${color}-200`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{
                borderColor: selectedMedia?.id === media.id 
                  ? `var(--${color}-500, #6b7280)` 
                  : undefined
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">{media.name}</h3>
                  <div className="text-sm text-gray-600">{media.fullName}</div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold`}
                  style={{
                    backgroundColor: `var(--${color}-100, #f3f4f6)`,
                    color: `var(--${color}-700, #374151)`
                  }}
                >
                  {categoryInfo?.name}
                </div>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{media.description}</p>
              
              {/* Hızlı bilgiler */}
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <Beaker className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong>Uygun türler:</strong> {media.suitableFor?.slice(0, 3).join(', ')}
                    {media.suitableFor?.length > 3 && '...'}
                  </div>
                </div>
                
                {media.composition?.hasFullStoichiometry && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Tam stokiyometrik veri mevcut</span>
                  </div>
                )}
                
                {!media.composition?.hasFullStoichiometry && (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span>Kısmi veri / Tanımlanamayan bileşenler</span>
                  </div>
                )}
              </div>
              
              <button
                className="mt-4 w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-2 rounded-lg font-bold hover:from-teal-600 hover:to-cyan-600 transition-all"
              >
                Detayları Gör →
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Detay Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 rounded-t-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-1">{selectedMedia.name}</h2>
                  <div className="text-teal-100">{selectedMedia.fullName}</div>
                </div>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Açıklama */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">📝 Açıklama</h3>
                <p className="text-gray-700">{selectedMedia.description}</p>
              </div>
              
              {/* Ne zaman seçilir */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">🎯 Ne Zaman Seçilir?</h3>
                <p className="text-gray-700">{selectedMedia.whenToSelect}</p>
              </div>
              
              {/* Uygun türler */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">🦠 Uygun Türler</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMedia.suitableFor?.map((species, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {species}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Avantajlar */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">✅ Avantajlar</h3>
                <ul className="space-y-2">
                  {selectedMedia.advantages?.map((adv, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Dezavantajlar */}
              <div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">⚠️ Dezavantajlar</h3>
                <ul className="space-y-2">
                  {selectedMedia.disadvantages?.map((dis, idx) => (
                    <li key={idx} className="flex items-start">
                      <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{dis}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Bileşim */}
              {selectedMedia.composition && (
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-800">🧪 Bileşim Bilgisi</h3>
                  
                  {selectedMedia.composition.hasFullStoichiometry ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-bold text-green-800">Tam Stokiyometrik Veri Mevcut</span>
                      </div>
                      
                      {selectedMedia.composition.macronutrients && (
                        <div className="space-y-2">
                          <div className="font-bold text-gray-700 mb-2">Makro Besinler (1 Litre için):</div>
                          <table className="w-full text-sm">
                            <thead className="bg-green-100">
                              <tr>
                                <th className="px-3 py-2 text-left">Bileşik</th>
                                <th className="px-3 py-2 text-right">Miktar</th>
                                <th className="px-3 py-2 text-left">Element</th>
                                <th className="px-3 py-2 text-right">Sağlanan (mg/L)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(selectedMedia.composition.macronutrients).map(([compound, data]) => (
                                <tr key={compound} className="border-b border-green-100">
                                  <td className="px-3 py-2 font-mono">{compound}</td>
                                  <td className="px-3 py-2 text-right">{data.amount} {data.unit}</td>
                                  <td className="px-3 py-2">{data.element}</td>
                                  <td className="px-3 py-2 text-right font-bold">{data.provides.toFixed(1)} mg/L</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          
                          {selectedMedia.composition.totalN && selectedMedia.composition.totalP && (
                            <div className="mt-3 p-3 bg-blue-50 rounded">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <div className="text-sm text-gray-600">Toplam Azot</div>
                                  <div className="text-xl font-bold text-blue-700">
                                    {selectedMedia.composition.totalN.toFixed(1)} mg/L
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">Toplam Fosfor</div>
                                  <div className="text-xl font-bold text-blue-700">
                                    {selectedMedia.composition.totalP.toFixed(1)} mg/L
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600">N:P Oranı</div>
                                  <div className="text-xl font-bold text-blue-700">
                                    {selectedMedia.composition.npRatio.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedMedia.composition.pH && (
                        <div className="mt-3 p-3 bg-purple-50 rounded">
                          <strong>pH:</strong> {selectedMedia.composition.pH.optimal} 
                          {' '}(Aralık: {selectedMedia.composition.pH.range[0]} - {selectedMedia.composition.pH.range[1]})
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-800 mb-1">
                            Kısmi Veri / Tanımlanamayan Bileşenler
                          </div>
                          <div className="text-sm text-amber-700">
                            Bu besin ortamı toprak özütü veya organik karbon gibi tam olarak tanımlanamayan 
                            bileşenler içerir. Stokiyometrik hesaplamalar sınırlıdır.
                          </div>
                          
                          {selectedMedia.composition.pH && (
                            <div className="mt-3 p-2 bg-white rounded">
                              <strong>pH:</strong> {selectedMedia.composition.pH.optimal} 
                              {' '}(Aralık: {selectedMedia.composition.pH.range[0]} - {selectedMedia.composition.pH.range[1]})
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Hazırlama notları */}
              {selectedMedia.preparationNotes && (
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">⚗️ Hazırlama Notları</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-gray-700">{selectedMedia.preparationNotes}</p>
                  </div>
                </div>
              )}
              
              {/* Referanslar */}
              {selectedMedia.references && (
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-800">📚 Referanslar</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {selectedMedia.references.map((ref, idx) => (
                      <li key={idx} className="flex items-start">
                        <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{ref}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-lg border-t">
              <button
                onClick={() => setSelectedMedia(null)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaCatalog;
