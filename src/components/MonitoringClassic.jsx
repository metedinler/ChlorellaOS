import React, { useState, useEffect } from 'react';
import { Table, Plus, Save, Download, Upload, Calendar, Droplet, Zap, Eye, EyeOff, Settings } from 'lucide-react';

const MonitoringClassic = () => {
  const [activeTanks, setActiveTanks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [dataEntries, setDataEntries] = useState({});
  const [savedData, setSavedData] = useState([]);
  const [visibleParams, setVisibleParams] = useState({});
  const [showParamSettings, setShowParamSettings] = useState(false);

  // Parametre tanımları
  const parameters = [
    { id: 'temp', label: 'Sıcaklık (°C)', type: 'number', step: '0.1', defaultVisible: true },
    { id: 'ph', label: 'pH', type: 'number', step: '0.01', defaultVisible: true },
    { id: 'tds', label: 'TDS (ppm)', type: 'number', step: '1', defaultVisible: true },
    { id: 'ec', label: 'EC (µS/cm)', type: 'number', step: '1', defaultVisible: false },
    { id: 'o2', label: 'O₂ (mg/L)', type: 'number', step: '0.01', defaultVisible: true },
    { id: 'alkalinity', label: 'Alkalinite (ppm)', type: 'number', step: '1', defaultVisible: false },
    { id: 'hardness', label: 'Sertlik (ppm)', type: 'number', step: '1', defaultVisible: false },
    { id: 'ammonia', label: 'Amonyak (mg/L)', type: 'number', step: '0.01', defaultVisible: false },
    { id: 'ammonium', label: 'Amonyum (mg/L)', type: 'number', step: '0.01', defaultVisible: false },
    { id: 'nitrite', label: 'Nitrit (mg/L)', type: 'number', step: '0.01', defaultVisible: false },
    { id: 'nitrate', label: 'Nitrat (mg/L)', type: 'number', step: '0.1', defaultVisible: false },
    { id: 'phosphate', label: 'Toplam Fosfat (mg/L)', type: 'number', step: '0.01', defaultVisible: false },
    { id: 'luxFront', label: 'Işık (Ön) (lux)', type: 'number', step: '10', defaultVisible: true },
    { id: 'luxBack', label: 'Işık (Arka) (lux)', type: 'number', step: '10', defaultVisible: false },
    { id: 'photoperiod', label: 'Fotoperyot (saat)', type: 'number', step: '0.5', defaultVisible: true }
  ];

  // Tank listesini yükle
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
      
      // Her tank için boş veri objesi oluştur
      const initialData = {};
      active.forEach(tank => {
        initialData[tank.id] = {};
      });
      setDataEntries(initialData);
    }

    // Kaydedilmiş verileri yükle
    const stored = localStorage.getItem('chlorellaMonitoringClassic');
    if (stored) {
      setSavedData(JSON.parse(stored));
    }

    // Parametre görünürlük ayarlarını yükle
    const savedVisibility = localStorage.getItem('monitoringClassicVisibility');
    if (savedVisibility) {
      setVisibleParams(JSON.parse(savedVisibility));
    } else {
      // İlk yüklemede default görünürlükleri ayarla
      const defaultVisibility = {};
      parameters.forEach(p => {
        defaultVisibility[p.id] = p.defaultVisible;
      });
      setVisibleParams(defaultVisibility);
    }
  }, []);

  // Parametre görünürlüğünü değiştir
  const toggleParamVisibility = (paramId) => {
    const newVisibility = {
      ...visibleParams,
      [paramId]: !visibleParams[paramId]
    };
    setVisibleParams(newVisibility);
    localStorage.setItem('monitoringClassicVisibility', JSON.stringify(newVisibility));
  };

  // Görünür parametreleri filtrele
  const visibleParameters = parameters.filter(p => visibleParams[p.id]);

  // Veri güncelle
  const updateValue = (tankId, paramId, value) => {
    setDataEntries(prev => ({
      ...prev,
      [tankId]: {
        ...prev[tankId],
        [paramId]: value
      }
    }));
  };

  // Tüm verileri kaydet
  const saveAllData = () => {
    // Boş olmayan tanklardaki verileri kontrol et
    const hasData = Object.keys(dataEntries).some(tankId => 
      Object.keys(dataEntries[tankId]).length > 0
    );

    if (!hasData) {
      alert('⚠️ Lütfen en az bir tank için veri girin!');
      return;
    }

    const newEntry = {
      id: Date.now(),
      date: currentDate,
      timestamp: new Date().toISOString(),
      data: { ...dataEntries }
    };

    const updated = [newEntry, ...savedData];
    setSavedData(updated);
    localStorage.setItem('chlorellaMonitoringClassic', JSON.stringify(updated));

    // Verileri tankDetails'a da kaydet (diğer sistemlerle entegrasyon)
    const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    
    Object.keys(dataEntries).forEach(tankId => {
      if (!tankDetails[tankId]) {
        tankDetails[tankId] = { qualityParams: [] };
      }
      if (!tankDetails[tankId].qualityParams) {
        tankDetails[tankId].qualityParams = [];
      }

      // Her parametreyi ayrı kayıt olarak ekle
      Object.keys(dataEntries[tankId]).forEach(paramId => {
        if (dataEntries[tankId][paramId]) {
          const param = parameters.find(p => p.id === paramId);
          tankDetails[tankId].qualityParams.push({
            date: currentDate,
            time: new Date().toLocaleTimeString('tr-TR'),
            [paramId]: parseFloat(dataEntries[tankId][paramId]),
            parameterName: param?.label || paramId,
            source: 'İzleme Klasik',
            timestamp: new Date().toISOString()
          });
        }
      });
    });

    localStorage.setItem('tankDetails', JSON.stringify(tankDetails));
    
    // Formu temizle
    const initialData = {};
    activeTanks.forEach(tank => {
      initialData[tank.id] = {};
    });
    setDataEntries(initialData);

    alert(`✅ ${currentDate} tarihli ${activeTanks.length} tank verisi kaydedildi!`);
  };

  // Excel-benzeri export
  const exportToCSV = () => {
    if (savedData.length === 0) {
      alert('⚠️ Dışa aktarılacak veri yok!');
      return;
    }

    // CSV başlıkları
    let csv = 'Tarih,Tank,';
    csv += parameters.map(p => p.label).join(',') + '\n';

    // Veriler
    savedData.forEach(entry => {
      Object.keys(entry.data).forEach(tankId => {
        const tank = activeTanks.find(t => t.id === tankId);
        const tankName = tank ? (tank.customName || tank.id) : tankId;
        
        let row = `${entry.date},${tankName},`;
        row += parameters.map(p => entry.data[tankId][p.id] || '').join(',');
        csv += row + '\n';
      });
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chlorella_monitoring_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // CSV Import
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(l => l.trim());
        
        if (lines.length < 2) {
          alert('⚠️ CSV dosyası boş!');
          return;
        }

        // Başlıkları parse et
        const headers = lines[0].split(',');
        
        // Verileri parse et
        const importedData = {};
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',');
          const date = values[0];
          const tankId = values[1];
          
          if (!importedData[date]) {
            importedData[date] = {};
          }
          
          if (!importedData[date][tankId]) {
            importedData[date][tankId] = {};
          }
          
          // Parametreleri eşleştir
          for (let j = 2; j < values.length; j++) {
            const paramLabel = headers[j];
            const param = parameters.find(p => p.label === paramLabel);
            if (param && values[j]) {
              importedData[date][tankId][param.id] = values[j];
            }
          }
        }

        // savedData'ya ekle
        const newEntries = Object.keys(importedData).map(date => ({
          id: Date.now() + Math.random(),
          date: date,
          timestamp: new Date().toISOString(),
          data: importedData[date]
        }));

        const updated = [...newEntries, ...savedData];
        setSavedData(updated);
        localStorage.setItem('chlorellaMonitoringClassic', JSON.stringify(updated));
        
        alert(`✅ ${newEntries.length} kayıt başarıyla içe aktarıldı!`);
      } catch (error) {
        alert('⚠️ CSV dosyası okunamadı: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // JSON Export
  const exportToJSON = () => {
    if (savedData.length === 0) {
      alert('⚠️ Dışa aktarılacak veri yok!');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      dataType: 'MonitoringClassic',
      schema: {
        parameters: parameters.map(p => ({ id: p.id, label: p.label, type: p.type })),
        tanks: activeTanks.map(t => ({ id: t.id, customName: t.customName, volume: t.volume }))
      },
      data: savedData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chlorella_monitoring_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // JSON Import
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        if (importData.dataType !== 'MonitoringClassic') {
          alert('⚠️ Geçersiz veri formatı!');
          return;
        }

        const updated = [...importData.data, ...savedData];
        setSavedData(updated);
        localStorage.setItem('chlorellaMonitoringClassic', JSON.stringify(updated));
        
        alert(`✅ ${importData.data.length} kayıt başarıyla içe aktarıldı!`);
      } catch (error) {
        alert('⚠️ JSON dosyası okunamadı: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // JSON Şablon İndir
  const downloadJSONTemplate = () => {
    const template = {
      version: '1.0',
      dataType: 'MonitoringClassic',
      description: 'ChlorellaOS İzleme Klasik veri şablonu',
      schema: {
        parameters: parameters.map(p => ({ 
          id: p.id, 
          label: p.label, 
          type: p.type,
          step: p.step,
          description: `${p.label} parametresi için değer`
        })),
        tanks: activeTanks.map(t => ({ 
          id: t.id, 
          customName: t.customName || '', 
          volume: t.volume,
          description: `${t.volume}L tank`
        }))
      },
      instructions: {
        tr: 'Bu dosyayı doldurun ve "JSON İçe Aktar" ile yükleyin.',
        format: 'YYYY-MM-DD formatında tarih kullanın',
        example: {
          date: '2026-01-07',
          data: {
            [activeTanks[0]?.id || 'KA1']: {
              temp: '25.5',
              ph: '7.2',
              tds: '450'
            }
          }
        }
      },
      data: [
        {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          data: {}
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chlorella_monitoring_template.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Table className="w-10 h-10" />
          İzleme Klasik - Tablo Bazlı Veri Girişi
        </h2>
        <p className="text-indigo-100">
          Tüm tanklara günlük parametreleri hızlıca girin (Sıcaklık, pH, TDS, EC, vb.)
        </p>
      </div>

      {/* Tarih Seçici ve Aksiyonlar */}
      <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-indigo-600" />
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowParamSettings(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <Settings className="w-5 h-5" />
            Parametreler
          </button>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            CSV İçe Aktar
            <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
          </label>
          <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-5 h-5" />
            JSON İçe Aktar
            <input type="file" accept=".json" onChange={importFromJSON} className="hidden" />
          </label>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            CSV İndir
          </button>
          <button
            onClick={exportToJSON}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            JSON İndir
          </button>
          <button
            onClick={downloadJSONTemplate}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Şablon
          </button>
          <button
            onClick={saveAllData}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2 font-semibold"
          >
            <Save className="w-5 h-5" />
            Tümünü Kaydet
          </button>
        </div>
      </div>

      {/* Ana Tablo */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {activeTanks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Droplet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Henüz aktif tank yok. Tank sayfasından tank aktive edin.</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left font-bold border-b-2 border-gray-300 sticky left-0 bg-gray-100 z-10">
                  Tank
                </th>
                {visibleParameters.map(param => (
                  <th key={param.id} className="px-4 py-3 text-center font-semibold border-b-2 border-gray-300 min-w-[120px]">
                    {param.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTanks.map((tank, idx) => (
                <tr key={tank.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 font-bold border-r-2 border-gray-200 sticky left-0 z-10" style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                    <div>
                      <div className="text-gray-800">{tank.customName || tank.id}</div>
                      <div className="text-xs text-gray-500">{tank.volume}L • {tank.type}</div>
                    </div>
                  </td>
                  {visibleParameters.map(param => (
                    <td key={param.id} className="px-2 py-2 text-center">
                      <input
                        type={param.type}
                        step={param.step}
                        value={dataEntries[tank.id]?.[param.id] || ''}
                        onChange={(e) => updateValue(tank.id, param.id, e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="-"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Geçmiş Kayıtlar */}
      {savedData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Geçmiş Kayıtlar</h3>
          <div className="space-y-3">
            {savedData.slice(0, 10).map(entry => (
              <div key={entry.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-800">{entry.date}</span>
                  <span className="text-sm text-gray-500">
                    {Object.keys(entry.data).length} tank • {new Date(entry.timestamp).toLocaleTimeString('tr-TR')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {Object.keys(entry.data).map(tankId => {
                    const tank = activeTanks.find(t => t.id === tankId);
                    const dataCount = Object.keys(entry.data[tankId]).filter(k => entry.data[tankId][k]).length;
                    return (
                      <span key={tankId} className="inline-block mr-3 px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs">
                        {tank ? (tank.customName || tank.series || tankId) : tankId}: {dataCount} parametre
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Parametre Ayarları Modalı */}
      {showParamSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 rounded-t-xl">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <Settings className="w-7 h-7" />
                Parametre Görünürlük Ayarları
              </h3>
              <p className="text-gray-200 mt-2">Tabloda görmek istediğiniz parametreleri seçin</p>
            </div>

            <div className="p-6 space-y-3">
              {parameters.map(param => (
                <div key={param.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div>
                    <div className="font-semibold text-gray-800">{param.label}</div>
                    <div className="text-xs text-gray-500">Tip: {param.type} • Adım: {param.step}</div>
                  </div>
                  <button
                    onClick={() => toggleParamVisibility(param.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2 ${
                      visibleParams[param.id]
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                    }`}
                  >
                    {visibleParams[param.id] ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    {visibleParams[param.id] ? 'Görünür' : 'Gizli'}
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-xl flex gap-3">
              <button
                onClick={() => {
                  const allVisible = {};
                  parameters.forEach(p => { allVisible[p.id] = true; });
                  setVisibleParams(allVisible);
                  localStorage.setItem('monitoringClassicVisibility', JSON.stringify(allVisible));
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Tümünü Göster
              </button>
              <button
                onClick={() => {
                  const defaultVisibility = {};
                  parameters.forEach(p => { defaultVisibility[p.id] = p.defaultVisible; });
                  setVisibleParams(defaultVisibility);
                  localStorage.setItem('monitoringClassicVisibility', JSON.stringify(defaultVisibility));
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Varsayılana Dön
              </button>
              <button
                onClick={() => setShowParamSettings(false)}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-semibold"
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

export default MonitoringClassic;
