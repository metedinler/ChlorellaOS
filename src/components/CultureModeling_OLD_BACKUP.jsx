import React, { useState, useEffect, useMemo } from 'react';
import { Activity, TrendingUp, AlertTriangle, RefreshCw, Play, Pause, Settings, Beaker, Droplet, Sun, BarChart3 } from 'lucide-react';
import ChlorellaModel from '../utils/ChlorellaModel';  // 🔧 FIX: default import kullan
import { getInterventionsByTank, getFedbatchInterventions } from '../utils/interventionManager';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MEDIA_DATABASE } from '../data/mediaDatabase';

const CultureModeling = () => {
  const [tanks, setTanks] = useState([]);
  const [selectedTank, setSelectedTank] = useState(null);
  const [model, setModel] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [predictionDays, setPredictionDays] = useState(7);
  const [modelParams, setModelParams] = useState({
    volume: 2.0,
    initialBiomass: 0.1,
    initialN: 100,
    initialP: 10,
    lightIntensity: 5000,
    temperature: 28,
    pH: 7.5
  });

  // Aktif tankları yükle
  useEffect(() => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setTanks(active);
      if (active.length > 0 && !selectedTank) {
        setSelectedTank(active[0].id);
      }
    }
  }, []);

  // Besin yeri analizi - N, P, mikronutrient hesapla
  const calculateNutrientsFromMedium = (mediumData) => {
    if (!mediumData) return { N: 100, P: 10, K: 0, CO2: 20 };
    
    const nutrients = { N: 0, P: 0, K: 0, CO2: 20, S: 0, Mg: 0, Ca: 0, Fe: 0 };
    
    // MEDIA_DATABASE formatı
    if (mediumData.composition?.macronutrients) {
      const macro = mediumData.composition.macronutrients;
      nutrients.N = macro.N?.provides || 0;
      nutrients.P = macro.P?.provides || 0;
      nutrients.K = macro.K?.provides || 0;
      nutrients.S = macro.S?.provides || 0;
      nutrients.Mg = macro.Mg?.provides || 0;
      nutrients.Ca = macro.Ca?.provides || 0;
    }
    
    // Formülasyon formatı (customFormulations)
    if (mediumData.stocks) {
      mediumData.stocks.forEach(stock => {
        stock.chemicals?.forEach(chem => {
          const formula = chem.formula || '';
          // Basit element çıkarma
          if (formula.includes('NO3') || formula.includes('NH4')) nutrients.N += chem.amount * 0.14;
          if (formula.includes('PO4')) nutrients.P += chem.amount * 0.31;
          if (formula.includes('CO3') || formula.includes('HCO3')) nutrients.CO2 += chem.amount * 0.5;
        });
      });
    }
    
    return nutrients;
  };

  // Tank seçildiğinde model oluştur veya yükle
  useEffect(() => {
    if (selectedTank) {
      const tank = tanks.find(t => t.id === selectedTank);
      if (!tank) return;
      
      // 📥 ÖNCEKİ MODEL DURUMUNU YÜKLE
      const savedState = localStorage.getItem(`modelState_${selectedTank}`);
      
      if (savedState) {
        console.log(`🔄 Model durumu yükleniyor: ${selectedTank}`);
        try {
          const state = JSON.parse(savedState);
          const restoredModel = new ChlorellaModel(state.params);
          
          // Durumu geri yükle
          restoredModel.currentBiomass = state.current.biomass;
          restoredModel.currentN = state.current.N;
          restoredModel.currentP = state.current.P;
          restoredModel.currentCO2 = state.current.CO2;
          restoredModel.currentDay = state.current.day;
          restoredModel.history = state.history;
          restoredModel.interventions = state.interventions || [];
          
          setModel(restoredModel);
          setModelParams(state.params);
          console.log(`✅ Model gün ${state.current.day}'den devam ediyor`);
          return;
        } catch (error) {
          console.error('❌ Model durumu yüklenemedi:', error);
        }
      }
      
      // 🆕 YENİ MODEL OLUŞTUR - TANK AKTİVASYON VERİLERİYLE
      console.log(`🆕 Yeni model oluşturuluyor: ${selectedTank}`);
      
      // TankDetails'den son parametreleri al
      const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
      const tankData = tankDetails[selectedTank] || {};
      const lastParam = tankData.qualityParams?.[tankData.qualityParams.length - 1];
      
      // Tank aktivasyon parametreleri
      const initParams = tank.initialParams || {};
      
      // Besin yeri analizi
      let mediumData = null;
      let nutrients = { N: 100, P: 10, CO2: 20 };
      
      if (tank.formulationId) {
        // Özel formülasyon
        const formulations = JSON.parse(localStorage.getItem('customFormulations') || '[]');
        mediumData = formulations.find(f => f.id === tank.formulationId);
        console.log(`📋 Formülasyon: ${mediumData?.name}`);
      } else if (tank.medium) {
        // Standart besin yeri
        mediumData = Object.values(MEDIA_DATABASE).find(m => m.name === tank.medium);
        console.log(`🧪 Standart besin yeri: ${tank.medium}`);
      }
      
      if (mediumData) {
        nutrients = calculateNutrientsFromMedium(mediumData);
        console.log(`🧬 Besin analizi:`, nutrients);
      }
      
      // Model parametreleri - TANK VERİLERİNDEN
      // 🔥 FIX: density değeri çok büyükse 0.1-10 aralığına çek
      let biomass = initParams.density || 0.1;
      if (biomass > 10) {
        console.warn(`⚠️ InitParams.density çok yüksek (${biomass}), 0.1'e düşürülüyor`);
        biomass = 0.1;
      }
      
      const params = {
        volume: tank.volume,
        initialBiomass: biomass,
        initialN: nutrients.N || initParams.nitrate || tankData.nutrients?.nitrogen || 100,
        initialP: nutrients.P || initParams.totalPhosphorus || tankData.nutrients?.phosphorus || 10,
        initialCO2: nutrients.CO2 || 20,
        initialTAN: initParams.TAN || 0,
        initialO2: initParams.DO || 8,
        lightIntensity: initParams.lightIntensity || 5000,
        temperature: lastParam?.temp || initParams.temp || 28,
        pH: lastParam?.ph || initParams.pH || 7.5,
        alkalinity: initParams.alkalinity || 50,
        EC: initParams.conductivity || 64,
        μmax: 0.15,
        Ks_N: 5.0,
        Ks_P: 0.5,
        Ks_CO2: 2.0
      };
      
      console.log(`⚙️ Model parametreleri:`, params);
      
      setModelParams(params);
      const newModel = new ChlorellaModel(params);
      
      // Müdahaleleri yükle
      const interventions = getFedbatchInterventions(selectedTank, 
        new Date(Date.now() - 30*24*60*60*1000).toISOString(), 
        new Date().toISOString()
      );
      
      interventions.forEach(int => {
        newModel.addIntervention(1, int.nutrient, int.amount);
      });
      
      // GERÇEK VERİ VARSA KALİBRE ET
      if (tankData.cellCounts && tankData.cellCounts.length > 0) {
        const realData = tankData.cellCounts.map(cc => {
          const daysSince = tank.startDate ? 
            Math.floor((new Date(cc.timestamp) - new Date(tank.startDate)) / (1000 * 60 * 60 * 24)) : 0;
          return {
            day: daysSince,
            biomass: cc.cellsPerMl / 1e8  // cells/ml → g/L yaklaşık
          };
        }).filter(d => d.day >= 0);
        
        if (realData.length > 0) {
          console.log(`📊 Kalibrasyon yapılıyor (${realData.length} veri noktası)`);
          newModel.calibrateWithRealData(realData);
        }
      }
      
      setModel(newModel);
      console.log(`✅ Model hazır - ${tank.id}`);
    }
  }, [selectedTank, tanks]);

  // Model durumunu kaydet
  useEffect(() => {
    if (model && model.history.length > 1) {
      const state = model.exportState();
      localStorage.setItem(`modelState_${selectedTank}`, JSON.stringify(state));
      console.log(`💾 Model durumu kaydedildi: Gün ${model.currentDay}`);
    }
  }, [model?.currentDay, selectedTank]);

  // TankDetails veri girişi dinle
  useEffect(() => {
    const handleDataUpdate = (e) => {
      if (e.detail.tankId === selectedTank && model) {
        console.log(`📥 Yeni veri alındı:`, e.detail.type);
        
        if (e.detail.type === 'cellCount') {
          // Gerçek hücre sayımı
          const realData = [{
            day: e.detail.data.day,
            biomass: e.detail.data.biomass
          }];
          
          model.calibrateWithRealData(realData);
          console.log(`🔄 Model kalibre edildi - Gerçek: ${e.detail.data.biomass.toFixed(3)} g/L`);
        } else if (e.detail.type === 'qualityParam') {
          // pH, sıcaklık güncelle
          if (e.detail.data.ph) model.pH = e.detail.data.ph;
          if (e.detail.data.temp) model.temperature = e.detail.data.temp;
          console.log(`🌡️ Parametreler güncellendi - pH: ${model.pH}, Temp: ${model.temperature}°C`);
        } else if (e.detail.type === 'nutrient') {
          // Besin elementi güncelle
          if (e.detail.data.nitrogen) model.currentN = e.detail.data.nitrogen;
          if (e.detail.data.phosphorus) model.currentP = e.detail.data.phosphorus;
          console.log(`🧪 Besinler güncellendi - N: ${model.currentN.toFixed(1)}, P: ${model.currentP.toFixed(1)} mg/L`);
        } else if (e.detail.type === 'intervention') {
          // 🔥 pH MÜDAHALESİ
          if (e.detail.data.interventionType === 'pH') {
            model.pH = e.detail.data.phAfter;
            model.interventions.push({
              day: model.currentDay,
              type: 'pH',
              chemical: e.detail.data.chemical,
              phBefore: e.detail.data.phBefore,
              phAfter: e.detail.data.phAfter,
              volume: e.detail.data.volume,
              timestamp: e.detail.data.timestamp
            });
            console.log(`💊 pH müdahalesi uygulandı: ${e.detail.data.phBefore} → ${e.detail.data.phAfter}`);
          }
        }
        
        setModel({ ...model });
      }
    };
    
    window.addEventListener('tankDataUpdate', handleDataUpdate);
    return () => window.removeEventListener('tankDataUpdate', handleDataUpdate);
  }, [selectedTank, model]);

  // Simülasyon başlat - KALDIĞI YERDEN DEVAM ET
  const runSimulation = (days) => {
    console.log('🔵 runSimulation çağrıldı!', { model: !!model, days });
    if (!model) {
      alert('⚠️ Model henüz oluşturulmadı! Lütfen bir tank seçin.');
      return;
    }
    
    setIsRunning(true);
    const startDay = model.currentDay;
    console.log(`▶️ Simülasyon başlıyor: Gün ${startDay} → ${startDay + days}`);
    
    // ❌ model.reset(); // ARTIK SIFIRLAMA YOK!
    model.simulate(days);
    setModel({ ...model });  // Force re-render
    
    console.log(`✅ Simülasyon tamamlandı: Gün ${model.currentDay}`);
    setIsRunning(false);
  };

  // 🔥 ZAMAN BAZLI SİMÜLASYON - TÜM GERÇEKVERİLERİ KULLANARAK
  const runTimeBasedSimulation = () => {
    console.log('🟠 runTimeBasedSimulation çağrıldı!', { model: !!model, selectedTank });
    if (!model || !selectedTank) {
      alert('⚠️ Model veya tank seçilmedi!');
      return;
    }

    setIsRunning(true);
    console.log(`🕐 ZAMAN BAZLI SİMÜLASYON BAŞLIYOR - Tank: ${selectedTank}`);

    try {
      // Gerçek verileri yükle
      const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
      const tankData = tankDetails[selectedTank];

      if (!tankData) {
        alert('⚠️ Tank verisi bulunamadı!');
        return;
      }

      // Tüm olayları kronolojik sıralama
      const events = [];

      // 1. Kalite parametreleri (pH, sıcaklık)
      if (tankData.qualityParams) {
        tankData.qualityParams.forEach(param => {
          events.push({
            timestamp: new Date(param.timestamp || param.date).getTime(),
            type: 'qualityParam',
            data: param
          });
        });
      }

      // 2. pH Müdahaleleri
      if (tankData.interventions) {
        tankData.interventions.forEach(intervention => {
          events.push({
            timestamp: new Date(intervention.timestamp).getTime(),
            type: 'intervention',
            data: intervention
          });
        });
      }

      // 3. Hücre sayımları
      if (tankData.cellCounts) {
        tankData.cellCounts.forEach(count => {
          events.push({
            timestamp: new Date(count.timestamp || count.date).getTime(),
            type: 'cellCount',
            data: count
          });
        });
      }

      // 4. Besin eklemeleri
      if (tankData.nutrients) {
        Object.entries(tankData.nutrients).forEach(([element, value]) => {
          events.push({
            timestamp: Date.now(), // Şimdilik mevcut zaman
            type: 'nutrient',
            data: { element, value }
          });
        });
      }

      // Zaman sırasına göre sırala
      events.sort((a, b) => a.timestamp - b.timestamp);

      console.log(`📊 ${events.length} olay bulundu, sıralanıyor...`);

      // Tank başlangıç tarihini al
      const tankStates = JSON.parse(localStorage.getItem('tankStates') || '[]');
      const tank = tankStates.find(t => t.id === selectedTank);
      const startTime = tank?.startDate ? new Date(tank.startDate).getTime() : Date.now();

      // Model'i sıfırla (baştan başla)
      model.reset();
      
      let lastSimulatedDay = 0;

      // Her olayı uygula
      events.forEach((event, idx) => {
        const daysSinceStart = (event.timestamp - startTime) / (1000 * 60 * 60 * 24);
        const currentDay = Math.floor(daysSinceStart);

        // Bu olaya kadar simüle et
        if (currentDay > lastSimulatedDay) {
          const daysToSimulate = currentDay - lastSimulatedDay;
          console.log(`⏩ ${lastSimulatedDay} → ${currentDay} gün simüle ediliyor...`);
          model.simulate(daysToSimulate);
          lastSimulatedDay = currentDay;
        }

        // Olayı uygula
        if (event.type === 'qualityParam') {
          model.pH = parseFloat(event.data.ph);
          model.temperature = parseFloat(event.data.temp);
          console.log(`📥 Gün ${currentDay}: pH=${event.data.ph}, Temp=${event.data.temp}°C`);
        } else if (event.type === 'intervention') {
          model.pH = parseFloat(event.data.phAfter);
          model.interventions.push({
            day: currentDay,
            type: 'pH',
            phBefore: event.data.phBefore,
            phAfter: event.data.phAfter
          });
          console.log(`💊 Gün ${currentDay}: pH müdahale ${event.data.phBefore} → ${event.data.phAfter}`);
        } else if (event.type === 'cellCount') {
          const biomass = event.data.cellsPerMl / 1e8;
          model.calibrateWithRealData([{ day: currentDay, biomass }]);
          console.log(`🔬 Gün ${currentDay}: Kalibrasyon ${biomass.toFixed(3)} g/L`);
        } else if (event.type === 'nutrient') {
          if (event.data.element === 'nitrogen') model.currentN = event.data.value;
          if (event.data.element === 'phosphorus') model.currentP = event.data.value;
          console.log(`🧪 Gün ${currentDay}: ${event.data.element} = ${event.data.value} mg/L`);
        }
      });

      // Son güne kadar simüle et (bugün)
      const todayDay = Math.floor((Date.now() - startTime) / (1000 * 60 * 60 * 24));
      if (todayDay > lastSimulatedDay) {
        console.log(`⏩ ${lastSimulatedDay} → ${todayDay} gün (son) simüle ediliyor...`);
        model.simulate(todayDay - lastSimulatedDay);
      }

      setModel({ ...model });
      console.log(`✅ ZAMAN BAZLI SİMÜLASYON TAMAM! Toplam ${model.currentDay} gün`);
      alert(`✅ Simülasyon tamamlandı!\n\n${events.length} olay işlendi\nToplam ${model.currentDay} gün simüle edildi`);

    } catch (error) {
      console.error('❌ Zaman bazlı simülasyon hatası:', error);
      alert(`❌ Simülasyon hatası:\n${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Tahmin yap
  const runPrediction = () => {
    console.log('🟢 runPrediction çağrıldı!', { model: !!model, predictionDays });
    if (!model) {
      alert('⚠️ Model henüz oluşturulmadı! Lütfen bir tank seçin.');
      return;
    }
    
    setIsRunning(true);
    try {
      model.reset();
      model.simulate(5);  // Mevcut duruma kadar simüle et
      model.predictNextDays(predictionDays);
      setModel({ ...model });  // Force re-render
    } catch (error) {
      console.error('Tahmin hatası:', error);
      alert('Tahmin sırasında bir hata oluştu. Lütfen parametreleri kontrol edin.');
    } finally {
      setIsRunning(false);
    }
  };

  // Model durumu
  const currentState = model?.history[model.history.length - 1] || {};
  
  // 🔥 B+++ ALTERNATİFLİ BESLENME ÖNERİLERİ
  const selectedTankData = tanks.find(t => t.id === selectedTank);
  const tankVolume = selectedTankData?.initialParams?.volume || 1000; // Varsayılan 1000L
  const suggestions = (model && typeof model.suggestIntervention === 'function') 
    ? model.suggestIntervention(tankVolume) 
    : [];
  
  const risks = (model && typeof model.assessRisks === 'function')
    ? model.assessRisks()
    : [];

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4">
          <Activity className="w-12 h-12" />
          <div>
            <h2 className="text-3xl font-bold">Kültür Modelleme V3</h2>
            <p className="text-purple-100">Monod kinetik model - Büyüme tahmini ve müdahale önerileri</p>
          </div>
        </div>
      </div>

      {/* Tank Seçimi */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-medium mb-2">Tank Seçin</label>
        <select
          value={selectedTank || ''}
          onChange={(e) => setSelectedTank(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        >
          {tanks.length > 0 ? (
            tanks.map(tank => {
              const mediumName = tank.formulationName || tank.medium || 'Besin yok';
              const displayText = `${tank.id}${tank.series ? ` - Seri#${tank.series}` : ''} - ${mediumName}${tank.customName ? ` - ${tank.customName}` : ''} (${tank.volume}L - ${tank.category})`;
              return (
                <option key={tank.id} value={tank.id}>
                  {displayText}
                </option>
              );
            })
          ) : (
            <option value="" disabled>Aktif tank yok</option>
          )}
        </select>
      </div>

      {/* Kontrol Paneli */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          Model Parametreleri
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Başlangıç Biyokütle (g/L)</label>
            <input
              type="number"
              step="0.01"
              value={modelParams.initialBiomass}
              onChange={(e) => setModelParams({ ...modelParams, initialBiomass: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Başlangıç N (mg/L)</label>
            <input
              type="number"
              value={modelParams.initialN}
              onChange={(e) => setModelParams({ ...modelParams, initialN: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Başlangıç P (mg/L)</label>
            <input
              type="number"
              value={modelParams.initialP}
              onChange={(e) => setModelParams({ ...modelParams, initialP: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Işık (lux)</label>
            <input
              type="number"
              value={modelParams.lightIntensity}
              onChange={(e) => setModelParams({ ...modelParams, lightIntensity: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-4 flex-wrap">
          <button
            type="button"
            onClick={() => runSimulation(10)}
            disabled={isRunning || !model}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Çalışıyor...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                10 Gün Simüle Et
              </>
            )}
          </button>

          {/* 🔥 ZAMAN BAZLI SİMÜLASYON BUTONU */}
          <button
            type="button"
            onClick={runTimeBasedSimulation}
            disabled={!model || isRunning}
            className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition disabled:bg-gray-300 flex items-center gap-2 font-bold"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                İşleniyor...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                🕐 TÜM VERİLERLE SİMÜLE ET
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={runPrediction}
            disabled={!model || isRunning}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:bg-gray-300 flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Hesaplanıyor...
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                {predictionDays} Gün Tahmin
              </>
            )}
          </button>
          
          <button
            onClick={() => model?.reset()}
            disabled={!model || isRunning}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sıfırla
          </button>
        </div>
      </div>

      {/* Mevcut Durum */}
      {model && model.history.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 Mevcut Durum (Gün {currentState.day})</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Beaker className="w-4 h-4" />
                Biyokütle
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                {currentState.biomass?.toFixed(2)} g/L
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Azot (N)</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentState.N?.toFixed(1)} mg/L
              </p>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Fosfor (P)</p>
              <p className="text-2xl font-bold text-orange-600">
                {currentState.P?.toFixed(1)} mg/L
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Büyüme Hızı (μ)</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentState.μ?.toFixed(3)} /gün
              </p>
            </div>
          </div>

          {currentState.limitingFactor && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-800">
                ⚠️ Sınırlayıcı Faktör: <span className="text-lg">{currentState.limitingFactor}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Müdahale Önerileri */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            🧪 Müdahale Önerileri (Gerçek Stok Bazlı)
          </h3>
          
          <div className="space-y-4">
            {suggestions.map((sug, idx) => (
              <div key={idx} className={`p-5 rounded-lg border-2 ${
                sug.urgency === 'critical' ? 'bg-red-50 border-red-400' :
                sug.urgency === 'high' ? 'bg-orange-50 border-orange-300' : 
                'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">📅 Gün {sug.day}</p>
                    <p className="text-sm text-gray-600 mt-1">{sug.reason}</p>
                    {sug.suggestedAmount && (
                      <p className="text-sm text-emerald-600 font-semibold mt-2">
                        🎯 Hedef: {sug.suggestedAmount} mg/L {sug.nutrient} artışı
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    sug.urgency === 'critical' ? 'bg-red-200 text-red-800' :
                    sug.urgency === 'high' ? 'bg-orange-200 text-orange-800' : 
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {sug.urgency === 'critical' ? 'KRİTİK' : sug.urgency === 'high' ? 'ACİL' : 'ORTA'}
                  </span>
                </div>

                {/* 🔥 ALTERNATİF STOK ÇÖZELTİ TARİFLERİ */}
                {sug.alternatives && sug.alternatives.length > 0 && (
                  <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-3">💊 Stok Çözelti Alternatifleri:</p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {sug.alternatives.slice(0, 5).map((alt, altIdx) => (
                        <div key={altIdx} className={`p-4 rounded-lg border-2 ${
                          alt.sufficient ? 'bg-green-50 border-green-400' : 
                          alt.inStock ? 'bg-yellow-50 border-yellow-400' : 
                          'bg-gray-50 border-gray-300'
                        }`}>
                          {/* Başlık */}
                          <div className="flex justify-between items-center mb-3">
                            <p className="font-bold text-base text-gray-800">
                              {altIdx + 1}. {alt.chemical} {alt.formula && `(${alt.formula})`}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              alt.sufficient ? 'bg-green-200 text-green-800' : 
                              alt.inStock ? 'bg-yellow-200 text-yellow-800' : 
                              'bg-gray-200 text-gray-800'
                            }`}>
                              {alt.sufficient ? '✓ YETERLİ' : alt.inStock ? '⚠️ AZ' : '❌ YOK'}
                            </span>
                          </div>

                          {/* Element İçeriği */}
                          <p className="text-xs text-gray-600 mb-3">
                            {alt.nContent && `🔵 Azot içeriği: ${alt.nContent.toFixed(2)}%`}
                            {alt.pContent && `🟣 Fosfor içeriği: ${alt.pContent.toFixed(2)}%`}
                            {' • '}
                            Stokta: {alt.stockAmount} {alt.stockUnit}
                          </p>

                          {/* STOK ÇÖZELTİ TARİFİ */}
                          <div className="bg-white p-3 rounded border border-gray-300">
                            <p className="text-xs font-semibold text-purple-700 mb-2">📋 STOK ÇÖZELTİ HAZIRLAYIN:</p>
                            <div className="space-y-1 text-xs">
                              <p className="text-gray-700">1️⃣ {alt.stockSolution.preparation}</p>
                              <p className="text-gray-700">2️⃣ Konsantrasyon: <span className="font-semibold text-blue-600">{alt.stockSolution.concentration}</span></p>
                              <p className="text-gray-700">3️⃣ <span className="font-bold text-green-700">{alt.stockSolution.usage}</span></p>
                            </div>
                          </div>

                          {/* DOĞRUDAN KULLANIM */}
                          <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 mb-1">⚡ VEYA DOĞRUDAN:</p>
                            <p className="text-xs text-gray-700">{alt.directUse.instruction}</p>
                          </div>

                          {/* Maliyet (sadece listede) */}
                          {alt.cost !== 'N/A' && (
                            <p className="text-xs text-gray-500 mt-2 text-right">
                              💰 Maliyet: ~{alt.cost} {alt.currency}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    {sug.alternatives.length > 5 && (
                      <p className="text-xs text-gray-500 mt-2">
                        +{sug.alternatives.length - 5} alternatif daha (stokta olmayabilir)
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Değerlendirmesi */}
      {risks.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            ⚠️ Risk Analizi
          </h3>
          
          <div className="space-y-3">
            {risks.map((risk, idx) => (
              <div key={idx} className={`p-4 rounded-lg border-2 ${
                risk.severity === 'high' ? 'bg-red-50 border-red-300' : 'bg-orange-50 border-orange-300'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-800">{risk.message}</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    risk.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                  }`}>
                    {risk.severity === 'high' ? 'YÜKSEK' : 'ORTA'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">💡 {risk.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Simülasyon Tablosu */}
      {model && model.history.length > 1 && (
        <>
          {/* GRAFİKLER */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              📈 Büyüme ve Besin Grafikleri
            </h3>
            
            {/* Biyokütle Grafiği */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-gray-700">Biyokütle Gelişimi (g/L)</h4>
              <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={model.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Gün', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'g/L', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="biomass" stroke="#10b981" strokeWidth={3} name="Biyokütle" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Besin Elementleri Grafiği */}
            <div className="mb-8">
              <h4 className="font-semibold mb-3 text-gray-700">Besin Elementleri (mg/L)</h4>
              <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={model.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Gün', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'mg/L', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="N" stroke="#3b82f6" strokeWidth={2} name="Azot (N)" />
                    <Line type="monotone" dataKey="P" stroke="#f97316" strokeWidth={2} name="Fosfor (P)" />
                    <Line type="monotone" dataKey="CO2" stroke="#06b6d4" strokeWidth={2} name="CO₂" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Büyüme Hızı Grafiği */}
            <div className="mb-4">
              <h4 className="font-semibold mb-3 text-gray-700">Büyüme Hızı (μ /gün)</h4>
              <div className="w-full" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={model.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="μ" fill="#a855f7" name="μ (büyüme hızı)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* TABLO */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">📈 Simülasyon Sonuçları</h3>
            
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Gün</th>
                    <th className="px-4 py-2 text-center">Biyokütle (g/L)</th>
                    <th className="px-4 py-2 text-center">N (mg/L)</th>
                    <th className="px-4 py-2 text-center">P (mg/L)</th>
                    <th className="px-4 py-2 text-center">CO₂ (mg/L)</th>
                    <th className="px-4 py-2 text-center">μ (/gün)</th>
                    <th className="px-4 py-2 text-center">Sınırlayıcı</th>
                  </tr>
                </thead>
                <tbody>
                  {model.history.slice(-10).map((state, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{state.day}</td>
                      <td className="px-4 py-2 text-center">{state.biomass.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">{state.N.toFixed(1)}</td>
                      <td className="px-4 py-2 text-center">{state.P.toFixed(1)}</td>
                      <td className="px-4 py-2 text-center">{state.CO2.toFixed(1)}</td>
                      <td className="px-4 py-2 text-center">{state.μ.toFixed(3)}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          state.limitingFactor === 'N' ? 'bg-blue-100 text-blue-800' :
                          state.limitingFactor === 'P' ? 'bg-orange-100 text-orange-800' :
                          state.limitingFactor === 'CO2' ? 'bg-cyan-100 text-cyan-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {state.limitingFactor || 'none'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* İpuçları */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold mb-3 text-blue-900">💡 Model Kullanım İpuçları</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Simülasyon:</strong> Teorik büyüme tahminini gösterir (müdahaleler dahil)</li>
          <li>• <strong>Tahmin:</strong> Gelecek {predictionDays} gün için olası senaryoları hesaplar</li>
          <li>• <strong>Müdahale Önerileri:</strong> Besin tükenmesini önceden görerek dozaj önerir</li>
          <li>• <strong>Risk Analizi:</strong> Kritik parametreleri kontrol edip uyarır</li>
          <li>• <strong>Kalibrasyon:</strong> TankDetails'teki gerçek ölçümlerle model otomatik kalibre olur</li>
        </ul>
      </div>
    </div>
  );
};

export default CultureModeling;
