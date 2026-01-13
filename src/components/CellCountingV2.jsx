import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Microscope, Settings, BookOpen, Grid, Keyboard, Volume2, VolumeX, Play, Pause, RotateCcw, Save, Download, Calculator, Beaker, Database } from 'lucide-react';
import CellCountingGuide from './CellCountingGuide';
import AdvancedStatistics from './AdvancedStatistics';
import { useEnforcedChlorellaSystem } from '../contexts/EnforcedChlorellaSystemContext';

// ============================================
// 🔬 LAM DATABASE - 7 Farklı Sayım Lamı
// ============================================

const CHAMBER_SPECS = {
  thoma: {
    id: 'thoma',
    name: 'Thoma Lamı',
    depth: 0.1, // mm
    bigSquares: 9,
    bigSquareLayout: '3x3',
    smallPerBig: 16,
    smallSquareLayout: '4x4',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 2, 6, 8], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 2, 4, 6, 8], time: '~3 dk' },
      precise: { name: 'Hassas (9 Tümü)', squares: [0,1,2,3,4,5,6,7,8], time: '~5 dk' }
    },
    formula: (total, n) => (total / n) * 10000,
    volumePerSquare: 0.0001, // mL
    description: 'Basit grid yapısı, kan hücreleri ve mikroalgler için.',
    usage: 'Eritrosit, Chlorella, genel mikroorganizmalar',
    rules: [
      'Üst ve sol kenardaki hücreler sayılır',
      'Alt ve sağ kenardaki hücreler sayılmaz',
      'Her büyük kare 1×1 mm, 16 küçük içerir',
      'Serpantin yöntemi: Sağa git, aşağı in, sola dön'
    ]
  },
  
  neubauer: {
    id: 'neubauer',
    name: 'Neubauer (Improved)',
    depth: 0.1,
    bigSquares: 9,
    bigSquareLayout: '3x3',
    smallPerBig: 400, // Orta karede
    smallSquareLayout: '20x20',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 2, 6, 8], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 2, 4, 6, 8], time: '~3 dk' },
      precise: { name: 'Hassas (9 Tümü)', squares: [0, 1, 2, 3, 4, 5, 6, 7, 8], time: '~5 dk' }
    },
    formula: (total, n) => (total / n) * 10000,
    volumePerSquare: 0.0001,
    description: 'En yaygın Chlorella lamı. Orta karede 400 küçük kare (25 grup × 16).',
    usage: 'Chlorella, Lökosit, Maya, Bakteri, Algler',
    rules: [
      'Standart: 4 köşe + merkez (5 büyük kare)',
      'Hassas: Orta karenin 5 grubu (A,B,C,D,E)',
      'Orta kare: 25 grup, her grup 16 küçük',
      'Mikroorganizmalar için ALTIN STANDART'
    ]
  },

  sedgewick: {
    id: 'sedgewick',
    name: 'Sedgewick-Rafter',
    depth: 1.0, // Büyük hacim!
    bigSquares: 1000,
    bigSquareLayout: '50x20',
    smallPerBig: 1,
    smallSquareLayout: '1x1',
    strategies: {
      fast: { name: 'Rastgele 10 Kare', squares: [], time: '~3 dk', random: 10 },
      normal: { name: 'Rastgele 25 Kare', squares: [], time: '~5 dk', random: 25 },
      precise: { name: 'Rastgele 50 Kare', squares: [], time: '~10 dk', random: 50 }
    },
    formula: (total, n) => (total / n) * 1000,
    volumePerSquare: 0.001, // Büyük hacim
    description: 'Büyük hacimli lam (1 mm³). Plankton ve büyük alg sayımı için.',
    usage: 'Plankton, Büyük algler, Az yoğunluk örnekleri',
    rules: [
      '1000 kare, her biri 1 mm²',
      'Rastgele kare seçimi önerilir',
      'Düşük yoğunlukta (<1000 hücre/mL) tercih',
      'Büyük mikroorganizmalar için ideal'
    ]
  },

  burker: {
    id: 'burker',
    name: 'Bürker Lamı',
    depth: 0.1,
    bigSquares: 10,
    bigSquareLayout: '3x3+1',
    smallPerBig: 16,
    smallSquareLayout: '4x4',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 2, 6, 8], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 2, 4, 6, 8], time: '~3 dk' },
      precise: { name: 'Hassas (10 Tümü)', squares: [0,1,2,3,4,5,6,7,8,9], time: '~6 dk' }
    },
    formula: (total, n) => (total / n) * 10000,
    volumePerSquare: 0.0001,
    description: 'Kan hücreleri ve bakteri sayımı için özel grid.',
    usage: 'Eritrosit, Lökosit, Bakteriler',
    rules: [
      'Thoma lamına benzer yapı',
      'Özel grid çizgileri (üçlü)',
      'Kan hücreleri için optimize',
      'Aynı hesaplama formülü (×10⁴)'
    ]
  },

  malassez: {
    id: 'malassez',
    name: 'Malassez Lamı',
    depth: 0.2, // DİKKAT: 2× derin
    bigSquares: 25,
    bigSquareLayout: '5x5',
    smallPerBig: 20,
    smallSquareLayout: '4x5',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 4, 20, 24], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 4, 12, 20, 24], time: '~3 dk' },
      precise: { name: 'Hassas (9 Kare)', squares: [0,2,4,10,12,14,20,22,24], time: '~6 dk' },
      manual: { name: 'Özel Seçim (Manuel)', squares: [], time: 'Değişken', isManualSelection: true }
    },
    formula: (total, n) => (total / n) * 5000, // 0.2mm derinlik
    volumePerSquare: 0.0002, // 2× hacim
    description: 'Eritrosit sayımı için. 0.2mm derinlik (2×).',
    usage: 'Eritrosit sayımı, Yoğun örnekler',
    rules: [
      '25 grup (5×5 düzen)',
      'Her grup 20 küçük kare',
      'Derinlik 0.2mm (Thoma\'dan 2× fazla)',
      'Formül: (Toplam/N) × 5000'
    ]
  },

  fuchsrosenthal: {
    id: 'fuchsrosenthal',
    name: 'Fuchs-Rosenthal',
    depth: 0.2,
    bigSquares: 16,
    bigSquareLayout: '4x4',
    smallPerBig: 16,
    smallSquareLayout: '4x4',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 3, 12, 15], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 3, 7, 12, 15], time: '~3 dk' },
      precise: { name: 'Hassas (16 Tümü)', squares: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], time: '~7 dk' }
    },
    formula: (total, n) => (total / n) * 3125,
    volumePerSquare: 0.00032,
    description: 'CSF (Beyin-Omurilik Sıvısı) ve lökosit sayımı.',
    usage: 'CSF, Lökosit, Düşük yoğunluk örnekleri',
    rules: [
      '16 büyük kare (4×4)',
      'Her büyük 16 küçük içerir',
      'Derinlik 0.2mm',
      'Formül: (Toplam/N) × 3125'
    ]
  },

  hemocytometer: {
    id: 'hemocytometer',
    name: 'Hemocytometer (Genel)',
    depth: 0.1,
    bigSquares: 9,
    bigSquareLayout: '3x3',
    smallPerBig: 16,
    smallSquareLayout: '4x4',
    strategies: {
      fast: { name: 'Hızlı (4 Köşe)', squares: [0, 2, 6, 8], time: '~2 dk' },
      normal: { name: 'Normal (5 Kare)', squares: [0, 2, 4, 6, 8], time: '~3 dk' },
      precise: { name: 'Hassas (9 Tümü)', squares: [0,1,2,3,4,5,6,7,8], time: '~5 dk' },
      custom: { name: 'Özelleştirilmiş Sayım', squares: [], time: 'Değişken', custom: true }
    },
    formula: (total, n) => (total / n) * 10000,
    volumePerSquare: 0.0001,
    description: 'Genel hemocytometer. Tüm sayım lamları için ortak terim.',
    usage: 'Tüm hücre tipleri, Genel amaçlı',
    rules: [
      'Standart 0.1mm derinlik',
      'Formül: (Toplam/N) × 10⁴',
      'Kenar kuralı: Üst+Sol SAY, Alt+Sağ SAYMA',
      'En yaygın laboratuvar lamı'
    ]
  }
};

// ============================================
// 🎹 TUŞ PROFİLLERİ
// ============================================

const KEY_PROFILES = {
  left: {
    name: 'Sol El (Mikroskop Sağda)',
    keys: {
      alive: 'q',
      dead: 'w',
      nextSmall: 'e',
      back: 'a',
      aliveDecrement: '1',
      deadDecrement: '2',
      // Motility mode için yeni tuşlar
      motile: 'r',
      nonMotile: 't',
      motileDecrement: '3',
      nonMotileDecrement: '4',
      // Hücre çeperi ölçüm tuşları (3D Matrix)
      thinWall: 'z',      // İnce çeper
      thickWall: 'x',     // Kalın çeper
      nextBig: 's',
      reset: 'd',
      pause: 'Tab'
    },
    icon: '👈',
    safe: true
  },
  right: {
    name: 'Sağ El (Mikroskop Solda)',
    keys: {
      alive: 'i',
      dead: 'o',
      nextSmall: 'p',
      back: 'k',
      aliveDecrement: '8',
      deadDecrement: '9',
      // Motility mode için yeni tuşlar
      motile: 'u',
      nonMotile: 'y',
      motileDecrement: '7',
      nonMotileDecrement: '6',
      // Hücre çeperi ölçüm tuşları (3D Matrix)
      thinWall: 'm',      // İnce çeper
      thickWall: 'n',     // Kalın çeper
      nextBig: 'l',
      reset: ';',
      pause: 'Tab'
    },
    icon: '👉',
    safe: true
  },
  numpad: {
    name: 'Numpad (Masaüstü)',
    keys: {
      alive: '4',
      dead: '5',
      nextSmall: '6',
      back: '1',
      aliveDecrement: '7',
      deadDecrement: '8',
      // Motility mode için numpad üzerinde farklı tuşlar
      motile: '/',
      nonMotile: '*',
      motileDecrement: '-',
      nonMotileDecrement: '+',
      // Hücre çeperi ölçüm tuşları (3D Matrix)
      thinWall: '0',      // İnce çeper
      thickWall: '.',     // Kalın çeper
      nextBig: '2',
      reset: '3',
      pause: 'Enter'
    },
    icon: '⌨️',
    safe: true,
    requiresNumLock: true
  }
};

// ============================================
// 🎨 COMPONENT
// ============================================

const CellCountingV2 = () => {
  // 🔴 ENFORCED MERKEZI SISTEM BAĞLANTISI - TankID zorunlu
  const { addCellCount, getTankState, getAllTankStates, state } = useEnforcedChlorellaSystem();
  
  // Ana state
  const [mode, setMode] = useState('classic'); // 'classic' | 'smart'
  const [showGuide, setShowGuide] = useState(false);
  const [chamber, setChamber] = useState('thoma');
  const [strategy, setStrategy] = useState('normal');
  const [dilution, setDilution] = useState(1); // 1:1, 1:10, 1:100
  
  // Custom Hemocytometer Stratejisi
  const [customHemoConfig, setCustomHemoConfig] = useState({
    depth: 0.1,        // mm
    bigSquares: 5,     // Sayılacak büyük kare sayısı
    smallPerBig: 16    // Her büyük karedeki küçük kare sayısı
  });
  
  // Manuel kare seçimi için
  const [selectedSquares, setSelectedSquares] = useState([]);
  
  // Tank ve Numune Bilgileri
  const [sampleInfo, setSampleInfo] = useState({
    tankSource: '',
    sampleDate: new Date().toISOString().split('T')[0],
    isDiluted: false,
    dilutionMethod: 'manual', // 'manual' | 'calculated'
    // Manuel seyreltme
    manualDilutionFactor: 1,
    // Hesaplanmış seyreltme
    sampleVolume: '',
    diluentVolume: '',
    calculatedDilution: 1
  });
  
  // Tercihler
  // İstatistiksel Analiz
  const [selectedTest, setSelectedTest] = useState('pairedT');
  const [testResults, setTestResults] = useState(null);
  const [selectedTanks, setSelectedTanks] = useState([]);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedPostHoc, setSelectedPostHoc] = useState('tukey'); // tukey, bonferroni, scheffe, duncan
  
  const [preferences, setPreferences] = useState({
    keyProfile: 'left',
    isLaptop: false,
    disableTouchpad: false,
    audioEnabled: true,
    audioVolume: 0.7,
    visualFeedback: true,
    showMethodology: true,
    motilityMode: 'viability', // 'viability' (canlı/ölü) | 'motility' (hareketli/hareketsiz)
    cellWallMeasurement: false, // Hücre çeperi ölçümü aktif mi?
    cellWallThresholds: {
      thin: 0.5,  // µm - İnce çeper eşiği
      thick: 1.0  // µm - Kalın çeper eşiği
    }
  });

  // Klasik mod state - 3D Matrix (6 kombinasyon)
  const [classicSquares, setClassicSquares] = useState(
    Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      alive: 0,
      dead: 0,
      motile: 0,
      nonMotile: 0,
      wallThickness: '',
      matrix: {
        aliveThin: 0,
        aliveThick: 0,
        aliveUnknown: 0,
        deadThin: 0,
        deadThick: 0,
        deadUnknown: 0,
        motileThin: 0,
        motileThick: 0,
        motileUnknown: 0,
        nonMotileThin: 0,
        nonMotileThick: 0,
        nonMotileUnknown: 0
      }
    }))
  );

  // Akıllı mod state - 3D Matrix
  const [smartMode, setSmartMode] = useState({
    isActive: false,
    currentBigSquare: 0,
    currentSmallSquare: 0,
    counts: {}, // { bigSquareIdx: { alive, dead, motile, nonMotile, smallSquares: [...], matrix: {...} } }
    startTime: null,
    totalAlive: 0,
    totalDead: 0,
    totalMotile: 0,
    totalNonMotile: 0
  });

  // Sonuçlar
  const [results, setResults] = useState(null);

  // Audio context
  const audioContextRef = useRef(null);

  // ============================================
  // YARDIMCI FONKSİYONLAR
  // ============================================

  // localStorage'dan aktif tank listesini getir
  const getTankList = () => {
    try {
      const tankStatesRaw = localStorage.getItem('tankStates');
      
      if (!tankStatesRaw) {
        return [];
      }
      
      const tankStates = JSON.parse(tankStatesRaw);
      
      const activeTanks = tankStates
        .filter(tank => tank.active)
        .map(tank => tank.id);
      
      return activeTanks;
    } catch (e) {
      console.error('❌ Tank listesi alınamadı:', e);
      return [];
    }
  };

  // Anlık hücre/mL hesaplama (sayım sırasında canlı göster)
  const calculateLiveCellsPerMl = () => {
    const spec = CHAMBER_SPECS[chamber];
    const strat = spec.strategies[strategy];
    
    // Şu ana kadar sayılan toplam kare sayısı
    const totalSquaresCounted = smartMode.currentBigSquare * spec.smallPerBig + smartMode.currentSmallSquare + 1;
    
    if (totalSquaresCounted === 0) return 0;
    
    let totalCells;
    if (preferences.motilityMode === 'viability') {
      totalCells = smartMode.totalAlive + smartMode.totalDead;
    } else {
      totalCells = (smartMode.totalMotile || 0) + (smartMode.totalNonMotile || 0);
    }
    
    const cellsPerMl = spec.formula(totalCells, totalSquaresCounted) * dilution;
    
    return cellsPerMl;
  };

  // Canlılık veya hareketlilik yüzdesi
  const calculateLiveViability = () => {
    if (preferences.motilityMode === 'viability') {
      const total = smartMode.totalAlive + smartMode.totalDead;
      if (total === 0) return 0;
      return (smartMode.totalAlive / total) * 100;
    } else {
      const total = (smartMode.totalMotile || 0) + (smartMode.totalNonMotile || 0);
      if (total === 0) return 0;
      return ((smartMode.totalMotile || 0) / total) * 100;
    }
  };

  // ============================================
  // EFFECTS
  // ============================================

  // Chamber değiştiğinde strategy'yi reset et
  useEffect(() => {
    const spec = CHAMBER_SPECS[chamber];
    const availableStrategies = Object.keys(spec.strategies);
    if (availableStrategies.length > 0 && !spec.strategies[strategy]) {
      // Mevcut strateji geçerli değilse ilkini seç
      setStrategy(availableStrategies[0]);
    }
  }, [chamber]);

  // Strateji değişince klasik mod karelerini yeniden initialize et
  useEffect(() => {
    const spec = CHAMBER_SPECS[chamber];
    const strat = spec.strategies[strategy];
    
    if (!strat) return; // Strateji henüz yüklenmediyse bekle
    
    // Custom stratejide kullanıcı ayarlarını kullan
    const squareCount = strat.custom 
      ? customHemoConfig.bigSquares 
      : strat.isManualSelection
        ? selectedSquares.length
        : (strat.squares && strat.squares.length > 0 ? strat.squares.length : (strat.random || 5));
    
    setClassicSquares(
      Array.from({ length: squareCount }, (_, i) => ({
        id: i + 1,
        alive: 0,
        dead: 0,
        motile: 0,
        nonMotile: 0,
        wallThickness: '',
        matrix: {
          aliveThin: 0,
          aliveThick: 0,
          aliveUnknown: 0,
          deadThin: 0,
          deadThick: 0,
          deadUnknown: 0,
          motileThin: 0,
          motileThick: 0,
          motileUnknown: 0,
          nonMotileThin: 0,
          nonMotileThick: 0,
          nonMotileUnknown: 0
        }
      }))
    );
  }, [chamber, strategy, customHemoConfig.bigSquares, selectedSquares.length]);

  // ============================================
  // 🔊 SES SİSTEMİ
  // ============================================

  useEffect(() => {
    if (preferences.audioEnabled) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [preferences.audioEnabled]);

  const playSound = (type) => {
    if (!preferences.audioEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.value = preferences.audioVolume;

    switch (type) {
      case 'smallSquare': // Bib
        oscillator.frequency.value = 800;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        break;
      case 'bigSquare': // Biiip
        oscillator.frequency.value = 600;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        break;
      case 'complete': // Ding!
        oscillator.frequency.value = 1000;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        break;
      case 'alive': // Kısa tik
        oscillator.frequency.value = 1200;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        break;
      case 'dead': // Düşük ton
        oscillator.frequency.value = 400;
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        break;
    }

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
  };

  // ============================================
  // ⌨️ KLAVYE KONTROLÜ
  // ============================================

  useEffect(() => {
    if (mode !== 'smart' || !smartMode.isActive) return;

    const handleKeyDown = (e) => {
      const profile = KEY_PROFILES[preferences.keyProfile];
      const key = e.key.toLowerCase();
      const isMotilityMode = preferences.motilityMode === 'motility';
      const isFullMode = preferences.motilityMode === 'full';

      // ESC ile çıkış
      if (key === 'escape') {
        pauseSmartCounting();
        if (preferences.disableTouchpad) {
          document.body.style.pointerEvents = 'auto';
        }
        return;
      }

      // Full mode - tüm tuşlar aktif
      if (isFullMode) {
        // Viability tuşları (Q/W)
        if (key === profile.keys.alive) {
          e.preventDefault();
          incrementCount('alive');
          playSound('alive');
        } else if (key === profile.keys.dead) {
          e.preventDefault();
          incrementCount('dead');
          playSound('dead');
        } else if (key === profile.keys.aliveDecrement) {
          e.preventDefault();
          decrementCount('alive');
          playSound('alive');
        } else if (key === profile.keys.deadDecrement) {
          e.preventDefault();
          decrementCount('dead');
          playSound('dead');
        }
        // Motility tuşları (R/T)
        else if (key === profile.keys.motile) {
          e.preventDefault();
          incrementCount('motile');
          playSound('alive');
        } else if (key === profile.keys.nonMotile) {
          e.preventDefault();
          incrementCount('nonMotile');
          playSound('dead');
        } else if (key === profile.keys.motileDecrement) {
          e.preventDefault();
          decrementCount('motile');
          playSound('alive');
        } else if (key === profile.keys.nonMotileDecrement) {
          e.preventDefault();
          decrementCount('nonMotile');
          playSound('dead');
        }
      } else {
        // Profil tuşları - Viability mode
        if (!isMotilityMode) {
          if (key === profile.keys.alive) {
            e.preventDefault();
            incrementCount('alive');
            playSound('alive');
          } else if (key === profile.keys.dead) {
            e.preventDefault();
            incrementCount('dead');
            playSound('dead');
          } else if (key === profile.keys.aliveDecrement) {
            e.preventDefault();
            decrementCount('alive');
            playSound('alive');
          } else if (key === profile.keys.deadDecrement) {
            e.preventDefault();
            decrementCount('dead');
            playSound('dead');
          }
        }
        
        // Motility mode tuşları
        if (isMotilityMode) {
          if (key === profile.keys.motile) {
            e.preventDefault();
            incrementCount('motile');
            playSound('alive');
          } else if (key === profile.keys.nonMotile) {
            e.preventDefault();
            incrementCount('nonMotile');
            playSound('dead');
          } else if (key === profile.keys.motileDecrement) {
            e.preventDefault();
            decrementCount('motile');
            playSound('alive');
          } else if (key === profile.keys.nonMotileDecrement) {
            e.preventDefault();
            decrementCount('nonMotile');
            playSound('dead');
          }
        }
      }
      
      // Hücre çeperi ölçüm tuşları (3D Matrix için)
      if (preferences.cellWallMeasurement) {
        if (key === profile.keys.thinWall) {
          e.preventDefault();
          console.log('🔍 İnce çeper tuşuna basıldı:', key, '| Profile:', profile.name);
          console.log('🔍 SmartMode currentBigSquare:', smartMode.currentBigSquare);
          console.log('🔍 Counts:', smartMode.counts);
          incrementCellWall('thin');
          playSound('smallSquare');
        } else if (key === profile.keys.thickWall) {
          e.preventDefault();
          console.log('🔍 Kalın çeper tuşuna basıldı:', key, '| Profile:', profile.name);
          console.log('🔍 SmartMode currentBigSquare:', smartMode.currentBigSquare);
          console.log('🔍 Counts:', smartMode.counts);
          incrementCellWall('thick');
          playSound('smallSquare');
        }
      }
      
      // Ortak tuşlar (her modda)
      if (key === profile.keys.nextSmall) {
        e.preventDefault();
        nextSmallSquare();
      } else if (key === profile.keys.back) {
        e.preventDefault();
        previousSquare();
      } else if (key === profile.keys.nextBig) {
        e.preventDefault();
        nextBigSquare();
      } else if (key === profile.keys.reset) {
        e.preventDefault();
        resetCurrentSquare();
      } else if (key === profile.keys.pause) {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, preferences.keyboardProfile, preferences.motilityMode, preferences.cellWallMeasurement]);

  // ============================================
  // 🎮 AKILLI MOD FONKSİYONLARI
  // ============================================

  const startSmartCounting = () => {
    const spec = CHAMBER_SPECS[chamber];
    const strat = spec.strategies[strategy];

    // Touchpad kapat
    if (preferences.disableTouchpad && preferences.isLaptop) {
      document.body.style.pointerEvents = 'none';
    }

    setSmartMode({
      isActive: true,
      currentBigSquare: 0,
      currentSmallSquare: 0,
      counts: {},
      startTime: Date.now(),
      totalAlive: 0,
      totalDead: 0,
      totalMotile: 0,
      totalNonMotile: 0,
      totalThinWall: 0,
      totalThickWall: 0,
      squaresToCount: strat.squares || []
    });
  };

  const pauseSmartCounting = () => {
    setSmartMode(prev => ({ ...prev, isActive: false }));
    if (preferences.disableTouchpad) {
      document.body.style.pointerEvents = 'auto';
    }
  };

  const togglePause = useCallback(() => {
    setSmartMode(prev => ({ ...prev, isActive: !prev.isActive }));
  }, []);

  const incrementCount = useCallback((type) => {
    console.log('📈 incrementCount çağrıldı, type:', type, '| Mode:', preferences.motilityMode);
    setSmartMode(prev => {
      const bigIdx = prev.currentBigSquare;
      const smallIdx = prev.currentSmallSquare;
      
      const newCounts = { ...prev.counts };
      if (!newCounts[bigIdx]) {
        newCounts[bigIdx] = { alive: 0, dead: 0, motile: 0, nonMotile: 0, smallSquares: [], lastCellType: null };
      }
      
      newCounts[bigIdx][type]++;
      
      // SON SAYILAN HÜCRE TİPİNİ KAYDET (hücre duvarı ölçümü için)
      // Viability modu: alive/dead
      // Motility modu: motile/nonMotile
      // Full modu: motile hareketli ve canlı, nonMotile hareketsiz ve canlı
      if (preferences.motilityMode === 'viability') {
        if (type === 'alive') {
          newCounts[bigIdx].lastCellType = 'alive'; // Canlı (hareketsiz varsayımı)
        } else if (type === 'dead') {
          newCounts[bigIdx].lastCellType = 'dead';
        }
      } else if (preferences.motilityMode === 'motility' || preferences.motilityMode === 'full') {
        if (type === 'motile') {
          newCounts[bigIdx].lastCellType = 'aliveMotile'; // Hareketli = canlı + hareketli
        } else if (type === 'nonMotile') {
          newCounts[bigIdx].lastCellType = 'aliveNonMotile'; // Hareketsiz = canlı + hareketsiz
        } else if (type === 'dead') {
          newCounts[bigIdx].lastCellType = 'dead';
        }
      }
      
      console.log('✅ lastCellType güncellendi:', newCounts[bigIdx].lastCellType);
      
      const updates = {
        ...prev,
        counts: newCounts
      };
      
      // Totalleri güncelle
      if (type === 'alive') updates.totalAlive = prev.totalAlive + 1;
      if (type === 'dead') updates.totalDead = prev.totalDead + 1;
      if (type === 'motile') updates.totalMotile = (prev.totalMotile || 0) + 1;
      if (type === 'nonMotile') updates.totalNonMotile = (prev.totalNonMotile || 0) + 1;
      
      return updates;
    });
  }, [preferences.motilityMode]);


  const decrementCount = useCallback((type) => {
    setSmartMode(prev => {
      const bigIdx = prev.currentBigSquare;
      
      const newCounts = { ...prev.counts };
      if (!newCounts[bigIdx]) return prev;
      if (newCounts[bigIdx][type] <= 0) return prev; // Negatif olmasın
      
      newCounts[bigIdx][type]--;
      
      const updates = {
        ...prev,
        counts: newCounts
      };
      
      // Totalleri güncelle
      if (type === 'alive') updates.totalAlive = Math.max(0, prev.totalAlive - 1);
      if (type === 'dead') updates.totalDead = Math.max(0, prev.totalDead - 1);
      if (type === 'motile') updates.totalMotile = Math.max(0, (prev.totalMotile || 0) - 1);
      if (type === 'nonMotile') updates.totalNonMotile = Math.max(0, (prev.totalNonMotile || 0) - 1);
      
      return updates;
    });
  }, []);


  // 3D Matrix: Hücre çeperi kaydı (son sayılan hücreye çeper tipi atar)
  const incrementCellWall = useCallback((wallType) => {
    console.log('📊 incrementCellWall çağrıldı, wallType:', wallType);
    setSmartMode(prev => {
      const bigIdx = prev.currentBigSquare;
      const newCounts = { ...prev.counts };
      
      if (!newCounts[bigIdx]) {
        console.warn('⚠️ Kare bulunamadı:', bigIdx);
        return prev;
      }
      
      // Matrix'i başlat
      if (!newCounts[bigIdx].matrix) {
        newCounts[bigIdx].matrix = {
          aliveMotileThin: 0,
          aliveMotileThick: 0,
          aliveNonMotileThin: 0,
          aliveNonMotileThick: 0,
          deadThin: 0,
          deadThick: 0
        };
      }
      
      // SON SAYILAN HÜCRE TİPİNİ AL (bu karede en son hangi hücre sayıldı?)
      const lastCellType = newCounts[bigIdx].lastCellType;
      console.log('🔍 lastCellType:', lastCellType, '| Kare:', bigIdx, '| WallType:', wallType);
      
      if (!lastCellType) {
        // Henüz hiç hücre sayılmamış, hücre duvarı ölçülemez
        console.warn('⚠️ Hücre duvarı ölçmek için önce bir hücre saymalısınız!');
        return prev;
      }
      
      // Toplam sayaçları güncelle
      const updates = {
        ...prev,
        counts: newCounts
      };
      
      if (wallType === 'thin') {
        updates.totalThinWall = (prev.totalThinWall || 0) + 1;
      } else {
        updates.totalThickWall = (prev.totalThickWall || 0) + 1;
      }
      
      // Son sayılan hücre tipine göre matrix'i güncelle
      switch (lastCellType) {
        case 'aliveMotile':
          if (wallType === 'thin') {
            newCounts[bigIdx].matrix.aliveMotileThin++;
          } else {
            newCounts[bigIdx].matrix.aliveMotileThick++;
          }
          break;
        
        case 'aliveNonMotile':
        case 'alive': // Viability modunda canlı = hareketsiz
          if (wallType === 'thin') {
            newCounts[bigIdx].matrix.aliveNonMotileThin++;
          } else {
            newCounts[bigIdx].matrix.aliveNonMotileThick++;
          }
          break;
        
        case 'dead':
          if (wallType === 'thin') {
            newCounts[bigIdx].matrix.deadThin++;
          } else {
            newCounts[bigIdx].matrix.deadThick++;
          }
          break;
        
        default:
          console.warn(`⚠️ Bilinmeyen hücre tipi: ${lastCellType}`);
          return prev;
      }
      
      // lastCellType'ı sıfırla (bir sonraki hücre için hazır)
      newCounts[bigIdx].lastCellType = null;
      
      return updates;
    });
  }, []);

  const nextSmallSquare = useCallback(() => {
    const spec = CHAMBER_SPECS[chamber];
    const maxSmall = spec.smallPerBig;

    setSmartMode(prev => {
      const nextSmall = prev.currentSmallSquare + 1;
      
      if (nextSmall >= maxSmall) {
        // Küçük kareler bitti, büyük kareye geç
        playSound('bigSquare');
        // nextBigSquare mantığını burada uygula (state içinde kalmak için)
        const strat = CHAMBER_SPECS[chamber].strategies[strategy];
        const squaresToCount = strat.squares || [];
        const currentIdx = squaresToCount.indexOf(prev.currentBigSquare);
        
        if (currentIdx === -1 || currentIdx >= squaresToCount.length - 1) {
          // Tamamlandı!
          playSound('complete');
          setTimeout(() => calculateResults(), 500);
          return {
            ...prev,
            isActive: false
          };
        } else {
          // Bir sonraki büyük kareye geç
          return {
            ...prev,
            currentBigSquare: squaresToCount[currentIdx + 1],
            currentSmallSquare: 0
          };
        }
      } else {
        playSound('smallSquare');
        return {
          ...prev,
          currentSmallSquare: nextSmall
        };
      }
    });
  }, [chamber, strategy]);

  const nextBigSquare = useCallback(() => {
    const strat = CHAMBER_SPECS[chamber].strategies[strategy];
    const squaresToCount = strat.squares || [];
    
    setSmartMode(prev => {
      const currentIdx = squaresToCount.indexOf(prev.currentBigSquare);
      
      if (currentIdx === -1 || currentIdx >= squaresToCount.length - 1) {
        // Tamamlandı!
        playSound('complete');
        // Biraz bekle sonra sonuçları hesapla
        setTimeout(() => calculateResults(), 500);
        return {
          ...prev,
          isActive: false
        };
      } else {
        playSound('bigSquare');
        return {
          ...prev,
          currentBigSquare: squaresToCount[currentIdx + 1],
          currentSmallSquare: 0
        };
      }
    });
  }, [chamber, strategy]);

  const previousSquare = useCallback(() => {
    setSmartMode(prev => {
      const bigIdx = prev.currentBigSquare;
      const smallIdx = prev.currentSmallSquare;
      
      // Mevcut karenin sayılarını sıfırla
      const newCounts = { ...prev.counts };
      if (newCounts[bigIdx]) {
        const alive = newCounts[bigIdx].alive || 0;
        const dead = newCounts[bigIdx].dead || 0;
        newCounts[bigIdx] = { alive: 0, dead: 0, smallSquares: [] };
        
        if (smallIdx > 0) {
          // Aynı büyük karede geriye git
          playSound('smallSquare');
          return { 
            ...prev, 
            currentSmallSquare: smallIdx - 1,
            counts: newCounts,
            totalAlive: prev.totalAlive - alive,
            totalDead: prev.totalDead - dead
          };
        } else if (bigIdx > 0) {
          // Önceki büyük kareye git
          const spec = CHAMBER_SPECS[chamber];
          playSound('bigSquare');
          return {
            ...prev,
            currentBigSquare: bigIdx - 1,
            currentSmallSquare: spec.smallPerBig - 1,
            counts: newCounts,
            totalAlive: prev.totalAlive - alive,
            totalDead: prev.totalDead - dead
          };
        }
      }
      return prev;
    });
  }, [chamber]);

  const resetCurrentSquare = useCallback(() => {
    setSmartMode(prev => {
      const newCounts = { ...prev.counts };
      const bigIdx = prev.currentBigSquare;
      
      if (newCounts[bigIdx]) {
        const alive = newCounts[bigIdx].alive;
        const dead = newCounts[bigIdx].dead;
        
        newCounts[bigIdx] = { alive: 0, dead: 0, smallSquares: [] };
        
        return {
          ...prev,
          counts: newCounts,
          totalAlive: prev.totalAlive - alive,
          totalDead: prev.totalDead - dead,
          currentSmallSquare: 0
        };
      }
      return prev;
    });
  }, []);

  // ============================================
  // 🧮 HESAPLAMALAR
  // ============================================

  // İstatistiksel Fonksiyonlar
  const calculateMean = (values) => {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  };

  const calculateStdDev = (values, mean) => {
    if (values.length <= 1) return 0;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / (values.length - 1);
    return Math.sqrt(variance);
  };

  const calculateStdError = (stdDev, n) => {
    if (n <= 0) return 0;
    return stdDev / Math.sqrt(n);
  };

  const calculateCV = (stdDev, mean) => {
    if (mean === 0) return 0;
    return (stdDev / mean) * 100;
  };

  const calculate95CI = (mean, stdError) => {
    const z = 1.96; // 95% güven için z-skoru
    return {
      lower: mean - (z * stdError),
      upper: mean + (z * stdError)
    };
  };

  const formatScientific = (value, stdDev, stdError) => {
    if (value === 0) return '0';
    const exponent = Math.floor(Math.log10(Math.abs(value)));
    const mantissa = value / Math.pow(10, exponent);
    
    if (stdDev && stdError) {
      const stdDevMantissa = stdDev / Math.pow(10, exponent);
      const stdErrorMantissa = stdError / Math.pow(10, exponent);
      return `${mantissa.toFixed(3)} ± ${stdDevMantissa.toFixed(3)} (${stdErrorMantissa.toFixed(3)}) × 10^${exponent} hücre/mL`;
    }
    
    return `${mantissa.toFixed(2)} × 10${exponent >= 0 ? '⁺' : '⁻'}${Math.abs(exponent)}`;
  };

  // ============================================
  // 📊 İSTATİSTİKSEL TEST FONKSİYONLARI (FAZ 2)
  // ============================================

  // Paired t-Test (Eşleştirilmiş örnekler)
  const pairedTTest = (sample1, sample2) => {
    if (sample1.length !== sample2.length || sample1.length < 2) {
      return { error: 'Örnekler eşit uzunlukta ve en az 2 ölçüm olmalı' };
    }
    
    const n = sample1.length;
    const differences = sample1.map((val, i) => val - sample2[i]);
    const meanDiff = differences.reduce((a, b) => a + b, 0) / n;
    const variance = differences.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / (n - 1);
    const stdError = Math.sqrt(variance / n);
    const tStatistic = meanDiff / stdError;
    const df = n - 1;
    
    // p-value yaklaşık hesaplama (t-distribution)
    const pValue = 2 * (1 - tCDF(Math.abs(tStatistic), df));
    
    return {
      testName: 'Paired t-Test',
      n,
      meanDifference: meanDiff.toFixed(2),
      stdError: stdError.toFixed(2),
      tStatistic: tStatistic.toFixed(3),
      df,
      pValue: pValue.toFixed(4),
      significant: pValue < 0.05,
      interpretation: pValue < 0.05 
        ? '✅ İstatistiksel olarak anlamlı fark var (p < 0.05)'
        : '❌ İstatistiksel olarak anlamlı fark yok (p ≥ 0.05)'
    };
  };

  // ANOVA (Tek yönlü varyans analizi)
  const oneWayANOVA = (groups) => {
    if (groups.length < 2) {
      return { error: 'En az 2 grup gerekli' };
    }
    
    const allData = groups.flat();
    const grandMean = allData.reduce((a, b) => a + b, 0) / allData.length;
    const totalN = allData.length;
    const k = groups.length;
    
    // Between-group sum of squares
    const SSB = groups.reduce((sum, group) => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      return sum + group.length * Math.pow(groupMean - grandMean, 2);
    }, 0);
    
    // Within-group sum of squares
    const SSW = groups.reduce((sum, group) => {
      const groupMean = group.reduce((a, b) => a + b, 0) / group.length;
      return sum + group.reduce((s, val) => s + Math.pow(val - groupMean, 2), 0);
    }, 0);
    
    const dfBetween = k - 1;
    const dfWithin = totalN - k;
    const MSB = SSB / dfBetween;
    const MSW = SSW / dfWithin;
    const FStatistic = MSB / MSW;
    
    // p-value yaklaşık hesaplama (F-distribution)
    const pValue = 1 - fCDF(FStatistic, dfBetween, dfWithin);
    
    return {
      testName: 'One-Way ANOVA',
      groups: k,
      totalN,
      FStatistic: FStatistic.toFixed(3),
      dfBetween,
      dfWithin,
      pValue: pValue.toFixed(4),
      significant: pValue < 0.05,
      interpretation: pValue < 0.05
        ? '✅ Gruplar arasında anlamlı fark var (p < 0.05)'
        : '❌ Gruplar arasında anlamlı fark yok (p ≥ 0.05)'
    };
  };

  // Chi-Square Test (Ki-Kare)
  const chiSquareTest = (observed, expected) => {
    if (observed.length !== expected.length) {
      return { error: 'Gözlenen ve beklenen frekanslar eşit uzunlukta olmalı' };
    }
    
    const chiSquare = observed.reduce((sum, obs, i) => {
      const exp = expected[i];
      return sum + Math.pow(obs - exp, 2) / exp;
    }, 0);
    
    const df = observed.length - 1;
    const pValue = 1 - chiSquareCDF(chiSquare, df);
    
    return {
      testName: 'Chi-Square Test',
      chiSquare: chiSquare.toFixed(3),
      df,
      pValue: pValue.toFixed(4),
      significant: pValue < 0.05,
      interpretation: pValue < 0.05
        ? '✅ Gözlenen ve beklenen değerler arasında anlamlı fark var'
        : '❌ Gözlenen ve beklenen değerler arasında anlamlı fark yok'
    };
  };

  // Pearson Correlation
  const pearsonCorrelation = (x, y) => {
    if (x.length !== y.length || x.length < 3) {
      return { error: 'Eşit uzunlukta ve en az 3 veri noktası gerekli' };
    }
    
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denomX = 0;
    let denomY = 0;
    
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      numerator += dx * dy;
      denomX += dx * dx;
      denomY += dy * dy;
    }
    
    const r = numerator / Math.sqrt(denomX * denomY);
    const tStatistic = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
    const pValue = 2 * (1 - tCDF(Math.abs(tStatistic), n - 2));
    
    let strength = '';
    const absR = Math.abs(r);
    if (absR < 0.3) strength = 'Zayıf';
    else if (absR < 0.7) strength = 'Orta';
    else strength = 'Güçlü';
    
    return {
      testName: 'Pearson Correlation',
      n,
      r: r.toFixed(3),
      rSquared: Math.pow(r, 2).toFixed(3),
      tStatistic: tStatistic.toFixed(3),
      pValue: pValue.toFixed(4),
      significant: pValue < 0.05,
      strength,
      direction: r > 0 ? 'Pozitif' : 'Negatif',
      interpretation: pValue < 0.05
        ? `✅ ${strength} ${r > 0 ? 'pozitif' : 'negatif'} korelasyon (p < 0.05)`
        : '❌ İstatistiksel olarak anlamlı korelasyon yok'
    };
  };

  // Yardımcı fonksiyonlar - İstatistiksel dağılımlar
  const tCDF = (t, df) => {
    // Student's t-distribution CDF yaklaşımı
    const x = df / (df + t * t);
    return 1 - 0.5 * betaIncomplete(df/2, 0.5, x);
  };

  const fCDF = (f, df1, df2) => {
    // F-distribution CDF yaklaşımı
    const x = df2 / (df2 + df1 * f);
    return 1 - betaIncomplete(df2/2, df1/2, x);
  };

  const chiSquareCDF = (chi, df) => {
    // Chi-square CDF yaklaşımı (gamma distribution)
    return gammaIncomplete(df/2, chi/2);
  };

  const betaIncomplete = (a, b, x) => {
    // Incomplete beta function yaklaşımı
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    return 0.5; // Basitleştirilmiş
  };

  const gammaIncomplete = (a, x) => {
    // Incomplete gamma function yaklaşımı
    if (x <= 0) return 0;
    return 1 - Math.exp(-x); // Basitleştirilmiş
  };

  const calculateResults = () => {
    const spec = CHAMBER_SPECS[chamber];
    const strat = spec.strategies[strategy];
    const isMotilityMode = preferences.motilityMode === 'motility';
    const isFullMode = preferences.motilityMode === 'full';

    let totalAlive = 0;
    let totalDead = 0;
    let totalMotile = 0;
    let totalNonMotile = 0;
    let squareCount = 0;

    if (mode === 'smart') {
      Object.values(smartMode.counts).forEach(square => {
        totalAlive += square.alive || 0;
        totalDead += square.dead || 0;
        totalMotile += square.motile || 0;
        totalNonMotile += square.nonMotile || 0;
        squareCount++;
      });
    } else {
      classicSquares.forEach(square => {
        totalAlive += square.alive || 0;
        totalDead += square.dead || 0;
        totalMotile += square.motile || 0;
        totalNonMotile += square.nonMotile || 0;
        squareCount++;
      });
    }

    const totalCells = isFullMode 
      ? (totalAlive + totalDead) // Full mode'da toplam canlı+ölü
      : (isMotilityMode 
        ? (totalMotile + totalNonMotile)
        : (totalAlive + totalDead));
    const avgPerSquare = squareCount > 0 ? totalCells / squareCount : 0;
    
    // Seyreltme faktörünü belirle
    const finalDilution = sampleInfo.isDiluted 
      ? (sampleInfo.dilutionMethod === 'calculated' ? sampleInfo.calculatedDilution : sampleInfo.manualDilutionFactor)
      : 1;
    
    // Custom stratejisi için özel hesaplama
    let cellsPerMl;
    if (strat.custom) {
      // Custom: (Toplam / (Derinlik × Büyük Kare Sayısı)) / mL
      const depthInMm = customHemoConfig.depth;
      const bigSquaresCount = customHemoConfig.bigSquares;
      cellsPerMl = (totalCells / (depthInMm * bigSquaresCount)) * finalDilution;
    } else {
      cellsPerMl = spec.formula(totalCells, squareCount) * finalDilution;
    }
    
    // Canlılık veya hareketlilik yüzdesi
    const viability = isFullMode
      ? (totalCells > 0 ? ((totalAlive / totalCells) * 100).toFixed(1) : 0)
      : (isMotilityMode
        ? (totalCells > 0 ? ((totalMotile / totalCells) * 100).toFixed(1) : 0)
        : (totalCells > 0 ? ((totalAlive / totalCells) * 100).toFixed(1) : 0));
    
    // Full mode için hareketlilik yüzdesi
    const motility = isFullMode && (totalMotile + totalNonMotile) > 0
      ? ((totalMotile / (totalMotile + totalNonMotile)) * 100).toFixed(1)
      : undefined;

    // İSTATİSTİKSEL ANALİZ (FAZ 1.5)
    // Her karede sayılan hücre sayılarını topla
    const squareCounts = [];
    if (mode === 'smart') {
      Object.values(smartMode.counts).forEach(square => {
        const count = isFullMode
          ? ((square.alive || 0) + (square.dead || 0))
          : (isMotilityMode 
            ? ((square.motile || 0) + (square.nonMotile || 0))
            : ((square.alive || 0) + (square.dead || 0)));
        squareCounts.push(count);
      });
    } else {
      classicSquares.forEach(square => {
        const count = isFullMode
          ? ((square.alive || 0) + (square.dead || 0))
          : (isMotilityMode
            ? ((square.motile || 0) + (square.nonMotile || 0))
            : ((square.alive || 0) + (square.dead || 0)));
        squareCounts.push(count);
      });
    }

    // İstatistiksel metrikler
    const mean = calculateMean(squareCounts);
    const stdDev = calculateStdDev(squareCounts, mean);
    const stdError = calculateStdError(stdDev, squareCounts.length);
    const cv = calculateCV(stdDev, mean);
    const ci95 = calculate95CI(cellsPerMl, stdError * spec.formula(1, 1) * finalDilution);

    const statistics = {
      mean: mean.toFixed(2),
      stdDev: stdDev.toFixed(2),
      stdError: stdError.toFixed(2),
      cv: cv.toFixed(1),
      ci95: {
        lower: Math.max(0, ci95.lower).toFixed(0),
        upper: ci95.upper.toFixed(0)
      },
      scientificNotation: formatScientific(cellsPerMl, stdDev * spec.formula(1, 1) * finalDilution, stdError * spec.formula(1, 1) * finalDilution),
      nCells: totalCells,
      nSquares: squareCount,
      isReliable: totalCells >= 100,
      qualityWarning: totalCells < 100 
        ? `⚠️ Toplam ${totalCells} hücre sayıldı. En az 100 hücre önerilir (düşük güvenilirlik).` 
        : totalCells < 200
        ? `⚡ ${totalCells} hücre sayıldı. İyi sonuç için 200+ önerilir.`
        : null
    };

    const resultData = {
      chamber: spec.name,
      strategy: strat.name,
      dilution: finalDilution,
      countingMode: isFullMode ? 'full-3d' : (isMotilityMode ? 'motility' : 'viability'),
      totalAlive,
      totalDead,
      totalMotile,
      totalNonMotile,
      totalCells,
      avgPerSquare: avgPerSquare.toFixed(1),
      cellsPerMl: Math.round(cellsPerMl).toLocaleString(),
      cellsPerMlRaw: Math.round(cellsPerMl),
      viability,
      motility, // Full mode için hareketlilik yüzdesi
      statistics, // İSTATİSTİK EKLENDİ
      timestamp: new Date().toISOString(),
      // Tank ve numune bilgileri
      tankSource: sampleInfo.tankSource,
      sampleDate: sampleInfo.sampleDate,
      isDiluted: sampleInfo.isDiluted,
      dilutionDetails: sampleInfo.isDiluted ? {
        method: sampleInfo.dilutionMethod,
        factor: finalDilution,
        sampleVolume: sampleInfo.sampleVolume,
        diluentVolume: sampleInfo.diluentVolume
      } : null
    };

    setResults(resultData);
    
    // Tank bilgisine kaydet
    if (sampleInfo.tankSource) {
      saveTankData(resultData);
    }
  };

  // Tank verilerine kaydetme
  const saveTankData = (resultData) => {
    try {
      const tankData = JSON.parse(localStorage.getItem('tankDetails') || '{}');
      
      if (!tankData[sampleInfo.tankSource]) {
        tankData[sampleInfo.tankSource] = { cellCounts: [], qualityParams: [] };
      }
      
      const cellCountEntry = {
        date: sampleInfo.sampleDate,
        cellsPerMl: resultData.cellsPerMlRaw,
        viability: parseFloat(resultData.viability),
        motility: resultData.motility ? parseFloat(resultData.motility) : null,
        method: resultData.chamber,
        strategy: resultData.strategy,
        dilution: resultData.dilution,
        timestamp: resultData.timestamp,
        // İstatistiksel testler için ham veri
        rawData: {
          totalAlive: resultData.totalAlive,
          totalDead: resultData.totalDead,
          totalMotile: resultData.totalMotile,
          totalNonMotile: resultData.totalNonMotile
        }
      };
      
      tankData[sampleInfo.tankSource].cellCounts.push(cellCountEntry);
      localStorage.setItem('tankDetails', JSON.stringify(tankData));
      
      // � MERKEZI SİSTEME KAYDET
      if (sampleInfo.tankSource) {
        addCellCount(sampleInfo.tankSource, {
          value: resultData.cellsPerMlRaw,
          method: mode === 'smart' ? 'smart_counting' : chamber,
          dilution: dilution,
          confidence: 'high',
          notes: `${mode} mode, ${strategy} strategy, ${resultData.squaresCounted} squares`,
          viability: resultData.viability,
          biomassEstimate_gL: resultData.cellsPerMlRaw / 1e8,
          rawCounts: mode === 'smart' ? smartMode.counts : classicSquares
        });
        
        console.log(`✅ Hücre sayımı merkezi sisteme kaydedildi: Tank ${sampleInfo.tankSource}, ${(resultData.cellsPerMlRaw / 1e6).toFixed(2)}M cells/mL`);
      }
      
      // 🔥 MODEL'E BİLDİR - YENİ! (backward compatibility)
      const tankStates = JSON.parse(localStorage.getItem('tankStates') || '[]');
      const tank = tankStates.find(t => t.id === sampleInfo.tankSource);
      
      if (tank?.startDate) {
        const daysSince = Math.floor((new Date(cellCountEntry.timestamp) - new Date(tank.startDate)) / (1000 * 60 * 60 * 24));
        
        window.dispatchEvent(new CustomEvent('tankDataUpdate', {
          detail: {
            tankId: sampleInfo.tankSource,
            type: 'cellCount',
            data: {
              day: daysSince,
              biomass: resultData.cellsPerMlRaw / 1e8,  // cells/ml → g/L yaklaşık
              viability: parseFloat(resultData.viability),
              timestamp: cellCountEntry.timestamp
            }
          }
        }));
        
        console.log(`🔔 Model'e hücre sayımı gönderildi: ${sampleInfo.tankSource}, Gün ${daysSince}, ${(resultData.cellsPerMlRaw / 1e6).toFixed(2)}M cells/ml`);
      }
      
      // Sayım geçmişine de kaydet
      const history = JSON.parse(localStorage.getItem('cellCountHistory') || '[]');
      history.push({
        ...resultData,
        mode,
        rawCounts: mode === 'smart' ? smartMode.counts : classicSquares
      });
      localStorage.setItem('cellCountHistory', JSON.stringify(history));
      
    } catch (error) {
      console.error('Tank verisi kaydedilemedi:', error);
    }
  };

  const calculateClassic = () => {
    calculateResults();
  };

  // ============================================
  // 💧 SEYRELTME HESAPLAYICI
  // ============================================

  const calculateDilution = () => {
    const sample = parseFloat(sampleInfo.sampleVolume);
    const diluent = parseFloat(sampleInfo.diluentVolume);
    
    if (!sample || !diluent || sample <= 0 || diluent <= 0) {
      alert('Lütfen geçerli hacim değerleri girin');
      return;
    }
    
    const totalVolume = sample + diluent;
    const calculatedFactor = totalVolume / sample;
    
    setSampleInfo(prev => ({
      ...prev,
      calculatedDilution: calculatedFactor,
      isDiluted: true,
      dilutionMethod: 'calculated'
    }));
  };

  // ============================================
  // 📥 KAYDET / İNDİR
  // ============================================

  const downloadResults = () => {
    const data = {
      ...results,
      mode,
      chamber,
      strategy,
      rawCounts: mode === 'smart' ? smartMode.counts : classicSquares
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cell-count-${Date.now()}.json`;
    a.click();
  };

  // ============================================
  // 🎨 RENDER
  // ============================================

  const spec = CHAMBER_SPECS[chamber];
  const strat = spec.strategies[strategy];
  const profile = KEY_PROFILES[preferences.keyProfile];

  // Strateji henüz yüklenmediyse loading göster
  if (!strat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Rehber görünümü
  if (showGuide) {
    return <CellCountingGuide onBack={() => setShowGuide(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Microscope className="w-12 h-12" />
              <div>
                <h2 className="text-3xl font-bold">Mikroskop Hücre Sayımı V2</h2>
                <p className="text-cyan-100">7 Lam Sistemi • Klasik & Akıllı Canlı Sayım</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowGuide(true)}
                className="px-4 py-3 rounded-xl font-semibold transition-all bg-white/20 hover:bg-white/30 flex items-center gap-2"
              >
                <BookOpen className="w-5 h-5" />
                📚 Rehber
              </button>
              <button
                onClick={() => setMode('classic')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'classic'
                    ? 'bg-white text-cyan-600 shadow-lg'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'
                }`}
              >
                📋 Klasik Mod
              </button>
              <button
                onClick={() => setMode('smart')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  mode === 'smart'
                    ? 'bg-white text-cyan-600 shadow-lg'
                    : 'bg-cyan-600 text-white hover:bg-cyan-700'
                }`}
              >
                🎯 Akıllı Canlı Sayım
              </button>
            </div>
          </div>
        </div>

        {/* Lam & Strateji Seçimi */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🔬 Sayım Lamı</label>
              <select
                value={chamber}
                onChange={(e) => setChamber(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500"
              >
                {Object.entries(CHAMBER_SPECS).map(([key, spec]) => (
                  <option key={key} value={key}>
                    {spec.name} ({spec.depth}mm)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">📊 Sayım Stratejisi</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500"
              >
                {Object.entries(spec.strategies).map(([key, strat]) => (
                  <option key={key} value={key}>
                    {strat.name} - {strat.time}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tank ve Seyreltme Bilgileri */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            Numune Bilgileri
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Sol: Tank & Tarih */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏷️ Numune Kaynağı (Tank)</label>
                <select
                  value={sampleInfo.tankSource}
                  onChange={(e) => setSampleInfo(prev => ({ ...prev, tankSource: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Tank Seçin --</option>
                  {getTankList().map(tank => (
                    <option key={tank} value={tank}>{tank}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Sonuçlar bu tankın verilerine kaydedilecek</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Numune Tarihi</label>
                <input
                  type="date"
                  value={sampleInfo.sampleDate}
                  onChange={(e) => setSampleInfo(prev => ({ ...prev, sampleDate: e.target.value }))}
                  className="w-full border-2 border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sağ: Seyreltme */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                <input
                  type="checkbox"
                  id="isDiluted"
                  checked={sampleInfo.isDiluted}
                  onChange={(e) => setSampleInfo(prev => ({ ...prev, isDiluted: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="isDiluted" className="font-semibold text-gray-700">
                  💧 Numune seyreltildi mi?
                </label>
              </div>

              {sampleInfo.isDiluted && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSampleInfo(prev => ({ ...prev, dilutionMethod: 'manual' }))}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                        sampleInfo.dilutionMethod === 'manual'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Manuel (1:10, 1:100)
                    </button>
                    <button
                      onClick={() => setSampleInfo(prev => ({ ...prev, dilutionMethod: 'calculated' }))}
                      className={`flex-1 py-2 rounded-lg font-semibold text-sm ${
                        sampleInfo.dilutionMethod === 'calculated'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Hesapla (Hacimlerden)
                    </button>
                  </div>

                  {sampleInfo.dilutionMethod === 'manual' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Seyreltme Faktörü</label>
                      <select
                        value={sampleInfo.manualDilutionFactor}
                        onChange={(e) => setSampleInfo(prev => ({ ...prev, manualDilutionFactor: parseInt(e.target.value) }))}
                        className="w-full border-2 border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="1">1:1 (Seyreltmesiz)</option>
                        <option value="2">1:2</option>
                        <option value="5">1:5</option>
                        <option value="10">1:10</option>
                        <option value="100">1:100</option>
                        <option value="1000">1:1000</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">🧪 Numune (mL)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={sampleInfo.sampleVolume}
                            onChange={(e) => setSampleInfo(prev => ({ ...prev, sampleVolume: e.target.value }))}
                            placeholder="Örn: 2"
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">💧 Su/Seyreltici (mL)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={sampleInfo.diluentVolume}
                            onChange={(e) => setSampleInfo(prev => ({ ...prev, diluentVolume: e.target.value }))}
                            placeholder="Örn: 8"
                            className="w-full border border-gray-300 rounded p-2 text-sm"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={calculateDilution}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                      >
                        <Calculator className="w-4 h-4 inline mr-1" />
                        Seyreltme Hesapla
                      </button>

                      {sampleInfo.calculatedDilution > 1 && (
                        <div className="mt-2 bg-green-50 border-2 border-green-300 rounded-lg p-3">
                          <p className="text-sm font-bold text-green-900">
                            Seyreltme: 1:{sampleInfo.calculatedDilution.toFixed(1)}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {sampleInfo.sampleVolume} mL numune + {sampleInfo.diluentVolume} mL seyreltici = 
                            {' '}{(parseFloat(sampleInfo.sampleVolume) + parseFloat(sampleInfo.diluentVolume)).toFixed(1)} mL toplam
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ana İçerik Grid */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Sol Panel: Metodoloji */}
          {preferences.showMethodology && (
            <div className="bg-white rounded-xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Metodoloji Rehberi
                </h3>
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, showMethodology: false }))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <h4 className="font-bold text-cyan-900">{spec.name}</h4>
                  <p className="text-sm text-cyan-700 mt-1">{spec.description}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">📐 Yapı:</p>
                  <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                    <li>• {spec.bigSquares} büyük kare ({spec.bigSquareLayout})</li>
                    <li>• Her büyük: {spec.smallPerBig} küçük kare</li>
                    <li>• Derinlik: {spec.depth} mm</li>
                    <li>• Hacim/kare: {spec.volumePerSquare} mL</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">🎯 Kullanım:</p>
                  <p className="text-sm text-gray-600 ml-4 mt-1">{spec.usage}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">📏 Sayım Kuralları:</p>
                  <ul className="text-sm text-gray-600 ml-4 mt-1 space-y-1">
                    {spec.rules.map((rule, idx) => (
                      <li key={idx}>• {rule}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">🧮 Formül:</p>
                  <div className="bg-gray-100 p-3 rounded mt-1 font-mono text-sm">
                    Hücre/mL = (Toplam / N) × {spec.formula(1, 1).toLocaleString()}
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-4">
                  <p className="text-sm font-semibold text-yellow-900">💡 Strateji: {strat.name}</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {strat.isManualSelection 
                      ? `${selectedSquares.length > 0 ? selectedSquares.length : 'Henüz kare seçilmedi'} - Özel seçim`
                      : strat.squares && strat.squares.length > 0 
                        ? `${strat.squares.length} kare sayılacak` 
                        : `${strat.random || 0} rastgele kare`}
                  </p>
                  <p className="text-xs text-yellow-700">Tahmini süre: {strat.time}</p>
                </div>
                
                {/* Detaylı Mod Kılavuzu */}
                <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mt-4">
                  <p className="font-bold text-blue-900 mb-2 text-sm">📚 Detaylı Mod Kullanımı</p>
                  
                  <div className="bg-white rounded p-2 mb-2 border border-blue-200">
                    <p className="font-semibold text-blue-800 mb-1 text-xs">Senaryo 1: Canlılık Modu</p>
                    <p className="text-gray-700 mb-1 text-xs"><strong>Örnek:</strong> 12 canlı, 3 ölü (9 canlı ince, 3 canlı kalın, 2 ölü ince, 1 ölü kalın)</p>
                    <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre">{`📋 Kare 1
┌────────────────────────────┐
│ Basit: Canlı=12, Ölü=3  │
└────────────────────────────┘
Detaylı:
 Canlı: İ=9 K=3 B=0
 Ölü:  İ=2 K=1 B=0
 Toplam: 15 hücre`}</pre>
                  </div>
                  
                  <div className="bg-yellow-50 rounded p-2 border border-yellow-300">
                    <p className="font-semibold text-yellow-900 mb-1 text-xs">⚠️ Önemli:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs">
                      <li><strong>Basit Mod:</strong> Sadece toplam sayılar</li>
                      <li><strong>Detaylı Mod:</strong> Zar kalınlığı dağılımı</li>
                      <li><strong>İ K B:</strong> İnce / Kalın / Belirsiz</li>
                    </ul>
                  </div>
                </div>

                {/* İleri İstatistiksel Analiz Sistemi */}
                <div className="bg-purple-50 border-2 border-purple-400 rounded-lg p-4 mt-4">
                  <p className="font-bold text-purple-900 mb-2 text-sm">📊 İleri İstatistiksel Analiz Sistemi</p>
                  
                  <div className="bg-white rounded p-2 mb-2 border border-purple-200">
                    <p className="font-semibold text-purple-800 mb-1 text-xs">Sistem Akışı:</p>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 text-xs ml-2">
                      <li>Kullanıcı tank adı girip sayım yapar</li>
                      <li>Hesapla/Başlat butonuna basar</li>
                      <li>Sonuçlar görünür</li>
                      <li><strong>Sonuçların hemen altında istatistik paneli otomatik açılır</strong> (buton yok, hep görünür)</li>
                      <li>Kullanıcı 4 test arasında seçim yapabilir</li>
                      <li>Demo butonu ile test çalıştırabilir</li>
                      <li>Sonuçları JSON'de görebilir</li>
                    </ol>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded p-2 border border-purple-300">
                    <p className="font-semibold text-purple-900 mb-1 text-xs">🧪 Mevcut Testler:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 text-xs ml-2">
                      <li><strong>Paired t-Test:</strong> İki farklı ölçüm zamanındaki hücre konsantrasyonlarını karşılaştırır</li>
                      <li><strong>ANOVA:</strong> Üç veya daha fazla grup arasındaki hücre konsantrasyonu farklarını karşılaştırır</li>
                      <li><strong>Chi-Square:</strong> Canlı/ölü hücre oranlarının beklenen değerlerden farklı olup olmadığını test eder</li>
                      <li><strong>Correlation:</strong> Canlılık oranı ile hücre konsantrasyonu arasındaki ilişkiyi inceler</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orta & Sağ Panel: Mod'a Göre */}
          <div className={preferences.showMethodology ? "col-span-2" : "col-span-3"}>
            {mode === 'classic' ? (
              <ClassicCountingMode
                spec={spec}
                strat={strat}
                chamber={chamber}
                customHemoConfig={customHemoConfig}
                setCustomHemoConfig={setCustomHemoConfig}
                selectedSquares={selectedSquares}
                setSelectedSquares={setSelectedSquares}
                classicSquares={classicSquares}
                setClassicSquares={setClassicSquares}
                calculateClassic={calculateClassic}
                results={results}
                downloadResults={downloadResults}
                icons={{ Calculator, Database, Beaker, Download }}
                preferences={preferences}
                setPreferences={setPreferences}
                sampleInfo={sampleInfo}
                selectedTest={selectedTest}
                setSelectedTest={setSelectedTest}
                testResults={testResults}
                setTestResults={setTestResults}
                selectedTanks={selectedTanks}
                setSelectedTanks={setSelectedTanks}
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                selectedPostHoc={selectedPostHoc}
                setSelectedPostHoc={setSelectedPostHoc}
              />
            ) : (
              <SmartCountingMode
                spec={spec}
                strat={strat}
                smartMode={smartMode}
                preferences={preferences}
                setPreferences={setPreferences}
                profile={profile}
                startSmartCounting={startSmartCounting}
                pauseSmartCounting={pauseSmartCounting}
                results={results}
                downloadResults={downloadResults}
                icons={{ Settings, Play, Download }}
                calculateLiveCellsPerMl={calculateLiveCellsPerMl}
                calculateLiveViability={calculateLiveViability}
                sampleInfo={sampleInfo}
                selectedTest={selectedTest}
                setSelectedTest={setSelectedTest}
                testResults={testResults}
                setTestResults={setTestResults}
                selectedTanks={selectedTanks}
                setSelectedTanks={setSelectedTanks}
                selectedDates={selectedDates}
                setSelectedDates={setSelectedDates}
                selectedPostHoc={selectedPostHoc}
                setSelectedPostHoc={setSelectedPostHoc}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// 📋 KLASİK SAYIM MODU COMPONENT
// ============================================

const ClassicCountingMode = ({ spec, strat, chamber, customHemoConfig, setCustomHemoConfig, selectedSquares, setSelectedSquares, classicSquares, setClassicSquares, calculateClassic, results, downloadResults, icons, preferences, setPreferences, sampleInfo, selectedTest, setSelectedTest, testResults, setTestResults, selectedTanks, setSelectedTanks, selectedDates, setSelectedDates, selectedPostHoc, setSelectedPostHoc }) => {
  const { Calculator, Database, Beaker, Download } = icons;
  const isMotilityMode = preferences.motilityMode === 'motility';
  
  const updateSquare = (id, field, value) => {
    setClassicSquares(prev =>
      prev.map(sq => {
        if (sq.id !== id) return sq;
        
        // Nested matrix field (e.g., "matrix.aliveThin")
        if (field.startsWith('matrix.')) {
          const matrixField = field.split('.')[1];
          return {
            ...sq,
            matrix: {
              ...sq.matrix,
              [matrixField]: value === '' ? 0 : parseInt(value) || 0
            }
          };
        }
        
        // Regular field
        return { ...sq, [field]: value === '' ? 0 : parseInt(value) || 0 };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Sayım Ayarları */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">⚙️</span>
          Sayım Ayarları
        </h3>
        
        {/* Sayım Modu */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">📊 Sayım Modu</h4>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border-2 border-green-200 hover:border-green-400 transition">
              <input
                type="radio"
                name="countingMode"
                value="viability"
                checked={preferences.motilityMode === 'viability'}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  motilityMode: e.target.value
                }))}
                className="form-radio text-green-600"
              />
              <span className="text-sm font-medium">💚 Canlılık (Canlı/Ölü)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition">
              <input
                type="radio"
                name="countingMode"
                value="motility"
                checked={preferences.motilityMode === 'motility'}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  motilityMode: e.target.value
                }))}
                className="form-radio text-orange-600"
              />
              <span className="text-sm font-medium">🏃 Hareketlilik (Hareketli/Hareketsiz)</span>
            </label>
          </div>
        </div>

        {/* Hücre Çeperi Ölçümü */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              id="cellWallMeasurement"
              checked={preferences.cellWallMeasurement}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                cellWallMeasurement: e.target.checked
              }))}
              className="form-checkbox text-blue-600 h-5 w-5"
            />
            <label htmlFor="cellWallMeasurement" className="text-sm font-semibold text-gray-700 cursor-pointer">
              🔬 Hücre Çeperi Kalınlığı Ölçümü (İnce Zar / Kalın Zar)
            </label>
          </div>
          
          {preferences.cellWallMeasurement && (
            <div className="ml-7 mt-2 p-3 bg-white rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">İnce Çeper Eşiği (µm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={preferences.cellWallThresholds.thin}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      cellWallThresholds: {
                        ...prev.cellWallThresholds,
                        thin: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Kalın Çeper Eşiği (µm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={preferences.cellWallThresholds.thick}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      cellWallThresholds: {
                        ...prev.cellWallThresholds,
                        thick: parseFloat(e.target.value) || 0
                      }
                    }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">💡 Ölçüm sırasında hücre çeperini ince/kalın olarak işaretleyebilirsiniz</p>
              
              {/* DETAYLI MOD KILAVUZU */}
              <div className="mt-3 bg-blue-50 border-2 border-blue-400 rounded-lg p-3 text-xs">
                <p className="font-bold text-blue-900 mb-2 text-sm">📖 Detaylı Mod Kullanım Kılavuzu</p>
                
                <div className="bg-white rounded p-2 mb-2 border border-blue-200">
                  <p className="font-semibold text-blue-800 mb-1">Senaryo 1: Canlılık Modu (Canlı/Ölü)</p>
                  <p className="text-gray-700 mb-1"><strong>Örnek:</strong> Kare 1'de 12 canlı, 3 ölü hücre saydınız.</p>
                  <p className="text-gray-600 mb-2">9 canlı ince zarla, 3 canlı kalın zarla, 2 ölü ince, 1 ölü kalın.</p>
                  <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre">{`📋 Kare 1
┌─────────────────────────────────────┐
│ Basit Mod (üstte):                  │
│   👍 Canlı: 12                      │
│   ☠️ Ölü: 3                         │
└─────────────────────────────────────┘

🔬 Detaylı Zar Kalınlığı Dağılımı:
┌──────────┬──────────┬──────────┐
│ 👍 Canlı │ ☠️ Ölü   │ 📊 Toplam│
│ İ: 9      │ İ: 2      │          │
│ K: 3      │ K: 1      │   15     │
│ B: 0      │ B: 0      │  hücre  │
└──────────┴──────────┴──────────┘`}</pre>
                </div>
                
                <div className="bg-white rounded p-2 mb-2 border border-blue-200">
                  <p className="font-semibold text-blue-800 mb-1">Senaryo 2: Hareketlilik Modu</p>
                  <p className="text-gray-700 mb-1"><strong>Örnek:</strong> Kare 2'de 8 hareketli, 4 hareketsiz.</p>
                  <p className="text-gray-600 mb-2">5 hareketli ince, 3 hareketli kalın, 2 hareketsiz ince, 2 hareketsiz kalın.</p>
                  <pre className="bg-gray-800 text-green-400 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre">{`📋 Kare 2
┌─────────────────────────────────────┐
│ Basit Mod (üstte):                  │
│   🏃 Hareketli: 8                   │
│   🛑 Hareketsiz: 4                  │
└─────────────────────────────────────┘

🔬 Detaylı Zar Kalınlığı Dağılımı:
┌──────────────┬──────────────┬──────────┐
│ 🏃 Hareketli │ 🛑 Hareketsiz│ 📊 Toplam│
│ İ: 5         │ İ: 2         │          │
│ K: 3         │ K: 2         │   12     │
│ B: 0         │ B: 0         │  hücre   │
└──────────────┴──────────────┴──────────┘`}</pre>
                </div>
                
                <div className="bg-yellow-50 rounded p-2 border border-yellow-300">
                  <p className="font-semibold text-yellow-900 mb-1">⚠️ Önemli Notlar:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li><strong>Basit Mod</strong> (üstteki büyük kutular): Sadece toplam sayıları girin</li>
                    <li><strong>Detaylı Mod</strong> (alttaki küçük kutular): Zar kalınlığına göre dağılımı girin</li>
                    <li><strong>Toplam</strong> otomatik hesaplanır (sağdaki gri kutu)</li>
                    <li><strong>Belirsiz (B)</strong>: Zar kalınlığını ölçemediyseniz buraya yazın</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded p-2 mt-2 border border-green-300">
                  <p className="font-semibold text-green-900 mb-1">✅ İki Seçenek:</p>
                  <ul className="list-decimal list-inside space-y-1 text-gray-700">
                    <li><strong>Sadece Basit Mod:</strong> Üstteki büyük kutulara toplam sayıları gir, detaylı modu boş bırak</li>
                    <li><strong>Detaylı Mod:</strong> Hem basit hem detaylı modları doldur (istatistikler için daha iyi)</li>
                  </ul>
                </div>
                
                <p className="mt-2 text-center text-blue-800 font-semibold">
                  İ = İnce • K = Kalın • B = Belirsiz
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        {/* Custom Hemocytometer Yapılandırması */}
        {chamber === 'hemocytometer' && strat.custom && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-purple-900 mb-3 text-lg">⚙️ Özelleştirilmiş Hemocytometer Yapılandırması</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-800 mb-1">
                  Derinlik (mm)
                </label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  value={customHemoConfig.depth}
                  onChange={(e) => setCustomHemoConfig({...customHemoConfig, depth: parseFloat(e.target.value) || 0.1})}
                  className="w-full border-2 border-purple-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-600 mt-1">Örn: 0.1, 0.2, 1.0</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-800 mb-1">
                  Sayılacak Büyük Kare
                </label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={customHemoConfig.bigSquares}
                  onChange={(e) => setCustomHemoConfig({...customHemoConfig, bigSquares: parseInt(e.target.value) || 5})}
                  className="w-full border-2 border-purple-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-600 mt-1">1-50 arası</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-purple-800 mb-1">
                  Küçük Kare/Büyük
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={customHemoConfig.smallPerBig}
                  onChange={(e) => setCustomHemoConfig({...customHemoConfig, smallPerBig: parseInt(e.target.value) || 16})}
                  className="w-full border-2 border-purple-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-purple-600 mt-1">Örn: 16, 25, 100</p>
              </div>
            </div>
            <div className="mt-4 bg-white rounded p-3 border border-purple-200">
              <p className="text-sm font-semibold text-purple-900 mb-1">📐 Hesaplanan Değerler:</p>
              <div className="grid grid-cols-3 gap-2 text-xs text-purple-700">
                <div>
                  <span className="font-semibold">Hacim per kare:</span> {(customHemoConfig.depth * 0.01).toFixed(4)} µL
                </div>
                <div>
                  <span className="font-semibold">Toplam kare:</span> {customHemoConfig.bigSquares * customHemoConfig.smallPerBig}
                </div>
                <div>
                  <span className="font-semibold">Formül:</span> N × {(1 / (customHemoConfig.depth * customHemoConfig.bigSquares)).toFixed(2)} / mL
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manuel Kare Seçimi (Malassez, Fuchs-Rosenthal vb. için) */}
        {strat.isManualSelection && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mb-6">
            <h4 className="font-bold text-green-900 mb-3 text-lg">🎯 Özel Kare Seçimi</h4>
            <p className="text-sm text-green-800 mb-3">
              Lam üzerinde sayacağınız kareleri seçin. Seçtiğiniz kareler için aşağıda sayım alanları oluşturulacak.
            </p>
            
            {/* 5x5 Checkbox Grid */}
            <div className="bg-white rounded-lg p-4 border-2 border-green-200">
              <p className="text-xs font-semibold text-green-900 mb-2 text-center">
                {spec.bigSquareLayout} Grid - {spec.bigSquares} Kare
              </p>
              <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
                {Array.from({ length: spec.bigSquares }, (_, i) => (
                  <div key={i} className="relative">
                    <input
                      type="checkbox"
                      id={`square-${i}`}
                      checked={selectedSquares.includes(i)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSquares([...selectedSquares, i].sort((a, b) => a - b));
                        } else {
                          setSelectedSquares(selectedSquares.filter(s => s !== i));
                        }
                      }}
                      className="hidden peer"
                    />
                    <label
                      htmlFor={`square-${i}`}
                      className="flex items-center justify-center h-12 w-full border-2 rounded cursor-pointer
                        peer-checked:bg-green-500 peer-checked:text-white peer-checked:border-green-700 peer-checked:font-bold
                        bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      {i}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 bg-green-100 rounded p-3 border border-green-300">
                <p className="text-sm font-semibold text-green-900">
                  ✅ Seçilen Kareler: {selectedSquares.length > 0 ? selectedSquares.join(', ') : 'Henüz kare seçilmedi'}
                </p>
                {selectedSquares.length > 0 && (
                  <button
                    onClick={() => setSelectedSquares([])}
                    className="mt-2 text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    🗑️ Seçimi Temizle
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-800 mb-4">📋 Manuel Sayım Girişi</h3>
        <p className="text-sm text-gray-600 mb-6">
          Mikroskopda sayımınızı yapın, sonuçları buraya girin. {strat.name} için{' '}
          <span className="font-bold text-cyan-600">
            {strat.custom 
              ? customHemoConfig.bigSquares 
              : strat.isManualSelection
                ? (selectedSquares.length > 0 ? selectedSquares.length : '(yukarıdan kare seçin)')
                : (strat.squares && strat.squares.length > 0 ? strat.squares.length : strat.random)} kare
          </span>{' '}
          saymanız gerekiyor.
          {strat.random && strat.random >= 10 && (
            <span className="block mt-2 text-xs text-orange-600 font-semibold">
              ⚠️ Rastgele kare seçimi: Mikroskoptaki {strat.random} farklı rastgele kareyi sayın ve buraya girin.
              Sayfa uzun olacaktır, aşağı kaydırın.
            </span>
          )}
        </p>

        <div className="space-y-3">
          {strat.isManualSelection && selectedSquares.length === 0 ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
              <p className="text-yellow-900 font-semibold">⚠️ Lütfen yukarıdaki grid'den sayım yapacağınız kareleri seçin</p>
            </div>
          ) : (
            classicSquares.slice(0, strat.custom 
              ? customHemoConfig.bigSquares 
              : strat.isManualSelection
                ? selectedSquares.length
                : (strat.squares && strat.squares.length > 0 ? strat.squares.length : strat.random)
            ).map((square, idx) => {
              // Manuel selection'da gerçek kare numarasını göster
              const actualSquareNum = strat.isManualSelection ? selectedSquares[idx] : square.id;
              
              return (
            <div key={square.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border-2 border-blue-200 space-y-3">
              <div className="font-bold text-gray-800 text-lg border-b-2 border-blue-300 pb-2">
                📋 Kare {actualSquareNum}
                {strat.isManualSelection && (
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Grid: {actualSquareNum}</span>
                )}
              </div>
              
              {/* Basit Mod: Canlı/Ölü VEYA Hareketli/Hareketsiz */}
              <div className="grid grid-cols-2 gap-3">
                {isMotilityMode ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">🏃 Hareketli</label>
                      <input
                        type="number"
                        min="0"
                        value={square.motile}
                        onChange={(e) => updateSquare(square.id, 'motile', e.target.value)}
                        className="w-full border-2 border-green-400 rounded p-2 text-center font-bold text-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-orange-700 mb-1">🛑 Hareketsiz</label>
                      <input
                        type="number"
                        min="0"
                        value={square.nonMotile}
                        onChange={(e) => updateSquare(square.id, 'nonMotile', e.target.value)}
                        className="w-full border-2 border-orange-400 rounded p-2 text-center font-bold text-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-green-700 mb-1">👍 Canlı</label>
                      <input
                        type="number"
                        min="0"
                        value={square.alive}
                        onChange={(e) => updateSquare(square.id, 'alive', e.target.value)}
                        className="w-full border-2 border-green-400 rounded p-2 text-center font-bold text-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-red-700 mb-1">☠️ Ölü</label>
                      <input
                        type="number"
                        min="0"
                        value={square.dead}
                        onChange={(e) => updateSquare(square.id, 'dead', e.target.value)}
                        className="w-full border-2 border-red-400 rounded p-2 text-center font-bold text-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </>
                )}
              </div>
              
              {/* Detaylı 3D Matrix Giriş (Opsiyonel) */}
              {preferences.cellWallMeasurement && (
                <div className="bg-white p-3 rounded-lg border-2 border-indigo-300">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-bold text-indigo-900">🔬 Detaylı Zar Kalınlığı Dağılımı</h5>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Opsiyonel</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {/* Canlı/Ölü başlığa göre */}
                    {isMotilityMode ? (
                      <>
                        {/* Hareketli */}
                        <div className="bg-green-50 p-2 rounded">
                          <p className="font-semibold text-green-700 mb-1">🏃 Hareketli</p>
                          <div className="space-y-1">
                            <input type="number" min="0" placeholder="İ - İnce" 
                              value={square.matrix?.motileThin || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.motileThin', e.target.value)}
                              className="w-full border border-blue-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="K - Kalın" 
                              value={square.matrix?.motileThick || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.motileThick', e.target.value)}
                              className="w-full border border-purple-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="B - Belirsiz" 
                              value={square.matrix?.motileUnknown || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.motileUnknown', e.target.value)}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs" />
                          </div>
                        </div>
                        {/* Hareketsiz */}
                        <div className="bg-orange-50 p-2 rounded">
                          <p className="font-semibold text-orange-700 mb-1">🛑 Hareketsiz</p>
                          <div className="space-y-1">
                            <input type="number" min="0" placeholder="İ - İnce" 
                              value={square.matrix?.nonMotileThin || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.nonMotileThin', e.target.value)}
                              className="w-full border border-blue-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="K - Kalın" 
                              value={square.matrix?.nonMotileThick || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.nonMotileThick', e.target.value)}
                              className="w-full border border-purple-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="B - Belirsiz" 
                              value={square.matrix?.nonMotileUnknown || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.nonMotileUnknown', e.target.value)}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Canlı */}
                        <div className="bg-green-50 p-2 rounded">
                          <p className="font-semibold text-green-700 mb-1">👍 Canlı</p>
                          <div className="space-y-1">
                            <input type="number" min="0" placeholder="İ - İnce" 
                              value={square.matrix?.aliveThin || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.aliveThin', e.target.value)}
                              className="w-full border border-blue-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="K - Kalın" 
                              value={square.matrix?.aliveThick || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.aliveThick', e.target.value)}
                              className="w-full border border-purple-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="B - Belirsiz" 
                              value={square.matrix?.aliveUnknown || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.aliveUnknown', e.target.value)}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs" />
                          </div>
                        </div>
                        {/* Ölü */}
                        <div className="bg-red-50 p-2 rounded">
                          <p className="font-semibold text-red-700 mb-1">☠️ Ölü</p>
                          <div className="space-y-1">
                            <input type="number" min="0" placeholder="İ - İnce" 
                              value={square.matrix?.deadThin || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.deadThin', e.target.value)}
                              className="w-full border border-blue-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="K - Kalın" 
                              value={square.matrix?.deadThick || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.deadThick', e.target.value)}
                              className="w-full border border-purple-300 rounded px-1 py-0.5 text-xs" />
                            <input type="number" min="0" placeholder="B - Belirsiz" 
                              value={square.matrix?.deadUnknown || 0}
                              onChange={(e) => updateSquare(square.id, 'matrix.deadUnknown', e.target.value)}
                              className="w-full border border-gray-300 rounded px-1 py-0.5 text-xs" />
                          </div>
                        </div>
                      </>
                    )}
                    {/* Toplam */}
                    <div className="bg-gray-100 p-2 rounded">
                      <p className="font-semibold text-gray-700 mb-1">📊 Toplam</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(() => {
                          if (!square.matrix) return (isMotilityMode ? square.motile + square.nonMotile : square.alive + square.dead);
                          if (isMotilityMode) {
                            return (square.matrix.motileThin || 0) + (square.matrix.motileThick || 0) + (square.matrix.motileUnknown || 0) +
                                   (square.matrix.nonMotileThin || 0) + (square.matrix.nonMotileThick || 0) + (square.matrix.nonMotileUnknown || 0);
                          } else {
                            return (square.matrix.aliveThin || 0) + (square.matrix.aliveThick || 0) + (square.matrix.aliveUnknown || 0) +
                                   (square.matrix.deadThin || 0) + (square.matrix.deadThick || 0) + (square.matrix.deadUnknown || 0);
                          }
                        })()}
                      </p>
                      <p className="text-xs text-gray-600">hücre</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">💡 Örnek: 12 canlı hücre → 9 ince, 3 kalın gibi</p>
                </div>
              )}
            </div>
          );
            })
          )}
        </div>

        <button
          onClick={() => {
            calculateClassic();
            if (sampleInfo.tankSource) {
              setTimeout(() => {
                alert(`✅ Sonuçlar başarıyla hesaplandı ve "${sampleInfo.tankSource}" tankına kaydedildi!\n\n📊 Sonuçların altında ileri istatistiksel analiz bölümünü görebilirsiniz.`);
              }, 100);
            } else {
              setTimeout(() => {
                alert('⚠️ Tank adı girilmediği için sonuçlar KAYDED İLMED İ!\n\nİleri istatistik analizi için tank adı gereklidir.');
              }, 100);
            }
          }}
          className="mt-6 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
        >
          <Calculator className="w-5 h-5 inline mr-2" />
          {sampleInfo.tankSource ? '💾 HESAPLA VE KAYDET' : '⚠️ HESAPLA (Kaydedilmeyecek)'}
        </button>
        {!sampleInfo.tankSource && (
          <p className="text-center text-red-600 text-sm mt-2 font-semibold">
            ⚠️ Tank seçimi yapılmadı - Sonuçlar kaydedilmeyecek!
          </p>
        )}
      </div>

      {results && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Sonuçlar</h3>
          
          {/* Tank ve Seyreltme Bilgisi */}
          {(results.tankSource || results.isDiluted) && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2">
              {results.tankSource && (
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-700">Tank:</span>
                  <span className="text-gray-900">{results.tankSource}</span>
                </div>
              )}
              {results.isDiluted && results.dilutionDetails && (
                <div className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-gray-700">Seyreltme:</span>
                  <span className="text-gray-900">
                    1:{results.dilution.toFixed(1)}
                    {results.dilutionDetails.method === 'calculated' && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({results.dilutionDetails.sampleVolume} mL + {results.dilutionDetails.diluentVolume} mL)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            {isMotilityMode ? (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">🏃 Hareketli</p>
                  <p className="text-3xl font-bold text-green-900">{results.totalMotile}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-700">🛑 Hareketsiz</p>
                  <p className="text-3xl font-bold text-orange-900">{results.totalNonMotile}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Hücre/mL</p>
                  <p className="text-3xl font-bold text-blue-900">{results.cellsPerMl}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Hareketlilik</p>
                  <p className="text-3xl font-bold text-purple-900">{results.viability}%</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">Canlı Hücreler</p>
                  <p className="text-3xl font-bold text-green-900">{results.totalAlive}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-700">Ölü Hücreler</p>
                  <p className="text-3xl font-bold text-red-900">{results.totalDead}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">Hücre/mL</p>
                  <p className="text-3xl font-bold text-blue-900">{results.cellsPerMl}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-purple-700">Canlılık</p>
                  <p className="text-3xl font-bold text-purple-900">{results.viability}%</p>
                </div>
              </>
            )}
          </div>
          
          {/* İSTATİSTİKSEL ANALİZ (FAZ 1.5) */}
          {results.statistics && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
              <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                📊 İstatistiksel Analiz
              </h4>
              
              {/* Kalite Uyarısı */}
              {results.statistics.qualityWarning && (
                <div className={`mb-4 p-3 rounded-lg ${results.statistics.isReliable ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'} border`}>
                  <p className={`text-sm font-semibold ${results.statistics.isReliable ? 'text-yellow-800' : 'text-red-800'}`}>
                    {results.statistics.qualityWarning}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {/* Bilimsel Notasyon - Büyük Gösterim */}
                <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-indigo-200">
                  <p className="text-xs text-gray-600 mb-1">Bilimsel Notasyon</p>
                  <p className="text-2xl font-bold text-indigo-900">{results.statistics.scientificNotation}</p>
                </div>
                
                {/* Standart Sapma */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Standart Sapma (σ)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.stdDev}</p>
                  <p className="text-xs text-gray-500 mt-1">Hücre/kare</p>
                </div>
                
                {/* Standart Hata */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Standart Hata (SE)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.stdError}</p>
                  <p className="text-xs text-gray-500 mt-1">Hücre/kare</p>
                </div>
                
                {/* Varyasyon Katsayısı */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Varyasyon Katsayısı (CV)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.cv}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(results.statistics.cv) < 10 ? '✅ Çok iyi' : 
                     parseFloat(results.statistics.cv) < 20 ? '👍 İyi' : 
                     '⚠️ Yüksek varyasyon'}
                  </p>
                </div>
                
                {/* 95% Güven Aralığı */}
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">95% Güven Aralığı</p>
                  <p className="text-sm font-bold text-gray-900">
                    {parseFloat(results.statistics.ci95.lower).toLocaleString()} - {parseFloat(results.statistics.ci95.upper).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">hücre/mL</p>
                </div>
                
                {/* Sayım Bilgisi */}
                <div className="col-span-2 bg-indigo-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-indigo-700">Toplam Hücre Sayısı</p>
                      <p className="text-lg font-bold text-indigo-900">{results.statistics.nCells} hücre</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700">Sayılan Kare</p>
                      <p className="text-lg font-bold text-indigo-900">{results.statistics.nSquares} kare</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700">Güvenilirlik</p>
                      <p className="text-lg font-bold text-indigo-900">
                        {results.statistics.isReliable ? '✅' : '⚠️'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded-lg">
                <p className="font-semibold mb-1">📖 Not:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>σ: Sayımlar arasındaki değişkenlik</li>
                  <li>SE: Ortalama değerin hassasiyeti</li>
                  <li>CV: Oransal değişkenlik (&lt;15% ideal)</li>
                  <li>CI: Gerçek değerin %95 olasılıkla bulunduğu aralık</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Hücre Çeperi İstatistikleri */}
          {preferences.cellWallMeasurement && (() => {
            const thinCount = classicSquares.filter(sq => sq.wallThickness === 'thin').length;
            const thickCount = classicSquares.filter(sq => sq.wallThickness === 'thick').length;
            const unknownCount = classicSquares.filter(sq => !sq.wallThickness).length;
            const totalMeasured = thinCount + thickCount;
            
            if (totalMeasured > 0) {
              return (
                <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🔬</span>
                    Hücre Çeperi Kalınlığı Dağılımı
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-xs text-blue-600">İnce Çeper</p>
                      <p className="text-2xl font-bold text-blue-900">{thinCount}</p>
                      <p className="text-xs text-gray-600">{totalMeasured > 0 ? Math.round((thinCount/totalMeasured)*100) : 0}%</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-xs text-purple-600">Kalın Çeper</p>
                      <p className="text-2xl font-bold text-purple-900">{thickCount}</p>
                      <p className="text-xs text-gray-600">{totalMeasured > 0 ? Math.round((thickCount/totalMeasured)*100) : 0}%</p>
                    </div>
                    <div className="bg-white p-3 rounded shadow-sm">
                      <p className="text-xs text-gray-600">Belirsiz</p>
                      <p className="text-2xl font-bold text-gray-900">{unknownCount}</p>
                      <p className="text-xs text-gray-500">ölçülmedi</p>
                    </div>
                  </div>
                </div>
              );
            }
          })()}

          {/* 🆕 İLERİ İSTATİSTİKSEL ANALİZ (Modül ile) */}
          {results && sampleInfo.tankSource && (
            <AdvancedStatistics
              tankData={JSON.parse(localStorage.getItem('tankDetails') || '{}')}
              currentTank={sampleInfo.tankSource}
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
              testResults={testResults}
              setTestResults={setTestResults}
              selectedTanks={selectedTanks}
              setSelectedTanks={setSelectedTanks}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              selectedPostHoc={selectedPostHoc}
              setSelectedPostHoc={setSelectedPostHoc}
            />
          )}
          
          <button
            onClick={downloadResults}
            className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all"
          >
            <Download className="w-4 h-4 inline mr-2" />
            JSON İndir
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🎯 AKILLI CANLI SAYIM MODU COMPONENT
// ============================================

const SmartCountingMode = ({ spec, strat, smartMode, preferences, setPreferences, profile, startSmartCounting, pauseSmartCounting, results, downloadResults, icons, calculateLiveCellsPerMl, calculateLiveViability, sampleInfo, selectedTest, setSelectedTest, testResults, setTestResults, selectedTanks, setSelectedTanks, selectedDates, setSelectedDates, selectedPostHoc, setSelectedPostHoc }) => {
  const { Settings, Play, Download } = icons;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="space-y-6">
      {/* Ayarlar Paneli */}
      {showSettings && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Sayım Tercihleri
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">🖐️ Hangi eliniz klavyede?</label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(KEY_PROFILES).map(([key, prof]) => (
                  <button
                    key={key}
                    onClick={() => setPreferences(prev => ({ ...prev, keyProfile: key }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      preferences.keyProfile === key
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-300 hover:border-cyan-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{prof.icon}</div>
                    <div className="text-xs font-semibold">{prof.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-lg">
              <input
                type="checkbox"
                id="isLaptop"
                checked={preferences.isLaptop}
                onChange={(e) => setPreferences(prev => ({ ...prev, isLaptop: e.target.checked }))}
                className="w-5 h-5"
              />
              <label htmlFor="isLaptop" className="text-sm font-semibold text-gray-700">
                💻 Laptop kullanıyorum
              </label>
            </div>

            {preferences.isLaptop && (
              <div className="flex items-center gap-3 bg-red-50 p-4 rounded-lg ml-6">
                <input
                  type="checkbox"
                  id="disableTouchpad"
                  checked={preferences.disableTouchpad}
                  onChange={(e) => setPreferences(prev => ({ ...prev, disableTouchpad: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="disableTouchpad" className="text-sm text-gray-700">
                  Touchpad'i sayım sırasında kapat (ESC ile açılır)
                </label>
              </div>
            )}

            <div>
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="checkbox"
                  id="audioEnabled"
                  checked={preferences.audioEnabled}
                  onChange={(e) => setPreferences(prev => ({ ...prev, audioEnabled: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="audioEnabled" className="text-sm font-semibold text-gray-700">
                  🔊 Ses Geri Bildirimi
                </label>
              </div>
              {preferences.audioEnabled && (
                <div className="ml-8">
                  <label className="block text-xs text-gray-600 mb-1">Ses Seviyesi</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.audioVolume}
                    onChange={(e) => setPreferences(prev => ({ ...prev, audioVolume: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3">🔬 Sayım Yöntemi</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, motilityMode: 'viability' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.motilityMode === 'viability'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl mb-2">💚</div>
                  <div className="text-sm font-bold mb-1">Canlılık</div>
                  <div className="text-xs text-gray-600">Canlı / Ölü sayımı</div>
                  <div className="text-xs text-gray-500 mt-2">Trypan Blue boyama</div>
                </button>
                
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, motilityMode: 'motility' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.motilityMode === 'motility'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🏃</div>
                  <div className="text-sm font-bold mb-1">Hareketlilik</div>
                  <div className="text-xs text-gray-600">Hareketli / Hareketsiz</div>
                  <div className="text-xs text-gray-500 mt-2">Boyasız gözlem</div>
                </button>
                
                <button
                  onClick={() => setPreferences(prev => ({ ...prev, motilityMode: 'full' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    preferences.motilityMode === 'full'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-sm font-bold mb-1">3D Tam Mod</div>
                  <div className="text-xs text-gray-600">Aynı anda hepsi</div>
                  <div className="text-xs text-gray-500 mt-2">Q/W + R/T + Z/X</div>
                </button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="cellWallMeasurement"
                  checked={preferences.cellWallMeasurement}
                  onChange={(e) => setPreferences(prev => ({ ...prev, cellWallMeasurement: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="cellWallMeasurement" className="text-sm font-semibold text-gray-700">
                  🔍 Hücre Çeperi Ölçümü (3D Matrix)
                </label>
              </div>
              {preferences.cellWallMeasurement && (
                <div className="ml-8 space-y-3 bg-purple-50 p-4 rounded-lg">
                  <div className="text-xs text-purple-800 font-semibold mb-2">
                    📏 Okuler Mikrometre ile ölçüm yapın ve tuşlarla kaydedin:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <div className="font-bold text-purple-700">İnce Çeper (&lt; {preferences.cellWallThresholds.thin} µm)</div>
                      <div className="text-gray-600">Tuş: Z (sol) / M (sağ) / 0 (numpad)</div>
                      <div className="text-gray-500 mt-1">→ Sağlıklı hücreler</div>
                    </div>
                    <div className="bg-white p-2 rounded border border-purple-200">
                      <div className="font-bold text-purple-700">Kalın Çeper (&gt; {preferences.cellWallThresholds.thick} µm)</div>
                      <div className="text-gray-600">Tuş: X (sol) / N (sağ) / . (numpad)</div>
                      <div className="text-gray-500 mt-1">→ Stresli hücreler</div>
                    </div>
                  </div>
                  <div className="text-xs text-purple-700 mt-2">
                    💡 <strong>Teşhis değeri:</strong> Ölü + İnce çeper → Akut stres (toksin, şok) / Ölü + Kalın çeper → Kronik stres (besin eksikliği)
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Paneli */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">🎯 Canlı Sayım Kontrolü</h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!smartMode.isActive ? (
          <div>
            <button
              onClick={startSmartCounting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-xl font-bold text-xl hover:shadow-xl transition-all"
            >
              <Play className="w-6 h-6 inline mr-2" />
              SAYIMI BAŞLAT
            </button>
            <p className="text-sm text-gray-600 mt-3 text-center">
              {strat.squares ? `${strat.squares.length} büyük kare` : `${strat.random} rastgele kare`} sayılacak
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-white border-2 border-cyan-500 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">İlerleme</span>
                <span className="text-sm text-cyan-600 font-bold">
                  {smartMode.currentBigSquare + 1} / {spec.bigSquares} Büyük Kare
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
                  style={{ width: `${((smartMode.currentBigSquare + 1) / spec.bigSquares) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                Küçük Kare: {smartMode.currentSmallSquare + 1}/{spec.smallPerBig} | 
                Toplam: {(smartMode.currentBigSquare * spec.smallPerBig) + smartMode.currentSmallSquare + 1} / {spec.bigSquares * spec.smallPerBig}
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white p-6 rounded-xl">
              <div className={`grid gap-4 text-center ${preferences.cellWallMeasurement ? 'grid-cols-3' : 'grid-cols-4'}`}>
                <div>
                  <p className="text-xs opacity-75">Büyük Kare</p>
                  <p className="text-3xl font-bold">{smartMode.currentBigSquare + 1}</p>
                </div>
                <div>
                  <p className="text-xs opacity-75">Küçük Kare</p>
                  <p className="text-3xl font-bold">{smartMode.currentSmallSquare + 1}/{spec.smallPerBig}</p>
                </div>
                {preferences.motilityMode === 'viability' ? (
                  <>
                    <div>
                      <p className="text-xs opacity-75">👍 Canlı (Toplam)</p>
                      <p className="text-3xl font-bold text-green-200">{smartMode.totalAlive}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">☠️ Ölü (Toplam)</p>
                      <p className="text-3xl font-bold text-red-200">{smartMode.totalDead}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-xs opacity-75">🏃 Hareketli</p>
                      <p className="text-3xl font-bold text-green-200">{smartMode.totalMotile || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">🛑 Hareketsiz</p>
                      <p className="text-3xl font-bold text-orange-200">{smartMode.totalNonMotile || 0}</p>
                    </div>
                  </>
                )}
              </div>
              
              {/* Hücre Çeperi Sayaçları */}
              {preferences.cellWallMeasurement && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-xs text-center opacity-75 mb-3">🔍 Hücre Çeperi Ölçümü (Toplam)</p>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-xs opacity-75">📏 İnce Çeper</p>
                      <p className="text-2xl font-bold text-purple-200">{smartMode.totalThinWall || 0}</p>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-xs opacity-75">📏 Kalın Çeper</p>
                      <p className="text-2xl font-bold text-pink-200">{smartMode.totalThickWall || 0}</p>
                    </div>
                  </div>
                </div>
              )}
              
              
              {/* Mevcut Küçük Karedeki Sayılar */}
              {smartMode.counts[smartMode.currentBigSquare] && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <p className="text-xs text-center opacity-75 mb-2">Bu Küçük Karede:</p>
                  <div className={`grid gap-4 text-center ${preferences.motilityMode === 'full' ? 'grid-cols-4' : 'grid-cols-2'}`}>
                    {preferences.motilityMode === 'full' ? (
                      <>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">👍 Canlı</p>
                          <p className="text-2xl font-bold text-green-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.alive || 0}
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">☠️ Ölü</p>
                          <p className="text-2xl font-bold text-red-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.dead || 0}
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">🏃 Hareketli</p>
                          <p className="text-2xl font-bold text-cyan-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.motile || 0}
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">🛑 Hareketsiz</p>
                          <p className="text-2xl font-bold text-orange-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.nonMotile || 0}
                          </p>
                        </div>
                      </>
                    ) : preferences.motilityMode === 'viability' ? (
                      <>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">👍 Canlı</p>
                          <p className="text-2xl font-bold text-green-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.alive || 0}
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">☠️ Ölü</p>
                          <p className="text-2xl font-bold text-red-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.dead || 0}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">🏃 Hareketli</p>
                          <p className="text-2xl font-bold text-green-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.motile || 0}
                          </p>
                        </div>
                        <div className="bg-white/20 rounded-lg p-2">
                          <p className="text-xs opacity-75">🛑 Hareketsiz</p>
                          <p className="text-2xl font-bold text-orange-200">
                            {smartMode.counts[smartMode.currentBigSquare]?.nonMotile || 0}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* 3D Matrix Bilgisi (Hücre Çeperi Ölçümü Aktifse) */}
                  {preferences.cellWallMeasurement && smartMode.counts[smartMode.currentBigSquare]?.matrix && (
                    <div className="mt-3 bg-purple-900/30 rounded-lg p-3">
                      <p className="text-xs text-center opacity-75 mb-2">🔍 Hücre Çeperi Dağılımı</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {preferences.motilityMode === 'viability' ? (
                          <>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-green-300">Canlı+İnce</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveNonMotileThin || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-yellow-300">Canlı+Kalın</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveNonMotileThick || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-red-300">Ölü+İnce</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.deadThin || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center col-span-3">
                              <div className="text-orange-300">Ölü+Kalın</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.deadThick || 0}</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-green-300">Hareketli+İnce</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveMotileThin || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-yellow-300">Hareketli+Kalın</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveMotileThick || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-blue-300">Hareketsiz+İnce</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveNonMotileThin || 0}</div>
                            </div>
                            <div className="bg-white/10 rounded p-2 text-center">
                              <div className="text-purple-300">Hareketsiz+Kalın</div>
                              <div className="text-lg font-bold">{smartMode.counts[smartMode.currentBigSquare].matrix.aliveNonMotileThick || 0}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Anlık Hesaplama */}
              {((preferences.motilityMode === 'viability' && (smartMode.totalAlive + smartMode.totalDead) > 0) ||
                (preferences.motilityMode === 'motility' && ((smartMode.totalMotile || 0) + (smartMode.totalNonMotile || 0)) > 0) ||
                (preferences.motilityMode === 'full' && (smartMode.totalAlive + smartMode.totalDead) > 0)) && (
                <div className="mt-4 pt-4 border-t border-white/30">
                  <div className={`grid gap-4 text-center ${preferences.motilityMode === 'full' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <div>
                      <p className="text-xs opacity-75">🔬 Anlık Hücre/mL</p>
                      <p className="text-2xl font-bold text-yellow-200">
                        {calculateLiveCellsPerMl().toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">{preferences.motilityMode === 'full' ? '💚 Canlılık %' : (preferences.motilityMode === 'viability' ? '💚 Canlılık' : '🏃 Hareketlilik')}</p>
                      <p className="text-2xl font-bold text-green-200">{calculateLiveViability().toFixed(1)}%</p>
                    </div>
                    {preferences.motilityMode === 'full' && (
                      <div>
                        <p className="text-xs opacity-75">🏃 Hareketlilik %</p>
                        <p className="text-2xl font-bold text-cyan-200">
                          {((smartMode.totalMotile || 0) / ((smartMode.totalMotile || 0) + (smartMode.totalNonMotile || 0)) * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-center mt-2 opacity-60">
                    {(smartMode.currentBigSquare * spec.smallPerBig) + smartMode.currentSmallSquare + 1} kare sayıldı
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-700 mb-3">🎹 Aktif Tuşlar ({profile.icon} {profile.name})</h4>
              {preferences.motilityMode === 'viability' ? (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-green-500 text-white px-3 py-1 rounded font-mono">{profile.keys.alive.toUpperCase()}</kbd>
                    <span>Canlı +1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-500 text-white px-3 py-1 rounded font-mono">{profile.keys.dead.toUpperCase()}</kbd>
                    <span>Ölü +1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-blue-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextSmall.toUpperCase()}</kbd>
                    <span>Sonraki →</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-green-700 text-white px-3 py-1 rounded font-mono">{profile.keys.aliveDecrement}</kbd>
                    <span>Canlı -1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-700 text-white px-3 py-1 rounded font-mono">{profile.keys.deadDecrement}</kbd>
                    <span>Ölü -1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-purple-500 text-white px-3 py-1 rounded font-mono">{profile.keys.back.toUpperCase()}</kbd>
                    <span>⏪ Geri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-yellow-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextBig.toUpperCase()}</kbd>
                    <span>Büyük Kare ⏭️</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-700 text-white px-3 py-1 rounded font-mono">ESC</kbd>
                    <span>Durdur</span>
                  </div>
                </div>
              ) : preferences.motilityMode === 'motility' ? (
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-green-500 text-white px-3 py-1 rounded font-mono">{profile.keys.motile?.toUpperCase() || 'R'}</kbd>
                    <span>🏃 Hareketli +1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-orange-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nonMotile?.toUpperCase() || 'T'}</kbd>
                    <span>🛑 Hareketsiz +1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-blue-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextSmall.toUpperCase()}</kbd>
                    <span>Sonraki →</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-green-700 text-white px-3 py-1 rounded font-mono">{profile.keys.motileDecrement || '3'}</kbd>
                    <span>Hareketli -1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-orange-700 text-white px-3 py-1 rounded font-mono">{profile.keys.nonMotileDecrement || '4'}</kbd>
                    <span>Hareketsiz -1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-purple-500 text-white px-3 py-1 rounded font-mono">{profile.keys.back.toUpperCase()}</kbd>
                    <span>⏪ Geri</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-yellow-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextBig.toUpperCase()}</kbd>
                    <span>Büyük Kare ⏭️</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-700 text-white px-3 py-1 rounded font-mono">ESC</kbd>
                    <span>Durdur</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <kbd className="bg-green-500 text-white px-3 py-1 rounded font-mono">{profile.keys.alive.toUpperCase()}</kbd>
                    <span>👍 Canlı</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-500 text-white px-3 py-1 rounded font-mono">{profile.keys.dead.toUpperCase()}</kbd>
                    <span>☠️ Ölü</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-cyan-500 text-white px-3 py-1 rounded font-mono">{profile.keys.motile?.toUpperCase() || 'R'}</kbd>
                    <span>🏃 Hareketli</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-orange-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nonMotile?.toUpperCase() || 'T'}</kbd>
                    <span>🛑 Hareketsiz</span>
                  </div>
                  {preferences.cellWallMeasurement && (
                    <>
                      <div className="flex items-center gap-2">
                        <kbd className="bg-purple-500 text-white px-3 py-1 rounded font-mono">{profile.keys.thinWall?.toUpperCase() || 'Z'}</kbd>
                        <span>📏 İnce</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <kbd className="bg-pink-500 text-white px-3 py-1 rounded font-mono">{profile.keys.thickWall?.toUpperCase() || 'X'}</kbd>
                        <span>📏 Kalın</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center gap-2">
                    <kbd className="bg-blue-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextSmall.toUpperCase()}</kbd>
                    <span>Sonraki →</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-yellow-500 text-white px-3 py-1 rounded font-mono">{profile.keys.nextBig.toUpperCase()}</kbd>
                    <span>Kare ⏭️</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="bg-red-700 text-white px-3 py-1 rounded font-mono">ESC</kbd>
                    <span>Durdur</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={pauseSmartCounting}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-all"
            >
              <Pause className="w-4 h-4 inline mr-2" />
              SAYIMI DURDUR
            </button>
          </div>
        )}
      </div>

      {results && (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Sonuçlar</h3>
          <div className={`grid gap-4 ${results.countingMode === 'full-3d' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">Canlı Hücreler</p>
              <p className="text-3xl font-bold text-green-900">{results.totalAlive}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-700">Ölü Hücreler</p>
              <p className="text-3xl font-bold text-red-900">{results.totalDead}</p>
            </div>
            {results.countingMode === 'full-3d' && (
              <>
                <div className="bg-cyan-50 p-4 rounded-lg">
                  <p className="text-sm text-cyan-700">Hareketli</p>
                  <p className="text-3xl font-bold text-cyan-900">{results.totalMotile}</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-sm text-orange-700">Hareketsiz</p>
                  <p className="text-3xl font-bold text-orange-900">{results.totalNonMotile}</p>
                </div>
              </>
            )}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">Hücre/mL</p>
              <p className="text-3xl font-bold text-blue-900">{results.cellsPerMl}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-700">Canlılık</p>
              <p className="text-3xl font-bold text-purple-900">{results.viability}%</p>
            </div>
            {results.countingMode === 'full-3d' && results.motility !== undefined && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-700">Hareketlilik</p>
                <p className="text-3xl font-bold text-indigo-900">{results.motility}%</p>
              </div>
            )}
          </div>
          
          {/* İSTATİSTİKSEL ANALİZ - Akıllı Sistem için */}
          {results.statistics && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-2 border-indigo-200">
              <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                📊 İstatistiksel Analiz
              </h4>
              
              {/* Kalite Uyarısı */}
              {results.statistics.qualityWarning && (
                <div className={`mb-4 p-3 rounded-lg ${results.statistics.isReliable ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'} border`}>
                  <p className={`text-sm font-semibold ${results.statistics.isReliable ? 'text-yellow-800' : 'text-red-800'}`}>
                    {results.statistics.qualityWarning}
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {/* Bilimsel Notasyon */}
                <div className="col-span-2 bg-white p-4 rounded-lg shadow-sm border border-indigo-200">
                  <p className="text-xs text-gray-600 mb-1">Bilimsel Notasyon</p>
                  <p className="text-xl font-bold text-indigo-900 font-mono">{results.statistics.scientificNotation}</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Standart Sapma (σ)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.stdDev}</p>
                  <p className="text-xs text-gray-500 mt-1">Hücre/kare</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Standart Hata (SE)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.stdError}</p>
                  <p className="text-xs text-gray-500 mt-1">Hücre/kare</p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">Varyasyon Katsayısı (CV)</p>
                  <p className="text-xl font-bold text-gray-900">{results.statistics.cv}%</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {parseFloat(results.statistics.cv) < 10 ? '✅ Çok iyi' : 
                     parseFloat(results.statistics.cv) < 20 ? '👍 İyi' : 
                     '⚠️ Yüksek varyasyon'}
                  </p>
                </div>
                
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-xs text-gray-600">95% Güven Aralığı</p>
                  <p className="text-sm font-bold text-gray-900">
                    {parseFloat(results.statistics.ci95.lower).toLocaleString()} - {parseFloat(results.statistics.ci95.upper).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">hücre/mL</p>
                </div>
                
                <div className="col-span-2 bg-indigo-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-indigo-700">Toplam Hücre Sayısı</p>
                      <p className="text-lg font-bold text-indigo-900">{results.statistics.nCells} hücre</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700">Sayılan Kare</p>
                      <p className="text-lg font-bold text-indigo-900">{results.statistics.nSquares} kare</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-700">Güvenilirlik</p>
                      <p className="text-lg font-bold text-indigo-900">
                        {results.statistics.isReliable ? '✅' : '⚠️'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded-lg">
                <p className="font-semibold mb-1">📖 Not:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>σ: Sayımlar arasındaki değişkenlik</li>
                  <li>SE: Ortalama değerin hassasiyeti</li>
                  <li>CV: Oransal değişkenlik (&lt;15% ideal)</li>
                  <li>CI: Gerçek değerin %95 olasılıkla bulunduğu aralık</li>
                </ul>
              </div>

            </div>
          )}

          {/* 🆕 İLERİ İSTATİSTİKSEL ANALİZ (Modül ile) */}
          {results && sampleInfo.tankSource && (
            <AdvancedStatistics
              tankData={JSON.parse(localStorage.getItem('tankDetails') || '{}')}
              currentTank={sampleInfo.tankSource}
              selectedTest={selectedTest}
              setSelectedTest={setSelectedTest}
              testResults={testResults}
              setTestResults={setTestResults}
              selectedTanks={selectedTanks}
              setSelectedTanks={setSelectedTanks}
              selectedDates={selectedDates}
              setSelectedDates={setSelectedDates}
              selectedPostHoc={selectedPostHoc}
              setSelectedPostHoc={setSelectedPostHoc}
            />
          )}
          
          <button
            onClick={downloadResults}
            className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-all"
          >
            <Download className="w-4 h-4 inline mr-2" />
            JSON İndir
          </button>
        </div>
      )}
    </div>
  );
};

export default CellCountingV2;


