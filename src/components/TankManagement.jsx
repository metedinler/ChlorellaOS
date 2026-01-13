import React, { useState, useEffect } from 'react';
import { Database, Droplet, Power, GitBranch, X, CheckCircle, Edit, Merge, Plus } from 'lucide-react';
import { tankSystem } from '../data/systemData';
import { MEDIA_DATABASE } from '../data/mediaDatabase';
import modelManager from '../managers/ModelManager';
import simulationWorker from '../workers/SimulationWorker';

const TankManagement = () => {
  const [tanks, setTanks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [activatingTank, setActivatingTank] = useState(null);
  const [splitSource, setSplitSource] = useState(null);
  const [mergeSource, setMergeSource] = useState([]);
  const [editingTank, setEditingTank] = useState(null);
  const [splitTargets, setSplitTargets] = useState([]);
  const [splitCount, setSplitCount] = useState(2);
  const [formulations, setFormulations] = useState([]);
  const [selectedMedium, setSelectedMedium] = useState('');
  const [isCustomMedium, setIsCustomMedium] = useState(false);
  const [showBulkActivationModal, setShowBulkActivationModal] = useState(false);
  const [showTankTypeManager, setShowTankTypeManager] = useState(false);
  const [bulkSelectedTanks, setBulkSelectedTanks] = useState([]);
  const [tankTypes, setTankTypes] = useState([
    { code: 'K', name: 'Kavanoz', volume: 1, description: '1 litrelik kavanoz' },
    { code: 'S', name: 'Şişe', volume: 5, description: '5 litrelik şişe' },
    { code: 'V', name: 'Kova', volume: 70, description: '70 litrelik kova' },
    { code: 'IBC', name: 'IBC Tank', volume: 1000, description: '1000 litrelik IBC tank' }
  ]);

  // Tank sisteminden tank listesi oluştur
  const initializeTanks = () => {
    const allTanks = [];
    
    Object.entries(tankSystem).forEach(([categoryKey, types]) => {
      const categoryName = {
        kavanozlar: 'Kavanozlar (1L)',
        siseler: 'Şişeler (5L)',
        kovalar: 'Kovalar (70L)',
        ibcler: 'IBC\'ler (1000L)'
      }[categoryKey];
      
      Object.entries(types).forEach(([key, tankDef]) => {
        if (tankDef.tanks) {
          // Özel tank listesi var
          tankDef.tanks.forEach(tankId => {
            allTanks.push({
              id: tankId,
              systemId: tankId,
              customName: '',
              series: tankDef.series,
              volume: tankDef.volume,
              type: tankDef.type,
              category: categoryName,
              categoryKey,
              active: false,
              status: 'empty',
              startDate: null,
              sourceFrom: null, // Nereden gelmiş
              splitHistory: [],
              mergeHistory: [],
              notes: ''
            });
          });
        } else {
          // Count ile oluştur
          for (let i = 1; i <= tankDef.count; i++) {
            const tankId = `${key}${i}`;
            allTanks.push({
              id: tankId,
              systemId: tankId,
              customName: '',
              series: tankDef.series,
              volume: tankDef.volume,
              type: tankDef.type,
              category: categoryName,
              categoryKey,
              active: false,
              status: 'empty',
              startDate: null,
              sourceFrom: null,
              splitHistory: [],
              mergeHistory: [],
              notes: ''
            });
          }
        }
      });
    });
    
    return allTanks;
  };

  // LocalStorage'dan yükle veya oluştur
  useEffect(() => {
    const saved = localStorage.getItem('tankStates');
    if (saved) {
      const savedTanks = JSON.parse(saved);
      const systemTanks = initializeTanks();
      
      // Yeni tanklar eklenmişse birleştir
      const merged = systemTanks.map(sysTank => {
        const savedTank = savedTanks.find(t => t.id === sysTank.id);
        return savedTank || sysTank;
      });
      
      setTanks(merged);
    } else {
      const initialTanks = initializeTanks();
      setTanks(initialTanks);
      localStorage.setItem('tankStates', JSON.stringify(initialTanks));
    }

    // Formülasyonları yükle
    const savedFormulations = localStorage.getItem('customFormulations');
    if (savedFormulations) {
      setFormulations(JSON.parse(savedFormulations));
    }
  }, []);

  // Tank durumu güncelle
  const updateTank = (id, updates) => {
    const updated = tanks.map(t => t.id === id ? { ...t, ...updates } : t);
    setTanks(updated);
    localStorage.setItem('tankStates', JSON.stringify(updated));
  };

  // Tank düzenleme modalı aç
  const openEditModal = (tank) => {
    setEditingTank({ ...tank });
    setShowEditModal(true);
  };

  // Tank düzenlemeyi kaydet
  const saveEdit = () => {
    updateTank(editingTank.id, editingTank);
    setShowEditModal(false);
    setEditingTank(null);
  };

  // Aktif/Pasif değiştir
  const toggleActive = (id) => {
    const tank = tanks.find(t => t.id === id);
    if (!tank.active) {
      // Aktif ediliyor - aktivasyon modalını aç
      setActivatingTank(id);
      setSelectedMedium('');
      setIsCustomMedium(false);
      setShowActivationModal(true);
    } else {
      // Pasif ediliyor
      updateTank(id, {
        active: false,
        status: 'empty',
        startDate: null,
        sourceFrom: null,
        formulationId: null
      });
    }
  };

  // Aktivasyonu kaydet
  const saveActivation = (activationData) => {
    const tank = tanks.find(t => t.id === activatingTank);
    
    // TankManagement state'ini güncelle
    updateTank(activatingTank, {
      active: true,
      status: 'running',
      startDate: activationData.startDate,
      formulationId: activationData.formulationId || null,
      medium: activationData.medium || null,
      initialParams: {
        density: activationData.initialDensity,
        OD600: activationData.initialOD600,
        OD680: activationData.initialOD680,
        OD750: activationData.initialOD750,
        pH: activationData.initialPH,
        temp: activationData.initialTemp,
        TDS: activationData.initialTDS,
        conductivity: activationData.conductivity,
        DO: activationData.DO,
        alkalinity: activationData.alkalinity,
        hardness: activationData.hardness,
        TAN: activationData.TAN,
        nitrite: activationData.nitrite,
        nitrate: activationData.nitrate,
        ammonium: activationData.ammonium,
        ammonia: activationData.ammonia,
        totalPhosphorus: activationData.totalPhosphorus,
        lightHours: activationData.lightHours,
        lightIntensity: activationData.lightIntensity,
        CO2_flow: activationData.CO2_flow
      }
    });

    // 🔥 ModelManager'a tank kaydet (Singleton System)
    try {
      modelManager.registerTank(activatingTank, {
        formulationId: activationData.formulationId,
        volume: tank.volume,
        initialBiomass: activationData.initialDensity || 0.1, // g/L
        temperature: activationData.initialTemp || 25,
        pH: activationData.initialPH || 7.2,
        lightIntensity: activationData.lightIntensity || 150,
        activationDate: activationData.startDate
      });

      console.log(`✅ Tank ${activatingTank} ModelManager'a kaydedildi`);
      
      // SimulationWorker'ı başlat (eğer çalışmıyorsa)
      if (!simulationWorker.getStatus().isRunning) {
        simulationWorker.start();
        console.log('▶️ SimulationWorker başlatıldı');
      }
    } catch (error) {
      console.error(`❌ Tank ${activatingTank} ModelManager kayıt hatası:`, error);
      alert(`⚠️ Model sistemi hatası: ${error.message}\n\nTank aktif edildi ama model simülasyonu başlatılamadı.`);
    }

    setShowActivationModal(false);
    setActivatingTank(null);
  };

  // Çökme durumu
  const markAsCrashed = (id) => {
    if (confirm('Bu tankı çökme durumuna getirmek istediğinize emin misiniz?')) {
      updateTank(id, {
        status: 'crashed',
        active: false
      });
    }
  };

  // Çökmüş tankı sıfırla ve yeniden kullanıma aç
  const resetCrashedTank = (id) => {
    if (confirm('Bu tankı sıfırlayıp yeniden kullanıma hazır hale getirmek istiyor musunuz?\n\n⚠️ Uyarı: Tank boş hale gelecek, tüm önceki veriler korunacak ama tank yeni bir kültür için hazır olacak.')) {
      const tank = tanks.find(t => t.id === id);
      
      // Crash history'ye kaydet
      const crashRecord = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        reason: 'Manual reset after crash',
        resetBy: 'user'
      };
      
      updateTank(id, {
        status: 'empty',
        active: false,
        // Önceki verileri koru ama sıfırlanmış olarak işaretle
        crashHistory: [...(tank.crashHistory || []), crashRecord],
        lastCrashDate: tank.startDate,
        lastCrashNotes: tank.notes || '',
        // Yeni başlangıç için temizle
        startDate: null,
        formulationId: null,
        notes: '',
        sourceFrom: null
      });
      
      alert('✅ Tank başarıyla sıfırlandı ve yeniden kullanıma hazır!');
    }
  };

  // Bölünme modalını aç
  const openSplitModal = (tankId) => {
    setSplitSource(tankId);
    setSplitTargets([]);
    setSplitCount(2);
    setShowSplitModal(true);
  };

  // Hedef tank ekle/çıkar
  const toggleSplitTarget = (tankId) => {
    if (splitTargets.includes(tankId)) {
      setSplitTargets(splitTargets.filter(id => id !== tankId));
    } else {
      if (splitTargets.length < splitCount) {
        setSplitTargets([...splitTargets, tankId]);
      }
    }
  };

  // Bölünmeyi kaydet
  const confirmSplit = () => {
    if (splitTargets.length === 0) {
      alert('En az 1 hedef tank seçmelisiniz!');
      return;
    }

    const splitRecord = {
      from: splitSource,
      to: splitTargets,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    };

    // Kaynak tankı güncelle
    const sourceTank = tanks.find(t => t.id === splitSource);
    updateTank(splitSource, {
      status: 'split',
      active: false,
      splitHistory: [...(sourceTank.splitHistory || []), splitRecord]
    });

    // Hedef tankları aktif et
    splitTargets.forEach(targetId => {
      const targetTank = tanks.find(t => t.id === targetId);
      updateTank(targetId, {
        active: true,
        status: 'running',
        startDate: new Date().toISOString().split('T')[0],
        sourceFrom: splitSource,
        splitHistory: [...(targetTank.splitHistory || []), { ...splitRecord, isTarget: true }]
      });
    });

    setShowSplitModal(false);
    setSplitSource(null);
    setSplitTargets([]);
  };

  // Birleştirme modalını aç
  const openMergeModal = () => {
    setMergeSource([]);
    setShowMergeModal(true);
  };

  // Birleştirme kaynağı ekle/çıkar
  const toggleMergeSource = (tankId) => {
    if (mergeSource.includes(tankId)) {
      setMergeSource(mergeSource.filter(id => id !== tankId));
    } else {
      setMergeSource([...mergeSource, tankId]);
    }
  };

  // Birleştirmeyi kaydet
  const confirmMerge = () => {
    if (mergeSource.length < 2) {
      alert('En az 2 tank seçmelisiniz!');
      return;
    }

    const targetTankId = prompt('Hedef tank ID (örn: VA1):');
    if (!targetTankId) return;

    const targetTank = tanks.find(t => t.id === targetTankId);
    if (!targetTank) {
      alert('Tank bulunamadı!');
      return;
    }

    const mergeRecord = {
      from: mergeSource,
      to: targetTankId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5)
    };

    // Kaynak tankları pasif et
    mergeSource.forEach(sourceId => {
      const sourceTank = tanks.find(t => t.id === sourceId);
      updateTank(sourceId, {
        active: false,
        status: 'merged',
        mergeHistory: [...(sourceTank.mergeHistory || []), mergeRecord]
      });
    });

    // Hedef tankı aktif et
    updateTank(targetTankId, {
      active: true,
      status: 'running',
      startDate: new Date().toISOString().split('T')[0],
      sourceFrom: mergeSource.join(', '),
      mergeHistory: [...(targetTank.mergeHistory || []), { ...mergeRecord, isTarget: true }]
    });

    setShowMergeModal(false);
    setMergeSource([]);
  };

  // Filtreleme
  const filteredTanks = tanks.filter(t => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'active') return t.active;
    if (selectedCategory === 'inactive') return !t.active && t.status !== 'crashed' && t.status !== 'split' && t.status !== 'merged';
    if (selectedCategory === 'crashed') return t.status === 'crashed';
    if (selectedCategory === 'split') return t.status === 'split';
    if (selectedCategory === 'merged') return t.status === 'merged';
    return t.categoryKey === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Database className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Tank Yönetimi</h2>
            <p className="text-blue-100">K (Kavanoz) • S (Şişe) • V (Kova) • IBC - Toplam {tanks.length} Tank</p>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-emerald-600">{tanks.filter(t => t.active).length}</div>
          <div className="text-sm text-gray-600">Aktif</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-gray-600">{tanks.filter(t => !t.active && t.status === 'empty').length}</div>
          <div className="text-sm text-gray-600">Boş</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-red-600">{tanks.filter(t => t.status === 'crashed').length}</div>
          <div className="text-sm text-gray-600">Çökmüş</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-purple-600">{tanks.filter(t => t.status === 'split').length}</div>
          <div className="text-sm text-gray-600">Bölünmüş</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-orange-600">{tanks.filter(t => t.status === 'merged').length}</div>
          <div className="text-sm text-gray-600">Birleştirilmiş</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="text-2xl font-bold text-blue-600">{tanks.length}</div>
          <div className="text-sm text-gray-600">Toplam</div>
        </div>
      </div>

      {/* Filtreler ve Aksiyonlar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Tümü' },
              { key: 'active', label: 'Aktif' },
              { key: 'inactive', label: 'Boş' },
              { key: 'crashed', label: 'Çökmüş' },
              { key: 'split', label: 'Bölünmüş' },
              { key: 'merged', label: 'Birleştirilmiş' },
              { key: 'kavanozlar', label: 'Kavanozlar (K)' },
            { key: 'siseler', label: 'Şişeler (S)' },
            { key: 'kovalar', label: 'Kovalar (V)' },
            { key: 'ibcler', label: 'IBC' }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedCategory(filter.key)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedCategory === filter.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="flex gap-3">
            <button
              onClick={() => setShowBulkActivationModal(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Toplu Aktivasyon
            </button>
            <button
              onClick={() => setShowTankTypeManager(true)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold shadow-lg"
            >
              <Database className="w-5 h-5" />
              Tank Tipi Yönetimi
            </button>
            <button
              onClick={openMergeModal}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
            >
              <Merge className="w-4 h-4" />
              Birleştir
            </button>
          </div>
        </div>
      </div>

      {/* Tank Listesi */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTanks.map(tank => (
            <div
              key={tank.id}
              className={`border-2 rounded-lg p-4 transition ${
                tank.active ? 'border-emerald-500 bg-emerald-50' : 
                tank.status === 'crashed' ? 'border-red-500 bg-red-50' :
                tank.status === 'split' ? 'border-purple-500 bg-purple-50' :
                tank.status === 'merged' ? 'border-orange-500 bg-orange-50' :
                'border-gray-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {tank.systemId}
                    {tank.customName && <span className="text-sm text-gray-600"> ({tank.customName})</span>}
                  </h3>
                  <p className="text-xs text-gray-500">{tank.category} • {tank.volume}L</p>
                </div>
                <button
                  onClick={() => openEditModal(tank)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                {tank.status === 'crashed' && (
                  <div className="flex items-center gap-2 w-full">
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Çökme</span>
                    <button
                      onClick={() => resetCrashedTank(tank.id)}
                      className="ml-auto px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition flex items-center gap-1"
                      title="Tankı sıfırla ve yeniden kullanıma aç"
                    >
                      <Power className="w-3 h-3" />
                      Sıfırla
                    </button>
                  </div>
                )}
                {tank.status === 'split' && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Bölündü</span>
                )}
                {tank.status === 'merged' && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Birleştirildi</span>
                )}
                {tank.active && tank.status === 'running' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Aktif</span>
                )}
              </div>

              {tank.startDate && (
                <p className="text-xs text-gray-600 mb-1">📅 {tank.startDate}</p>
              )}

              {tank.sourceFrom && (
                <p className="text-xs text-blue-600 mb-1">🔗 Kaynak: {tank.sourceFrom}</p>
              )}

              {tank.formulationId && (() => {
                const formulation = formulations.find(f => f.id === tank.formulationId);
                return formulation && (
                  <p className="text-xs text-purple-600 mb-1">🧪 {formulation.name}</p>
                );
              })()}

              {tank.notes && (
                <p className="text-xs text-gray-500 italic mb-2">"{tank.notes}"</p>
              )}

              <div className="flex gap-1 mt-3">
                <button
                  onClick={() => toggleActive(tank.id)}
                  className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    tank.active
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                  }`}
                  disabled={tank.status === 'crashed' || tank.status === 'split' || tank.status === 'merged'}
                >
                  <Power className="w-3 h-3" />
                  {tank.active ? 'Pasif' : 'Aktif'}
                </button>

                {tank.active && (
                  <>
                    <button
                      onClick={() => markAsCrashed(tank.id)}
                      className="px-2 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition"
                      title="Çökme"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => openSplitModal(tank.id)}
                      className="px-2 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition"
                      title="Bölünme"
                    >
                      <GitBranch className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Düzenleme Modalı */}
      {showEditModal && editingTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Tank Düzenle: {editingTank.systemId}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Özel Ad</label>
                <input
                  type="text"
                  value={editingTank.customName}
                  onChange={(e) => setEditingTank({ ...editingTank, customName: e.target.value })}
                  placeholder="Örn: Ana Üretim Tankı"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Hacim (L)</label>
                <input
                  type="number"
                  value={editingTank.volume}
                  onChange={(e) => setEditingTank({ ...editingTank, volume: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notlar</label>
                <textarea
                  value={editingTank.notes}
                  onChange={(e) => setEditingTank({ ...editingTank, notes: e.target.value })}
                  placeholder="Özel notlar..."
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              {editingTank.startDate && (
                <div>
                  <label className="block text-sm font-medium mb-2">Aktivasyon Tarihi</label>
                  <input
                    type="date"
                    value={editingTank.startDate}
                    onChange={(e) => setEditingTank({ ...editingTank, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEdit}
                className="flex-1 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
              >
                Kaydet
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTank(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bölünme Modalı */}
      {showSplitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">{splitSource} Bölünme İşlemi</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Kaça Bölünecek?</label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map(count => (
                  <button
                    key={count}
                    onClick={() => {
                      setSplitCount(count);
                      setSplitTargets([]);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      splitCount === count ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {count} Tank
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Hedef Tankları Seçin ({splitTargets.length}/{splitCount}):
              </p>
              <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                {tanks
                  .filter(t => !t.active && t.status !== 'crashed' && t.id !== splitSource)
                  .map(tank => (
                    <button
                      key={tank.id}
                      onClick={() => toggleSplitTarget(tank.id)}
                      className={`px-2 py-1.5 rounded text-xs transition ${
                        splitTargets.includes(tank.id)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tank.systemId}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmSplit}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Bölünmeyi Kaydet
              </button>
              <button
                onClick={() => {
                  setShowSplitModal(false);
                  setSplitSource(null);
                  setSplitTargets([]);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Birleştirme Modalı */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">Tank Birleştirme</h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Birleştirilecek Tankları Seçin (En az 2, seçili: {mergeSource.length}):
              </p>
              <div className="grid grid-cols-8 gap-2 max-h-60 overflow-y-auto">
                {tanks
                  .filter(t => t.active)
                  .map(tank => (
                    <button
                      key={tank.id}
                      onClick={() => toggleMergeSource(tank.id)}
                      className={`px-2 py-1.5 rounded text-xs transition ${
                        mergeSource.includes(tank.id)
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tank.systemId}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={confirmMerge}
                className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
              >
                <Merge className="w-5 h-5" />
                Birleştirmeyi Kaydet
              </button>
              <button
                onClick={() => {
                  setShowMergeModal(false);
                  setMergeSource([]);
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Aktivasyon Modalı */}
      {showActivationModal && activatingTank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">
              {tanks.find(t => t.id === activatingTank)?.systemId} Aktivasyonu
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                saveActivation({
                  startDate: formData.get('startDate'),
                  formulationId: formData.get('formulationId'),
                  medium: formData.get('medium'),
                  initialDensity: parseFloat(formData.get('initialDensity')), // 🔥 FIX: 1e6 çarpan KALDIRILDI - direkt g/L değeri
                  initialOD600: parseFloat(formData.get('initialOD600')),
                  initialOD680: parseFloat(formData.get('initialOD680')),
                  initialOD750: parseFloat(formData.get('initialOD750')),
                  initialPH: parseFloat(formData.get('initialPH')),
                  initialTemp: parseFloat(formData.get('initialTemp')),
                  initialTDS: parseFloat(formData.get('initialTDS')),
                  conductivity: parseFloat(formData.get('conductivity')),
                  DO: parseFloat(formData.get('DO')),
                  alkalinity: parseFloat(formData.get('alkalinity')),
                  hardness: parseFloat(formData.get('hardness')),
                  TAN: parseFloat(formData.get('TAN')) || 0,
                  nitrite: parseFloat(formData.get('nitrite')) || 0,
                  nitrate: parseFloat(formData.get('nitrate')) || 0,
                  ammonium: parseFloat(formData.get('ammonium')) || 0,
                  ammonia: parseFloat(formData.get('ammonia')) || 0,
                  totalPhosphorus: parseFloat(formData.get('totalPhosphorus')) || 0,
                  lightHours: parseInt(formData.get('lightHours')),
                  lightIntensity: parseInt(formData.get('lightIntensity')),
                  CO2_flow: parseFloat(formData.get('CO2_flow'))
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Aktivasyon Tarihi *</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Besin Ortamı <span className="text-red-600">*</span> <span className="text-gray-500 text-xs">(modelleme için gerekli)</span>
                  </label>
                  <select
                    name="medium"
                    required
                    value={selectedMedium}
                    onChange={(e) => {
                      setSelectedMedium(e.target.value);
                      // Standart besin ortamı mı yoksa özel mi kontrol et
                      const isStandard = Object.values(MEDIA_DATABASE).some(m => m.name === e.target.value);
                      setIsCustomMedium(!isStandard && e.target.value !== '');
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Besin ortamı seçin...</option>
                    <optgroup label="📚 Standart Besin Ortamları (Stokiyometri sistemde tanımlı)">
                      {Object.values(MEDIA_DATABASE).map(media => (
                        <option key={media.id} value={media.name}>
                          {media.name} - {media.description}
                        </option>
                      ))}
                    </optgroup>
                    {formulations.length > 0 && (
                      <optgroup label="🧪 Özel Besin Ortamlarım (Stok formülasyonu gerekli)">
                        {formulations.map(f => (
                          <option key={f.id} value={f.name}>
                            {f.name} (Özel - {f.stocks?.length || 0} stok)
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">💡 Standart besin ortamlarının stokiyometrisi sistemde kayıtlı</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Stok Formülasyonu {isCustomMedium && <span className="text-red-600">*</span>} 
                    <span className="text-gray-500 text-xs">
                      {isCustomMedium ? '(özel besin ortamı için gerekli)' : '(sadece özel besin ortamları için)'}
                    </span>
                  </label>
                  <select
                    name="formulationId"
                    disabled={!isCustomMedium}
                    required={isCustomMedium}
                    className={`w-full px-3 py-2 border rounded-lg ${!isCustomMedium ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  >
                    <option value="">{isCustomMedium ? 'Stok formülasyonu seçin' : 'Standart besin ortamı stokiyometrisi kullanılacak'}</option>
                    {formulations.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.stocks.length} stok)
                      </option>
                    ))}
                  </select>
                  {!isCustomMedium && selectedMedium && (
                    <p className="text-xs text-green-600 mt-1">✓ Standart besin ortamı - sistem stokiyometrisini kullanacak</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-blue-700">📊 Optik Yoğunluk Ölçümleri</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">OD600 *</label>
                    <input
                      type="number"
                      step="0.001"
                      name="initialOD600"
                      defaultValue="0.1"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standart ölçüm</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">OD680</label>
                    <input
                      type="number"
                      step="0.001"
                      name="initialOD680"
                      defaultValue="0.1"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Klorofil a</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">OD750</label>
                    <input
                      type="number"
                      step="0.001"
                      name="initialOD750"
                      defaultValue="0.08"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Bulanıklık kontrolü</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-green-700">🔬 Hücre Yoğunluğu</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Yoğunluk (M cells/ml) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="initialDensity"
                      defaultValue="1.0"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Thoma/Neubauer sayımı</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-red-700">💧 Su Kalitesi Parametreleri</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">pH *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="initialPH"
                      defaultValue="7.5"
                      min="6"
                      max="9"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sıcaklık (°C) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="initialTemp"
                      defaultValue="25"
                      required
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">TDS (ppm)</label>
                    <input
                      type="number"
                      name="initialTDS"
                      defaultValue="500"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total Dissolved Solids</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">İletkenlik (µS/cm)</label>
                    <input
                      type="number"
                      name="conductivity"
                      defaultValue="800"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Elektriksel iletkenlik</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Çözünmüş Oksijen (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="DO"
                      defaultValue="8.0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">DO - Dissolved Oxygen</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Alkalinite (mg/L CaCO₃)</label>
                    <input
                      type="number"
                      name="alkalinity"
                      defaultValue="100"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Claude Boyd metodu</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sertlik (mg/L CaCO₃)</label>
                    <input
                      type="number"
                      name="hardness"
                      defaultValue="150"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Water hardness</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-purple-700">🧬 Azot & Fosfor Parametreleri</h4>
                <p className="text-xs text-gray-600 mb-3">📊 Sistem besin ortamı stokiyometrisinden teorik değerleri hesaplayacak</p>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">TAN (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="TAN"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total Ammonia Nitrogen</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">NO₂⁻ Nitrit (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="nitrite"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nitrite</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">NO₃⁻ Nitrat (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="nitrate"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nitrate</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">NH₄⁺ Amonyum (mg/L)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="ammonium"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ammonium</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">NH₃ Amonyak (mg/L)</label>
                    <input
                      type="number"
                      step="0.001"
                      name="ammonia"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Ammonia (toksik)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Toplam Fosfor (mg/L)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="totalPhosphorus"
                      defaultValue="0"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Total Phosphorus</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold mb-3 text-yellow-700">☀️ Işık & CO₂ Koşulları</h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Işık (saat/gün)</label>
                    <input
                      type="number"
                      name="lightHours"
                      defaultValue="16"
                      min="0"
                      max="24"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Işık Şiddeti (lux)</label>
                    <input
                      type="number"
                      name="lightIntensity"
                      defaultValue="5000"
                      step="100"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">CO₂ Akış (L/min)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="CO2_flow"
                      defaultValue="0.1"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Aktif Et
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivationModal(false);
                    setActivatingTank(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TankManagement;
