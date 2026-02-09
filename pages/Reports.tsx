
import React, { useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface ReportsProps {
  store: any;
}

const Reports: React.FC<ReportsProps> = ({ store }) => {
  const itemReport = useMemo(() => {
    const reportMap = new Map();

    store.sales.forEach((sale: any) => {
      sale.items.forEach((item: any) => {
        const product = store.products.find((p: any) => p.id === item.productId);
        if (!product) return;

        const profitPerItem = item.price - product.purchasePrice;
        const totalProfit = profitPerItem * item.quantity;
        const totalRevenue = item.price * item.quantity;

        const existing = reportMap.get(item.productId) || { 
          name: item.productName, 
          qty: 0, 
          revenue: 0, 
          profit: 0 
        };

        reportMap.set(item.productId, {
          ...existing,
          qty: existing.qty + item.quantity,
          revenue: existing.revenue + totalRevenue,
          profit: existing.profit + totalProfit
        });
      });
    });

    return Array.from(reportMap.values()).sort((a, b) => b.profit - a.profit);
  }, [store]);

  const summary = useMemo(() => {
    const totalProfit = itemReport.reduce((acc, curr) => acc + curr.profit, 0);
    const totalRevenue = itemReport.reduce((acc, curr) => acc + curr.revenue, 0);
    return { totalProfit, totalRevenue };
  }, [itemReport]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold uppercase opacity-80 mb-2">Total Accumulated Profit</p>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-10 h-10" />
            <h2 className="text-4xl font-black">{store.settings.currency} {summary.totalProfit.toLocaleString()}</h2>
          </div>
        </div>
        <div className="flex-1 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-sm font-bold uppercase opacity-80 mb-2">Total Accumulated Revenue</p>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-10 h-10" />
            <h2 className="text-4xl font-black">{store.settings.currency} {summary.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-800">Item-wise Profit Analysis</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Product</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Quantity Sold</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Total Profit</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {itemReport.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 text-center">{item.qty}</td>
                  <td className="px-6 py-4 text-right">{store.settings.currency}{item.revenue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${item.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {store.settings.currency}{item.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold">
                      {((item.profit / item.revenue) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {itemReport.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                    No sales data found to generate report.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
