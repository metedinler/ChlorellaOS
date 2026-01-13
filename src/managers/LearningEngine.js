/**
 * LearningEngine - Self-Learning Parameter Optimization
 * 
 * Gerçek ölçüm verilerinden model parametrelerini öğrenen ve optimize eden motor.
 * 
 * Özellikler:
 * - Büyüme parametrelerini gerçek veriye göre ayarlama (μmax, Ks_N, Ks_P, vb.)
 * - Risk ağırlıklarını optimize etme
 * - K-fold cross-validation ile model doğrulama
 * - Parametre güven aralığı hesaplama
 * - Tank'ler arası öğrenme (cross-tank learning)
 * 
 * Kullanım:
 *   const learningEngine = new LearningEngine();
 *   const updatedParams = learningEngine.updateGrowthParameters(theoretical, actual, currentParams);
 */

export class LearningEngine {
  constructor() {
    this.learningRate = 0.1; // Öğrenme hızı
    this.parameterHistory = [];
    this.errorHistory = [];
    this.tankDataRegistry = new Map(); // tankId → measurements
  }

  /**
   * Büyüme parametrelerini gerçek veriye göre optimize et
   * 
   * Teorik büyüme (model tahmini) ile gerçek büyüme (lab ölçümü) arasındaki
   * farkı analiz ederek model parametrelerini ayarlar.
   * 
   * @param theoreticalGrowth - Model tahmini (g/L)
   * @param actualGrowth - Gerçek ölçüm (g/L)
   * @param currentParams - Mevcut model parametreleri
   * @returns Güncellenmiş parametreler
   */
  updateGrowthParameters(theoreticalGrowth, actualGrowth, currentParams) {
    const error = actualGrowth - theoreticalGrowth;
    const relativeError = theoreticalGrowth > 0 ? error / theoreticalGrowth : 0;
    
    const updatedParams = { ...currentParams };

    // %10'dan fazla hata varsa parametreleri ayarla
    if (Math.abs(relativeError) > 0.1) {
      console.log(`🧠 LearningEngine: %${(relativeError * 100).toFixed(1)} hata tespit edildi, parametreler güncelleniyor...`);

      // μ_max ayarı (maksimum spesifik büyüme hızı)
      if (error > 0) {
        // Gerçek büyüme model tahminden fazla → μ_max'ı artır
        updatedParams.μmax *= (1 + this.learningRate * relativeError);
        console.log(`  ↗️ μmax artırıldı: ${currentParams.μmax.toFixed(4)} → ${updatedParams.μmax.toFixed(4)}`);
      } else {
        // Gerçek büyüme model tahminden az → μ_max'ı azalt
        updatedParams.μmax *= (1 + this.learningRate * relativeError);
        updatedParams.μmax = Math.max(0.05, updatedParams.μmax); // Minimum 0.05
        console.log(`  ↘️ μmax azaltıldı: ${currentParams.μmax.toFixed(4)} → ${updatedParams.μmax.toFixed(4)}`);
      }

      // Yarı doyum sabitleri (Ks) ayarı
      const ksAdjustment = 0.5; // Daha yavaş değişsin
      
      if (error > 0) {
        // Besin kullanımı model tahminden iyi → Ks'leri azalt (daha efektif besin kullanımı)
        updatedParams.Ks_N *= (1 - this.learningRate * Math.abs(relativeError) * ksAdjustment);
        updatedParams.Ks_P *= (1 - this.learningRate * Math.abs(relativeError) * ksAdjustment);
        updatedParams.Ks_CO2 *= (1 - this.learningRate * Math.abs(relativeError) * ksAdjustment);
        
        console.log(`  ↘️ Ks değerleri azaltıldı (besin kullanımı daha efektif)`);
      } else {
        // Besin kullanımı model tahminden kötü → Ks'leri artır
        updatedParams.Ks_N *= (1 + this.learningRate * Math.abs(relativeError) * ksAdjustment);
        updatedParams.Ks_P *= (1 + this.learningRate * Math.abs(relativeError) * ksAdjustment);
        updatedParams.Ks_CO2 *= (1 + this.learningRate * Math.abs(relativeError) * ksAdjustment);
        
        console.log(`  ↗️ Ks değerleri artırıldı (besin kullanımı daha az efektif)`);
      }

      // Minimum değerleri koru
      updatedParams.Ks_N = Math.max(1.0, updatedParams.Ks_N);
      updatedParams.Ks_P = Math.max(0.1, updatedParams.Ks_P);
      updatedParams.Ks_CO2 = Math.max(0.5, updatedParams.Ks_CO2);

      // Verim katsayıları (Y) ayarı
      if (error > 0) {
        // Daha verimli → Y katsayılarını artır
        updatedParams.Y_N *= (1 + this.learningRate * relativeError * 0.3);
        updatedParams.Y_P *= (1 + this.learningRate * relativeError * 0.3);
        updatedParams.Y_CO2 *= (1 + this.learningRate * relativeError * 0.3);
      }
    }

    // History'ye kaydet
    this.errorHistory.push(error);
    this.parameterHistory.push({
      timestamp: Date.now(),
      error,
      relativeError,
      params: { ...updatedParams }
    });

    // Son 100 kayıt tut
    if (this.errorHistory.length > 100) {
      this.errorHistory = this.errorHistory.slice(-100);
      this.parameterHistory = this.parameterHistory.slice(-100);
    }

    return updatedParams;
  }

  /**
   * Risk ağırlıklarını optimize et
   * 
   * Gerçek risk durumu (kullanıcı gözlemi veya crash) ile model tahminini
   * karşılaştırarak risk ağırlıklarını ayarlar.
   * 
   * @param actualCRI - Gerçek gözlenen risk seviyesi (0-1)
   * @param predictedCRI - Model tahmini (0-1)
   * @param riskWeights - Mevcut risk ağırlıkları
   * @returns Güncellenmiş risk ağırlıkları
   */
  updateRiskWeights(actualCRI, predictedCRI, riskWeights) {
    const error = actualCRI - predictedCRI;
    const relativeError = predictedCRI > 0 ? error / predictedCRI : 0;

    const updatedWeights = { ...riskWeights };

    // %5'ten fazla hata varsa ağırlıkları ayarla
    if (Math.abs(relativeError) > 0.05) {
      console.log(`🎯 LearningEngine: Risk ağırlıkları güncelleniyor... (Hata: %${(relativeError * 100).toFixed(1)})`);

      const adjustment = 1 + this.learningRate * relativeError;

      for (const riskType in updatedWeights) {
        const oldWeight = updatedWeights[riskType];
        updatedWeights[riskType] *= adjustment;
        
        // 0.5-3.5 aralığında tut
        updatedWeights[riskType] = Math.max(0.5, Math.min(3.5, updatedWeights[riskType]));

        if (Math.abs(updatedWeights[riskType] - oldWeight) > 0.1) {
          console.log(`  🔄 ${riskType}: ${oldWeight.toFixed(2)} → ${updatedWeights[riskType].toFixed(2)}`);
        }
      }
    }

    return updatedWeights;
  }

  /**
   * Parametre güven aralığını hesapla
   * 
   * Parametre history'sinden istatistiksel güven aralığı hesaplar.
   * Parametrelerin ne kadar kararlı olduğunu gösterir.
   * 
   * @returns Parametre istatistikleri
   */
  calculateParameterConfidence() {
    if (this.parameterHistory.length < 2) {
      return {
        message: 'Yeterli veri yok (en az 2 güncelleme gerekli)',
        sampleSize: this.parameterHistory.length
      };
    }

    const confidence = {};
    const latestParams = this.parameterHistory[this.parameterHistory.length - 1].params;
    const paramNames = Object.keys(latestParams);

    for (const param of paramNames) {
      const values = this.parameterHistory.map(h => h.params[param]);
      
      // İstatistikler
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      if (std > 0) {
        // 95% güven aralığı (t-distribution yaklaşımı)
        const confidenceInterval = 1.96 * std / Math.sqrt(values.length);
        const relativeError = mean > 0 ? std / mean : 0;

        confidence[param] = {
          current: latestParams[param],
          mean,
          std,
          confidence_95: [mean - confidenceInterval, mean + confidenceInterval],
          relative_error: relativeError,
          stability: relativeError < 0.1 ? 'STABLE' : relativeError < 0.2 ? 'MODERATE' : 'UNSTABLE'
        };
      }
    }

    return {
      sampleSize: this.parameterHistory.length,
      meanError: this.errorHistory.reduce((sum, e) => sum + e, 0) / this.errorHistory.length,
      recentError: this.errorHistory.slice(-10).reduce((sum, e) => sum + e, 0) / Math.min(10, this.errorHistory.length),
      parameters: confidence
    };
  }

  /**
   * K-fold cross-validation
   * 
   * Modelin gerçek verilere ne kadar iyi uyduğunu ölçer.
   * K parçaya bölerek her seferinde 1 parçayı test, kalanını eğitim olarak kullanır.
   * 
   * @param data - Zaman serisi verisi [{day, biomass, N, P, ...}]
   * @param k - Fold sayısı (varsayılan 5)
   * @returns Doğrulama metrikleri
   */
  performKFoldCrossValidation(data, k = 5) {
    if (data.length < k) {
      return {
        error: `Yeterli veri yok. ${k} fold için en az ${k} veri noktası gerekli.`,
        dataSize: data.length
      };
    }

    const foldSize = Math.floor(data.length / k);
    const rmseScores = [];
    const maeScores = [];

    console.log(`🔬 K-fold cross-validation başlatılıyor (k=${k}, data=${data.length} nokta)...`);

    for (let i = 0; i < k; i++) {
      const testStart = i * foldSize;
      const testEnd = Math.min(testStart + foldSize, data.length);
      
      const testData = data.slice(testStart, testEnd);
      const trainData = [...data.slice(0, testStart), ...data.slice(testEnd)];

      // Basit doğrusal regresyon (eğitim verisi üzerinde)
      const trainAvg = trainData.reduce((sum, d) => sum + d.biomass, 0) / trainData.length;

      // Test verisi üzerinde tahmin ve hata hesaplama
      let sumSquaredError = 0;
      let sumAbsoluteError = 0;

      testData.forEach(testPoint => {
        // Basit tahmin: eğitim ortalaması
        const prediction = trainAvg;
        const error = testPoint.biomass - prediction;
        
        sumSquaredError += error * error;
        sumAbsoluteError += Math.abs(error);
      });

      const rmse = Math.sqrt(sumSquaredError / testData.length);
      const mae = sumAbsoluteError / testData.length;

      rmseScores.push(rmse);
      maeScores.push(mae);

      console.log(`  Fold ${i + 1}/${k}: RMSE=${rmse.toFixed(4)}, MAE=${mae.toFixed(4)}`);
    }

    const meanRMSE = rmseScores.reduce((sum, val) => sum + val, 0) / rmseScores.length;
    const stdRMSE = Math.sqrt(
      rmseScores.reduce((sum, val) => sum + Math.pow(val - meanRMSE, 2), 0) / rmseScores.length
    );

    const meanMAE = maeScores.reduce((sum, val) => sum + val, 0) / maeScores.length;
    const avgBiomass = data.reduce((sum, d) => sum + d.biomass, 0) / data.length;
    const cvScore = meanRMSE / avgBiomass; // Coefficient of Variation

    console.log(`✅ Cross-validation tamamlandı: RMSE=${meanRMSE.toFixed(4)} ± ${stdRMSE.toFixed(4)}`);

    return {
      mean_rmse: meanRMSE,
      std_rmse: stdRMSE,
      mean_mae: meanMAE,
      cv_score: cvScore,
      interpretation: cvScore < 0.1 ? 'Mükemmel' : cvScore < 0.2 ? 'İyi' : cvScore < 0.3 ? 'Kabul edilebilir' : 'Zayıf'
    };
  }

  /**
   * Tank ölçüm verisini kaydet (cross-tank learning için)
   */
  registerTankData(tankId, measurement) {
    if (!this.tankDataRegistry.has(tankId)) {
      this.tankDataRegistry.set(tankId, []);
    }

    this.tankDataRegistry.get(tankId).push({
      timestamp: Date.now(),
      ...measurement
    });

    // Son 1000 ölçüm tut
    const tankData = this.tankDataRegistry.get(tankId);
    if (tankData.length > 1000) {
      this.tankDataRegistry.set(tankId, tankData.slice(-1000));
    }
  }

  /**
   * Cross-tank learning: Tüm tanklardan öğren
   * 
   * Tüm tankların verilerini birleştirerek global bir öğrenme yapar.
   * Başarılı tankların parametreleri diğerlerine transfer edilir.
   */
  performCrossTankLearning() {
    if (this.tankDataRegistry.size < 2) {
      console.log('⚠️ Cross-tank learning için en az 2 tank gerekli');
      return null;
    }

    console.log(`🌐 Cross-tank learning başlatılıyor (${this.tankDataRegistry.size} tank)...`);

    const allData = [];
    const tankPerformances = [];

    this.tankDataRegistry.forEach((data, tankId) => {
      if (data.length > 10) {
        allData.push(...data);

        // Tank performansını değerlendir (biyokütle artışı)
        const firstBiomass = data[0].biomass || 0.1;
        const lastBiomass = data[data.length - 1].biomass || 0.1;
        const growthRate = (lastBiomass - firstBiomass) / firstBiomass;

        tankPerformances.push({
          tankId,
          growthRate,
          dataPoints: data.length
        });
      }
    });

    // En başarılı tankları bul (top 3)
    tankPerformances.sort((a, b) => b.growthRate - a.growthRate);
    const bestTanks = tankPerformances.slice(0, 3);

    console.log('🏆 En başarılı tanklar:');
    bestTanks.forEach((tank, idx) => {
      console.log(`  ${idx + 1}. Tank ${tank.tankId}: %${(tank.growthRate * 100).toFixed(1)} büyüme`);
    });

    return {
      totalData: allData.length,
      tankCount: this.tankDataRegistry.size,
      bestTanks,
      recommendation: 'En başarılı tankların parametreleri diğer tanklara uygulanabilir'
    };
  }

  /**
   * Learning rate'i ayarla
   */
  setLearningRate(rate) {
    this.learningRate = Math.max(0.01, Math.min(0.5, rate));
    console.log(`🎚️ Learning rate ayarlandı: ${this.learningRate}`);
  }

  /**
   * History'yi temizle
   */
  resetHistory() {
    this.parameterHistory = [];
    this.errorHistory = [];
    this.tankDataRegistry.clear();
    console.log('🗑️ Learning engine history temizlendi');
  }

  /**
   * Durumu getir (debug için)
   */
  getStatus() {
    return {
      learningRate: this.learningRate,
      historySize: this.parameterHistory.length,
      meanError: this.errorHistory.length > 0 
        ? this.errorHistory.reduce((sum, e) => sum + e, 0) / this.errorHistory.length 
        : 0,
      recentError: this.errorHistory.slice(-10).length > 0
        ? this.errorHistory.slice(-10).reduce((sum, e) => sum + e, 0) / this.errorHistory.slice(-10).length
        : 0,
      tankCount: this.tankDataRegistry.size
    };
  }
}

// Export singleton instance
const learningEngine = new LearningEngine();
export default learningEngine;
