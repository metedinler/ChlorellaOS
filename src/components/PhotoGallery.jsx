import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, Image as ImageIcon, Calendar, Trash2, Link2, Square, Pipette, Save, X } from 'lucide-react';

const PhotoGallery = ({ tankId }) => {
  const [photos, setPhotos] = useState([]);
  const [activeTanks, setActiveTanks] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [currentSelection, setCurrentSelection] = useState(null); // Şu an çizilen seçim
  const [selections, setSelections] = useState([]); // Kaydedilmiş seçimler listesi
  const [selectedTankForPhoto, setSelectedTankForPhoto] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  // LocalStorage'dan yükle
  useEffect(() => {
    loadPhotos();
    loadActiveTanks();
  }, []);

  const loadPhotos = () => {
    const stored = localStorage.getItem('chlorellaPhotos');
    if (stored) {
      const parsed = JSON.parse(stored);
      setPhotos(parsed);
    }
  };

  const loadActiveTanks = () => {
    const tankStates = localStorage.getItem('tankStates');
    if (tankStates) {
      const allTanks = JSON.parse(tankStates);
      const active = allTanks.filter(t => t.active);
      setActiveTanks(active);
    }
  };

  // Foto sil
  const deletePhoto = (photoId) => {
    if (confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) {
      const updated = photos.filter(p => p.id !== photoId);
      setPhotos(updated);
      localStorage.setItem('chlorellaPhotos', JSON.stringify(updated));
      alert('✅ Fotoğraf silindi!');
    }
  };

  // Tank bağlantısı değiştir
  const changeTankLink = (photoId, newTankIds) => {
    const updated = photos.map(p => 
      p.id === photoId ? { ...p, tankIds: newTankIds, lastModified: new Date().toISOString() } : p
    );
    setPhotos(updated);
    localStorage.setItem('chlorellaPhotos', JSON.stringify(updated));
    alert('✅ Tank bağlantısı güncellendi!');
  };

  // Foto analizörü aç
  const openAnalyzer = (photo) => {
    setSelectedPhoto(photo);
    setShowAnalyzer(true);
    setCurrentSelection(null);
    setSelections([]);
    setIsSelecting(false);
  };

  // Alan seçimi başlat
  const startSelection = (e) => {
    if (!isSelecting) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentSelection({ startX: x, startY: y, endX: x, endY: y });
  };

  const updateSelection = (e) => {
    if (!isSelecting || !currentSelection) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentSelection({ ...currentSelection, endX: x, endY: y });
  };

  const endSelection = () => {
    if (currentSelection && isSelecting) {
      // Seçimi kaydet
      const colorData = analyzeArea(currentSelection);
      setSelections([...selections, { area: currentSelection, colorData, id: Date.now() }]);
      setCurrentSelection(null);
      // isSelecting'i false yapma - kullanıcı başka alan seçebilsin
    }
  };

  // Belirli bir seçimi sil
  const removeSelection = (selectionId) => {
    setSelections(selections.filter(s => s.id !== selectionId));
  };

  // Tüm seçimleri temizle
  const clearAllSelections = () => {
    setSelections([]);
    setCurrentSelection(null);
  };

  // Belirli bir alanı analiz et (parametre olarak alan al)
  const analyzeArea = (area) => {
    if (!area || !imageRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    // Canvas boyutunu ayarla
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Görüntüyü canvas'a çiz
    ctx.drawImage(img, 0, 0);

    // Seçili alanın koordinatlarını hesapla
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const x1 = Math.min(area.startX, area.endX) * scaleX;
    const y1 = Math.min(area.startY, area.endY) * scaleY;
    const x2 = Math.max(area.startX, area.endX) * scaleX;
    const y2 = Math.max(area.startY, area.endY) * scaleY;

    const width = x2 - x1;
    const height = y2 - y1;

    // Seçili alanın piksellerini al
    const imageData = ctx.getImageData(x1, y1, width, height);
    const pixels = imageData.data;

    // Ortalama renk değerlerini hesapla
    let totalR = 0, totalG = 0, totalB = 0;
    const pixelCount = pixels.length / 4;

    for (let i = 0; i < pixels.length; i += 4) {
      totalR += pixels[i];
      totalG += pixels[i + 1];
      totalB += pixels[i + 2];
    }

    const avgR = Math.round(totalR / pixelCount);
    const avgG = Math.round(totalG / pixelCount);
    const avgB = Math.round(totalB / pixelCount);

    // RGB'den CMYK'ye çevirme
    const r = avgR / 255;
    const g = avgG / 255;
    const b = avgB / 255;

    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

    // Parlaklık (HSL Lightness)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;

    // Brightness (HSV Value)
    const brightness = max;

    return {
      rgb: { r: avgR, g: avgG, b: avgB },
      cmyk: {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
      },
      lightness: Math.round(lightness * 100),
      brightness: Math.round(brightness * 100),
      darkness: Math.round((1 - brightness) * 100),
      hex: `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`
    };
  };

  // Tüm seçimlerin GREEN değerlerini sisteme kaydet
  const saveAllGreenValues = () => {
    if (selections.length === 0) {
      alert('⚠️ Hiçbir alan seçilmedi!');
      return;
    }
    if (!selectedTankForPhoto) {
      alert('⚠️ Lütfen tank seçin!');
      return;
    }

    const tankDetails = JSON.parse(localStorage.getItem('tankDetails') || '{}');
    if (!tankDetails[selectedTankForPhoto]) {
      tankDetails[selectedTankForPhoto] = { qualityParams: [] };
    }

    // Her seçim için bir parametre kaydı oluştur
    selections.forEach((sel, index) => {
      const newParam = {
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('tr-TR'),
        colorG: sel.colorData.rgb.g, // Sadece GREEN değeri
        colorR: sel.colorData.rgb.r,
        colorB: sel.colorData.rgb.b,
        colorHex: sel.colorData.hex,
        source: `Fotoğraf Alan ${index + 1}`,
        photoId: selectedPhoto.id,
        areaIndex: index + 1,
        timestamp: new Date().toISOString()
      };

      tankDetails[selectedTankForPhoto].qualityParams = tankDetails[selectedTankForPhoto].qualityParams || [];
      tankDetails[selectedTankForPhoto].qualityParams.push(newParam);
    });

    localStorage.setItem('tankDetails', JSON.stringify(tankDetails));
    alert(`✅ ${selections.length} alanın GREEN değerleri tank parametrelerine kaydedildi!`);
    setShowAnalyzer(false);
  };

  // Filtreleme
  const filteredPhotos = tankId 
    ? photos.filter(p => p.tankIds?.includes(tankId))
    : photos;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Fotoğraf Galerisi</h2>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold">
            {filteredPhotos.length} fotoğraf
          </span>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Henüz fotoğraf yok. Lab defterinden fotoğraf ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition">
              <div className="relative h-48 bg-gray-100">
                {photo.image ? (
                  <img 
                    src={photo.image} 
                    alt={photo.description} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-cyan-100">
                    <ImageIcon className="w-16 h-16 text-emerald-400" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800">{photo.description || 'Başlıksız'}</h3>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {photo.date}
                </div>
                {photo.tankIds && photo.tankIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {photo.tankIds.map(tid => {
                      const tank = activeTanks.find(t => t.id === tid);
                      return (
                        <span key={tid} className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded">
                          {tank ? (tank.customName || tank.series || tid) : tid}
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => openAnalyzer(photo)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
                    title="Renk analizi"
                  >
                    <Pipette className="w-4 h-4" />
                    Analiz
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renk Analizörü Modal */}
      {showAnalyzer && selectedPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Pipette className="w-8 h-8" />
                  <div>
                    <h3 className="text-xl font-bold">Renk Analizörü</h3>
                    <p className="text-sm text-blue-100">{selectedPhoto.description}</p>
                  </div>
                </div>
                <button onClick={() => setShowAnalyzer(false)} className="hover:bg-white/20 rounded-lg p-2 transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Fotoğraf ve Seçim */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">1. Alanları Seçin (Çoklu)</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSelecting(!isSelecting)}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        isSelecting ? 'bg-orange-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Square className="w-4 h-4" />
                      {isSelecting ? 'Seçim Modu AÇIK' : 'Alan Seç'}
                    </button>
                    {selections.length > 0 && (
                      <button
                        onClick={clearAllSelections}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Tümünü Temizle
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  💡 İpucu: "Alan Seç" butonuna basın, fare ile dikdörtgen çizin. Her çizim otomatik kaydedilir. Birden fazla alan seçebilirsiniz.
                </p>
                <div className="relative inline-block">
                  <img
                    ref={imageRef}
                    src={selectedPhoto.image}
                    alt="Analiz"
                    className="max-w-full h-auto border border-gray-300 rounded"
                    style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
                    onMouseDown={startSelection}
                    onMouseMove={updateSelection}
                    onMouseUp={endSelection}
                  />
                  {/* Şu an çizilen seçim */}
                  {currentSelection && (
                    <div
                      className="absolute border-2 border-blue-500 bg-blue-500/20"
                      style={{
                        left: Math.min(currentSelection.startX, currentSelection.endX),
                        top: Math.min(currentSelection.startY, currentSelection.endY),
                        width: Math.abs(currentSelection.endX - currentSelection.startX),
                        height: Math.abs(currentSelection.endY - currentSelection.startY)
                      }}
                    />
                  )}
                  {/* Kaydedilmiş seçimler */}
                  {selections.map((sel, idx) => (
                    <div
                      key={sel.id}
                      className="absolute border-2 border-green-500 bg-green-500/20"
                      style={{
                        left: Math.min(sel.area.startX, sel.area.endX),
                        top: Math.min(sel.area.startY, sel.area.endY),
                        width: Math.abs(sel.area.endX - sel.area.startX),
                        height: Math.abs(sel.area.endY - sel.area.startY)
                      }}
                    >
                      <span className="absolute -top-6 left-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              {/* Seçilmiş Alanlar Listesi */}
              {selections.length > 0 && (
                <div className="border-2 border-emerald-300 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-gray-800 text-lg">2. Seçilen Alanların Renk Değerleri</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selections.map((sel, idx) => (
                      <div key={sel.id} className="bg-gray-50 rounded-lg p-3 border border-gray-300">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800">Alan #{idx + 1}</span>
                          <button
                            onClick={() => removeSelection(sel.id)}
                            className="text-red-600 hover:bg-red-100 p-1 rounded"
                            title="Bu alanı sil"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">RED:</span>
                            <span className="font-semibold text-red-600">{sel.colorData.rgb.r}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">GREEN:</span>
                            <span className="font-semibold text-green-600">{sel.colorData.rgb.g}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">BLUE:</span>
                            <span className="font-semibold text-blue-600">{sel.colorData.rgb.b}</span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-300">
                            <div
                              className="w-full h-8 rounded border border-gray-400"
                              style={{ backgroundColor: sel.colorData.hex }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tank Seçimi ve Kaydet */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">3. Tank Seçin ve GREEN Değerlerini Kaydedin</h4>
                    <div className="flex gap-3">
                      <select
                        value={selectedTankForPhoto}
                        onChange={(e) => setSelectedTankForPhoto(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Tank seçin...</option>
                        {activeTanks.map(tank => (
                          <option key={tank.id} value={tank.id}>
                            {tank.customName || tank.series || tank.id} ({tank.volume}L)
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={saveAllGreenValues}
                        disabled={!selectedTankForPhoto || selections.length === 0}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Kaydet ({selections.length} Alan)
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Tüm seçilen alanların GREEN değerleri "Fotoğraf Alan 1, 2, 3..." olarak tank parametrelerine eklenecek
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
