import React, { useState, useEffect } from 'react';
import { Trash2, Beaker, Info, Plus, X, Save, Edit2, Package, AlertCircle, Filter } from 'lucide-react';
import { useMaterials } from '../contexts/MaterialsContext';
import { getAlphabeticalChemicalList, expandedChemicalDatabase } from '../data/expandedChemicalDatabase';
import { indexedDBService } from '../services/IndexedDBService';
import { saveCustomFormulation, getAllCustomFormulations, deleteCustomFormulationById, validateCustomFormulation, createNewCustomFormulation } from '../data/customFormulationsDatabase';

const CustomFormulationManager = () => {
  const { materials } = useMaterials();
  const [formulations, setFormulations] = useState([]);
  const [showCreateFormulation, setShowCreateFormulation] = useState(false);
  const [chemicalFilter, setChemicalFilter] = useState('all');
  const [newFormulation, setNewFormulation] = useState({
    name: '',
    description: '',
    cultureVolume: 1,
    stocks: []
  });

  useEffect(() => {
    const loadFormulations = async () => {
      try {
        const saved = await getAllCustomFormulations();
        setFormulations(saved);
      } catch (error) {
        console.error('Error loading formulations:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('customFormulations');
        if (saved) {
          setFormulations(JSON.parse(saved));
        }
      }
    };

    loadFormulations();
  }, []);

  const deleteFormulation = async (id) => {
    if (confirm('Bu formülasyonu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteCustomFormulationById(id);
        const updated = formulations.filter(f => f.id !== id);
        setFormulations(updated);
      } catch (error) {
        console.error('Error deleting formulation:', error);
        // Fallback to local state update
        const updated = formulations.filter(f => f.id !== id);
        setFormulations(updated);
      }
    }
  };

  // Filtrelenmiş kimyasal listesi
  const getFilteredChemicals = () => {
    if (chemicalFilter === 'available') {
      return materials
        .filter(m => m.category === 'Kimyasal')
        .map(m => ({
          formula: m.formula || m.name,
          name: m.name,
          isUserMaterial: true,
          stock: m.currentStock || 0,
          unit: m.unit
        }));
    }

    const allChemicals = getAlphabeticalChemicalList();
    const userChemicals = materials
      .filter(m => m.category === 'Kimyasal')
      .map(m => ({
        formula: m.formula || m.name,
        name: m.name,
        isUserMaterial: true,
        stock: m.currentStock || 0,
        unit: m.unit
      }));

    return [...userChemicals, ...allChemicals];
  };

  // Kimyasal stok durumu
  const getChemicalStockInfo = (formula) => {
    const userMaterial = materials.find(m =>
      m.category === 'Kimyasal' && (m.formula === formula || m.name === formula)
    );

    if (userMaterial) {
      return {
        available: (userMaterial.currentStock || 0) > 0,
        stock: userMaterial.currentStock || 0,
        unit: userMaterial.unit || 'kg',
        price: userMaterial.unitPrice,
        isUserMaterial: true
      };
    }

    const chem = expandedChemicalDatabase[formula];
    if (!chem) return { available: false, stock: 0, unit: 'kg', isUserMaterial: false };

    return {
      available: false,
      stock: 0,
      unit: 'kg',
      price: null,
      isUserMaterial: false
    };
  };

  // Stokları yeniden kullanma - mevcut formülasyonlardan stok seçme
  const addStockFromExisting = (sourceFormulationId, stockId) => {
    const sourceFormulation = formulations.find(f => f.id === sourceFormulationId);
    if (!sourceFormulation) return;

    const sourceStock = sourceFormulation.stocks.find(s => s.id === stockId);
    if (!sourceStock) return;

    const newStock = {
      ...sourceStock,
      id: `stock_${Date.now()}`,
      name: `${sourceStock.name} (Kopya)`,
      chemicals: sourceStock.chemicals.map(c => ({ ...c, id: `chem_${Date.now()}_${Math.random()}` }))
    };

    setNewFormulation({
      ...newFormulation,
      stocks: [...newFormulation.stocks, newStock]
    });
  };

  // Formülasyon düzenleme
  const editFormulation = (formulation) => {
    setNewFormulation({
      ...formulation,
      stocks: formulation.stocks.map(s => ({
        ...s,
        chemicals: s.chemicals.map(c => ({ ...c, id: `chem_${Date.now()}_${Math.random()}` }))
      }))
    });
    setShowCreateFormulation(true);
  };

  return (
    <div className="space-y-6">
      {/* Başlık Bölümü */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Beaker className="w-10 h-10" />
          <h2 className="text-3xl font-bold">Özel Formülasyon Analiz Merkezi</h2>
        </div>
        <p className="text-white/90 text-lg">
          Oluşturduğunuz özel formülasyonları görüntüleyin ve analiz edin
        </p>
      </div>

      {/* Bilgi Kutusu ve Yeni Oluştur Butonu */}
      <div className="flex items-center justify-between">
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg flex-1">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-teal-900 mb-1">Özel Formülasyon Yönetimi</h3>
              <p className="text-teal-800 text-sm">
                Kendi besi yeri formülasyonlarınızı oluşturun, düzenleyin ve mevcut stokları yeniden kullanın
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setNewFormulation({
              name: '',
              description: '',
              cultureVolume: 1,
              stocks: []
            });
            setShowCreateFormulation(true);
          }}
          className="ml-4 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Yeni Oluştur
        </button>
      </div>

      {/* Formülasyon Kartları */}
      {formulations.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Beaker className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Henüz özel formülasyon oluşturulmadı
          </h3>
          <p className="text-gray-500 mb-6">
            Besin Yeri sekmesinden kendi formülasyonunuzu oluşturabilirsiniz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formulations.map((formulation) => (
            <div
              key={formulation.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all p-6"
            >
              {/* Formülasyon Başlığı */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{formulation.name}</h3>
                  <p className="text-sm text-gray-500">
                    Kültür Hacmi: {formulation.cultureVolume}L
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editFormulation(formulation)}
                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                    title="Formülasyonu Düzenle"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteFormulation(formulation.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Formülasyonu Sil"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Stok Sayısı */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Stok Sayısı: {formulation.stocks.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {formulation.stocks.map((stock, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ backgroundColor: stock.color + '20', border: `2px solid ${stock.color}` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stock.color }}
                      />
                      <span className="font-medium text-gray-700">{stock.name}</span>
                      <span className="text-xs text-gray-500">
                        ({stock.chemicals.length} kimyasal)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarih Bilgisi */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Oluşturulma: {new Date(formulation.createdDate).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {formulation.modifiedDate && formulation.modifiedDate !== formulation.createdDate && (
                  <p className="text-xs text-gray-500">
                    Son düzenleme: {new Date(formulation.modifiedDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formülasyon Oluşturma/Düzenleme Modalı */}
      {showCreateFormulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                {newFormulation.id ? '✏️ Formülasyon Düzenle' : '🧪 Yeni Özel Formülasyon Oluştur'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateFormulation(false);
                  setNewFormulation({ name: '', description: '', cultureVolume: 1, stocks: [] });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Formülasyon Bilgileri */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formülasyon Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFormulation.name}
                    onChange={(e) => setNewFormulation({ ...newFormulation, name: e.target.value })}
                    placeholder="Örn: Yüksek N BBM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={newFormulation.description}
                    onChange={(e) => setNewFormulation({ ...newFormulation, description: e.target.value })}
                    placeholder="Formülasyon hakkında açıklama..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kültür Hacmi (L)
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={newFormulation.cultureVolume}
                    onChange={(e) => setNewFormulation({ ...newFormulation, cultureVolume: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Stok Yönetimi */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Stoklar ({newFormulation.stocks.length}/6)
                  </h4>
                  <div className="flex gap-2">
                    {/* Mevcut Stoklardan Ekle */}
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            const [formId, stockId] = e.target.value.split('|');
                            addStockFromExisting(formId, stockId);
                            e.target.value = '';
                          }
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        defaultValue=""
                      >
                        <option value="">Mevcut stoklardan ekle...</option>
                        {formulations.map(form => (
                          <optgroup key={form.id} label={form.name}>
                            {form.stocks.map(stock => (
                              <option key={stock.id} value={`${form.id}|${stock.id}`}>
                                {stock.name} ({stock.chemicals.length} kimyasal)
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Yeni Stok Ekle */}
                    <button
                      onClick={() => {
                        if (newFormulation.stocks.length >= 6) {
                          alert('Maksimum 6 stok ekleyebilirsiniz!');
                          return;
                        }
                        const colorPalette = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                        setNewFormulation({
                          ...newFormulation,
                          stocks: [
                            ...newFormulation.stocks,
                            {
                              id: `stock_${Date.now()}`,
                              name: `Stok ${newFormulation.stocks.length + 1}`,
                              color: colorPalette[newFormulation.stocks.length % colorPalette.length],
                              stockVolume: 1000,
                              usageAmount: 10,
                              chemicals: []
                            }
                          ]
                        });
                      }}
                      disabled={newFormulation.stocks.length >= 6}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        newFormulation.stocks.length >= 6
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Yeni Stok
                    </button>
                  </div>
                </div>

                {/* Stok Kartları */}
                {newFormulation.stocks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Henüz stok eklenmedi</p>
                    <p className="text-sm text-gray-400 mt-1">En az 1 stok ekleyin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newFormulation.stocks.map((stock, stockIdx) => (
                      <div key={stock.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stock.color }} />
                            <input
                              type="text"
                              value={stock.name}
                              onChange={(e) => {
                                setNewFormulation({
                                  ...newFormulation,
                                  stocks: newFormulation.stocks.map(s =>
                                    s.id === stock.id ? { ...s, name: e.target.value } : s
                                  )
                                });
                              }}
                              placeholder="Stok adı"
                              className="font-semibold px-2 py-1 border border-gray-300 rounded"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setNewFormulation({
                                ...newFormulation,
                                stocks: newFormulation.stocks.filter(s => s.id !== stock.id)
                              });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Stok Hacim Bilgileri */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Stok Hacmi (ml)</label>
                            <input
                              type="number"
                              min="0"
                              value={stock.stockVolume}
                              onChange={(e) => {
                                setNewFormulation({
                                  ...newFormulation,
                                  stocks: newFormulation.stocks.map(s =>
                                    s.id === stock.id ? { ...s, stockVolume: parseFloat(e.target.value) || 0 } : s
                                  )
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Kullanım (ml/L)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={stock.usageAmount}
                              onChange={(e) => {
                                setNewFormulation({
                                  ...newFormulation,
                                  stocks: newFormulation.stocks.map(s =>
                                    s.id === stock.id ? { ...s, usageAmount: parseFloat(e.target.value) || 0 } : s
                                  )
                                });
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            />
                          </div>
                        </div>

                        {/* Kimyasal filtresi */}
                        <div className="mb-3 bg-blue-50 p-3 rounded">
                          <div className="flex items-center gap-4">
                            <Filter className="w-4 h-4 text-blue-600" />
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={chemicalFilter === 'all'}
                                onChange={() => setChemicalFilter('all')}
                                className="cursor-pointer"
                              />
                              <span className="text-sm">Tüm Kimyasallar (300+)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                checked={chemicalFilter === 'available'}
                                onChange={() => setChemicalFilter('available')}
                                className="cursor-pointer"
                              />
                              <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                Elimdekiler ({getFilteredChemicals().length})
                              </span>
                            </label>
                          </div>
                        </div>

                        {/* Kimyasal Listesi */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-600">Kimyasallar</label>
                            <button
                              onClick={() => {
                                setNewFormulation({
                                  ...newFormulation,
                                  stocks: newFormulation.stocks.map(s =>
                                    s.id === stock.id
                                      ? {
                                          ...s,
                                          chemicals: [
                                            ...s.chemicals,
                                            { id: `chem_${Date.now()}`, formula: '', amount: 0, unit: 'g/L' }
                                          ]
                                        }
                                      : s
                                  )
                                });
                              }}
                              className="text-teal-600 hover:text-teal-700 text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Kimyasal Ekle
                            </button>
                          </div>

                          {stock.chemicals.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-2 bg-white rounded border border-gray-200">
                              Kimyasal eklenmemiş
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {stock.chemicals.map((chem, chemIdx) => (
                                <div key={chem.id} className="flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                                  <span className="text-xs text-gray-500 w-6">{chemIdx + 1}.</span>
                                  <select
                                    value={chem.formula}
                                    onChange={(e) => {
                                      setNewFormulation({
                                        ...newFormulation,
                                        stocks: newFormulation.stocks.map(s =>
                                          s.id === stock.id
                                            ? {
                                                ...s,
                                                chemicals: s.chemicals.map(c =>
                                                  c.id === chem.id ? { ...c, formula: e.target.value } : c
                                                )
                                              }
                                            : s
                                        )
                                      });
                                    }}
                                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                                  >
                                    <option value="">Kimyasal seçin...</option>
                                    {getFilteredChemicals().map(item => {
                                      if (item.isUserMaterial) {
                                        return (
                                          <option key={item.formula} value={item.formula}>
                                            {item.name} {item.formula !== item.name ? `(${item.formula})` : ''}
                                            {item.stock > 0 ? ` - Stok: ${item.stock} ${item.unit} ✓` : ' - Stok yok ⚠️'}
                                          </option>
                                        );
                                      }
                                      const chemData = expandedChemicalDatabase[item];
                                      const stockInfo = getChemicalStockInfo(item);
                                      return (
                                        <option key={item} value={item}>
                                          {chemData?.name || item} ({item})
                                          {stockInfo?.available ? ` - Stok: ${stockInfo.stock} ${stockInfo.unit} ✓` : ' - Envanterde yok ⚠️'}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  {/* Stok durumu badge */}
                                  {chem.formula && (() => {
                                    const stockInfo = getChemicalStockInfo(chem.formula);
                                    if (!stockInfo) return null;
                                    return stockInfo.available ? (
                                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center" title={`Stok: ${stockInfo.stock} ${stockInfo.unit}`}>
                                        <Package className="w-3 h-3 text-green-600" />
                                      </div>
                                    ) : (
                                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded flex items-center justify-center" title="Envanterde yok">
                                        <AlertCircle className="w-3 h-3 text-red-600" />
                                      </div>
                                    );
                                  })()}

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.001"
                                    value={chem.amount}
                                    onChange={(e) => {
                                      setNewFormulation({
                                        ...newFormulation,
                                        stocks: newFormulation.stocks.map(s =>
                                          s.id === stock.id
                                            ? {
                                                ...s,
                                                chemicals: s.chemicals.map(c =>
                                                  c.id === chem.id ? { ...c, amount: parseFloat(e.target.value) || 0 } : c
                                                )
                                              }
                                            : s
                                        )
                                      });
                                    }}
                                    placeholder="Miktar"
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                                  />
                                  <select
                                    value={chem.unit}
                                    onChange={(e) => {
                                      setNewFormulation({
                                        ...newFormulation,
                                        stocks: newFormulation.stocks.map(s =>
                                          s.id === stock.id
                                            ? {
                                                ...s,
                                                chemicals: s.chemicals.map(c =>
                                                  c.id === chem.id ? { ...c, unit: e.target.value } : c
                                                )
                                              }
                                            : s
                                        )
                                      });
                                    }}
                                    className="w-20 px-2 py-1 text-xs border border-gray-300 rounded"
                                  >
                                    <option value="g">g</option>
                                    <option value="mg">mg</option>
                                    <option value="mL">mL</option>
                                    <option value="L">L</option>
                                    <option value="g/L">g/L</option>
                                    <option value="mg/L">mg/L</option>
                                    <option value="µg/L">µg/L</option>
                                  </select>
                                  <button
                                    onClick={() => {
                                      setNewFormulation({
                                        ...newFormulation,
                                        stocks: newFormulation.stocks.map(s =>
                                          s.id === stock.id
                                            ? {
                                                ...s,
                                                chemicals: s.chemicals.filter(c => c.id !== chem.id)
                                              }
                                            : s
                                        )
                                      });
                                    }}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateFormulation(false);
                  setNewFormulation({ name: '', description: '', cultureVolume: 1, stocks: [] });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                onClick={async () => {
                  // Validation
                  const validation = validateCustomFormulation(newFormulation);
                  if (!validation.isValid) {
                    alert('Hata: ' + validation.errors.join('\n'));
                    return;
                  }

                  try {
                    const savedFormulation = await saveCustomFormulation(newFormulation);

                    if (newFormulation.id) {
                      // Update existing
                      const updatedFormulations = formulations.map(f =>
                        f.id === savedFormulation.id ? savedFormulation : f
                      );
                      setFormulations(updatedFormulations);
                    } else {
                      // Add new
                      setFormulations([...formulations, savedFormulation]);
                    }

                    setShowCreateFormulation(false);
                    setNewFormulation({ name: '', description: '', cultureVolume: 1, stocks: [] });

                    alert(newFormulation.id
                      ? '✅ Formülasyon başarıyla güncellendi!'
                      : '✅ Formülasyon başarıyla kaydedildi!'
                    );
                  } catch (error) {
                    alert('Hata: ' + error.message);
                  }
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {newFormulation.id ? '💾 Değişiklikleri Kaydet' : '📋 Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFormulationManager;
