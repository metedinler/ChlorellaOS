"""
Kayıt Sistemi (Recording System)
Tüm üretim verilerinin merkezi kaydı ve yönetimi

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import json
import sqlite3
from pathlib import Path


class DataRecorder:
    """Merkezi veri kayıt sistemi"""
    
    def __init__(self, database_path: str = "chlorellaos_data.db"):
        self.database_path = database_path
        self._init_database()
    
    def _init_database(self):
        """Veritabanını başlat"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        # Ana kayıt tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS production_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                batch_id TEXT NOT NULL,
                record_type TEXT NOT NULL,
                module TEXT NOT NULL,
                data TEXT NOT NULL,
                created_by TEXT
            )
        """)
        
        # İndeksler
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_batch_id 
            ON production_records (batch_id)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp 
            ON production_records (timestamp)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_record_type 
            ON production_records (record_type)
        """)
        
        # Batch bilgi tablosu
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS batches (
                batch_id TEXT PRIMARY KEY,
                start_date TEXT NOT NULL,
                status TEXT NOT NULL,
                location TEXT,
                metadata TEXT
            )
        """)
        
        conn.commit()
        conn.close()
    
    def create_batch(self, batch_id: str, location: str, 
                    metadata: Optional[Dict] = None) -> Dict:
        """Yeni batch oluştur"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        batch_data = {
            'batch_id': batch_id,
            'start_date': datetime.now().isoformat(),
            'status': 'active',
            'location': location,
            'metadata': json.dumps(metadata or {})
        }
        
        cursor.execute("""
            INSERT INTO batches (batch_id, start_date, status, location, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (batch_id, batch_data['start_date'], batch_data['status'],
              location, batch_data['metadata']))
        
        conn.commit()
        conn.close()
        
        return batch_data
    
    def record_data(self, batch_id: str, record_type: str, module: str,
                   data: Dict, created_by: Optional[str] = None) -> int:
        """Veri kaydet"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO production_records 
            (timestamp, batch_id, record_type, module, data, created_by)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (datetime.now().isoformat(), batch_id, record_type, module,
              json.dumps(data), created_by))
        
        record_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return record_id
    
    def get_batch_records(self, batch_id: str, 
                         record_type: Optional[str] = None) -> List[Dict]:
        """Batch kayıtlarını getir"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        if record_type:
            cursor.execute("""
                SELECT id, timestamp, record_type, module, data, created_by
                FROM production_records
                WHERE batch_id = ? AND record_type = ?
                ORDER BY timestamp
            """, (batch_id, record_type))
        else:
            cursor.execute("""
                SELECT id, timestamp, record_type, module, data, created_by
                FROM production_records
                WHERE batch_id = ?
                ORDER BY timestamp
            """, (batch_id,))
        
        records = []
        for row in cursor.fetchall():
            records.append({
                'id': row[0],
                'timestamp': row[1],
                'record_type': row[2],
                'module': row[3],
                'data': json.loads(row[4]),
                'created_by': row[5]
            })
        
        conn.close()
        return records
    
    def update_batch_status(self, batch_id: str, status: str):
        """Batch durumunu güncelle"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            UPDATE batches SET status = ? WHERE batch_id = ?
        """, (status, batch_id))
        
        conn.commit()
        conn.close()
    
    def get_batch_info(self, batch_id: str) -> Optional[Dict]:
        """Batch bilgisini getir"""
        conn = sqlite3.connect(self.database_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT batch_id, start_date, status, location, metadata
            FROM batches WHERE batch_id = ?
        """, (batch_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                'batch_id': row[0],
                'start_date': row[1],
                'status': row[2],
                'location': row[3],
                'metadata': json.loads(row[4])
            }
        return None


class TimeSeriesManager:
    """Zaman serisi veri yönetimi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.time_series_data = {}
    
    def add_series(self, series_name: str):
        """Yeni zaman serisi ekle"""
        if series_name not in self.time_series_data:
            self.time_series_data[series_name] = []
    
    def append_data(self, series_name: str, value: float, 
                   timestamp: Optional[str] = None):
        """Seriye veri ekle"""
        if series_name not in self.time_series_data:
            self.add_series(series_name)
        
        data_point = {
            'timestamp': timestamp or datetime.now().isoformat(),
            'value': value
        }
        self.time_series_data[series_name].append(data_point)
    
    def get_series(self, series_name: str, 
                  start_time: Optional[str] = None,
                  end_time: Optional[str] = None) -> List[Dict]:
        """Seri verilerini getir"""
        if series_name not in self.time_series_data:
            return []
        
        data = self.time_series_data[series_name]
        
        if start_time:
            data = [d for d in data if d['timestamp'] >= start_time]
        if end_time:
            data = [d for d in data if d['timestamp'] <= end_time]
        
        return data
    
    def get_latest_value(self, series_name: str) -> Optional[float]:
        """Son değeri getir"""
        if series_name not in self.time_series_data:
            return None
        
        data = self.time_series_data[series_name]
        return data[-1]['value'] if data else None
    
    def calculate_statistics(self, series_name: str) -> Dict:
        """İstatistikleri hesapla"""
        data = self.get_series(series_name)
        if not data:
            return {}
        
        values = [d['value'] for d in data]
        return {
            'count': len(values),
            'min': min(values),
            'max': max(values),
            'mean': sum(values) / len(values),
            'first': values[0],
            'last': values[-1]
        }


class ReportGenerator:
    """Raporlama sistemi"""
    
    def __init__(self, data_recorder: DataRecorder):
        self.recorder = data_recorder
    
    def generate_batch_report(self, batch_id: str) -> Dict:
        """Batch raporu oluştur"""
        batch_info = self.recorder.get_batch_info(batch_id)
        if not batch_info:
            return {'error': 'Batch not found'}
        
        # Tüm kayıtları getir
        records = self.recorder.get_batch_records(batch_id)
        
        # Modül bazlı grupla
        by_module = {}
        for record in records:
            module = record['module']
            if module not in by_module:
                by_module[module] = []
            by_module[module].append(record)
        
        report = {
            'batch_info': batch_info,
            'report_date': datetime.now().isoformat(),
            'total_records': len(records),
            'records_by_module': {
                module: len(recs) for module, recs in by_module.items()
            },
            'data_by_module': by_module
        }
        
        return report
    
    def generate_summary_report(self, batch_id: str) -> Dict:
        """Özet rapor oluştur"""
        batch_info = self.recorder.get_batch_info(batch_id)
        if not batch_info:
            return {'error': 'Batch not found'}
        
        # Modül bazlı kayıt sayıları
        cultivation_records = len(self.recorder.get_batch_records(
            batch_id, 'cultivation'))
        analysis_records = len(self.recorder.get_batch_records(
            batch_id, 'analysis'))
        
        start_date = datetime.fromisoformat(batch_info['start_date'])
        duration_days = (datetime.now() - start_date).days
        
        summary = {
            'batch_id': batch_id,
            'status': batch_info['status'],
            'location': batch_info['location'],
            'start_date': batch_info['start_date'],
            'duration_days': duration_days,
            'cultivation_records': cultivation_records,
            'analysis_records': analysis_records,
            'report_generated': datetime.now().isoformat()
        }
        
        return summary
    
    def export_to_json(self, batch_id: str, filepath: str):
        """JSON formatında dışa aktar"""
        report = self.generate_batch_report(batch_id)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
    
    def export_to_csv(self, batch_id: str, filepath: str):
        """CSV formatında dışa aktar"""
        records = self.recorder.get_batch_records(batch_id)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            # Header
            f.write("Timestamp,Batch ID,Record Type,Module,Created By\n")
            
            # Veri satırları
            for record in records:
                f.write(f"{record['timestamp']},{batch_id},"
                       f"{record['record_type']},{record['module']},"
                       f"{record.get('created_by', '')}\n")


class TraceabilitySystem:
    """İzlenebilirlik (Traceability) sistemi"""
    
    def __init__(self, data_recorder: DataRecorder):
        self.recorder = data_recorder
    
    def trace_batch_lifecycle(self, batch_id: str) -> Dict:
        """Batch yaşam döngüsünü izle"""
        batch_info = self.recorder.get_batch_info(batch_id)
        if not batch_info:
            return {'error': 'Batch not found'}
        
        records = self.recorder.get_batch_records(batch_id)
        
        # Kronolojik zaman çizelgesi
        timeline = []
        for record in records:
            event = {
                'timestamp': record['timestamp'],
                'module': record['module'],
                'type': record['record_type'],
                'summary': self._summarize_record(record['data'])
            }
            timeline.append(event)
        
        return {
            'batch_id': batch_id,
            'start_date': batch_info['start_date'],
            'current_status': batch_info['status'],
            'timeline': timeline,
            'total_events': len(timeline)
        }
    
    def _summarize_record(self, data: Dict) -> str:
        """Kayıt özetini oluştur"""
        # Veri tipine göre özet
        if 'temperature' in data:
            return f"Environment: Temp={data.get('temperature')}°C"
        elif 'biomass_density' in data:
            return f"Growth: Biomass={data.get('biomass_density')}g/L"
        elif 'test_type' in data:
            return f"Test: {data.get('test_type')}"
        else:
            return "Data recorded"
    
    def generate_chain_of_custody(self, batch_id: str) -> List[Dict]:
        """Gözetim zinciri oluştur"""
        records = self.recorder.get_batch_records(batch_id)
        
        custody_chain = []
        for record in records:
            if record.get('created_by'):
                custody_chain.append({
                    'timestamp': record['timestamp'],
                    'custodian': record['created_by'],
                    'action': record['record_type'],
                    'module': record['module']
                })
        
        return custody_chain


__all__ = [
    'DataRecorder',
    'TimeSeriesManager',
    'ReportGenerator',
    'TraceabilitySystem'
]
