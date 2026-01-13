import React, { useState, useEffect } from 'react';
import { Activity, BookOpen, Camera, BarChart3, FlaskConical, Droplet, Syringe, ClipboardList, Table, Scan, AlertTriangle } from 'lucide-react';
import LabJournal from './LabJournal';
import PhotoGallery from './PhotoGallery';
import StatisticsGraphs from './StatisticsGraphs';
import Reports from './Reports';
import TankDetails from './TankDetails';
import FedBatchAssistant from './FedBatchAssistant';
import ChemicalDosageCalculator from './ChemicalDosageCalculator';
import MonitoringClassic from './MonitoringClassic';
import SpectroOD from './SpectroOD';
import MonitoringTab from '../tabs/MonitoringTab';
import RiskAssessment from './RiskAssessment';
import modelManager from '../managers/ModelManager';

/**
 * MONİTORİNG HUB - İZLEME MERKEZİ
 * =================================
 * Günlük izleme, veri girişi, analiz ve raporlama için tek merkez
 * 
 * ENTEGRE SİSTEM:
 * - Lab Defteri: Günlük kayıt, resim, olay
 * - Galeri: Mikroskop görüntüleri, tank fotoğrafları
 * - Tank Detay: Su kalitesi parametreleri (pH, sıcaklık, DO, iletkenlik)
 * - Fed-Batch Asistan: Model önerileri, dozaj hesaplama
 * - Parametre/Dozaj: Kimyasal dozaj hesaplayıcı
 * - Grafikler: İstatistiksel analiz, trend grafikleri
 * - Raporlar: Özet raporlar, export
 * 
 * VERİ AKIŞI:
 * TankDetails → Model → FedBatch → Müdahale → LabJournal
 * LabJournal → PhotoGallery → Reports
 * Model Tahminleri ↔ Gerçek Veriler (TankDetails)
 */
const MonitoringHub = () => {
  const [activeTab, setActiveTab] = useState('monitoring-classic'); // Varsayılan: Ölçüm Girişi
  const [selectedTank, setSelectedTank] = useState('');
  const [activeTanks, setActiveTanks] = useState([]);
  const [latestData, setLatestData] = useState({
    lastLabEntry: null,
    lastPhoto: null,
    lastParameter: null,
    lastIntervention: null
  });

  // Tank listesini yükle
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
      if (active.length > 0 && !selectedTank) {
        setSelectedTank(active[0].id);
      }
    }
  }, []);

  // Son verileri yükle (dashboard için)
  useEffect(() => {
    const loadLatestData = () => {
      try {
        // Lab Journal
        const labEntries = JSON.parse(localStorage.getItem('chlorellaLabJournal') || '[]');
        const lastLabEntry = labEntries.length > 0 ? labEntries[0] : null;

        // Photo Gallery
        const photos = JSON.parse(localStorage.getItem('chlorellaPhotos') || '[]');
        const lastPhoto = photos.length > 0 ? photos[0] : null;

        // Tank Details
        const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
        const tankData = selectedTank ? tankDetails[selectedTank] : null;
        const lastParameter = tankData?.qualityParams?.[tankData.qualityParams.length - 1] || null;

        // Interventions
        const interventions = JSON.parse(localStorage.getItem('interventions') || '[]');
        const tankInterventions = interventions.filter(i => i.tankId === selectedTank);
        const lastIntervention = tankInterventions.length > 0 ? tankInterventions[tankInterventions.length - 1] : null;

        setLatestData({
          lastLabEntry,
          lastPhoto,
          lastParameter,
          lastIntervention
        });
      } catch (error) {
        console.warn('Dashboard veri yükleme hatası:', error);
      }
    };

    loadLatestData();
    // Performans için 30 saniyeye çıkarıldı
    const interval = setInterval(loadLatestData, 30000);
    return () => clearInterval(interval);
  }, [selectedTank]);

  const tabs = [
    {
      id: 'monitoring-classic',
      label: 'Ölçüm Girişi',
      icon: Table,
      description: 'Tank İzleme, Risk Değerlendirmesi ve Lab Defteri',
      badge: '📊 Tümü Bir Arada'
    },
    {
      id: 'spectro-od',
      label: 'Spektro OD',
      icon: Scan,
      description: 'OD ölçümleri + Kalibrasyon',
      badge: '🌈'
    },
    {
      id: 'gallery',
      label: 'Galeri',
      icon: Camera,
      description: 'Mikroskop ve tank fotoğrafları',
      badge: latestData.lastPhoto ? `${JSON.parse(localStorage.getItem('chlorellaPhotos') || '[]').length} foto` : null
    },
    {
      id: 'tank-details',
      label: 'Tank Detay',
      icon: Droplet,
      description: 'Su kalitesi parametreleri',
      badge: latestData.lastParameter ? `pH ${latestData.lastParameter.ph}` : null
    },
    {
      id: 'fedbatch',
      label: 'Fed-Batch',
      icon: Syringe,
      description: 'Model önerileri, dozaj',
      badge: latestData.lastIntervention ? '🟢 Aktif' : null
    },
    {
      id: 'dosage',
      label: 'Parametre/Dozaj',
      icon: FlaskConical,
      description: 'Kimyasal dozaj hesaplama'
    },
    {
      id: 'graphs',
      label: 'Grafikler',
      icon: BarChart3,
      description: 'İstatistik, trend analizi'
    },
    {
      id: 'reports',
      label: 'Raporlar',
      icon: ClipboardList,
      description: 'Özet raporlar, export'
    }
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Başlık ve Tank Seçici */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Activity className="w-10 h-10" />
              İzleme Merkezi
            </h2>
            <p className="text-blue-100">
              Günlük veri girişi, analiz, model karşılaştırma ve raporlama
            </p>
          </div>

          {/* Tank Seçici */}
          <div className="bg-white/20 backdrop-blur rounded-lg p-4 min-w-[250px]">
            <label className="block text-sm font-medium mb-2">Aktif Tank</label>
            <select
              value={selectedTank}
              onChange={(e) => setSelectedTank(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 font-semibold"
            >
              <option value="">Tank seçin...</option>
              {activeTanks.map(tank => (
                <option key={tank.id} value={tank.id}>
                  {tank.id}{tank.series ? ` - Seri#${tank.series}` : ''} - {tank.formulationName || tank.medium || 'Besin yok'}{tank.customName ? ` - ${tank.customName}` : ''} ({tank.volume}L - {tank.category})
                </option>
              ))}
            </select>
            {selectedTank && (
              <p className="text-xs mt-2 text-white/80">
                {(() => {
                  const tank = activeTanks.find(t => t.id === selectedTank);
                  return tank ? `${tank.type} • ${tank.category}` : 'Tank bilgisi yok';
                })()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard (Hızlı Bilgi) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Son Lab Kaydı</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {latestData.lastLabEntry 
              ? new Date(latestData.lastLabEntry.timestamp).toLocaleDateString('tr-TR')
              : 'Kayıt yok'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-medium text-gray-700">Galeri</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {latestData.lastPhoto ? `${JSON.parse(localStorage.getItem('chlorellaPhotos') || '[]').length} foto` : '0 foto'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Droplet className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Son Parametre</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {latestData.lastParameter 
              ? `pH ${latestData.lastParameter.ph} / ${latestData.lastParameter.temp}°C`
              : 'Ölçüm yok'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Syringe className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Son Müdahale</span>
          </div>
          <p className="text-lg font-bold text-gray-900">
            {latestData.lastIntervention 
              ? new Date(latestData.lastIntervention.date).toLocaleDateString('tr-TR')
              : 'Müdahale yok'}
          </p>
        </div>
      </div>

      {/* Tab Navigasyon */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs font-bold
                    ${isActive ? 'bg-white/20' : 'bg-gray-300'}
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Tab Açıklama */}
        {activeTabData && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{activeTabData.label}:</strong> {activeTabData.description}
            </p>
          </div>
        )}
      </div>

      {/* Tab İçerik */}
      <div className="bg-gray-50 rounded-xl p-6">
        {activeTab === 'monitoring-classic' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-xl p-6 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Table className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-800">🔬 Tank İzleme & Günlük Ölçüm</h3>
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">3 Alt Sekme: Ölçüm Girişi, Risk Değerlendirmesi, Lab Defteri</span>
            </div>
            <MonitoringTab />
          </div>
        )}
        {activeTab === 'spectro-od' && <SpectroOD />}
        {activeTab === 'gallery' && <PhotoGallery tankId={selectedTank} />}
        {activeTab === 'tank-details' && <TankDetails preselectedTank={selectedTank} />}
        {activeTab === 'fedbatch' && <FedBatchAssistant tankId={selectedTank} />}
        {activeTab === 'dosage' && <ChemicalDosageCalculator tankId={selectedTank} />}
        {activeTab === 'graphs' && <StatisticsGraphs tankId={selectedTank} />}
        {activeTab === 'reports' && <Reports tankId={selectedTank} />}
      </div>

      {/* Entegrasyon Bilgisi */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-bold mb-3">🔗 Entegre Sistem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold mb-2">Veri Akışı:</p>
            <ul className="space-y-1 text-green-100">
              <li>• Tank Detay → Model → Fed-Batch → Müdahale</li>
              <li>• Lab Defteri → Galeri → Raporlar</li>
              <li>• Model Tahminleri ↔ Gerçek Veriler</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">Otomatik İşlemler:</p>
            <ul className="space-y-1 text-green-100">
              <li>• Tank parametreleri modele aktarılıyor</li>
              <li>• Model önerileri Fed-Batch'e gidiyor</li>
              <li>• Müdahaleler Lab Defterine kaydediliyor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringHub;
