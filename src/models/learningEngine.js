// learningEngine.js - Parametre optimizasyonu ve öğrenme motoru

export class LearningEngine {
  constructor() {
    // Öğrenilebilir parametreler (başlangıç değerleri)
    this.params = {
      mu_max: 0.08,        // Maksimum büyüme hızı (h^-1)
      Ks_N: 5.0,           // Yarı-saturasyon N (mg/L)
      Ks_P: 1.0,           // Yarı-saturasyon P (mg/L)
      Ks_light: 200,       // Yarı-saturasyon ışık (μmol/m²/s)
      Y_X_N: 10.0,         // Yield azot (g/g)
      Y_X_P: 50.0,         // Yield fosfor (g/g)
      k_d: 0.01,           // Ölüm oranı (h^-1)
      alpha_light: 0.01,   // Foton kullanım verimi
      Pmax: 0.5            // Maksimum fotosentez (d^-1)
    };
    
    // Parametre sınırları
    this.bounds = {
      mu_max: [0.02, 0.15],
      Ks_N: [1.0, 20.0],
      Ks_P: [0.1, 5.0],
      Ks_light: [50, 500],
      Y_X_N: [5.0, 20.0],
      Y_X_P: [20.0, 100.0],
      k_d: [0.001, 0.05],
      alpha_light: [0.005, 0.05],
      Pmax: [0.1, 1.0]
    };
    
    // Öğrenme geçmişi
    this.history = [];
    this.maxHistorySize = 100;
    
    // Bayesian güncelleme parametreleri
    this.priorStrength = 10; // Başlangıç inancı
    this.learningRate = 0.1;
  }

  /**
   * Parametre optimizasyonu (Gradient Descent)
   */
  optimizeParameters(observations, targetVariable = 'biomass') {
    const errors = [];
    const gradients = {};
    
    // Her parametre için gradient hesapla
    for (const [paramName, paramValue] of Object.entries(this.params)) {
      const delta = paramValue * 0.01; // %1 pertürbasyon
      
      // İleri fark
      this.params[paramName] = paramValue + delta;
      const error_plus = this.calculateModelError(observations, targetVariable);
      
      // Geri fark
      this.params[paramName] = paramValue - delta;
      const error_minus = this.calculateModelError(observations, targetVariable);
      
      // Gradient
      gradients[paramName] = (error_plus - error_minus) / (2 * delta);
      
      // Orijinal değere dön
      this.params[paramName] = paramValue;
    }
    
    // Parametre güncelleme
    for (const [paramName, gradient] of Object.entries(gradients)) {
      const update = -this.learningRate * gradient;
      const newValue = this.params[paramName] + update;
      
      // Sınır kontrolü
      const [min, max] = this.bounds[paramName];
      this.params[paramName] = Math.max(min, Math.min(max, newValue));
    }
    
    // Geçmişe kaydet
    const finalError = this.calculateModelError(observations, targetVariable);
    this.history.push({
      timestamp: new Date().toISOString(),
      params: { ...this.params },
      error: finalError,
      gradients
    });
    
    // Geçmiş boyutu kontrolü
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    return {
      newParams: this.params,
      error: finalError,
      convergence: this.checkConvergence()
    };
  }

  /**
   * Model hatası hesaplama (RMSE)
   */
  calculateModelError(observations, targetVariable) {
    let sumSquaredError = 0;
    let count = 0;
    
    observations.forEach(obs => {
      const predicted = this.predictValue(obs, targetVariable);
      const actual = obs[targetVariable];
      
      if (actual !== undefined && predicted !== undefined) {
        sumSquaredError += Math.pow(predicted - actual, 2);
        count++;
      }
    });
    
    return count > 0 ? Math.sqrt(sumSquaredError / count) : Infinity;
  }

  /**
   * Değer tahmini (basitleştirilmiş model)
   */
  predictValue(state, variable) {
    if (variable === 'biomass') {
      return this.predictBiomassGrowth(state);
    } else if (variable === 'NO3') {
      return this.predictNO3Consumption(state);
    } else if (variable === 'PO4') {
      return this.predictPO4Consumption(state);
    }
    
    return undefined;
  }

  /**
   * Biyokütle büyüme tahmini
   */
  predictBiomassGrowth(state) {
    const { biomass = 1.0, NO3 = 50, PO4 = 10, lightIntensity = 5000, dt = 1.0 } = state;
    
    // Monod kinetik
    const f_N = NO3 / (this.params.Ks_N + NO3);
    const f_P = PO4 / (this.params.Ks_P + PO4);
    const f_light = lightIntensity / (this.params.Ks_light + lightIntensity);
    
    // Net büyüme hızı
    const mu_net = this.params.mu_max * Math.min(f_N, f_P, f_light) - this.params.k_d;
    
    // Yeni biyokütle
    return biomass * Math.exp(mu_net * dt);
  }

  /**
   * NO3 tüketim tahmini
   */
  predictNO3Consumption(state) {
    const { biomass = 1.0, biomassPrevious = 0.9, NO3 = 50 } = state;
    
    const biomassDelta = biomass - biomassPrevious;
    if (biomassDelta <= 0) return NO3;
    
    // Yield katsayısı ile tüketim
    const NO3_consumed = biomassDelta / this.params.Y_X_N;
    
    return Math.max(0, NO3 - NO3_consumed);
  }

  /**
   * PO4 tüketim tahmini
   */
  predictPO4Consumption(state) {
    const { biomass = 1.0, biomassPrevious = 0.9, PO4 = 10 } = state;
    
    const biomassDelta = biomass - biomassPrevious;
    if (biomassDelta <= 0) return PO4;
    
    // Yield katsayısı ile tüketim
    const PO4_consumed = biomassDelta / this.params.Y_X_P;
    
    return Math.max(0, PO4 - PO4_consumed);
  }

  /**
   * Yakınsama kontrolü
   */
  checkConvergence() {
    if (this.history.length < 10) return false;
    
    // Son 10 iterasyondaki hata değişimi
    const recentHistory = this.history.slice(-10);
    const errors = recentHistory.map(h => h.error);
    
    const errorMean = errors.reduce((a, b) => a + b, 0) / errors.length;
    const errorStd = Math.sqrt(
      errors.reduce((sum, e) => sum + Math.pow(e - errorMean, 2), 0) / errors.length
    );
    
    // Yakınsama kriteri: std/mean < 0.05
    return errorStd / errorMean < 0.05;
  }

  /**
   * K-fold cross-validation
   */
  crossValidate(observations, k = 5) {
    const foldSize = Math.floor(observations.length / k);
    const foldErrors = [];
    
    for (let fold = 0; fold < k; fold++) {
      // Test seti
      const testStart = fold * foldSize;
      const testEnd = testStart + foldSize;
      const testSet = observations.slice(testStart, testEnd);
      
      // Eğitim seti
      const trainSet = [
        ...observations.slice(0, testStart),
        ...observations.slice(testEnd)
      ];
      
      // Parametreleri eğit
      const originalParams = { ...this.params };
      this.optimizeParameters(trainSet, 'biomass');
      
      // Test setinde hata hesapla
      const testError = this.calculateModelError(testSet, 'biomass');
      foldErrors.push(testError);
      
      // Parametreleri geri yükle
      this.params = originalParams;
    }
    
    // Ortalama CV hatası
    const meanCVError = foldErrors.reduce((a, b) => a + b, 0) / k;
    const stdCVError = Math.sqrt(
      foldErrors.reduce((sum, e) => sum + Math.pow(e - meanCVError, 2), 0) / k
    );
    
    return {
      foldErrors,
      meanError: meanCVError,
      stdError: stdCVError,
      overfitting: stdCVError / meanCVError > 0.3 // Yüksek varyans → overfitting
    };
  }

  /**
   * Bayesian parametre güncelleme
   */
  bayesianUpdate(observation, targetVariable) {
    const predicted = this.predictValue(observation, targetVariable);
    const actual = observation[targetVariable];
    
    if (predicted === undefined || actual === undefined) return;
    
    const error = actual - predicted;
    
    // Posterior güncelleme (basitleştirilmiş)
    for (const [paramName, paramValue] of Object.entries(this.params)) {
      // Gradient tahmini (sayısal)
      const sensitivity = this.estimateSensitivity(observation, paramName, targetVariable);
      
      // Bayesian güncelleme
      const update = (error * sensitivity) / (this.priorStrength + 1);
      const newValue = paramValue + update * this.learningRate;
      
      // Sınır kontrolü
      const [min, max] = this.bounds[paramName];
      this.params[paramName] = Math.max(min, Math.min(max, newValue));
    }
    
    // Prior zayıflama
    this.priorStrength *= 0.99;
  }

  /**
   * Parametre hassasiyeti tahmini
   */
  estimateSensitivity(state, paramName, targetVariable) {
    const delta = this.params[paramName] * 0.01;
    
    // İleri fark
    const originalValue = this.params[paramName];
    this.params[paramName] = originalValue + delta;
    const pred_plus = this.predictValue(state, targetVariable);
    
    // Geri fark
    this.params[paramName] = originalValue - delta;
    const pred_minus = this.predictValue(state, targetVariable);
    
    // Orijinal değere dön
    this.params[paramName] = originalValue;
    
    // Sensitivity
    return (pred_plus - pred_minus) / (2 * delta);
  }

  /**
   * Online öğrenme (yeni veri geldikçe güncelle)
   */
  onlineUpdate(newObservation, targetVariable = 'biomass') {
    // Bayesian güncelleme
    this.bayesianUpdate(newObservation, targetVariable);
    
    // Geçmişe ekle
    this.history.push({
      timestamp: new Date().toISOString(),
      observation: newObservation,
      params: { ...this.params }
    });
    
    // Geçmiş boyutu kontrolü
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Model performans raporu
   */
  getPerformanceReport(observations, targetVariable = 'biomass') {
    const error = this.calculateModelError(observations, targetVariable);
    const cvResult = this.crossValidate(observations);
    const convergence = this.checkConvergence();
    
    return {
      rmse: error,
      crossValidation: cvResult,
      converged: convergence,
      parameterUncertainty: this.estimateUncertainty(),
      recommendations: this.generateRecommendations(error, cvResult)
    };
  }

  /**
   * Parametre belirsizliği tahmini
   */
  estimateUncertainty() {
    if (this.history.length < 20) {
      return 'Yetersiz veri - belirsizlik yüksek';
    }
    
    const recentHistory = this.history.slice(-20);
    const paramVariances = {};
    
    for (const paramName of Object.keys(this.params)) {
      const values = recentHistory.map(h => h.params[paramName]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      
      paramVariances[paramName] = Math.sqrt(variance) / mean; // CV
    }
    
    return paramVariances;
  }

  /**
   * Öneri üretimi
   */
  generateRecommendations(error, cvResult) {
    const recommendations = [];
    
    if (error > 1.0) {
      recommendations.push('Model hatası yüksek - daha fazla veri toplayın');
    }
    
    if (cvResult.overfitting) {
      recommendations.push('Overfitting tespit edildi - model karmaşıklığını azaltın');
    }
    
    if (!this.checkConvergence()) {
      recommendations.push('Parametreler henüz yakınsamadı - daha fazla iterasyon gerekli');
    }
    
    if (this.history.length < 50) {
      recommendations.push('Yetersiz eğitim verisi - en az 50 ölçüm toplayın');
    }
    
    return recommendations;
  }

  /**
   * Parametreleri sıfırla
   */
  reset() {
    this.params = {
      mu_max: 0.08,
      Ks_N: 5.0,
      Ks_P: 1.0,
      Ks_light: 200,
      Y_X_N: 10.0,
      Y_X_P: 50.0,
      k_d: 0.01,
      alpha_light: 0.01,
      Pmax: 0.5
    };
    
    this.history = [];
    this.priorStrength = 10;
  }
}
