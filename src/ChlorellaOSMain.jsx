import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, AlertTriangle, Beaker, BarChart3, Database, Calculator, DollarSign, Package, Flask, BookOpen, CalendarDays } from 'lucide-react';
import MonitoringTab from './tabs/MonitoringTab';
import NutrientCalculator from './components/NutrientCalculator';
import FeasibilityAnalysis from './components/FeasibilityAnalysis';
import TankManagement from './components/TankManagement';
import MaterialInventory from './components/MaterialInventory';
import MediumLibrary from './components/MediumLibrary';
import LabJournal from './components/LabJournal';
import ProductionPlanning from './components/ProductionPlanning';
import StockManagement from './components/StockManagement';
import simulationWorker from './workers/SimulationWorker';

const ChlorellaOSMain = () => {
  const [activeTab, setActiveTab] = useState('monitoring');
  const [workerStatus, setWorkerStatus] = useState({ isRunning: false });

  // SimulationWorker'ı başlat
  useEffect(() => {
    console.log('🚀 ChlorellaOS başlatılıyor...');
    
    // Worker durumunu kontrol et
    const status = simulationWorker.getStatus();
    setWorkerStatus(status);

    // Eğer localStorage'da active tanklar varsa worker'ı başlat
    const tanksData = localStorage.getItem('tankStates');
    if (tanksData) {
      try {
        const tanks = JSON.parse(tanksData);
        const activeTanks = tanks.filter(t => t.active);
        
        if (activeTanks.length > 0 && !status.isRunning) {
          console.log(`📊 ${activeTanks.length} aktif tank bulundu, SimulationWorker başlatılıyor...`);
          simulationWorker.start();
          setWorkerStatus({ ...status, isRunning: true });
        }
      } catch (error) {
        console.error('❌ Tank verisi yükleme hatası:', error);
      }
    }

    // Worker status güncellemelerini dinle
    const handleSimulationCompleted = (event) => {
      console.log('✅ Simülasyon tamamlandı:', event.detail);
      setWorkerStatus(simulationWorker.getStatus());
    };

    window.addEventListener('simulation-completed', handleSimulationCompleted);

    return () => {
      window.removeEventListener('simulation-completed', handleSimulationCompleted);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Beaker className="w-10 h-10 text-emerald-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">ChlorellaOS</h1>
                <p className="text-gray-600">Akıllı Üretim İzleme ve Stokiyometrik Besleme Sistemi</p>
              </div>
            </div>
            
            {/* Worker Status Indicator */}
            {workerStatus.isRunning && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">
                  Simülasyon Aktif ({workerStatus.activeTanks} tank)
                </span>
              </div>
            )}
          </div>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'monitoring'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              İzleme & Analiz
            </button>
            
            <button
              onClick={() => setActiveTab('nutrients')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'nutrients'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Besin Yeri Hazırlama
            </button>
            
            <button
              onClick={() => setActiveTab('tanks')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'tanks'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Database className="w-5 h-5" />
              Tank Yönetimi
            </button>
            
            <button
              onClick={() => setActiveTab('feasibility')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'feasibility'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="w-5 h-5" />
              Fizibilite & Maliyet
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'materials'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-5 h-5" />
              Malzeme/Maliyet
            </button>

            <button
              onClick={() => setActiveTab('mediums')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'mediums'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Flask className="w-5 h-5" />
              Besin Yeri Kütüphanesi
            </button>

            <button
              onClick={() => setActiveTab('journal')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'journal'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Lab Defteri
            </button>

            <button
              onClick={() => setActiveTab('planning')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'planning'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              Üretim Planlama
            </button>

            <button
              onClick={() => setActiveTab('stocks')}
              className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${
                activeTab === 'stocks'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Package className="w-5 h-5" />
              Stok Yönetimi
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'monitoring' && <MonitoringTab />}
          {activeTab === 'nutrients' && <NutrientCalculator />}
          {activeTab === 'tanks' && <TankManagement />}
          {activeTab === 'feasibility' && <FeasibilityAnalysis />}
          {activeTab === 'materials' && <MaterialInventory />}
          {activeTab === 'mediums' && <MediumLibrary />}
          {activeTab === 'journal' && <LabJournal />}
          {activeTab === 'planning' && <ProductionPlanning />}
          {activeTab === 'stocks' && <StockManagement />}
        </div>

        <div className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">🧬 Stokiyometrik Prensip</h3>
            <p className="text-emerald-50">
              &quot;Yenen = Eklenen&quot; dengesini kur. Artığı hesapla. Körlemesine değil, bilimsel besle.
            </p>
            <div className="mt-4 text-sm text-emerald-100">
              Kalibrasyon: Spektrofotometre ile Abs→Biyokütle (g/L) dönüşümünü kalibre edin.
              <br />
              TAN ve TP kitleriyle haftalık doğrulama yapın.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChlorellaOSMain;
