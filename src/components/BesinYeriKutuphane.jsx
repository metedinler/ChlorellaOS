import React, { useState } from 'react';
import { Beaker } from 'lucide-react';

const BesinYeriKutuphane = () => {
  const [selected, setSelected] = useState('BBM');

  const library = {
    BBM: { 
      name: 'BBM (Bold Basal Medium)',
      desc: 'Chlorella vulgaris için standart besin ortamı',
      stock: 'Ana Stok A: NaNO3 12.5g, K2HPO4 3.75g, MgSO4 3.75g',
      micro: 'Mikro: H3BO3, MnCl2, ZnSO4, CuSO4',
      element: 'N: 250mg/L, P: 75mg/L, K: 125mg/L'
    },
    BS11: { 
      name: 'BS11',
      desc: 'Synechococcus için',
      stock: 'NaNO3 1.5g/L, K2HPO4 0.04g/L',
      micro: 'FeNH4 citrate, EDTA',
      element: 'N: 220mg/L, P: 30mg/L'
    },
    JAWORSKI: { 
      name: 'Jaworski Medium',
      desc: 'Genel amaçlı mikroalg ortamı',
      stock: 'Ca(NO3)2, KH2PO4, MgSO4',
      micro: 'Fe-EDTA, vitamin B12',
      element: 'N: 100mg/L, P: 15mg/L'
    },
    FACHB: { 
      name: 'FACHB',
      desc: 'Çin tatlısu alg koleksiyonu standart ortamı',
      stock: 'NaNO3 0.25g/L, K2HPO4 0.075g/L',
      micro: 'Sitrik asit, Fe, Mn, Zn',
      element: 'N: 40mg/L, P: 10mg/L'
    },
    ZARROUK: { 
      name: 'Zarrouk Medium',
      desc: 'Spirulina platensis için alkali ortam',
      stock: 'NaHCO3 16.8g/L, NaNO3 2.5g/L, K2HPO4 0.5g/L',
      micro: 'FeSO4, EDTA, pH 9-10',
      element: 'N: 460mg/L, P: 150mg/L, pH: 9.5'
    },
    CUSTOM_BBM: { 
      name: 'Custom BBM',
      desc: 'Modifiye BBM - yüksek verim için optimize edilmiş',
      stock: 'BBM + Üre 0.5g/L, MKP ilavesi',
      micro: 'Standard BBM mikro elementleri',
      element: 'N: 300mg/L (Arttırılmış), P: 100mg/L'
    }
  };

  const m = library[selected];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">🧪 Besin Yeri Kütüphanesi</h2>
        <p className="text-blue-100">6 Standart Besin Ortamı Formülasyonu</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {Object.keys(library).map(key => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            className={`px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
              selected === key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white hover:bg-blue-50 text-gray-700 shadow'
            }`}
          >
            <Beaker className="w-4 h-4" />
            {key}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{m.name}</h3>
        <p className="text-gray-600 mb-6">{m.desc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">📦 Ana Stok</h4>
            <p className="text-sm text-gray-700">{m.stock}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">🔬 Mikro Elementler</h4>
            <p className="text-sm text-gray-700">{m.micro}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">⚗️ Element Analizi</h4>
            <p className="text-sm text-gray-700">{m.element}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BesinYeriKutuphane;
