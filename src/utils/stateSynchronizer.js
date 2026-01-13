/**
 * STATE SYNCHRONIZER - Tek Veri Kaynağı Senkronizasyonu
 * 
 * Sistemplani.md gereksinimi:
 * - CultureState = Tek kaynak (Single Source of Truth)
 * - EnforcedContext tank state ↔ ModelManager snapshot
 * - Her değişiklik otomatik senkronize edilir
 * 
 * Kullanım:
 *   import stateSynchronizer from './utils/stateSynchronizer.js';
 *   
 *   // Context → Model senkronizasyonu
 *   stateSynchronizer.syncContextToModel(tankId, contextState);
 *   
 *   // Model → Context senkronizasyonu
 *   const updatedState = stateSynchronizer.syncModelToContext(tankId);
 */

import modelManager from '../managers/ModelManager.js';

class StateSynchronizer {
  constructor() {
    this.syncLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Context state → Model state senkronizasyonu
   * 
   * Context'teki ölçüm verileri → Model güncelleme
   */
  syncContextToModel(tankId, contextState) {
    const startTime = performance.now();

    try {
      // Context state validasyonu
      if (!contextState || !tankId) {
        throw new Error('Invalid tankId or contextState');
      }

      // Model mevcut mu?
      const modelExists = modelManager.hasModel(tankId);
      if (!modelExists) {
        console.warn(`⚠️ Model ${tankId} bulunamadı, oluşturuluyor...`);
        modelManager.initializeModel(tankId, {
          volume: contextState.volume || 1.0,
          initialBiomass: contextState.biomass || 0.1
        });
      }

      // Context'ten güncel ölçümleri çek
      const measurements = {
        biomass: contextState.biomass,
        NO3: contextState.N_mgL,
        PO4: contextState.P_mgL,
        pH: contextState.pH,
        temperature: contextState.temperature,
        O2: contextState.O2_mgL,
        light: contextState.light_lux
      };

      // Model'i güncelle
      const updateResult = modelManager.updateWithMeasurement(tankId, measurements);

      // Log kaydet
      this._logSync({
        direction: 'context→model',
        tankId,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        measurements,
        success: updateResult.success
      });

      return {
        success: true,
        model: updateResult.snapshot,
        risks: updateResult.risks,
        duration: performance.now() - startTime
      };

    } catch (error) {
      console.error(`❌ Context→Model sync hatası (${tankId}):`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Model state → Context state senkronizasyonu
   * 
   * Model'deki hesaplanan veriler → Context güncelleme
   */
  syncModelToContext(tankId) {
    const startTime = performance.now();

    try {
      // Model snapshot'ını al
      const snapshotResult = modelManager.getSnapshot(tankId);
      
      if (!snapshotResult.success) {
        throw new Error(`Model snapshot alınamadı: ${snapshotResult.error}`);
      }

      const snapshot = snapshotResult.snapshot;

      // Context formatına dönüştür
      const contextState = {
        // Biology
        biomass: snapshot.biology.biomass,
        growthRate: snapshot.biology.growthRate,
        cellDensity: snapshot.biology.cellDensity,

        // Nutrients
        N_mgL: snapshot.nutrients.NO3,
        P_mgL: snapshot.nutrients.PO4,
        N_limitation: snapshot.nutrients.limitationFactors.N,
        P_limitation: snapshot.nutrients.limitationFactors.P,

        // Water Chemistry
        pH: snapshot.water.pH,
        alkalinity: snapshot.water.alkalinity,
        temperature: snapshot.water.temperature,
        NH3_mgL: snapshot.water.NH3,
        NH4_mgL: snapshot.water.NH4,

        // Gas
        O2_mgL: snapshot.gas.O2.current,
        O2_saturation: snapshot.gas.O2.saturation,
        CO2_mgL: snapshot.gas.CO2.current,

        // Light
        light_lux: snapshot.light?.I_z || 0,

        // Risk State
        modelState: {
          CRI: snapshot.risks.CRI,
          riskLevel: snapshot.risks.level.level,
          risks: snapshot.risks.risks,
          timestamp: snapshot.timestamp
        },

        // Meta
        lastModelUpdate: new Date().toISOString(),
        modelSyncDuration: performance.now() - startTime
      };

      // Log kaydet
      this._logSync({
        direction: 'model→context',
        tankId,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        snapshot: {
          biomass: contextState.biomass,
          CRI: contextState.modelState.CRI,
          riskLevel: contextState.modelState.riskLevel
        },
        success: true
      });

      return {
        success: true,
        contextState,
        duration: performance.now() - startTime
      };

    } catch (error) {
      console.error(`❌ Model→Context sync hatası (${tankId}):`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Bidirectional sync: Context ↔ Model
   * 
   * 1. Context → Model (ölçümler)
   * 2. Model calculation (risk, growth, etc.)
   * 3. Model → Context (güncel state)
   */
  bidirectionalSync(tankId, contextState) {
    const startTime = performance.now();

    try {
      // 1. Context → Model
      const toModelResult = this.syncContextToModel(tankId, contextState);
      
      if (!toModelResult.success) {
        throw new Error(`Context→Model sync başarısız: ${toModelResult.error}`);
      }

      // 2. Model → Context
      const toContextResult = this.syncModelToContext(tankId);
      
      if (!toContextResult.success) {
        throw new Error(`Model→Context sync başarısız: ${toContextResult.error}`);
      }

      // Log
      this._logSync({
        direction: 'bidirectional',
        tankId,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        success: true
      });

      return {
        success: true,
        contextState: toContextResult.contextState,
        model: toModelResult.model,
        risks: toModelResult.risks,
        duration: performance.now() - startTime
      };

    } catch (error) {
      console.error(`❌ Bidirectional sync hatası (${tankId}):`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tüm tanklar için toplu senkronizasyon
   */
  syncAllTanks(tanksState) {
    const results = {};

    for (const [tankId, tankState] of Object.entries(tanksState)) {
      results[tankId] = this.bidirectionalSync(tankId, tankState);
    }

    return results;
  }

  /**
   * Sync log kaydı
   */
  _logSync(entry) {
    this.syncLog.push(entry);

    // Maksimum log boyutunu aşma
    if (this.syncLog.length > this.maxLogSize) {
      this.syncLog = this.syncLog.slice(-this.maxLogSize);
    }
  }

  /**
   * Sync loglarını oku
   */
  getSyncLog(limit = 10) {
    return this.syncLog.slice(-limit);
  }

  /**
   * Sync istatistikleri
   */
  getSyncStats() {
    if (this.syncLog.length === 0) {
      return {
        totalSyncs: 0,
        avgDuration: 0,
        successRate: 0
      };
    }

    const successfulSyncs = this.syncLog.filter(s => s.success).length;
    const totalDuration = this.syncLog.reduce((sum, s) => sum + s.duration, 0);

    return {
      totalSyncs: this.syncLog.length,
      successfulSyncs,
      failedSyncs: this.syncLog.length - successfulSyncs,
      successRate: (successfulSyncs / this.syncLog.length * 100).toFixed(1) + '%',
      avgDuration: (totalDuration / this.syncLog.length).toFixed(2) + 'ms',
      lastSync: this.syncLog[this.syncLog.length - 1]?.timestamp
    };
  }

  /**
   * Conflict detection: Context vs Model farklılıkları
   */
  detectConflicts(tankId, contextState) {
    try {
      const snapshotResult = modelManager.getSnapshot(tankId);
      
      if (!snapshotResult.success) {
        return { hasConflicts: false, reason: 'Model snapshot yok' };
      }

      const snapshot = snapshotResult.snapshot;
      const conflicts = [];

      // Biomass karşılaştırması
      if (Math.abs(contextState.biomass - snapshot.biology.biomass) > 0.1) {
        conflicts.push({
          field: 'biomass',
          context: contextState.biomass,
          model: snapshot.biology.biomass,
          diff: Math.abs(contextState.biomass - snapshot.biology.biomass)
        });
      }

      // NO3 karşılaştırması
      if (Math.abs(contextState.N_mgL - snapshot.nutrients.NO3) > 5) {
        conflicts.push({
          field: 'NO3',
          context: contextState.N_mgL,
          model: snapshot.nutrients.NO3,
          diff: Math.abs(contextState.N_mgL - snapshot.nutrients.NO3)
        });
      }

      // PO4 karşılaştırması
      if (Math.abs(contextState.P_mgL - snapshot.nutrients.PO4) > 1) {
        conflicts.push({
          field: 'PO4',
          context: contextState.P_mgL,
          model: snapshot.nutrients.PO4,
          diff: Math.abs(contextState.P_mgL - snapshot.nutrients.PO4)
        });
      }

      // pH karşılaştırması
      if (Math.abs(contextState.pH - snapshot.water.pH) > 0.3) {
        conflicts.push({
          field: 'pH',
          context: contextState.pH,
          model: snapshot.water.pH,
          diff: Math.abs(contextState.pH - snapshot.water.pH)
        });
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ Conflict detection hatası (${tankId}):`, error);
      return {
        hasConflicts: false,
        error: error.message
      };
    }
  }

  /**
   * Conflict resolution: Model state'i kaynak kabul et
   */
  resolveConflicts(tankId) {
    try {
      // Model → Context sync ile conflict çözülür
      const result = this.syncModelToContext(tankId);
      
      if (result.success) {
        console.log(`✅ Conflicts resolved for tank ${tankId}`);
      }

      return result;

    } catch (error) {
      console.error(`❌ Conflict resolution hatası (${tankId}):`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Singleton instance
const stateSynchronizer = new StateSynchronizer();

export default stateSynchronizer;
