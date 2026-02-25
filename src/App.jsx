import React, { useState, useEffect } from 'react';
import { Beaker, BarChart3, Calculator, Database, DollarSign, Package, BookOpen, TrendingUp, Camera, LineChart, FileText, Activity, Microscope, HelpCircle, Scale, Scan, User, GraduationCap, FlaskConical, ShoppingCart, Syringe } from 'lucide-react';
import { MaterialsProvider } from './contexts/MaterialsContext';
import { EnforcedChlorellaSystemProvider } from './contexts/EnforcedChlorellaSystemContext';
import simulationWorker from './workers/SimulationWorker';
import ToastContainer from './components/ToastNotification';
import MonitoringHub from './components/MonitoringHub';
import MonitoringTab from './tabs/MonitoringTab';
import BesinYeriPage from './components/BesinYeriPage';
import TankManagement from './components/TankManagement';
import FeasibilityAnalysis from './components/FeasibilityAnalysis';
import MaterialInventory from './components/MaterialInventory';
import ShoppingList from './components/ShoppingList';
import LabJournal from './components/LabJournal';
import ProductionPlanning from './components/ProductionPlanning';
import PhotoGallery from './components/PhotoGallery';
import StatisticsGraphs from './components/StatisticsGraphs';
import Reports from './components/Reports';
import TankDetails from './components/TankDetails';
import FormulationManager from './components/FormulationManager';
import CultureModeling from './components/CultureModeling';
import UserGuide from './components/UserGuide';
import ScaleUpCalculator from './components/ScaleUpCalculator';
import SpectroCalculator from './components/SpectroCalculator';
import UserSystemManager from './components/UserSystemManager';
import LearningCenter from './components/LearningCenter';
import CustomFormulationManager from './components/CustomFormulationManager';
import ChemicalDosageCalculator from './components/ChemicalDosageCalculator';
import CellCountingV2 from './components/CellCountingV2';
import FedBatchAssistant from './components/FedBatchAssistant';
import { ensureDocumentDatabaseIntegration } from './utils/documentDatabaseIntegrator';

function App() {
  const [activeTab, setActiveTab] = useState('monitoring-hub');

  // 🔥 OTOM ATİK SİMÜLASYON BAŞLAT - 5 DAKİKA İNTERVAL
  useEffect(() => {
    console.log('🚀 ChlorellaOS başlatılıyor - SimulationWorker aktive ediliyor...');

    try {
      const integrationSummary = ensureDocumentDatabaseIntegration();
      console.log('📚 Belge tabanlı DB entegrasyonu tamamlandı:', integrationSummary);
    } catch (integrationError) {
      console.warn('⚠️ Belge tabanlı DB entegrasyonu tamamlanamadı:', integrationError);
    }
    
    // Simulation Worker'ı başlat (5 dakikada bir çalışacak)
    simulationWorker.start().catch(err => {
      console.error('❌ SimulationWorker başlatılamadı:', err);
    });

    // Cleanup: Uygulama kapanırken durdur
    return () => {
      simulationWorker.stop();
      console.log('🛑 SimulationWorker durduruldu');
    };
  }, []);

  return (
    <EnforcedChlorellaSystemProvider>
    <MaterialsProvider>
    <ToastContainer />
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Beaker className="w-10 h-10 text-emerald-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ChlorellaOS</h1>
              <p className="text-gray-600">Akıllı Üretim İzleme Sistemi</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('monitoring-hub')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-xl ${activeTab === 'monitoring-hub' ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white' : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 hover:from-blue-200 hover:to-purple-200'}`}>
              <Activity className="w-5 h-5" />İzleme Merkezi ⭐
            </button>
            <button onClick={() => setActiveTab('besinyeri')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'besinyeri' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Calculator className="w-5 h-5" />Besin Yeri
            </button>
            <button onClick={() => setActiveTab('tanks')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'tanks' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Database className="w-5 h-5" />Tanklar
            </button>
            <button onClick={() => setActiveTab('feasibility')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'feasibility' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <DollarSign className="w-5 h-5" />Fizibilite
            </button>
            <button onClick={() => setActiveTab('materials')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'materials' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Package className="w-5 h-5" />Malzeme
            </button>
            <button onClick={() => setActiveTab('shopping')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'shopping' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <ShoppingCart className="w-5 h-5" />Alışveriş
            </button>
            <button onClick={() => setActiveTab('production')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'production' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <TrendingUp className="w-5 h-5" />Üretim Planı
            </button>
            <button onClick={() => setActiveTab('cellcountingv2')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-xl ${activeTab === 'cellcountingv2' ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white' : 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 hover:from-cyan-200 hover:to-blue-200'}`}>
              <Microscope className="w-5 h-5" />🔬 Hücre Sayım ⭐
            </button>
            <button onClick={() => setActiveTab('formulations')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'formulations' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Beaker className="w-5 h-5" />Formülasyonlar
            </button>
            <button onClick={() => setActiveTab('modeling')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'modeling' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Activity className="w-5 h-5" />Modelleme
            </button>
            <button onClick={() => setActiveTab('guide')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'guide' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <HelpCircle className="w-5 h-5" />Kullanım Kılavuzu
            </button>
            <button onClick={() => setActiveTab('scaleup')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'scaleup' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Scale className="w-5 h-5" />Scale-Up
            </button>
            <button onClick={() => setActiveTab('spectro')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'spectro' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <Scan className="w-5 h-5" />Spektrofotometre
            </button>
            <button onClick={() => setActiveTab('usersystem')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'usersystem' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              <User className="w-5 h-5" />Kullanıcı
            </button>
            <button onClick={() => setActiveTab('learning')} className={`px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 ${activeTab === 'learning' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}>
              <GraduationCap className="w-5 h-5" />Öğrenme Merkezi
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {activeTab === 'monitoring-hub' && <MonitoringHub />}
          {activeTab === 'besinyeri' && <BesinYeriPage />}
          {activeTab === 'tanks' && <TankManagement />}
          {activeTab === 'feasibility' && <FeasibilityAnalysis />}
          {activeTab === 'materials' && <MaterialInventory />}
          {activeTab === 'shopping' && <ShoppingList />}
          {activeTab === 'production' && <ProductionPlanning />}
          {activeTab === 'formulations' && <FormulationManager />}
          {activeTab === 'modeling' && <CultureModeling />}
          {activeTab === 'guide' && <UserGuide />}
          {activeTab === 'scaleup' && <ScaleUpCalculator />}
          {activeTab === 'spectro' && <SpectroCalculator />}
          {activeTab === 'usersystem' && <UserSystemManager />}
          {activeTab === 'learning' && <LearningCenter />}
          {activeTab === 'cellcountingv2' && <CellCountingV2 />}
        </div>
      </div>
    </div>
    </MaterialsProvider>
    </EnforcedChlorellaSystemProvider>
  );
};

export default App;
