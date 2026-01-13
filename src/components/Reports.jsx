import React from 'react';
import { FileText, Download, Printer, Mail } from 'lucide-react';

const Reports = () => {
  const reports = [
    { id: 1, title: 'Haftalık Üretim Raporu', date: '2025-01-20 - 2025-01-27', type: 'weekly' },
    { id: 2, title: 'Aylık Malzeme Tüketimi', date: '2025-01', type: 'monthly' },
    { id: 3, title: 'Fizibilite Analiz Raporu', date: '2025-Q1', type: 'analysis' },
    { id: 4, title: 'Su Kalite Parametreleri', date: '2025-01', type: 'quality' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Raporlar & Çıktılar</h2>
      </div>

      <div className="grid gap-4">
        {reports.map(report => (
          <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{report.date}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition" title="İndir">
                  <Download className="w-5 h-5" />
                </button>
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition" title="Yazdır">
                  <Printer className="w-5 h-5" />
                </button>
                <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition" title="Email">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <h4 className="font-semibold text-emerald-800 mb-2">Rapor Formatları</h4>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-white rounded text-sm">PDF</span>
          <span className="px-3 py-1 bg-white rounded text-sm">Excel</span>
          <span className="px-3 py-1 bg-white rounded text-sm">CSV</span>
          <span className="px-3 py-1 bg-white rounded text-sm">JSON</span>
        </div>
      </div>
    </div>
  );
};

export default Reports;
