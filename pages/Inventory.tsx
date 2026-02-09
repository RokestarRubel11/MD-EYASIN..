
import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { Package, Search, Filter, Plus, X, Trash2, LayoutGrid, List } from 'lucide-react';
import { StoreData } from '../store';

interface InventoryProps {
  store: StoreData;
  setStore?: (updater: (prev: StoreData) => StoreData) => void;
}

const Inventory: React.FC<InventoryProps> = ({ store, setStore }) => {
  const [search, setSearch] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    purchasePrice: 0,
    salePrice: 0,
    stock: 0
  });

  const savedUser = JSON.parse(localStorage.getItem('khmteam_auth') || '{}');
  const isAdmin = savedUser.role === 'ADMIN';

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return alert('Product Name is required');
    if (!setStore) return;

    const product: Product = {
      id: `PROD-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku || `SKU-${Math.floor(Math.random() * 10000)}`,
      category: newProduct.category || 'General',
      purchasePrice: Number(newProduct.purchasePrice) || 0,
      salePrice: Number(newProduct.salePrice) || 0,
      stock: Number(newProduct.stock) || 0,
      salesmanId: undefined
    };

    setStore(prev => ({
      ...prev,
      products: [...prev.products, product]
    }));

    setNewProduct({ name: '', sku: '', category: '', purchasePrice: 0, salePrice: 0, stock: 0 });
    setIsAddingProduct(false);
    alert('Product added successfully!');
  };

  const deleteProduct = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    if (!setStore) return;
    setStore(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const filteredProducts = useMemo(() => {
    let list = store.products;
    if (!isAdmin) {
      list = list.filter(p => p.salesmanId === savedUser.id);
    }
    return list.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }, [store.products, search, savedUser.id, isAdmin]);

  const todayStr = new Date().toISOString().split('T')[0];

  const getTodaySalesQty = (productId: string) => {
    return store.sales
      .filter(s => s.date.startsWith(todayStr))
      .reduce((total, sale) => {
        const item = sale.items.find(i => i.productId === productId);
        return total + (item ? item.quantity : 0);
      }, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Search and Add Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="প্রোডাক্ট সার্চ করুন..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest flex items-center shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            নতুন আইটেম
          </button>
        )}
      </div>

      {isAddingProduct && (
        <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl no-print relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-black text-gray-800 uppercase tracking-tight">পণ্য ডেটাবেসে যুক্ত করুন</h3>
            <button onClick={() => setIsAddingProduct(false)} className="text-gray-400 hover:text-red-500 transition-colors">
              <X className="w-8 h-8" />
            </button>
          </div>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">প্রোডাক্ট নাম *</label>
              <input type="text" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">কোড / SKU</label>
              <input type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ক্যাটাগরি</label>
              <input type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">ক্রয় মূল্য (UNIT)</label>
              <input type="number" step="0.01" required value={newProduct.purchasePrice || ''} onChange={e => setNewProduct({...newProduct, purchasePrice: parseFloat(e.target.value) || 0})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-black text-blue-600" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">বিক্রয় মূল্য (UNIT)</label>
              <input type="number" step="0.01" required value={newProduct.salePrice || ''} onChange={e => setNewProduct({...newProduct, salePrice: parseFloat(e.target.value) || 0})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-black text-green-600" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">স্টক পরিমাণ</label>
              <input type="number" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} className="w-full border-2 border-gray-50 bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-black" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-4 pt-4 border-t-2 border-dashed border-gray-50">
              <button type="button" onClick={() => setIsAddingProduct(false)} className="px-8 py-4 text-gray-400 font-black uppercase tracking-widest hover:text-gray-600 transition">Cancel</button>
              <button type="submit" className="px-12 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition">SAVE TO DATABASE</button>
            </div>
          </form>
        </div>
      )}

      {/* Main Inventory Table */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <th className="px-8 py-6">প্রোডাক্ট বিবরণ</th>
                <th className="px-4 py-6 text-center">আজকের সেল</th>
                <th className="px-4 py-6 text-center">স্টক (QTY)</th>
                <th className="px-4 py-6 text-right">সিঙ্গেল ক্রয় মূল্য</th>
                <th className="px-4 py-6 text-right">সিঙ্গেল বিক্রয় মূল্য</th>
                <th className="px-4 py-6 text-right bg-blue-50/20">ক্রয় মূল্য (TOTAL)</th>
                <th className="px-4 py-6 text-right bg-green-50/20">বিক্রয় মূল্য (TOTAL)</th>
                <th className="px-4 py-6 text-right bg-amber-50/20">লাভ (PROFIT)</th>
                {isAdmin && <th className="px-8 py-6 text-center">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.map((p) => {
                const todayQty = getTodaySalesQty(p.id);
                const totalCost = p.purchasePrice * p.stock;
                const totalSaleValue = p.salePrice * p.stock;
                const totalProfit = (p.salePrice - p.purchasePrice) * p.stock;

                return (
                  <tr key={p.id} className="hover:bg-blue-50/30 transition-all duration-300 group">
                    <td className="px-8 py-5">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${p.salesmanId ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                          {p.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-800 leading-tight uppercase">{p.name}</p>
                          <p className="text-[10px] font-bold text-gray-300 font-mono tracking-tight">{p.sku}</p>
                          {p.salesmanId && (
                            <span className="text-[8px] bg-purple-50 text-purple-600 px-1 rounded font-black uppercase">Salesman Owned</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full font-black text-xs ${todayQty > 0 ? 'bg-green-100 text-green-700 animate-pulse' : 'bg-gray-100 text-gray-300'}`}>
                        {todayQty} Units
                      </span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex flex-col">
                        <span className={`text-lg font-black ${p.stock < 5 ? 'text-red-500' : 'text-gray-900'}`}>
                          {p.stock}
                        </span>
                        <span className="text-[9px] font-black text-gray-300 uppercase">Remaining</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right font-bold text-gray-400">
                      {store.settings.currency} {p.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-5 text-right font-black text-gray-900">
                      {store.settings.currency} {p.salePrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-5 text-right font-bold text-blue-600 bg-blue-50/5">
                      {store.settings.currency} {totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-5 text-right font-bold text-green-600 bg-green-50/5">
                      {store.settings.currency} {totalSaleValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-5 text-right font-black text-amber-600 bg-amber-50/5">
                      {store.settings.currency} {totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    {isAdmin && (
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="px-8 py-32 text-center text-gray-300 italic font-medium uppercase tracking-widest">
                    কোন ডাটা পাওয়া যায়নি। (No Inventory Found)
                  </td>
                </tr>
              )}
            </tbody>
            {filteredProducts.length > 0 && (
              <tfoot className="bg-gray-50/80 border-t-4 border-white font-black backdrop-blur-sm sticky bottom-0">
                <tr className="divide-x divide-white">
                  <td className="px-8 py-6 text-gray-400 uppercase text-[10px] tracking-widest">Aggregate Totals</td>
                  <td className="px-4 py-6 text-center text-green-600">
                    {filteredProducts.reduce((a, b) => a + getTodaySalesQty(b.id), 0)} <span className="text-[9px]">Sold</span>
                  </td>
                  <td className="px-4 py-6 text-center text-gray-800">
                    {filteredProducts.reduce((a, b) => a + b.stock, 0)} <span className="text-[9px]">Pcs</span>
                  </td>
                  <td colSpan={2}></td>
                  <td className="px-4 py-6 text-right text-blue-700 bg-blue-100/30">
                    {store.settings.currency} {filteredProducts.reduce((a, b) => a + (b.purchasePrice * b.stock), 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right text-green-700 bg-green-100/30">
                    {store.settings.currency} {filteredProducts.reduce((a, b) => a + (b.salePrice * b.stock), 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-6 text-right text-amber-700 bg-amber-100/30">
                    {store.settings.currency} {filteredProducts.reduce((a, b) => a + ((b.salePrice - b.purchasePrice) * b.stock), 0).toLocaleString()}
                  </td>
                  {isAdmin && <td></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
