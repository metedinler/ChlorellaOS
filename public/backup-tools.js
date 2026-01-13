// MALZEME VERİLERİNİ YEDEKLEME/YÜKLEME ARACI
// Bu dosyayı tarayıcı konsolunda çalıştırarak verilerinizi yedekleyebilirsiniz

// 1. VERİLERİ YEDEKLE (Tarayıcı konsolunda çalıştır)
function exportMaterials() {
  const materials = localStorage.getItem('chlorellaMaterials');
  const shopping = localStorage.getItem('chlorellaShoppingList');
  
  const backup = {
    timestamp: new Date().toISOString(),
    materials: materials ? JSON.parse(materials) : [],
    shopping: shopping ? JSON.parse(shopping) : []
  };
  
  // JSON dosya olarak indir
  const dataStr = JSON.stringify(backup, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `malzeme_yedek_${new Date().toISOString().slice(0,10)}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  
  console.log('✅ Veriler indirildi:', exportFileDefaultName);
  console.log('📊 Toplam malzeme:', backup.materials.length);
}

// 2. VERİLERİ YÜKLE (JSON dosyasından)
function importMaterials(jsonData) {
  try {
    const backup = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    
    if (backup.materials) {
      localStorage.setItem('chlorellaMaterials', JSON.stringify(backup.materials));
      console.log('✅ Malzemeler yüklendi:', backup.materials.length, 'adet');
    }
    
    if (backup.shopping) {
      localStorage.setItem('chlorellaShoppingList', JSON.stringify(backup.shopping));
      console.log('✅ Alışveriş listesi yüklendi:', backup.shopping.length, 'adet');
    }
    
    console.log('🔄 Sayfayı yenileyin (F5)');
    return true;
  } catch (error) {
    console.error('❌ Yükleme hatası:', error);
    return false;
  }
}

// 3. MEVCUT VERİLERİ GÖSTER
function showCurrentData() {
  const materials = localStorage.getItem('chlorellaMaterials');
  const shopping = localStorage.getItem('chlorellaShoppingList');
  
  console.log('📦 MEVCUT MALZEMELER:');
  console.log(materials ? JSON.parse(materials) : 'YOK');
  
  console.log('\n🛒 MEVCUT ALIŞVERİŞ LİSTESİ:');
  console.log(shopping ? JSON.parse(shopping) : 'YOK');
}

// KULLANIM:
// Tarayıcı konsolunda (F12 → Console):
// 1. exportMaterials()        → Verileri indir
// 2. showCurrentData()         → Mevcut verileri gör
// 3. importMaterials(jsonData) → JSON dosyasından yükle

console.log(`
╔════════════════════════════════════════════╗
║   MALZEME VERİ YEDEKLEME ARACI            ║
╚════════════════════════════════════════════╝

📥 VERİ YEDEKLE:
   exportMaterials()

👁️  VERİLERİ GÖSTER:
   showCurrentData()

📤 VERİ YÜKLE:
   1. JSON dosyasını aç, içeriği kopyala
   2. const jsonData = { ... yapıştır ... }
   3. importMaterials(jsonData)

⚠️  NOT: Bu dosyayı chlorellaOS/public/ klasörüne koyun
    Sonra http://localhost:3000/backup-tools.js olarak erişin
`);
