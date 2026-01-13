import React, { useState, useEffect, useMemo } from 'react';
import { Beaker, Plus, Edit, Trash2, Save, X, Droplet, FlaskConical, AlertCircle } from 'lucide-react';
import chemicalLibrary from '../data/chemicalLibrary';
import { useMaterials } from '../contexts/MaterialsContext';
import { useEnforcedChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

const FormulationManager = () => {
  // 🔴 ENFORCED MERKEZI SISTEM - Formülasyonlar global inventory'de
  const { addMediaFormulation, state } = useEnforcedChlorellaSystem();
  const { materials, reduceStock } = useMaterials();
  const [formulations, setFormulations] = useState([]);
  const [selectedFormulation, setSelectedFormulation] = useState(null);
  const [showFormulationModal, setShowFormulationModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingFormulation, setEditingFormulation] = useState(null);
  const [editingStock, setEditingStock] = useState(null);

  // Malzemelerden Kimyasal kategorisini al ve chemicalLibrary ile birleştir
  const availableChemicals = useMemo(() => {
    const userChemicals = materials
      .filter(m => m.category === 'Kimyasal')
      .map(m => ({
        name: m.name,
        formula: m.formula || m.note || '',
        tdsContribution: 1.0, // Varsayılan TDS katkısı
        nutrients: {}, // Kullanıcı kimyasalları için besin verisi yok (gelecekte eklenebilir)
        molarMass: 0,
        source: 'user', // Kullanıcı tarafından eklendi
        stock: m.currentStock || 0,
        unit: m.unit || 'kg'
      }));
    
    // chemicalLibrary'deki kimyasalları da ekle
    const libraryChemicals = chemicalLibrary.map(c => ({
      ...c,
      source: 'library', // Kütüphaneden
      stock: 0
    }));
    
    // Birleştir ve sırala (önce stoktakiler, sonra alfabetik)
    const combined = [...userChemicals, ...libraryChemicals];
    return combined.sort((a, b) => {
      if (a.stock > 0 && b.stock === 0) return -1;
      if (a.stock === 0 && b.stock > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [materials]);

  // LocalStorage'dan yükle
  useEffect(() => {
    const saved = localStorage.getItem('customFormulations');
    if (saved) {
      setFormulations(JSON.parse(saved));
    }
  }, []);

  // LocalStorage'a kaydet
  const saveFormulations = (data) => {
    setFormulations(data);
    localStorage.setItem('customFormulations', JSON.stringify(data));
  };

  // Yeni formülasyon oluştur
  const createFormulation = () => {
    setEditingFormulation({
      id: Date.now().toString(),
      name: '',
      description: '',
      stocks: [],
      createdAt: new Date().toISOString()
    });
    setShowFormulationModal(true);
  };

  // Formülasyon kaydet
  const saveFormulation = () => {
    if (!editingFormulation.name.trim()) {
      alert('Formülasyon adı gerekli!');
      return;
    }

    const existing = formulations.find(f => f.id === editingFormulation.id);
    if (existing) {
      saveFormulations(formulations.map(f => 
        f.id === editingFormulation.id ? editingFormulation : f
      ));
    } else {
      saveFormulations([...formulations, editingFormulation]);
      
      // 🔴 MERKEZI SİSTEME EKLE (yeni formülasyon)
      addMediaFormulation({
        id: editingFormulation.id,
        name: editingFormulation.name,
        description: editingFormulation.description,
        stocks: editingFormulation.stocks,
        composition: calculateComposition(editingFormulation.stocks),
        createdAt: editingFormulation.createdAt
      });
      
      console.log(`✅ Formülasyon merkezi sisteme eklendi: ${editingFormulation.name}`);
    }

    setShowFormulationModal(false);
    setEditingFormulation(null);
  };
  
  // Formülasyon bileşimini hesapla
  const calculateComposition = (stocks) => {
    const composition = {};
    stocks.forEach(stock => {
      stock.chemicals.forEach(chem => {
        const chemName = chem.chemicalId;
        if (!composition[chemName]) {
          composition[chemName] = 0;
        }
        composition[chemName] += chem.amount;
      });
    });
    return composition;
  };

  // Formülasyon sil
  const deleteFormulation = (id) => {
    if (confirm('Bu formülasyonu silmek istediğinize emin misiniz?')) {
      saveFormulations(formulations.filter(f => f.id !== id));
      if (selectedFormulation?.id === id) {
        setSelectedFormulation(null);
      }
    }
  };

  // Yeni stok ekle
  const addStock = () => {
    if (selectedFormulation.stocks.length >= 10) {
      alert('Maksimum 10 stok tanımlayabilirsiniz!');
      return;
    }

    setEditingStock({
      id: Date.now().toString(),
      name: '',
      finalVolume: 1, // Tamamlanan hacim (L)
      dissolutionVolume: 0.3, // Eritme hacmi (L)
      chemicals: [], // [{ chemicalId, amount, unit: 'g' }]
      usageRatio: 100, // ml/L kültür
      notes: ''
    });
    setShowStockModal(true);
  };

  // Stok düzenle
  const editStock = (stock) => {
    setEditingStock({ ...stock });
    setShowStockModal(true);
  };

  // Stok kaydet
  const saveStock = () => {
    if (!editingStock.name.trim()) {
      alert('Stok adı gerekli!');
      return;
    }

    if (editingStock.chemicals.length === 0) {
      alert('En az 1 kimyasal ekleyin!');
      return;
    }

    // ✅ STOK TÜKETİMİ - Her kimyasal için stok azalt
    const stockErrors = [];
    editingStock.chemicals.forEach(chem => {
      const chemical = availableChemicals.find(c => c.name === chem.chemicalId);
      if (chemical) {
        const result = reduceStock(
          chemical.name,
          chem.amount,
          chem.unit || 'g',
          {
            type: 'formulation',
            formulationId: selectedFormulation.id,
            stockId: editingStock.id,
            stockName: editingStock.name
          }
        );
        
        if (!result.success) {
          stockErrors.push(`${chemical.name}: ${result.error}`);
        }
      }
    });

    // Stok hatası varsa kullanıcıyı bilgilendir
    if (stockErrors.length > 0) {
      const confirmMsg = `⚠️ STOK UYARISI:\n\n${stockErrors.join('\n')}\n\nYine de devam etmek istiyor musunuz?`;
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    const updated = { ...selectedFormulation };
    const existing = updated.stocks.find(s => s.id === editingStock.id);

    if (existing) {
      updated.stocks = updated.stocks.map(s => 
        s.id === editingStock.id ? editingStock : s
      );
    } else {
      updated.stocks.push(editingStock);
    }

    // Formülasyonu güncelle
    saveFormulations(formulations.map(f => 
      f.id === selectedFormulation.id ? updated : f
    ));
    setSelectedFormulation(updated);
    setShowStockModal(false);
    setEditingStock(null);
  };

  // Stok sil
  const deleteStock = (stockId) => {
    if (confirm('Bu stoku silmek istediğinize emin misiniz?')) {
      const updated = { ...selectedFormulation };
      updated.stocks = updated.stocks.filter(s => s.id !== stockId);
      
      saveFormulations(formulations.map(f => 
        f.id === selectedFormulation.id ? updated : f
      ));
      setSelectedFormulation(updated);
    }
  };

  // Kimyasal ekle
  const addChemicalToStock = () => {
    const firstChem = availableChemicals[0];
    if (!firstChem) {
      alert('⚠️ Kimyasal bulunamadı! Önce "Malzeme Yönetimi" bölümünden kimyasal ekleyin.');
      return;
    }
    
    setEditingStock({
      ...editingStock,
      chemicals: [...editingStock.chemicals, { 
        chemicalId: firstChem.name,
        amount: 0,
        unit: 'g'
      }]
    });
  };

  // Kimyasal güncelle
  const updateChemical = (index, field, value) => {
    const updated = [...editingStock.chemicals];
    updated[index][field] = value;
    setEditingStock({ ...editingStock, chemicals: updated });
  };

  // Kimyasal sil
  const removeChemical = (index) => {
    setEditingStock({
      ...editingStock,
      chemicals: editingStock.chemicals.filter((_, i) => i !== index)
    });
  };

  // Stok toplam TDS hesapla
  const calculateStockTDS = (stock) => {
    let totalTDS = 0;
    stock.chemicals.forEach(chem => {
      const chemical = availableChemicals.find(c => c.name === chem.chemicalId);
      if (chemical) {
        totalTDS += (chem.amount * (chemical.tdsContribution || 1.0)) / stock.finalVolume;
      }
    });
    return totalTDS.toFixed(2);
  };

  // Kültür için toplam besin hesapla
  const calculateCultureNutrients = (formulation, cultureVolume = 1) => {
    let totalVolume = 0;
    const nutrients = { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, Fe: 0 };

    formulation.stocks.forEach(stock => {
      const stockVolume = (stock.usageRatio / 1000) * cultureVolume; // ml -> L
      totalVolume += stockVolume;

      stock.chemicals.forEach(chem => {
        const chemical = availableChemicals.find(c => c.name === chem.chemicalId);
        if (chemical && chemical.nutrients) {
          Object.entries(chemical.nutrients).forEach(([nutrient, percentage]) => {
            const amountInStock = chem.amount; // gram
            const concentrationInStock = amountInStock / stock.finalVolume; // g/L
            const amountInCulture = concentrationInStock * stockVolume; // g
            nutrients[nutrient] = (nutrients[nutrient] || 0) + amountInCulture;
          });
        }
      });
    });

    return {
      totalStockVolume: totalVolume,
      nutrients,
      concentrations: Object.entries(nutrients).reduce((acc, [key, val]) => {
        acc[key] = (val / cultureVolume * 1000).toFixed(2); // mg/L
        return acc;
      }, {})
    };
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FlaskConical className="w-12 h-12" />
            <div>
              <h2 className="text-3xl font-bold">Özel Formülasyon Yöneticisi</h2>
              <p className="text-purple-100">Besin stokları ve kullanım oranları</p>
            </div>
          </div>
          <button
            onClick={createFormulation}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Formülasyon
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Panel: Formülasyon Listesi */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Formülasyonlar ({formulations.length})</h3>
          
          {formulations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Henüz formülasyon yok</p>
          ) : (
            <div className="space-y-2">
              {formulations.map(formulation => (
                <div
                  key={formulation.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    selectedFormulation?.id === formulation.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedFormulation(formulation)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{formulation.name}</h4>
                      <p className="text-xs text-gray-500">{formulation.stocks.length} stok</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFormulation(formulation);
                          setShowFormulationModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFormulation(formulation.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {formulation.description && (
                    <p className="text-xs text-gray-600 mt-1 italic">"{formulation.description}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sağ Panel: Stok Detayları */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {!selectedFormulation ? (
            <div className="text-center py-20 text-gray-500">
              <FlaskConical className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Formülasyon seçin veya yeni oluşturun</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Formülasyon Başlığı */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold">{selectedFormulation.name}</h3>
                  {selectedFormulation.description && (
                    <p className="text-gray-600">{selectedFormulation.description}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Oluşturulma: {new Date(selectedFormulation.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button
                  onClick={addStock}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                  disabled={selectedFormulation.stocks.length >= 10}
                >
                  <Plus className="w-4 h-4" />
                  Stok Ekle ({selectedFormulation.stocks.length}/10)
                </button>
              </div>

              {/* Kültür Hesaplama Özeti */}
              {selectedFormulation.stocks.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <h4 className="font-bold mb-2">1L Kültür için Toplam:</h4>
                  {(() => {
                    const calc = calculateCultureNutrients(selectedFormulation, 1);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm"><strong>Toplam Stok:</strong> {(calc.totalStockVolume * 1000).toFixed(1)} ml</p>
                          <p className="text-sm text-gray-600">Kültür + Su: {(1000 - calc.totalStockVolume * 1000).toFixed(1)} ml</p>
                        </div>
                        <div>
                          <p className="text-sm font-bold">Besin Konsantrasyonları:</p>
                          <div className="grid grid-cols-3 gap-1 text-xs">
                            {Object.entries(calc.concentrations).map(([nutrient, conc]) => (
                              conc > 0 && <p key={nutrient}>{nutrient}: {conc} mg/L</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Stok Listesi */}
              {selectedFormulation.stocks.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Bu formülasyonda henüz stok tanımlanmamış</p>
              ) : (
                <div className="space-y-4">
                  {selectedFormulation.stocks.map(stock => (
                    <div key={stock.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-800">{stock.name}</h4>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <p className="text-sm text-gray-600">
                              📊 Hazırlık: {stock.chemicals.reduce((sum, c) => sum + c.amount, 0).toFixed(2)}g 
                              → {(stock.dissolutionVolume * 1000).toFixed(0)}ml su 
                              → {(stock.finalVolume * 1000).toFixed(0)}ml
                            </p>
                            <p className="text-sm text-purple-600 font-semibold">
                              💧 Kullanım: {stock.usageRatio} ml/L kültür
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editStock(stock)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStock(stock.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Kimyasal Listesi */}
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-xs font-bold mb-2">Kimyasallar:</p>
                        <div className="space-y-1">
                          {stock.chemicals.map((chem, idx) => {
                            const chemical = chemicalLibrary.find(c => c.name === chem.chemicalId);
                            return (
                              <div key={idx} className="flex justify-between text-xs">
                                <span>{chemical?.name || chem.chemicalId}</span>
                                <span className="font-semibold">{chem.amount} {chem.unit}</span>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          <strong>TDS:</strong> {calculateStockTDS(stock)} g/L
                        </p>
                      </div>

                      {stock.notes && (
                        <p className="text-xs text-gray-500 italic mt-2">Not: {stock.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Formülasyon Modal */}
      {showFormulationModal && editingFormulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingFormulation.createdAt ? 'Formülasyon Düzenle' : 'Yeni Formülasyon'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Formülasyon Adı *</label>
                <input
                  type="text"
                  value={editingFormulation.name}
                  onChange={(e) => setEditingFormulation({ ...editingFormulation, name: e.target.value })}
                  placeholder="Örn: Özel Besin Yeri A"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Açıklama</label>
                <textarea
                  value={editingFormulation.description}
                  onChange={(e) => setEditingFormulation({ ...editingFormulation, description: e.target.value })}
                  placeholder="Bu formülasyon hakkında notlar..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveFormulation}
                className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => {
                  setShowFormulationModal(false);
                  setEditingFormulation(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stok Modal */}
      {showStockModal && editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {editingStock.id ? 'Stok Düzenle' : 'Yeni Stok'}
            </h3>

            <div className="space-y-4">
              {/* Stok Adı */}
              <div>
                <label className="block text-sm font-medium mb-2">Stok Adı *</label>
                <input
                  type="text"
                  value={editingStock.name}
                  onChange={(e) => setEditingStock({ ...editingStock, name: e.target.value })}
                  placeholder="Örn: Ana Besin Stoku"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Hacim Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Eritme Hacmi (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingStock.dissolutionVolume}
                    onChange={(e) => setEditingStock({ ...editingStock, dissolutionVolume: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(editingStock.dissolutionVolume * 1000).toFixed(0)} ml</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tamamlanan Hacim (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingStock.finalVolume}
                    onChange={(e) => setEditingStock({ ...editingStock, finalVolume: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(editingStock.finalVolume * 1000).toFixed(0)} ml</p>
                </div>
              </div>

              {/* Kullanım Oranı */}
              <div>
                <label className="block text-sm font-medium mb-2">Kullanım Oranı (ml/L kültür) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingStock.usageRatio}
                  onChange={(e) => setEditingStock({ ...editingStock, usageRatio: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">1L kültür için {editingStock.usageRatio} ml bu stoktan kullanılır</p>
              </div>

              {/* Kimyasallar */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold">Kimyasallar ({editingStock.chemicals.length})</label>
                  <button
                    onClick={addChemicalToStock}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Kimyasal Ekle
                  </button>
                </div>

                {editingStock.chemicals.length === 0 ? (
                  <p className="text-gray-500 text-center py-4 text-sm">Henüz kimyasal eklenmedi</p>
                ) : (
                  <div className="space-y-2">
                    {editingStock.chemicals.map((chem, idx) => {
                      const selectedChem = availableChemicals.find(c => c.name === chem.chemicalId);
                      return (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 p-2 rounded">
                          <select
                            value={chem.chemicalId}
                            onChange={(e) => updateChemical(idx, 'chemicalId', e.target.value)}
                            className="flex-1 px-2 py-1 border rounded text-sm"
                          >
                            {availableChemicals.map(c => (
                              <option key={c.name} value={c.name}>
                                {c.name} {c.formula ? `(${c.formula})` : ''} 
                                {c.stock > 0 ? ` ✓ Stok: ${c.stock}${c.unit}` : ' ⚠️ Stok yok'}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            step="0.01"
                            value={chem.amount}
                            onChange={(e) => updateChemical(idx, 'amount', parseFloat(e.target.value))}
                            placeholder="Miktar"
                            className="w-24 px-2 py-1 border rounded text-sm"
                          />
                          <select
                            value={chem.unit}
                            onChange={(e) => updateChemical(idx, 'unit', e.target.value)}
                            className="w-16 px-2 py-1 border rounded text-sm"
                          >
                            <option value="g">g</option>
                            <option value="ml">ml</option>
                          </select>
                          {selectedChem && selectedChem.stock > 0 && (
                            <span className="text-xs text-green-600">✓</span>
                          )}
                          <button
                            onClick={() => removeChemical(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notlar */}
              <div>
                <label className="block text-sm font-medium mb-2">Notlar</label>
                <textarea
                  value={editingStock.notes}
                  onChange={(e) => setEditingStock({ ...editingStock, notes: e.target.value })}
                  placeholder="Hazırlık notları, uyarılar..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveStock}
                className="flex-1 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setEditingStock(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormulationManager;
