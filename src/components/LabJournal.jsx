import React, { useState, useEffect } from 'react';
import { BookOpen, Save, Calendar, Camera, CheckSquare, AlertTriangle, Edit2, Trash2, Copy } from 'lucide-react';
import { labJournalTemplate } from '../data/systemDataExtended';

const LabJournal = ({ tankId }) => {
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState({});
  const [routineChecks, setRoutineChecks] = useState({});
  const [savedEntries, setSavedEntries] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  // LocalStorage'dan yükle
  useEffect(() => {
    const saved = localStorage.getItem('chlorellaLabJournal');
    if (saved) {
      setSavedEntries(JSON.parse(saved));
    }
    
    // Rutin kontrolleri başlat
    const checks = {};
    labJournalTemplate.routineChecks.forEach(check => {
      checks[check.key] = false;
    });
    setRoutineChecks(checks);
  }, []);

  // Fotoğraf seç
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Kaydet veya güncelle
  const saveEntry = () => {
    if (editingEntry) {
      // Düzenleme modu
      const updatedEntries = savedEntries.map(e => 
        e.id === editingEntry.id 
          ? {
              ...e,
              date: currentDate,
              entries: { ...entries },
              routineChecks: { ...routineChecks },
              photo: photoPreview,
              lastModified: new Date().toISOString()
            }
          : e
      );
      setSavedEntries(updatedEntries);
      localStorage.setItem('chlorellaLabJournal', JSON.stringify(updatedEntries));
      alert('✅ Kayıt güncellendi!');
      setEditingEntry(null);
    } else {
      // Yeni kayıt
      const entry = {
        id: Date.now(),
        date: currentDate,
        entries: { ...entries },
        routineChecks: { ...routineChecks },
        photo: photoPreview,
        timestamp: new Date().toISOString()
      };

      const newEntries = [entry, ...savedEntries];
      setSavedEntries(newEntries);
      localStorage.setItem('chlorellaLabJournal', JSON.stringify(newEntries));
      
      // Fotoğrafı PhotoGallery'ye de ekle
      if (photoPreview) {
        const photos = JSON.parse(localStorage.getItem('chlorellaPhotos') || '[]');
        photos.unshift({
          id: Date.now(),
          date: currentDate,
          image: photoPreview,
          description: entries.purpose || 'Lab defteri fotoğrafı',
          tankIds: tankId ? [tankId] : [],
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('chlorellaPhotos', JSON.stringify(photos));
      }
      
      alert('✅ Laboratuvar defteri kaydedildi!');
    }
    
    // Formu temizle
    setEntries({});
    setRoutineChecks({});
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Kayıt düzenle
  const editEntry = (entry) => {
    setEditingEntry(entry);
    setCurrentDate(entry.date);
    setEntries(entry.entries);
    setRoutineChecks(entry.routineChecks);
    setPhotoPreview(entry.photo || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Kayıt sil
  const deleteEntry = (entryId) => {
    if (confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      const updated = savedEntries.filter(e => e.id !== entryId);
      setSavedEntries(updated);
      localStorage.setItem('chlorellaLabJournal', JSON.stringify(updated));
      alert('✅ Kayıt silindi!');
    }
  };

  // Kayıt kopyala (şablon olarak kullan)
  const copyEntry = (entry) => {
    setEditingEntry(null);
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setEntries(entry.entries);
    setRoutineChecks(entry.routineChecks);
    setPhotoPreview(null); // Fotoğraf kopyalanmaz
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('✅ Kayıt şablon olarak yüklendi! Tarihi ve detayları düzenleyip kaydedin.');
  };

  // Düzenlemeyi iptal et
  const cancelEdit = () => {
    setEditingEntry(null);
    setEntries({});
    setRoutineChecks({});
    setPhotoFile(null);
    setPhotoPreview(null);
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">📖 Laboratuvar Defteri</h2>
        <p className="text-indigo-100">Günlük işlem, gözlem, risk ve dersler</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Giriş Formu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarih */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tarih</label>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Rutin Kontroller */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-600" />
              Rutin İşlemler
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {labJournalTemplate.routineChecks.map(check => (
                <label key={check.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={routineChecks[check.key] || false}
                    onChange={(e) => setRoutineChecks({...routineChecks, [check.key]: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm">{check.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amaç, İşlem, Risk, vb. */}
          {labJournalTemplate.sections.map(section => (
            <div key={section.key} className="bg-white rounded-xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {section.name}
              </label>
              <textarea
                value={entries[section.key] || ''}
                onChange={(e) => setEntries({...entries, [section.key]: e.target.value})}
                rows="4"
                placeholder={section.placeholder}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}

          {/* Fotoğraf Yükleme */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-600" />
              Günlük Fotoğraf (Tank, Mikroskop, vb.)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-3"
            />
            {photoPreview && (
              <div className="mt-3 border-2 border-indigo-300 rounded-lg p-2">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full max-h-64 object-contain rounded"
                />
                <button
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Fotoğrafı Kaldır
                </button>
              </div>
            )}
          </div>

          {/* Kaydet/Güncelle Butonu */}
          <div className="space-y-3">
            {editingEntry && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800 font-semibold">⚠️ Düzenleme Modu</p>
                <p className="text-xs text-yellow-700">Kayıt güncelleniyor: {editingEntry.date}</p>
              </div>
            )}
            
            <button
              onClick={saveEntry}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {editingEntry ? 'Güncelle' : 'Kaydet'} {photoPreview && '(+ Fotoğraf)'}
            </button>
            
            {editingEntry && (
              <button
                onClick={cancelEdit}
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
              >
                İptal
              </button>
            )}
          </div>
        </div>

        {/* Sağ: Geçmiş Kayıtlar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Geçmiş Kayıtlar
            </h3>

            {savedEntries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kayıt yok</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {savedEntries.slice(0, 10).map(entry => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-semibold text-indigo-600">{entry.date}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyEntry(entry)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Şablon olarak kullan"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => editEntry(entry)}
                          className="text-orange-600 hover:text-orange-800 transition"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Fotoğraf thumbnail */}
                    {entry.photo && (
                      <img 
                        src={entry.photo} 
                        alt="Lab photo" 
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    
                    {entry.entries.purpose && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 font-semibold">Amaç:</p>
                        <p className="text-sm text-gray-700">{entry.entries.purpose.substring(0, 100)}...</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(entry.routineChecks)
                        .filter(([_, checked]) => checked)
                        .map(([key, _]) => (
                          <span key={key} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            ✓ {labJournalTemplate.routineChecks.find(c => c.key === key)?.name}
                          </span>
                        ))}
                    </div>
                    
                    {entry.lastModified && (
                      <p className="text-xs text-gray-400 mt-2">Düzenlendi: {new Date(entry.lastModified).toLocaleString('tr-TR')}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabJournal;
