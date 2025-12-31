"""
Muhasebe Modülü (Accounting Module)
Üretim maliyeti takibi, gider/gelir kaydı ve mali raporlama

© 2025 Mete Dinler. All rights reserved.
"""

from datetime import datetime
from typing import Dict, List, Optional
from enum import Enum


class TransactionType(Enum):
    """İşlem tipi"""
    EXPENSE = "expense"
    REVENUE = "revenue"
    INVESTMENT = "investment"


class CostCategory(Enum):
    """Maliyet kategorisi"""
    RAW_MATERIALS = "raw_materials"
    LABOR = "labor"
    ENERGY = "energy"
    EQUIPMENT = "equipment"
    MAINTENANCE = "maintenance"
    OVERHEAD = "overhead"
    OTHER = "other"


class AccountingManager:
    """Muhasebe yönetim sistemi"""
    
    def __init__(self, facility_id: str):
        self.facility_id = facility_id
        self.transactions = []
        self.inventory = {}
    
    def record_transaction(self, transaction_type: TransactionType,
                          amount: float, currency: str, category: str,
                          description: str, batch_id: Optional[str] = None) -> Dict:
        """
        Finansal işlem kaydet
        
        Args:
            transaction_type: İşlem tipi (gider/gelir/yatırım)
            amount: Tutar
            currency: Para birimi (TRY, USD, EUR)
            category: Kategori
            description: Açıklama
            batch_id: İlgili batch ID (opsiyonel)
        """
        transaction = {
            'id': len(self.transactions) + 1,
            'timestamp': datetime.now().isoformat(),
            'type': transaction_type.value,
            'amount': amount,
            'currency': currency,
            'category': category,
            'description': description,
            'batch_id': batch_id
        }
        self.transactions.append(transaction)
        return transaction
    
    def get_transactions(self, transaction_type: Optional[TransactionType] = None,
                        start_date: Optional[str] = None,
                        end_date: Optional[str] = None) -> List[Dict]:
        """İşlemleri filtrele ve getir"""
        filtered = self.transactions
        
        if transaction_type:
            filtered = [t for t in filtered if t['type'] == transaction_type.value]
        
        if start_date:
            filtered = [t for t in filtered if t['timestamp'] >= start_date]
        
        if end_date:
            filtered = [t for t in filtered if t['timestamp'] <= end_date]
        
        return filtered
    
    def calculate_balance(self, start_date: Optional[str] = None,
                         end_date: Optional[str] = None) -> Dict:
        """Bakiye hesapla"""
        transactions = self.get_transactions(start_date=start_date, end_date=end_date)
        
        total_revenue = sum(t['amount'] for t in transactions 
                          if t['type'] == TransactionType.REVENUE.value)
        total_expense = sum(t['amount'] for t in transactions 
                          if t['type'] == TransactionType.EXPENSE.value)
        total_investment = sum(t['amount'] for t in transactions 
                             if t['type'] == TransactionType.INVESTMENT.value)
        
        return {
            'total_revenue': total_revenue,
            'total_expense': total_expense,
            'total_investment': total_investment,
            'net_profit': total_revenue - total_expense,
            'period_start': start_date,
            'period_end': end_date
        }


class CostTracker:
    """Maliyet takip sistemi"""
    
    def __init__(self, batch_id: str):
        self.batch_id = batch_id
        self.costs = []
    
    def add_cost(self, category: CostCategory, amount: float,
                currency: str, description: str, quantity: float = 1.0,
                unit: str = "unit") -> Dict:
        """Maliyet ekle"""
        cost = {
            'timestamp': datetime.now().isoformat(),
            'category': category.value,
            'amount': amount,
            'currency': currency,
            'description': description,
            'quantity': quantity,
            'unit': unit,
            'unit_cost': amount / quantity if quantity > 0 else amount
        }
        self.costs.append(cost)
        return cost
    
    def get_total_cost(self, category: Optional[CostCategory] = None) -> float:
        """Toplam maliyeti hesapla"""
        costs = self.costs
        if category:
            costs = [c for c in costs if c['category'] == category.value]
        return sum(c['amount'] for c in costs)
    
    def get_cost_breakdown(self) -> Dict:
        """Maliyet dağılımını getir"""
        breakdown = {}
        for cost in self.costs:
            category = cost['category']
            if category not in breakdown:
                breakdown[category] = 0.0
            breakdown[category] += cost['amount']
        return breakdown
    
    def calculate_cost_per_kg(self, total_biomass_kg: float) -> float:
        """Kilogram başına maliyeti hesapla"""
        total_cost = self.get_total_cost()
        if total_biomass_kg <= 0:
            return 0.0
        return total_cost / total_biomass_kg


class InventoryManager:
    """Stok yönetim sistemi"""
    
    def __init__(self, facility_id: str):
        self.facility_id = facility_id
        self.inventory = {}
        self.movements = []
    
    def add_item(self, item_id: str, name: str, quantity: float,
                unit: str, unit_cost: float, currency: str):
        """Stok kalemi ekle"""
        if item_id not in self.inventory:
            self.inventory[item_id] = {
                'name': name,
                'quantity': 0.0,
                'unit': unit,
                'unit_cost': unit_cost,
                'currency': currency,
                'total_value': 0.0
            }
        
        item = self.inventory[item_id]
        item['quantity'] += quantity
        item['total_value'] = item['quantity'] * unit_cost
        
        # Hareket kaydı
        movement = {
            'timestamp': datetime.now().isoformat(),
            'item_id': item_id,
            'type': 'in',
            'quantity': quantity,
            'unit_cost': unit_cost
        }
        self.movements.append(movement)
        
        return item
    
    def remove_item(self, item_id: str, quantity: float) -> Optional[Dict]:
        """Stoktan çıkart"""
        if item_id not in self.inventory:
            return None
        
        item = self.inventory[item_id]
        if item['quantity'] < quantity:
            return None  # Yetersiz stok
        
        item['quantity'] -= quantity
        item['total_value'] = item['quantity'] * item['unit_cost']
        
        # Hareket kaydı
        movement = {
            'timestamp': datetime.now().isoformat(),
            'item_id': item_id,
            'type': 'out',
            'quantity': quantity,
            'unit_cost': item['unit_cost']
        }
        self.movements.append(movement)
        
        return item
    
    def get_inventory_value(self) -> float:
        """Toplam stok değerini hesapla"""
        return sum(item['total_value'] for item in self.inventory.values())
    
    def get_low_stock_items(self, threshold: float) -> List[Dict]:
        """Düşük stoklu kalemleri listele"""
        low_stock = []
        for item_id, item in self.inventory.items():
            if item['quantity'] < threshold:
                low_stock.append({
                    'item_id': item_id,
                    'name': item['name'],
                    'quantity': item['quantity'],
                    'unit': item['unit']
                })
        return low_stock
    
    def get_item(self, item_id: str) -> Optional[Dict]:
        """Stok kalemini getir"""
        return self.inventory.get(item_id)


class FinancialReporter:
    """Mali raporlama sistemi"""
    
    def __init__(self, accounting_manager: AccountingManager):
        self.accounting = accounting_manager
    
    def generate_income_statement(self, start_date: str, 
                                 end_date: str) -> Dict:
        """Gelir tablosu oluştur"""
        balance = self.accounting.calculate_balance(start_date, end_date)
        
        # Gider kategorileri
        expenses = self.accounting.get_transactions(
            TransactionType.EXPENSE, start_date, end_date)
        expense_by_category = {}
        for exp in expenses:
            cat = exp['category']
            if cat not in expense_by_category:
                expense_by_category[cat] = 0.0
            expense_by_category[cat] += exp['amount']
        
        return {
            'period': {'start': start_date, 'end': end_date},
            'revenue': balance['total_revenue'],
            'expenses': {
                'by_category': expense_by_category,
                'total': balance['total_expense']
            },
            'gross_profit': balance['total_revenue'] - balance['total_expense'],
            'net_profit': balance['net_profit']
        }
    
    def generate_cash_flow_statement(self, start_date: str,
                                    end_date: str) -> Dict:
        """Nakit akış tablosu oluştur"""
        transactions = self.accounting.get_transactions(
            start_date=start_date, end_date=end_date)
        
        operating_inflow = sum(t['amount'] for t in transactions 
                              if t['type'] == TransactionType.REVENUE.value)
        operating_outflow = sum(t['amount'] for t in transactions 
                               if t['type'] == TransactionType.EXPENSE.value)
        investing_outflow = sum(t['amount'] for t in transactions 
                               if t['type'] == TransactionType.INVESTMENT.value)
        
        return {
            'period': {'start': start_date, 'end': end_date},
            'operating_activities': {
                'inflow': operating_inflow,
                'outflow': operating_outflow,
                'net': operating_inflow - operating_outflow
            },
            'investing_activities': {
                'outflow': investing_outflow,
                'net': -investing_outflow
            },
            'net_cash_flow': operating_inflow - operating_outflow - investing_outflow
        }
    
    def generate_balance_sheet(self, inventory_manager: InventoryManager,
                              as_of_date: str) -> Dict:
        """Bilanço oluştur"""
        # Aktifler
        inventory_value = inventory_manager.get_inventory_value()
        
        # Özkaynak
        balance = self.accounting.calculate_balance(end_date=as_of_date)
        equity = balance['net_profit'] + balance['total_investment']
        
        return {
            'as_of_date': as_of_date,
            'assets': {
                'inventory': inventory_value,
                'total': inventory_value
            },
            'equity': {
                'retained_earnings': balance['net_profit'],
                'investments': balance['total_investment'],
                'total': equity
            }
        }
    
    def export_report(self, report_type: str, start_date: str,
                     end_date: str, filepath: str):
        """Raporu dışa aktar"""
        import json
        
        if report_type == 'income_statement':
            report = self.generate_income_statement(start_date, end_date)
        elif report_type == 'cash_flow':
            report = self.generate_cash_flow_statement(start_date, end_date)
        else:
            report = {'error': 'Unknown report type'}
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)


__all__ = [
    'AccountingManager',
    'CostTracker',
    'InventoryManager',
    'FinancialReporter',
    'TransactionType',
    'CostCategory'
]
