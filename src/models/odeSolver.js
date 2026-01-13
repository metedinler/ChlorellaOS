/**
 * TAM KAPSAMLI CHLORELLA MODEL - ODE SOLVER
 * Runge-Kutta 4. ve 5. mertebe çözücüler
 * Adaptive stepping ile hassas entegrasyon
 */

/**
 * Runge-Kutta 4 (RK4) - Klasik 4. mertebe method
 * @param {Function} f - Türev fonksiyonu dy/dt = f(t, y)
 * @param {Array} y0 - Başlangıç değerleri [y1_0, y2_0, ...]
 * @param {number} t0 - Başlangıç zamanı
 * @param {number} t1 - Bitiş zamanı
 * @param {number} n - Adım sayısı
 * @returns {Object} {t: [...], y: [[y1, y2, ...], ...]}
 */
export function rk4(f, y0, t0, t1, n) {
  const h = (t1 - t0) / n;
  const t = [t0];
  const y = [y0.slice()]; // Deep copy
  
  let yn = y0.slice();
  let tn = t0;
  
  for (let i = 0; i < n; i++) {
    // RK4 adımları
    const k1 = f(tn, yn);
    const k2 = f(tn + h/2, yn.map((val, idx) => val + h/2 * k1[idx]));
    const k3 = f(tn + h/2, yn.map((val, idx) => val + h/2 * k2[idx]));
    const k4 = f(tn + h, yn.map((val, idx) => val + h * k3[idx]));
    
    // Yeni değer hesapla
    yn = yn.map((val, idx) => 
      val + (h/6) * (k1[idx] + 2*k2[idx] + 2*k3[idx] + k4[idx])
    );
    
    tn += h;
    
    t.push(tn);
    y.push(yn.slice());
  }
  
  return { t, y };
}

/**
 * Runge-Kutta-Fehlberg 4-5 (RKF45) - Adaptive stepping
 * @param {Function} f - Türev fonksiyonu
 * @param {Array} y0 - Başlangıç değerleri
 * @param {number} t0 - Başlangıç zamanı
 * @param {number} t1 - Bitiş zamanı
 * @param {number} tol - Tolerans (varsayılan 1e-6)
 * @param {number} h_max - Maksimum adım boyutu
 * @returns {Object} {t: [...], y: [...]}
 */
export function rkf45(f, y0, t0, t1, tol = 1e-6, h_max = 0.1) {
  const t = [t0];
  const y = [y0.slice()];
  
  let yn = y0.slice();
  let tn = t0;
  let h = Math.min(0.01, h_max); // Başlangıç adımı
  
  // Butcher tablosu katsayıları (RKF45)
  const a = [
    [],
    [1/4],
    [3/32, 9/32],
    [1932/2197, -7200/2197, 7296/2197],
    [439/216, -8, 3680/513, -845/4104],
    [-8/27, 2, -3544/2565, 1859/4104, -11/40]
  ];
  
  const c = [0, 1/4, 3/8, 12/13, 1, 1/2];
  const b4 = [25/216, 0, 1408/2565, 2197/4104, -1/5, 0];
  const b5 = [16/135, 0, 6656/12825, 28561/56430, -9/50, 2/55];
  
  while (tn < t1) {
    // Adım boyutunu ayarla (t1'i aşmamak için)
    if (tn + h > t1) {
      h = t1 - tn;
    }
    
    // K değerlerini hesapla
    const k = [];
    k[0] = f(tn, yn);
    
    for (let i = 1; i < 6; i++) {
      const t_i = tn + c[i] * h;
      const y_i = yn.map((val, idx) => {
        let sum = val;
        for (let j = 0; j < i; j++) {
          sum += h * a[i][j] * k[j][idx];
        }
        return sum;
      });
      k[i] = f(t_i, y_i);
    }
    
    // 4. ve 5. mertebe çözümleri
    const y4 = yn.map((val, idx) => {
      let sum = val;
      for (let i = 0; i < 6; i++) {
        sum += h * b4[i] * k[i][idx];
      }
      return sum;
    });
    
    const y5 = yn.map((val, idx) => {
      let sum = val;
      for (let i = 0; i < 6; i++) {
        sum += h * b5[i] * k[i][idx];
      }
      return sum;
    });
    
    // Hata tahmini
    const error = y4.map((v4, idx) => Math.abs(v4 - y5[idx]));
    const max_error = Math.max(...error);
    
    // Adım boyutunu ayarla
    if (max_error < tol) {
      // Kabul et
      yn = y5; // 5. mertebe daha doğru
      tn += h;
      t.push(tn);
      y.push(yn.slice());
      
      // Bir sonraki adım boyutunu artır
      h = Math.min(h_max, h * Math.min(2.0, 0.9 * Math.pow(tol / max_error, 0.2)));
    } else {
      // Reddet ve adımı küçült
      h = h * Math.max(0.1, 0.9 * Math.pow(tol / max_error, 0.25));
    }
    
    // Sonsuz döngü koruması
    if (h < 1e-10) {
      console.warn('⚠️ RKF45: Adım boyutu çok küçük, durduruluyor');
      break;
    }
  }
  
  return { t, y };
}

/**
 * Basit Euler method (referans için)
 */
export function euler(f, y0, t0, t1, n) {
  const h = (t1 - t0) / n;
  const t = [t0];
  const y = [y0.slice()];
  
  let yn = y0.slice();
  let tn = t0;
  
  for (let i = 0; i < n; i++) {
    const dydt = f(tn, yn);
    yn = yn.map((val, idx) => val + h * dydt[idx]);
    tn += h;
    
    t.push(tn);
    y.push(yn.slice());
  }
  
  return { t, y };
}

export default {
  rk4,
  rkf45,
  euler
};
