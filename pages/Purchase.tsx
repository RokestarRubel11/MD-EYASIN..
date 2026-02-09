
import React, { useState, useMemo } from 'react';
import { Product, Purchase } from '../types';
import { ShoppingBag, Calendar, UserCheck, Search, CheckCircle, Package, ArrowRightLeft } from 'lucide-react';
import { StoreData } from '../store';

interface PurchaseProps {
  store: StoreData;
  setStore: (updater: (prev: StoreData) => StoreData) => void;
}

const PurchasePage: React.FC<PurchaseProps> = ({ store, setStore }) => {
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignedSalesmanId, setAssignedSalesmanId] = useState<string>('');
  const [search, setSearch] = useState('');
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const salesmen = store.users.filter(u => u.role === 'SALESMAN' && u.status === 'APPROVED');

  const masterProducts = useMemo(() => {
    return store.products.filter(p => !p.salesmanId);
  }, [store.products]);

  const filteredProducts = useMemo(() => {
    return masterProducts.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }, [masterProducts, search]);

  const handleQtyChange = (productId: string, val: string) => {
    const num = parseInt(val) || 0;
    setQuantities(prev => ({ ...prev, [productId]: num }));
  };

  const totalPurchaseValue = useMemo(() => {
    return Object.entries(quantities).reduce((sum, [id, qty]) => {
      const product = masterProducts.find(p => p.id === id);
      return sum + (product ? product.purchasePrice * (qty as number) : 0);
    }, 0);
  }, [quantities, masterProducts]);

  const totalItemsCount = Object.values(quantities).filter(q => (q as number) > 0).length;

  const handleProcessTransaction = () => {
    if (totalItemsCount === 0) return alert('Enter at least one quantity.');

    // If transferring to salesman, check if warehouse has enough stock
    if (assignedSalesmanId) {
      for (const [id, qty] of Object.entries(quantities)) {
        const numQty = qty as number;
        if (numQty <= 0) continue;
        const masterProd = masterProducts.find(p => p.id === id);
        if (masterProd && masterProd.stock < numQty) {
          return alert(`Insufficient Warehouse stock for ${masterProd.name}. Available: ${masterProd.stock}`);
        }
      }
    }

    setStore(prev => {
      let updatedProducts = [...prev.products];
      const newPurchases: Purchase[] = [];

      Object.entries(quantities).forEach(([id, qty]) => {
        const numQty = qty as number;
        if (numQty <= 0) return;

        const masterIdx = updatedProducts.findIndex(p => p.id === id);
        if (masterIdx === -1) return;
        const masterProduct = updatedProducts[masterIdx];

        if (assignedSalesmanId) {
          // 1. DEDUCT from Master Inventory (Warehouse)
          updatedProducts[masterIdx].stock -= numQty;

          // 2. GIVE to Salesman Inventory
          const sProdIdx = updatedProducts.findIndex(p => p.name === masterProduct.name && p.salesmanId === assignedSalesmanId);
          if (sProdIdx > -1) {
            updatedProducts[sProdIdx].stock += numQty;
          } else {
            updatedProducts.push({
              ...masterProduct,
              id: `PROD-S-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              stock: numQty,
              salesmanId: assignedSalesmanId
            });
          }
        } else {
          // Standard Restock (Purchase from supplier)
          updatedProducts[masterIdx].stock += numQty;
          
          newPurchases.push({
            id: `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            date: purchaseDate,
            productId: id,
            quantity: numQty,
            unitPrice: masterProduct.purchasePrice,
            total: numQty * masterProduct.purchasePrice
          });
        }
      });

      return {
        ...prev,
        products: updatedProducts,
        purchases: [...newPurchases, ...prev.purchases]
      };
    });

    setQuantities({});
    alert(assignedSalesmanId ? 'Stock transferred to Salesman successfully!' : 'Warehouse restocked successfully!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
            {assignedSalesmanId ? <ArrowRightLeft className="w-8 h-8" /> : <ShoppingBag className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">
              {assignedSalesmanId ? 'Stock Transfer (সেলসম্যান কে মাল দেয়া)' : 'Warehouse Purchase (গুদামজাত করা)'}
            </h2>
            <p className="text-sm text-gray-400 font-medium">Manage main warehouse inventory and distributions.</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="bg-blue-50 p-3 rounded-xl border-2 border-white shadow-sm flex items-center space-x-3">
            <UserCheck className="w-5 h-5 text-blue-600" />
            <select 
              value={assignedSalesmanId}
              onChange={(e) => setAssignedSalesmanId(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm font-black text-blue-700 outline-none pr-8"
            >
              <option value="">Restock Master Warehouse</option>
              {salesmen.map(s => (
                <option key={s.id} value={s.id}>Transfer to Salesman: {s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="পণ্য খুঁজুন..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-h-[500px]">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase border-b">
                  <tr>
                    <th className="px-8 py-5">Product Details</th>
                    <th className="px-8 py-5 text-center">Warehouse Stock</th>
                    <th className="px-8 py-5 text-right">Cost Price</th>
                    <th className="px-8 py-5 text-center w-40">{assignedSalesmanId ? 'Transfer Qty' : 'Restock Qty'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className={`transition-colors hover:bg-blue-50/30 ${quantities[p.id] > 0 ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-8 py-5">
                        <p className="font-black text-gray-800 uppercase">{p.name}</p>
                        <p className="text-[10px] font-bold text-blue-500 font-mono">{p.sku}</p>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-sm font-black ${p.stock <= 0 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</span>
                      </td>
                      <td className="px-8 py-5 text-right font-bold text-gray-700">
                        {store.settings.currency}{p.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-8 py-5">
                        <input 
                          type="number" 
                          min="0"
                          max={assignedSalesmanId ? p.stock : undefined}
                          placeholder="0"
                          value={quantities[p.id] || ''}
                          onChange={(e) => handleQtyChange(p.id, e.target.value)}
                          className="w-full text-center border-2 border-gray-100 rounded-xl py-2 font-black text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-6">
            <h3 className="text-xl font-black text-gray-800 mb-8 border-b pb-4">
              {assignedSalesmanId ? 'Transfer Summary' : 'Purchase Summary'}
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-center text-gray-400 font-bold text-xs uppercase">
                <span>Unique Items</span>
                <span className="text-gray-800 text-sm font-black">{totalItemsCount}</span>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-6 border-2 border-white shadow-inner">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Value of Transaction</p>
                <p className="text-3xl font-black text-blue-700 text-center">
                  {store.settings.currency}{totalPurchaseValue.toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[9px] font-black text-amber-700 uppercase mb-1">Destination</p>
                <p className="text-xs font-bold text-amber-900">
                  {assignedSalesmanId ? `Assigned to: ${salesmen.find(s => s.id === assignedSalesmanId)?.name}` : 'Main Warehouse Stock'}
                </p>
              </div>

              <button 
                onClick={handleProcessTransaction}
                disabled={totalItemsCount === 0}
                className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                  totalItemsCount === 0 
                  ? 'bg-gray-100 text-gray-400' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                <span>{assignedSalesmanId ? 'CONFIRM TRANSFER' : 'CONFIRM PURCHASE'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
