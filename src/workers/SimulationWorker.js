/**
 * SimulationWorker - Background Simulation Engine
 * 
 * Gerçek biyoreaktör matematiği ile çalışan arka plan simülasyon motoru.
 * ChlorellaModelV4 entegrasyonu ile tam matematiksel model desteği.
 * 
 * Özellikler:
 * - Zaman-adımlı deterministik simülasyon (dt = 0.1h)
 * - Monod kinetik + stokiyometri
 * - 16 risk senaryosu otomatik değerlendirme
 * - CRI (Composite Risk Index) takibi
 * - Catch-up mekanizması
 * - Browser notification alarmları
 * 
 * Kullanım:
 *   import simulationWorker from './workers/SimulationWorker.js';
 *   simulationWorker.start(); // Başlat
 *   simulationWorker.stop();  // Durdur
 */

import modelManager from '../managers/ModelManager.js';

// Toast import için global fonksiyon
let showToastGlobal = null;

// Toast fonksiyonunu kaydet
export const setToastFunction = (fn) => {
  showToastGlobal = fn;
};

class SimulationWorker {
  constructor() {
    if (SimulationWorker.instance) {
      return SimulationWorker.instance;
    }

    this.isRunning = false;
    this.simulationInterval = null;
    this.riskCheckInterval = null;
    
    // Timers - 5 DAKİKADA BİR ÇALIŞ
    this.SIMULATION_INTERVAL = 5 * 60 * 1000; // 5 dakika (300000 ms) 
    this.RISK_CHECK_INTERVAL = 5 * 60 * 1000;  // 5 dakika (300000 ms)
    
    // Alarm thresholds
    this.ALARM_THRESHOLDS = {
      CRI_CRITICAL: 0.6,   // %60 üzeri kritik
      CRI_WARNING: 0.4,    // %40 üzeri uyarı
      BIOMASS_LOW: 0.5,    // 0.5 g/L altı düşük
      pH_LOW: 6.8,
      pH_HIGH: 8.2,
      TEMP_LOW: 20,
      TEMP_HIGH: 35
    };

    // Notification permission
    this.notificationPermission = 'default';

    SimulationWorker.instance = this;
  }

  /**
   * Worker'ı başlat
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️ SimulationWorker zaten çalışıyor');
      return;
    }

    console.log('▶️ SimulationWorker başlatılıyor...');

    // Notification permission iste
    await this.requestNotificationPermission();

    // localStorage'dan tüm tankları yükle
    modelManager.loadAllTanks();

    // Catch-up: Kaçırılan saatleri telafi et
    await modelManager.catchUpAllTanks();

    // Saatlik simülasyon timer'ı başlat
    this.simulationInterval = setInterval(() => {
      this.runHourlySimulation();
    }, this.SIMULATION_INTERVAL);

    // Risk izleme timer'ı başlat (5 dakikada bir)
    this.riskCheckInterval = setInterval(() => {
      this.checkRisks();
    }, this.RISK_CHECK_INTERVAL);

    this.isRunning = true;

    // localStorage'a worker durumunu kaydet
    localStorage.setItem('simulationWorker_status', JSON.stringify({
      isRunning: true,
      startTime: Date.now()
    }));

    console.log('✅ SimulationWorker başlatıldı');
    console.log(`   - Saatlik simülasyon: Her ${this.SIMULATION_INTERVAL / 1000 / 60} dakikada`);
    console.log(`   - Risk izleme: Her ${this.RISK_CHECK_INTERVAL / 1000 / 60} dakikada`);
  }

  /**
   * Worker'ı durdur
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️ SimulationWorker zaten durmuş');
      return;
    }

    console.log('⏸️ SimulationWorker durduruluyor...');

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.riskCheckInterval) {
      clearInterval(this.riskCheckInterval);
      this.riskCheckInterval = null;
    }

    this.isRunning = false;

    localStorage.setItem('simulationWorker_status', JSON.stringify({
      isRunning: false,
      stopTime: Date.now()
    }));

    console.log('✅ SimulationWorker durduruldu');
  }

  /**
   * Saatlik simülasyon çalıştır (ChlorellaModelV4 entegrasyonu)
   */
  async runHourlySimulation() {
    console.log('🕐 Saatlik simülasyon başlıyor (ChlorellaModelV4)...');

    const allModels = modelManager.getAllModels();

    if (allModels.length === 0) {
      console.log('⚠️ Aktif model yok, simülasyon atlanıyor');
      return;
    }

    console.log(`📊 ${allModels.length} tank için simülasyon çalışıyor...`);

    for (const { tankID, snapshot, status } of allModels) {
      try {
        // Model durumu kontrol et
        if (!snapshot || !snapshot.biology) {
          console.warn(`⚠️ Tank ${tankID}: Model durumu eksik`);
          continue;
        }

        // 🕐 Catch-up: Son simülasyondan bu yana geçen süre
        const now = Date.now();
        const lastUpdate = status.lastUpdate ? new Date(status.lastUpdate).getTime() : now;
        const hoursSinceLastSim = (now - lastUpdate) / (60 * 60 * 1000);

        // En az 1 saat geçmişse simüle et
        if (hoursSinceLastSim >= 1) {
          console.log(`⏰ Tank ${tankID}: ${hoursSinceLastSim.toFixed(1)} saat simülasyonu...`);
          
          // Simülasyonu çalıştır (background)
          const result = await modelManager.runSimulation(tankID, hoursSinceLastSim, (update) => {
            // İlerleme callback (sessiz)
            if (update.progress % 25 === 0) {
              console.log(`   ${tankID}: %${update.progress.toFixed(0)}`);
            }
          });

          if (result) {
            console.log(`✅ Tank ${tankID}: Simülasyon tamamlandı`);
            console.log(`   Biomass: ${result.biology.biomass.toFixed(3)} g/L`);
            console.log(`   CRI: ${result.risks.CRI.toFixed(3)} (${result.risks.level.level})`);
            
            // Risk değerlendirmesi
            await this.evaluateRisks(tankID, result);

            // Snapshot'ı kaydet
            this.saveToFile(tankID, result);
          }
        } else {
          console.log(`⏭️ Tank ${tankID}: Henüz 1 saat geçmedi (${(hoursSinceLastSim * 60).toFixed(0)} dk)`);
        }

        // 🔮 24 saat öngörüsü (her simülasyonda)
        await this.forecast24Hours(tankID);

      } catch (error) {
        console.error(`❌ Tank ${tankID} simülasyon hatası:`, error);
      }
    }

    console.log('✅ Saatlik simülasyon turu tamamlandı');
  }

  /**
   * Risk değerlendirmesi ve alarm sistemi
   */
  async evaluateRisks(tankID, snapshot) {
    const { risks } = snapshot;

    // CRI kritik seviyede mi?
    if (risks.CRI >= this.ALARM_THRESHOLDS.CRI_CRITICAL) {
      this.sendNotification(
        `🚨 KRİTİK RISK - Tank ${tankID}`,
        `CRI: ${(risks.CRI * 100).toFixed(0)}% - ${risks.level.level}\n${risks.level.message}`
      );
    } else if (risks.CRI >= this.ALARM_THRESHOLDS.CRI_WARNING) {
      this.sendNotification(
        `⚠️ Uyarı - Tank ${tankID}`,
        `CRI: ${(risks.CRI * 100).toFixed(0)}% - İzleme gerekli`
      );
    }

    // Kritik riskler kontrolü
    const criticalRisks = Object.entries(risks.risks)
      .filter(([name, value]) => value > 0.7)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (criticalRisks.length > 0) {
      const riskMessages = criticalRisks.map(([name, value]) => 
        `${name}: ${(value * 100).toFixed(0)}%`
      ).join('\n');

      this.sendNotification(
        `⚠️ Yüksek Riskler - Tank ${tankID}`,
        riskMessages
      );
    }

    // Biyokütle düşük mü?
    if (snapshot.biology.biomass < this.ALARM_THRESHOLDS.BIOMASS_LOW) {
      this.sendNotification(
        `📉 Düşük Biyokütle - Tank ${tankID}`,
        `Biomass: ${snapshot.biology.biomass.toFixed(3)} g/L`
      );
    }
  }

  /**
   * 24 saat öngörüsü (ChlorellaModelV4)
   */
  async forecast24Hours(tankID) {
    try {
      // Mevcut snapshot'ı al
      const currentSnapshot = modelManager.getSnapshot(tankID);
      if (!currentSnapshot.success) return;

      // Model export et (snapshot)
      const exportData = modelManager.exportModel(tankID);
      if (!exportData.success) return;

      // Geçici model oluştur (forecast için)
      const forecastModel = modelManager.getModel(`${tankID}_forecast`);
      forecastModel.import(exportData.data);

      // 24 saat simülasyon
      const forecastResult = await forecastModel.simulate(24, null);

      // Uyarılar kontrol et
      const warnings = this.analyzeForecast(tankID, currentSnapshot.snapshot, forecastResult);

      // Uyarı varsa bildirim gönder
      if (warnings.length > 0) {
        this.sendNotification(
          `🔮 24 Saat Öngörüsü - Tank ${tankID}`,
          warnings.join('\n')
        );
      }

      // Forecast modelini temizle
      modelManager.resetModel(`${tankID}_forecast`);

    } catch (error) {
      console.error(`❌ Tank ${tankID} forecast hatası:`, error);
    }
  }

  /**
   * Forecast analizi
   */
  analyzeForecast(tankID, current, forecast) {
    const warnings = [];

    // NO3 limitasyonu
    if (forecast.nutrients && forecast.nutrients.NO3 < 10) {
      warnings.push(`⚠️ Azot tükeniyor (24h: ${forecast.nutrients.NO3.toFixed(1)} mg/L)`);
    }

    // PO4 limitasyonu
    if (forecast.nutrients && forecast.nutrients.PO4 < 2) {
      warnings.push(`⚠️ Fosfor tükeniyor (24h: ${forecast.nutrients.PO4.toFixed(1)} mg/L)`);
    }

    // pH dışı
    if (forecast.water && (forecast.water.pH < 6.5 || forecast.water.pH > 8.5)) {
      warnings.push(`⚠️ pH kritik seviyeye gidiyor (24h: ${forecast.water.pH.toFixed(2)})`);
    }

    // O2 hipoksisi
    if (forecast.gas && forecast.gas.O2.current < 3.0) {
      warnings.push(`⚠️ O2 düşüyor (24h: ${forecast.gas.O2.current.toFixed(1)} mg/L)`);
    }

    // CRI artışı
    if (forecast.risks && forecast.risks.CRI > current.risks.CRI * 1.5) {
      warnings.push(`⚠️ Risk artıyor (CRI: ${(current.risks.CRI * 100).toFixed(0)}% → ${(forecast.risks.CRI * 100).toFixed(0)}%)`);
    }

    return warnings;
  }

  /**
   * Risk kontrolü (5 dakikada bir)
   */
  async checkRisks() {
    const allModels = modelManager.getAllModels();

    for (const { tankID, snapshot } of allModels) {
      if (!snapshot || !snapshot.risks) continue;

      const { CRI, level, risks } = snapshot.risks;

      // Kritik seviye kontrolü
      if (CRI >= this.ALARM_THRESHOLDS.CRI_CRITICAL) {
        if (showToastGlobal) {
          showToastGlobal({
            type: 'error',
            message: `🚨 Tank ${tankID}: KRİTİK RISK (CRI: ${(CRI * 100).toFixed(0)}%)`
          });
        }
      }

      // NH3 toksisitesi (en kritik)
      if (risks.NH3_toxicity > 0.7) {
        this.sendNotification(
          `☠️ NH3 TOKSİSİTESİ - Tank ${tankID}`,
          `Risk seviyesi: ${(risks.NH3_toxicity * 100).toFixed(0)}%`
        );
      }

      // Gece hipoksisi
      if (risks.night_hypoxia > 0.7) {
        this.sendNotification(
          `🌙 GECE HİPOKSİSİ RİSKİ - Tank ${tankID}`,
          `Risk seviyesi: ${(risks.night_hypoxia * 100).toFixed(0)}%`
        );
      }
    }
  }

  /**
   * 💾 Tank state snapshot'ı localStorage'a kaydet
   */
  saveToFile(tankId, snapshot) {
    try {
      const data = {
        tankId,
        timestamp: Date.now(),
        dateStr: new Date().toISOString(),
        biology: {
          biomass: snapshot.biology.biomass,
          growthRate: snapshot.biology.growthRate,
          cellDensity: snapshot.biology.cellDensity
        },
        nutrients: {
          NO3: snapshot.nutrients.NO3,
          PO4: snapshot.nutrients.PO4,
          N_limitation: snapshot.nutrients.limitationFactors.N,
          P_limitation: snapshot.nutrients.limitationFactors.P
        },
        water: {
          pH: snapshot.water.pH,
          alkalinity: snapshot.water.alkalinity,
          temperature: snapshot.water.temperature
        },
        gas: {
          O2: snapshot.gas.O2.current,
          CO2: snapshot.gas.CO2.current
        },
        risks: {
          CRI: snapshot.risks.CRI,
          level: snapshot.risks.level.level,
          top3: Object.entries(snapshot.risks.risks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, value]) => ({ name, value }))
        }
      };

      // localStorage'a kaydet
      localStorage.setItem(`tank_${tankId}_latest_state`, JSON.stringify(data));

      // History'ye ekle (son 7 gün)
      const historyKey = `tank_${tankId}_history`;
      let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      history.push({
        timestamp: data.timestamp,
        biomass: data.biology.biomass,
        CRI: data.risks.CRI,
        NO3: data.nutrients.NO3,
        PO4: data.nutrients.PO4
      });

      // Son 168 saat (7 gün) tut
      if (history.length > 168) {
        history = history.slice(-168);
      }

      localStorage.setItem(historyKey, JSON.stringify(history));

      console.log(`💾 Tank ${tankId} snapshot kaydedildi`);

    } catch (error) {
      console.error(`❌ Tank ${tankId} kayıt hatası:`, error);
    }
  }

  /**
   * Risk kontrolü (5 dakikada bir)
   */
  checkRisks() {
    const activeTanks = modelManager.getAllTankStates().filter(s => s.isActive);

    if (activeTanks.length === 0) return;

    activeTanks.forEach(state => {
      const latestCRI = state.CRIHistory[state.CRIHistory.length - 1] || 0;

      // CRI kontrolü
      if (latestCRI >= this.ALARM_THRESHOLDS.CRI_CRITICAL) {
        this.sendNotification(
          `🚨 Tank ${state.tankId} - KRİTİK DURUM`,
          `CRI: %${(latestCRI * 100).toFixed(0)} - Kontrol edin!`
        );
      } else if (latestCRI >= this.ALARM_THRESHOLDS.CRI_WARNING) {
        this.sendNotification(
          `⚠️ Tank ${state.tankId} - UYARI`,
          `CRI: %${(latestCRI * 100).toFixed(0)} - İzleyin`
        );
      }

      // Biyokütle kontrolü
      if (state.currentBiomass < this.ALARM_THRESHOLDS.BIOMASS_LOW) {
        this.sendNotification(
          `⚠️ Tank ${state.tankId} - Düşük Biyokütle`,
          `${state.currentBiomass.toFixed(2)} g/L - Büyüme yavaş`
        );
      }

      // pH kontrolü
      if (state.pH < this.ALARM_THRESHOLDS.pH_LOW || state.pH > this.ALARM_THRESHOLDS.pH_HIGH) {
        this.sendNotification(
          `⚠️ Tank ${state.tankId} - pH Anormal`,
          `pH: ${state.pH.toFixed(1)} - Ayarlama gerekebilir`
        );
      }

      // Sıcaklık kontrolü
      if (state.temperature < this.ALARM_THRESHOLDS.TEMP_LOW || state.temperature > this.ALARM_THRESHOLDS.TEMP_HIGH) {
        this.sendNotification(
          `⚠️ Tank ${state.tankId} - Sıcaklık Anormal`,
          `${state.temperature}°C - Kontrol edin`
        );
      }
    });
  }

  /**
   * Browser notification gönder
   */
  async sendNotification(title, body) {
    if (this.notificationPermission !== 'granted') {
      console.log('🔕 Notification izni yok:', title, body);
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/chlorella-icon.png', // Public klasöründe olmalı
        badge: '/chlorella-badge.png',
        tag: 'chlorella-alarm', // Aynı tag'li notificationlar birleşir
        requireInteraction: true,  // Kullanıcı kapatana kadar kalır
        silent: false
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      console.log('🔔 Notification gönderildi:', title);
    } catch (error) {
      console.error('❌ Notification gönderilemedi:', error);
    }
  }

  /**
   * Notification permission iste
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.warn('⚠️ Bu tarayıcı notification desteklemiyor');
      return;
    }

    if (Notification.permission === 'granted') {
      this.notificationPermission = 'granted';
      console.log('✅ Notification izni var');
      return;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        this.notificationPermission = permission;
        
        if (permission === 'granted') {
          console.log('✅ Notification izni verildi');
          
          // Test notification
          this.sendNotification(
            '✅ ChlorellaOS Alarmları Aktif',
            'Risk durumlarında bildirim alacaksınız'
          );
        } else {
          console.warn('⚠️ Notification izni reddedildi');
        }
      } catch (error) {
        console.error('❌ Notification permission hatası:', error);
      }
    }
  }

  /**
   * Worker durumunu getir
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTanks: modelManager.getAllTankStates().filter(s => s.isActive).length,
      simulationInterval: this.SIMULATION_INTERVAL,
      riskCheckInterval: this.RISK_CHECK_INTERVAL,
      notificationPermission: this.notificationPermission
    };
  }

  /**
   * Alarm threshold'larını güncelle
   */
  updateAlarmThresholds(newThresholds) {
    this.ALARM_THRESHOLDS = { ...this.ALARM_THRESHOLDS, ...newThresholds };
    console.log('✅ Alarm threshold\'ları güncellendi:', this.ALARM_THRESHOLDS);
  }

  /**
   * Manuel simülasyon tetikle (test için)
   */
  async triggerManualSimulation() {
    console.log('🔧 Manuel simülasyon tetiklendi');
    await this.runHourlySimulation();
  }

  /**
   * Manuel risk kontrolü tetikle (test için)
   */
  triggerManualRiskCheck() {
    console.log('🔧 Manuel risk kontrolü tetiklendi');
    this.checkRisks();
  }
}

// Singleton instance export
const simulationWorker = new SimulationWorker();

// Sayfa yüklendiğinde otomatik başlat (opsiyonel)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // localStorage'dan önceki durumu kontrol et
    const statusStr = localStorage.getItem('simulationWorker_status');
    
    if (statusStr) {
      try {
        const status = JSON.parse(statusStr);
        
        if (status.isRunning) {
          console.log('🔄 SimulationWorker önceki oturumdan devam ediyor...');
          simulationWorker.start();
        }
      } catch (error) {
        console.error('❌ SimulationWorker status parse hatası:', error);
      }
    }
  });

  // Sayfa kapatılırken temizlik
  window.addEventListener('beforeunload', () => {
    // Worker'ı durdurmuyoruz, localStorage'da isRunning:true kalacak
    // Böylece sayfa tekrar açıldığında devam edecek
    console.log('👋 Sayfa kapatılıyor, SimulationWorker localStorage\'da korunuyor');
  });
}

export default simulationWorker;
