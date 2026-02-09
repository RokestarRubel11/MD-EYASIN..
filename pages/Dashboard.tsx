
import React, { useMemo } from 'react';
import { StoreData } from '../store';
import { TrendingUp, TrendingDown, Package, DollarSign, Activity, ShoppingBag as BagIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  store: StoreData;
}

const Dashboard: React.FC<DashboardProps> = ({ store }) => {
  const stats = useMemo(() => {
    const totalPurchase = store.purchases.reduce((acc, p) => acc + p.total, 0);
    const totalSales = store.sales.reduce((acc, s) => acc + s.total, 0);
    
    let totalProfit = 0;
    store.sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const product = store.products.find((p) => p.id === item.productId);
        if (product) {
          totalProfit += (item.price - product.purchasePrice) * item.quantity;
        }
      });
    });

    const stockValue = store.products.reduce((acc, p) => acc + (p.purchasePrice * p.stock), 0);
    
    return {
      totalPurchase,
      totalSales,
      totalProfit,
      stockValue,
      salesCount: store.sales.length,
      productCount: store.products.length
    };
  }, [store]);

  const chartData = [
    { name: 'Purchase', value: stats.totalPurchase, color: '#3b82f6' },
    { name: 'Sales', value: stats.totalSales, color: '#10b981' },
    { name: 'Profit', value: stats.totalProfit, color: '#f59e0b' },
    { name: 'Inventory', value: stats.stockValue, color: '#6366f1' },
  ];

  const cards = [
    { title: 'Total Purchase', value: stats.totalPurchase, icon: BagIcon, color: 'bg-blue-600', shadow: 'shadow-blue-100' },
    { title: 'Total Sales', value: stats.totalSales, icon: TrendingUp, color: 'bg-emerald-600', shadow: 'shadow-emerald-100' },
    { title: 'Total Profit', value: stats.totalProfit, icon: DollarSign, color: 'bg-amber-600', shadow: 'shadow-amber-100' },
    { title: 'Inventory Value', value: stats.stockValue, icon: Package, color: 'bg-indigo-600', shadow: 'shadow-indigo-100' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white rounded-3xl p-6 shadow-xl border border-gray-100 transition-all hover:scale-105 duration-300`}>
              <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg ${card.shadow}`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{card.title}</p>
                <p className="text-3xl font-black text-gray-900 tracking-tighter">
                  <span className="text-sm font-bold text-gray-300 mr-1">{store.settings.currency}</span>
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Business Overview</h3>
            <div className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-wider">Financial Chart</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  formatter={(value: number) => [`${store.settings.currency} ${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={50}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex flex-col">
          <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight mb-8">Performance</h3>
          <div className="flex-1 space-y-6">
            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border-2 border-white shadow-sm transition-all hover:bg-white hover:border-blue-50">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600 p-2.5 rounded-xl text-white"><Package className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Skus</p>
                  <span className="text-xl font-black text-gray-800">{stats.productCount}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-5 bg-gray-50 rounded-2xl border-2 border-white shadow-sm transition-all hover:bg-white hover:border-green-50">
              <div className="flex items-center space-x-4">
                <div className="bg-emerald-600 p-2.5 rounded-xl text-white"><Activity className="w-5 h-5" /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                  <span className="text-xl font-black text-gray-800">{stats.salesCount}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-600 rounded-3xl text-white shadow-xl shadow-blue-100 mt-auto">
              <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Net Profit Margin</p>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-black tracking-tighter">
                  {stats.totalSales > 0 ? ((stats.totalProfit / stats.totalSales) * 100).toFixed(1) : 0}%
                </span>
                <span className="text-sm font-bold text-blue-200 uppercase tracking-widest">Yield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
