import React, { useState, useEffect } from 'react';
import { Beaker, Calculator, Plus, Info, AlertCircle, Trash2, Edit2, X, Save, Package, Filter } from 'lucide-react';
import chemicalLibrary, { calculateTDS, estimatePH, analyzeIons } from '../data/chemicalLibrary';
import { getAlphabeticalChemicalList, expandedChemicalDatabase } from '../data/expandedChemicalDatabase';
import StoichiometryButton from './StoichiometryButton';
import { useMaterials } from '../contexts/MaterialsContext';

const NutrientCalculator = ({ initialMedia, onSave }) => {  // ← YENİ: Props
  const { materials, reduceStock } = useMaterials();  // ← YENİ: Stok yönetimi
  const [selectedMedium, setSelectedMedium] = useState('BBM');
  const [isCustom, setIsCustom] = useState(false);
  const [volume, setVolume] = useState(1);
  const [customFormula, setCustomFormula] = useState([]);
  const [results, setResults] = useState(null);
  const [showChemInfo, setShowChemInfo] = useState(null);
  const [customFormulations, setCustomFormulations] = useState([]);
  const [selectedCustomFormulation, setSelectedCustomFormulation] = useState(null);
  const [showCreateFormulation, setShowCreateFormulation] = useState(false);
  const [chemicalFilter, setChemicalFilter] = useState('all');  // ← YENİ: all | available
  const [newFormulation, setNewFormulation] = useState({
    name: '',
    description: '',  // ← YENİ
    templateId: null, // ← YENİ
    cultureVolume: 1,
    stocks: []
  });

  // localStorage'dan özel formülasyonları yükle
  useEffect(() => {
    const saved = localStorage.getItem('customFormulations');
    if (saved) {
      setCustomFormulations(JSON.parse(saved));
    }
  }, []);
  
  // YENİ: initialMedia prop'u değiştiğinde şablonu yükle
  useEffect(() => {
    if (initialMedia) {
      loadFromTemplate(initialMedia);
      setShowCreateFormulation(true);
    }
  }, [initialMedia]);
  
  // YENİ: Şablondan formülasyon yükleme
  const loadFromTemplate = (media) => {
    console.log('📋 Şablondan yükleniyor:', media);
    
    // Template'e göre stocks oluştur
    let stocks = [];
    
    if (media.composition?.stocks && media.composition.stocks.length > 0) {
      // Eğer medya zaten stocks formatındaysa direkt kullan
      stocks = media.composition.stocks.map((s, idx) => ({
        id: `stock_${Date.now()}_${idx}`,
        name: s.name || `Stok ${idx + 1}`,
        stockVolume: s.stockVolume || 1000,
        usageAmount: s.usageAmount || 100,
        color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'][idx],
        chemicals: s.chemicals || []
      }));
    }
    
    setNewFormulation({
      name: `${media.name} - Kopyası`,
      description: media.fullName || media.description || `${media.name} temel alınarak oluşturuldu`,
      templateId: media.id,
      cultureVolume: 1,
      stocks: stocks
    });
  };
  
  // Filtrelenmiş kimyasal listesi - Malzeme sayfasındaki TÜM kimyasallar otomatik gelir
  const getFilteredChemicals = () => {
    if (chemicalFilter === 'available') {
      // ELİMDEKİLER = Malzeme sayfasındaki TÜM Kimyasal kategorisi (stok kontrolü YOK)
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
    
    // TÜM KİMYASALLAR = Kullanıcı kimyasalları + 300+ database
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
  
  // Kimyasal stok durumu (Kullanıcı malzemeleri + Database)
  const getChemicalStockInfo = (formula) => {
    // Önce kullanıcı malzemelerinde ara
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
    
    // Database'de ara
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

  // Hazır besin yeri formülasyonları
  const mediums = {
    BBM: {
      name: 'BBM (Bold Basal Medium)',
      mainStock: [
        { chemical: 'NaNO3', amount: 25 },
        { chemical: 'K2HPO4', amount: 7.5 },
        { chemical: 'MgSO4·7H2O', amount: 7.5 },
        { chemical: 'NaCl', amount: 2.5 },
        { chemical: 'KH2PO4', amount: 17.5 }
      ],
      caStock: [{ chemical: 'CaCl2·2H2O', amount: 2.5 }],
      feStock: [
        { chemical: 'FeSO4·7H2O', amount: 4.98 },
        { chemical: 'EDTA', amount: 6.72 }
      ],
      usageRatio: { main: 100, ca: 5, fe: 0.1 }
    },
    BS11: {
      name: 'BS11 (Siyanobakteri)',
      mainStock: [
        { chemical: 'NaNO3', amount: 15 },
        { chemical: 'K2HPO4', amount: 4 },
        { chemical: 'MgSO4·7H2O', amount: 7.5 }
      ],
      caStock: [{ chemical: 'CaCl2·2H2O', amount: 3.6 }],
      feStock: [{ chemical: 'FeSO4·7H2O', amount: 6 }],
      usageRatio: { main: 100, ca: 5, fe: 0.1 }
    },
    JAWORSKI: {
      name: 'Jaworski (A+B+C)',
      mainStock: [
        { chemical: 'Ca(NO3)2·4H2O', amount: 10 },
        { chemical: 'KNO3', amount: 20 },
        { chemical: 'MgSO4·7H2O', amount: 10 }
      ],
      caStock: [{ chemical: 'K2HPO4', amount: 10 }],
      feStock: [
        { chemical: 'FeSO4·7H2O', amount: 0.7 },
        { chemical: 'EDTA', amount: 0.93 }
      ],
      usageRatio: { main: 20, ca: 10, fe: 0.1 }
    },
    CUSTOM: {
      name: 'Özel Formülasyon',
      mainStock: [],
      caStock: [],
      feStock: [],
      usageRatio: { main: 100, ca: 5, fe: 0.1 }
    }
  };

  // Kimyasal ekle (listeden seçim)
  const addCustomChemical = (stockType) => {
    setCustomFormula([...customFormula, {
      id: Date.now(),
      stockType,
      chemical: '', // Seçilecek
      amount: 0
    }]);
  };

  // Kimyasal seçimini güncelle
  const updateChemicalSelection = (id, chemicalName) => {
    setCustomFormula(customFormula.map(item =>
      item.id === id ? { ...item, chemical: chemicalName } : item
    ));
  };

  // Miktar güncelle
  const updateAmount = (id, amount) => {
    setCustomFormula(customFormula.map(item =>
      item.id === id ? { ...item, amount: parseFloat(amount) || 0 } : item
    ));
  };

  // Kimyasal sil
  const removeCustomChemical = (id) => {
    setCustomFormula(customFormula.filter(item => item.id !== id));
  };

  // Kullanım oranı güncelle
  const updateUsageRatio = (field, value) => {
    mediums.CUSTOM.usageRatio[field] = parseFloat(value);
  };

  // Hesaplama
  const calculateNutrients = () => {
    const medium = selectedMedium === 'CUSTOM' && customFormula.length > 0
      ? {
          ...mediums.CUSTOM,
          mainStock: customFormula.filter(c => c.stockType === 'main'),
          caStock: customFormula.filter(c => c.stockType === 'ca'),
          feStock: customFormula.filter(c => c.stockType === 'fe')
        }
      : mediums[selectedMedium];

    const vol = parseFloat(volume);
    const ratio = medium.usageRatio;

    // Stok çözeltileri için hesaplamalar
    const calculateStock = (stockChemicals, stockName) => {
      const formattedChems = stockChemicals.map(c => ({
        name: c.chemical,
        amount: c.amount,
        unit: 'g/L'
      }));

      const tds = calculateTDS(formattedChems);
      const phEstimate = estimatePH(formattedChems);
      const ions = analyzeIons(formattedChems);

      return {
        chemicals: stockChemicals,
        tds: tds.toFixed(2),
        ph: phEstimate.pH,
        ions
      };
    };

    const mainStockData = calculateStock(medium.mainStock, 'Ana Stok');
    const caStockData = calculateStock(medium.caStock, 'Ca Stok');
    const feStockData = calculateStock(medium.feStock, 'Fe Stok');

    // Kullanım miktarları
    const mainStockMl = vol * ratio.main;
    const caStockMl = vol * ratio.ca;
    const feStockMl = vol * ratio.fe;

    setResults({
      volume: vol,
      medium: medium.name,
      mainStock: { ...mainStockData, volumeNeeded: mainStockMl.toFixed(1) },
      caStock: { ...caStockData, volumeNeeded: caStockMl.toFixed(1) },
      feStock: { ...feStockData, volumeNeeded: feStockMl.toFixed(1) }
    });
  };

  // Kimyasal bilgi modalı
  const showChemicalInfo = (chemName) => {
    const chem = chemicalLibrary[chemName];
    if (chem) setShowChemInfo(chem);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Beaker className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Besin Yeri Hesaplama</h2>
            <p className="text-green-100">Kimyasal listesinden seçim yapın - formül, TDS ve pH otomatik hesaplanır</p>
          </div>
        </div>
      </div>

      {/* Besin Yeri Seçimi */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Besin Yeri Seçimi</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {Object.keys(mediums).filter(k => k !== 'CUSTOM').map(key => (
            <button
              key={key}
              onClick={() => {
                setSelectedMedium(key);
                setIsCustom(false);
                setSelectedCustomFormulation(null);
              }}
              className={`px-4 py-3 rounded-lg font-semibold transition ${
                selectedMedium === key && !isCustom
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {mediums[key].name}
            </button>
          ))}
        </div>

        {/* Özel Formülasyon Dropdown */}
        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🧪 Özel Formülasyon Seç (Kullanıcı Tanımlı Stoklar)
          </label>
          <div className="flex gap-2">
            <select
              value={selectedCustomFormulation?.id || ''}
              onChange={(e) => {
                const formulation = customFormulations.find(f => f.id === e.target.value);
                setSelectedCustomFormulation(formulation);
                if (formulation) {
                  setIsCustom(true);
                  setSelectedMedium('CUSTOM');
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Özel formülasyon seçin...</option>
              {customFormulations.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.stocks.length} stok) {f.usageCount ? `- ${f.usageCount}× kullanıldı` : ''}
                </option>
              ))}
            </select>
            {selectedCustomFormulation && (
              <>
                <button
                  onClick={() => {
                    // ✏️ DÜZENLE - Mevcut formülasyonu modal'a yükle
                    setNewFormulation({
                      id: selectedCustomFormulation.id,  // ID'yi koru
                      name: selectedCustomFormulation.name,
                      cultureVolume: selectedCustomFormulation.cultureVolume,
                      stocks: selectedCustomFormulation.stocks.map(stock => ({
                        ...stock,
                        chemicals: [...stock.chemicals]  // Deep copy
                      })),
                      usageCount: selectedCustomFormulation.usageCount,
                      stockTransactions: selectedCustomFormulation.stockTransactions
                    });
                    setShowCreateFormulation(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  title="Formülasyonu Düzenle"
                >
                  <Edit2 className="w-4 h-4" />
                  Düzenle
                </button>
                <button
                  onClick={() => {
                    if (confirm(`"${selectedCustomFormulation.name}" formülasyonunu silmek istediğinize emin misiniz?`)) {
                      const updatedFormulations = customFormulations.filter(f => f.id !== selectedCustomFormulation.id);
                      setCustomFormulations(updatedFormulations);
                      localStorage.setItem('customFormulations', JSON.stringify(updatedFormulations));
                      setSelectedCustomFormulation(null);
                      alert('✅ Formülasyon silindi!');
                    }
                  }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                  title="Formülasyonu Sil"
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </button>
              </>
            )}
            <button
              onClick={() => {
                setNewFormulation({ name: '', cultureVolume: parseFloat(volume) || 1, stocks: [] });
                setShowCreateFormulation(true);
              }}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yeni Oluştur
            </button>
          </div>
        </div>

        {/* Seçilen Özel Formülasyon Preview */}
        {selectedCustomFormulation && (
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-teal-700">
                📋 Seçilen Formülasyon: {selectedCustomFormulation.name}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // ✅ FORMÜLASYONU KULLAN - Stoklardan düşür
                    const stockErrors = [];
                    const stockWarnings = [];
                    const transactionsToSave = [];
                    
                    // Kullanım hacmini al
                    const useVolume = parseFloat(volume) || selectedCustomFormulation.cultureVolume;

                    // Her stok için kimyasalları hesapla ve stoklardan düş
                    selectedCustomFormulation.stocks.forEach(stock => {
                      stock.chemicals.forEach(chem => {
                        if (!chem.formula || chem.amount <= 0) return;

                        // Toplam kullanım hesaplama
                        // Örnek: 1L kültür için 100ml/L stok kullanılıyor
                        // Stokta 1.2g/L kimyasal var
                        // Kullanım = (100ml / 1000) * 1L * (1.2g / 1L) = 0.12g
                        const stockVolumeToUse = (stock.usageAmount / 1000) * useVolume; // ml -> L
                        const concentrationInStock = chem.amount / stock.stockVolume; // g/L
                        const totalChemicalUsed = concentrationInStock * stockVolumeToUse; // g

                        // Stoktan düş
                        const result = reduceStock(
                          chem.formula,
                          totalChemicalUsed,
                          chem.unit,
                          {
                            type: 'formulation_usage',
                            formulationName: selectedCustomFormulation.name,
                            cultureVolume: useVolume,
                            stockName: stock.name,
                            stockUsageAmount: stock.usageAmount,
                            timestamp: new Date().toISOString()
                          }
                        );

                        if (!result.success) {
                          stockErrors.push(`${chem.formula}: ${result.error}`);
                        } else {
                          if (result.warning) {
                            stockWarnings.push(result.warning);
                          }
                          transactionsToSave.push(result.transaction);
                        }
                      });
                    });

                    // Hata varsa işlemi durdur
                    if (stockErrors.length > 0) {
                      alert('❌ STOK YETERSİZ!\n\n' + stockErrors.join('\n') + '\n\nFormülasyon uygulanamadı.');
                      return;
                    }

                    // Kullanım sayacını artır
                    const updatedFormulation = {
                      ...selectedCustomFormulation,
                      usageCount: (selectedCustomFormulation.usageCount || 0) + 1,
                      lastUsed: new Date().toISOString(),
                      stockTransactions: [
                        ...(selectedCustomFormulation.stockTransactions || []),
                        ...transactionsToSave
                      ]
                    };

                    // Güncel formülasyonu kaydet
                    const updatedFormulations = customFormulations.map(f =>
                      f.id === updatedFormulation.id ? updatedFormulation : f
                    );
                    setCustomFormulations(updatedFormulations);
                    localStorage.setItem('customFormulations', JSON.stringify(updatedFormulations));
                    setSelectedCustomFormulation(updatedFormulation);

                    // Başarı mesajı
                    let successMessage = `✅ Formülasyon başarıyla uygulandı!\n\n`;
                    successMessage += `📊 ${useVolume}L kültür için stoklar düşüldü.\n`;
                    successMessage += `🔢 Toplam kullanım: ${updatedFormulation.usageCount} kere\n`;
                    if (stockWarnings.length > 0) {
                      successMessage += '\n⚠️ UYARILAR:\n' + stockWarnings.join('\n');
                    }
                    alert(successMessage);
                  }}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm"
                >
                  <Beaker className="w-4 h-4" />
                  🚀 FORMÜLASYONU KULLAN
                </button>
                <StoichiometryButton formulation={selectedCustomFormulation} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Kültür Hacmi: {selectedCustomFormulation.cultureVolume} L | {selectedCustomFormulation.stocks.length} Stok | Kullanım: {selectedCustomFormulation.usageCount || 0} kere
            </p>
            
            {/* Stokları Göster */}
            <div className="space-y-3">
              {selectedCustomFormulation.stocks.map((stock, idx) => (
                <div key={stock.id} className="bg-gray-50 rounded-lg p-4 border-l-4" style={{ borderColor: stock.color }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stock.color }} />
                      <h5 className="font-semibold text-gray-800">{stock.name}</h5>
                    </div>
                    <div className="text-sm text-gray-600">
                      {stock.usageAmount} ml/L kültür
                    </div>
                  </div>
                  
                  {/* Kimyasallar */}
                  {stock.chemicals.length > 0 ? (
                    <div className="text-sm space-y-1">
                      {stock.chemicals.map((chem, chemIdx) => (
                        <div key={chem.id} className="flex items-center gap-2 text-gray-700">
                          <span className="text-gray-400">{chemIdx + 1}.</span>
                          <span className="font-medium">{chem.formula}</span>
                          <span className="text-gray-500">→</span>
                          <span>{chem.amount} {chem.unit}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 italic">Kimyasal eklenmemiş</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hacim Girişi */}
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">Kültür Hacmi (L)</label>
          <input
            type="number"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>

        <button
          onClick={calculateNutrients}
          className="w-full mt-4 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2"
        >
          <Calculator className="w-5 h-5" />
          Hesapla
        </button>
      </div>

      {/* Sonuçlar */}
      {results && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Hesaplama Sonuçları</h3>
          
          <div className="bg-emerald-50 p-4 rounded-lg mb-4">
            <p className="text-lg"><strong>Besin Yeri:</strong> {results.medium}</p>
            <p className="text-lg"><strong>Hacim:</strong> {results.volume} L</p>
          </div>

          {/* Ana Stok */}
          {results.mainStock.chemicals.length > 0 && (
            <div className="mb-4 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800">Ana Stok: {results.mainStock.volumeNeeded} ml gerekli</h4>
              <div className="bg-blue-50 p-3 rounded-lg mb-2">
                {results.mainStock.chemicals.map((chem, idx) => {
                  const chemData = chemicalLibrary[chem.chemical];
                  return (
                    <div key={idx} className="text-sm mb-1 flex justify-between">
                      <span><strong>{chemData?.name || chem.chemical}:</strong> {chem.amount} g/L</span>
                      <span className="text-xs text-gray-600">{chemData?.formula}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-2 rounded">
                  <strong>TDS:</strong> {results.mainStock.tds} g/L
                </div>
                <div className="bg-white p-2 rounded">
                  <strong>Tahmini pH:</strong> {results.mainStock.ph}
                </div>
              </div>
              {Object.keys(results.mainStock.ions).length > 0 && (
                <div className="mt-2 bg-white p-2 rounded text-xs">
                  <strong>İyonlar:</strong> {Object.entries(results.mainStock.ions).map(([ion, conc]) => 
                    `${ion}: ${conc.toFixed(2)} mg/L`
                  ).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Ca Stok */}
          {results.caStock.chemicals.length > 0 && (
            <div className="mb-4 border border-purple-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-purple-800">Ca Stok: {results.caStock.volumeNeeded} ml gerekli</h4>
              <div className="bg-purple-50 p-3 rounded-lg mb-2">
                {results.caStock.chemicals.map((chem, idx) => {
                  const chemData = chemicalLibrary[chem.chemical];
                  return (
                    <div key={idx} className="text-sm mb-1 flex justify-between">
                      <span><strong>{chemData?.name || chem.chemical}:</strong> {chem.amount} g/L</span>
                      <span className="text-xs text-gray-600">{chemData?.formula}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-2 rounded">
                  <strong>TDS:</strong> {results.caStock.tds} g/L
                </div>
                <div className="bg-white p-2 rounded">
                  <strong>Tahmini pH:</strong> {results.caStock.ph}
                </div>
              </div>
            </div>
          )}

          {/* Fe Stok */}
          {results.feStock.chemicals.length > 0 && (
            <div className="border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-orange-800">Fe Stok: {results.feStock.volumeNeeded} ml gerekli</h4>
              <div className="bg-orange-50 p-3 rounded-lg mb-2">
                {results.feStock.chemicals.map((chem, idx) => {
                  const chemData = chemicalLibrary[chem.chemical];
                  return (
                    <div key={idx} className="text-sm mb-1 flex justify-between">
                      <span><strong>{chemData?.name || chem.chemical}:</strong> {chem.amount} g/L</span>
                      <span className="text-xs text-gray-600">{chemData?.formula}</span>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-2 rounded">
                  <strong>TDS:</strong> {results.feStock.tds} g/L
                </div>
                <div className="bg-white p-2 rounded">
                  <strong>Tahmini pH:</strong> {results.feStock.ph}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Formülasyon Oluşturma Modal */}
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
                  setNewFormulation({ name: '', cultureVolume: 1, stocks: [] });
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
                    Kültür Hacmi (L) <span className="text-green-600 text-xs">✓ Otomatik dolduruldu</span>
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
                    Stok Ekle
                  </button>
                </div>

                {/* Stok Kartları */}
                {newFormulation.stocks.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <p className="text-gray-500">Henüz stok eklenmedi</p>
                    <p className="text-sm text-gray-400 mt-1">En az 1, maksimum 6 stok ekleyin</p>
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

                          {/* YENİ: Kimyasal filtresi */}
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
                                      // Kullanıcı malzemesi mi yoksa database'den mi?
                                      if (item.isUserMaterial) {
                                        return (
                                          <option key={item.formula} value={item.formula}>
                                            {item.name} {item.formula !== item.name ? `(${item.formula})` : ''}
                                            {item.stock > 0 ? ` - Stok: ${item.stock} ${item.unit} ✓` : ' - Stok yok ⚠️'}
                                          </option>
                                        );
                                      }
                                      // Database kimyasalı
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
                  setNewFormulation({ name: '', cultureVolume: 1, stocks: [] });
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  if (!newFormulation.name.trim()) {
                    alert('Formülasyon adı giriniz!');
                    return;
                  }
                  if (newFormulation.stocks.length === 0) {
                    alert('En az 1 stok ekleyiniz!');
                    return;
                  }

                  // ✅ DÜZENLEME Mİ YENİ OLUŞTURMA MI?
                  const isEditing = !!newFormulation.id;
                  
                  let formulationToSave;
                  
                  if (isEditing) {
                    // DÜZENLEME - Mevcut formülasyonu güncelle
                    formulationToSave = {
                      ...newFormulation,
                      modifiedDate: new Date().toISOString(),
                      // createdDate, usageCount, stockTransactions'ı koru
                    };
                    
                    const updatedFormulations = customFormulations.map(f =>
                      f.id === formulationToSave.id ? formulationToSave : f
                    );
                    setCustomFormulations(updatedFormulations);
                    localStorage.setItem('customFormulations', JSON.stringify(updatedFormulations));
                    
                  } else {
                    // YENİ OLUŞTURMA
                    formulationToSave = {
                      ...newFormulation,
                      id: `formulation_${Date.now()}`,
                      createdDate: new Date().toISOString(),
                      modifiedDate: new Date().toISOString(),
                      usageCount: 0,
                      stockTransactions: []
                    };
                    
                    const updatedFormulations = [...customFormulations, formulationToSave];
                    setCustomFormulations(updatedFormulations);
                    localStorage.setItem('customFormulations', JSON.stringify(updatedFormulations));
                  }

                  // Kaydedilen formülasyonu seç
                  setSelectedCustomFormulation(formulationToSave);
                  setIsCustom(true);
                  setSelectedMedium('CUSTOM');

                  // Modal'ı kapat ve formu sıfırla
                  setShowCreateFormulation(false);
                  setNewFormulation({ name: '', cultureVolume: 1, stocks: [] });

                  // Başarı mesajı
                  let successMessage = isEditing 
                    ? '✅ Formülasyon başarıyla güncellendi!\n\n'
                    : '✅ Formülasyon başarıyla kaydedildi!\n\n';
                  successMessage += '📋 Tarif hazır, stoklar henüz düşmedi.\n';
                  successMessage += '💡 "FORMÜLASYONU KULLAN" butonuna basarak stoklardan düşebilirsiniz.';
                  alert(successMessage);
                }}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {newFormulation.id ? '💾 Değişiklikleri Kaydet' : '📋 Kaydet (Tarif)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kimyasal Bilgi Modalı */}
      {showChemInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowChemInfo(null)}>
          <div className="bg-white rounded-xl p-6 max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 text-emerald-600">{showChemInfo.name}</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <strong>Formül:</strong> {showChemInfo.formula}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Molekül Ağırlığı:</strong> {showChemInfo.molarMass} g/mol
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Kategori:</strong> {showChemInfo.category}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <strong>Çözünürlük:</strong> {showChemInfo.solubility} g/100ml
              </div>
            </div>

            {/* İyonlar */}
            {Object.keys(showChemInfo.ions).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">İyonlar (Tuzlar):</h4>
                <div className="bg-blue-50 p-3 rounded">
                  {Object.entries(showChemInfo.ions).map(([ion, data]) => (
                    <div key={ion} className="text-sm">
                      <strong>{ion}:</strong> {data.moles} mol, {data.mass} g/mol
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Besin Elementleri */}
            {Object.keys(showChemInfo.nutrients).length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Besin İçeriği (%):</h4>
                <div className="bg-green-50 p-3 rounded">
                  {Object.entries(showChemInfo.nutrients).map(([nutrient, percent]) => (
                    <div key={nutrient} className="text-sm">
                      <strong>{nutrient}:</strong> {percent}%
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* pKa */}
            {showChemInfo.pKa && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2">pKa Değerleri:</h4>
                <div className="bg-yellow-50 p-3 rounded text-sm">
                  {Array.isArray(showChemInfo.pKa) 
                    ? showChemInfo.pKa.join(', ')
                    : showChemInfo.pKa}
                </div>
              </div>
            )}

            {/* TDS Katsayısı */}
            <div className="bg-purple-50 p-3 rounded mb-4">
              <strong>TDS Katkısı:</strong> {showChemInfo.tdsContribution}x
            </div>

            <button
              onClick={() => setShowChemInfo(null)}
              className="w-full bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Uyarı */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-800">Önemli Not</h4>
          <p className="text-sm text-yellow-700 mt-1">
            pH ve TDS değerleri teorik hesaplamalardır. Gerçek değerler kimyasal saflık, sıcaklık ve diğer faktörlere bağlı olarak değişebilir. Mutlaka ölçüm cihazları ile kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NutrientCalculator;
