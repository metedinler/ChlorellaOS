import React, { useState, useEffect } from 'react';
import { Trash2, Beaker, Info } from 'lucide-react';

const CustomFormulationManager = () => {
  const [formulations, setFormulations] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('customFormulations');
    if (saved) {
      setFormulations(JSON.parse(saved));
    }
  }, []);

  const deleteFormulation = (id) => {
    if (confirm('Bu formülasyonu silmek istediğinizden emin misiniz?')) {
      const updated = formulations.filter(f => f.id !== id);
      setFormulations(updated);
      localStorage.setItem('customFormulations', JSON.stringify(updated));
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık Bölümü */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Beaker className="w-10 h-10" />
          <h2 className="text-3xl font-bold">Özel Formülasyon Analiz Merkezi</h2>
        </div>
        <p className="text-white/90 text-lg">
          Oluşturduğunuz özel formülasyonları görüntüleyin ve analiz edin
        </p>
      </div>

      {/* Bilgi Kutusu */}
      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-teal-900 mb-1">Yeni Formülasyon Oluşturma</h3>
            <p className="text-teal-800 text-sm">
              <strong>Besin Yeri</strong> sekmesine gidin → <strong>"Özel Formülasyon Seç"</strong> butonuna tıklayın → 
              <strong>"Yeni Oluştur"</strong> butonu ile kendi formülasyonunuzu tasarlayın
            </p>
          </div>
        </div>
      </div>

      {/* Formülasyon Kartları */}
      {formulations.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Beaker className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Henüz özel formülasyon oluşturulmadı
          </h3>
          <p className="text-gray-500 mb-6">
            Besin Yeri sekmesinden kendi formülasyonunuzu oluşturabilirsiniz
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formulations.map((formulation) => (
            <div
              key={formulation.id}
              className="bg-white rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all p-6"
            >
              {/* Formülasyon Başlığı */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{formulation.name}</h3>
                  <p className="text-sm text-gray-500">
                    Kültür Hacmi: {formulation.cultureVolume}L
                  </p>
                </div>
                <button
                  onClick={() => deleteFormulation(formulation.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  title="Formülasyonu Sil"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Stok Sayısı */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Stok Sayısı: {formulation.stocks.length}
                </p>
                <div className="flex flex-wrap gap-2">
                  {formulation.stocks.map((stock, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ backgroundColor: stock.color + '20', border: `2px solid ${stock.color}` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stock.color }}
                      />
                      <span className="font-medium text-gray-700">{stock.name}</span>
                      <span className="text-xs text-gray-500">
                        ({stock.chemicals.length} kimyasal)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tarih Bilgisi */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Oluşturulma: {new Date(formulation.createdAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomFormulationManager;
