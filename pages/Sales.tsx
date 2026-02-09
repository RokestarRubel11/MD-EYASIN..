
import React, { useState, useMemo } from 'react';
import { StoreData } from '../store';
import { Product, Sale, SaleItem, User, Customer } from '../types';
import { Plus, Trash2, Printer, Search, UserCheck, X, Share2, MessageCircle, CheckCircle2 } from 'lucide-react';

interface SalesProps {
  store: StoreData;
  setStore: (updater: (prev: StoreData) => StoreData) => void;
  user: User;
}

const Sales: React.FC<SalesProps> = ({ store, setStore, user }) => {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [showInvoice, setShowInvoice] = useState<Sale | null>(null);

  const availableProducts = useMemo(() => {
    return store.products.filter(p => user.role === 'ADMIN' ? true : p.salesmanId === user.id);
  }, [store.products, user.id, user.role]);

  const addToCart = () => {
    if (!selectedProduct) return;
    const product = availableProducts.find((p: Product) => p.id === selectedProduct);
    if (!product) return;
    if (product.stock < quantity) return alert('Insufficient stock!');

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (product.stock < existing.quantity + quantity) return alert('Stock limit exceeded!');
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity, price: product.salePrice }]);
    }
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.productId !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const vatRate = 0.15;
  const vatAmount = subtotal * vatRate;
  const total = subtotal + vatAmount;

  const handleCheckout = () => {
    if (!selectedCustomer) return alert('Select a customer');
    if (cart.length === 0) return alert('Cart is empty');

    const customer = store.customers.find((c: Customer) => c.id === selectedCustomer);
    
    const newSale: Sale = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer,
      customerName: customer?.name || 'Walk-in',
      items: cart,
      subtotal,
      vat: vatAmount,
      total,
      salesmanId: user.id
    };

    setStore(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales],
      products: prev.products.map((p: Product) => {
        const item = cart.find(i => i.productId === p.id);
        if (item && (p.id === item.productId)) {
           return { ...p, stock: p.stock - item.quantity };
        }
        return p;
      })
    }));

    setShowInvoice(newSale);
    setCart([]);
    setSelectedCustomer('');
  };

  const printInvoice = () => {
    window.print();
  };

  const shareViaWhatsApp = () => {
    if (!showInvoice) return;
    const text = `*Invoice from ${store.settings.companyName}*\n\n*Invoice No:* ${showInvoice.id}\n*Date:* ${new Date(showInvoice.date).toLocaleDateString()}\n*Customer:* ${showInvoice.customerName}\n*Total:* ${store.settings.currency} ${showInvoice.total.toFixed(2)}\n\nThank you for your business!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareInvoice = async () => {
    if (!showInvoice || !navigator.share) {
        alert('Sharing is not supported on this browser. Use WhatsApp or Print.');
        return;
    }
    try {
      await navigator.share({
        title: `Invoice ${showInvoice.id}`,
        text: `Tax Invoice from ${store.settings.companyName} for ${showInvoice.customerName}. Total: ${store.settings.currency} ${showInvoice.total.toFixed(2)}`,
        url: window.location.origin, // Sharing the app URL
      });
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight">Terminal POS</h3>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full text-blue-700 text-xs font-bold border border-blue-100">
                <UserCheck className="w-3 h-3" />
                <span>Holder: {user.name}</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Client Selection</label>
                  <select 
                    className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-gray-700 transition-all"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                  >
                    <option value="">Choose Customer...</option>
                    {store.customers.map((c: Customer) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Select Stock Item</label>
                   <select 
                    className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-gray-700 transition-all"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                  >
                    <option value="">Pick Product...</option>
                    {availableProducts.map((p: Product) => (
                      <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                        {p.name} (Qty: {p.stock}) - {store.settings.currency}{p.salePrice}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4 border-t-2 border-dashed border-gray-50">
                <div className="w-32">
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="w-full border-2 border-gray-100 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-center" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
                <button 
                  onClick={addToCart}
                  disabled={!selectedProduct}
                  className="flex-1 bg-blue-600 text-white p-3.5 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-lg active:scale-95"
                >
                  Confirm & Add
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center">Unit</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-right">Gross</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cart.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-black text-gray-800">{item.productName}</td>
                    <td className="px-6 py-4 text-center font-bold">{item.quantity}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-500">{store.settings.currency}{item.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-black text-blue-600">{store.settings.currency}{(item.price * item.quantity).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => removeFromCart(item.productId)} className="text-red-300 hover:text-red-600 transition p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-300 italic font-medium">No items in cart. Ready for selection.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6 no-print">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-6">
            <h3 className="text-xl font-black text-gray-800 mb-8 border-b pb-4">Transaction Summary</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center text-gray-400 font-bold text-xs uppercase">
                <span>Total Units</span>
                <span className="text-gray-800 text-sm font-black">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-400 font-bold text-xs uppercase">
                <span>Sub-Total</span>
                <span className="text-gray-800 text-sm font-black">{store.settings.currency}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-orange-400 font-bold text-xs uppercase">
                <span>VAT (15%)</span>
                <span className="text-orange-600 text-sm font-black">+{store.settings.currency}{vatAmount.toFixed(2)}</span>
              </div>
              <div className="pt-6 border-t-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-1">Total Payable</p>
                <div className="text-5xl font-black text-blue-700 tracking-tighter">
                  {store.settings.currency}{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-5 rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center space-x-3 mt-4 ${
                  cart.length === 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                <span>GENERATE INVOICE</span>
              </button>
            </div>
          </div>

          {showInvoice && (
            <div className="bg-white p-6 rounded-2xl shadow-2xl border-4 border-emerald-500 animate-in zoom-in fade-in duration-300">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-black text-gray-800 uppercase tracking-tight">Invoice Generated!</p>
                  <p className="text-xs text-gray-400 font-mono font-bold uppercase">{showInvoice.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={printInvoice} className="bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-black transition shadow-lg">
                  <Printer className="w-4 h-4" />
                  <span>Print / PDF</span>
                </button>
                <button onClick={shareViaWhatsApp} className="bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:opacity-90 transition shadow-lg">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button onClick={shareInvoice} className="bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-600 transition shadow-lg col-span-2">
                  <Share2 className="w-4 h-4" />
                  <span>Send / Share</span>
                </button>
                <button onClick={() => setShowInvoice(null)} className="bg-gray-100 text-gray-500 py-3 rounded-xl font-bold hover:bg-gray-200 transition col-span-2">
                  Close & New Sale
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PROFESSIONAL TAX INVOICE (PDF/PRINT LAYOUT) - MATCHED TO PHOTO */}
      <div className="print-only fixed inset-0 bg-white p-0 text-[10px] font-sans">
        <div className="max-w-[210mm] mx-auto bg-white min-h-screen relative p-6 border border-gray-100">
          
          {/* Top Logo and Type Header */}
          <div className="flex justify-between items-start mb-6">
             <div className="w-2/3">
                <h1 className="text-2xl font-black text-gray-900 uppercase">Tax Invoice (فاتورة ضريبية)</h1>
                <div className="mt-4 space-y-1">
                   <p className="font-black text-[11px] uppercase tracking-wider text-gray-400 border-b inline-block mb-1">Suppliers Details / تفاصيل المورد</p>
                   <p className="font-black text-blue-800 text-[13px] uppercase">{store.settings.companyName}</p>
                   <p className="text-[9px] text-gray-600 uppercase font-medium">{store.settings.address}</p>
                   <p className="text-[10px] font-black mt-1">VAT TRN: <span className="text-gray-900 font-mono">{store.settings.vatNumber}</span></p>
                   <p className="text-[9px] font-bold">Contact: {store.settings.phone}</p>
                </div>
             </div>
             <div className="w-1/3 text-right">
                <img src={store.settings.logo} alt="Logo" className="h-16 ml-auto mb-3 object-contain" />
                <div className="inline-block border-2 border-gray-100 p-2 rounded-lg">
                   <img src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`${store.settings.companyName}|${store.settings.vatNumber}|${showInvoice?.date}|${showInvoice?.total}`)}`} alt="ZATCA QR" className="w-20 h-20" />
                </div>
             </div>
          </div>

          {/* Top Date/Delivery Bar */}
          <div className="grid grid-cols-3 gap-0 border border-gray-800 mb-6 text-[8px] font-black uppercase text-center bg-gray-50 divide-x divide-gray-800">
             <div className="py-2">Order Date (تاريخ الطلب): {showInvoice ? new Date(showInvoice.date).toLocaleDateString() : ''}</div>
             <div className="py-2">Invoice Date (تاريخ الفاتورة): {showInvoice ? new Date(showInvoice.date).toLocaleDateString() : ''}</div>
             <div className="py-2">Delivery Date (تاريخ التوصيل): {showInvoice ? new Date(showInvoice.date).toLocaleDateString() : ''}</div>
          </div>

          {/* Customer Boxes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
             <div className="border border-gray-800">
                <div className="bg-gray-100 px-3 py-1 border-b border-gray-800 flex justify-between font-black uppercase text-[8px]">
                   <span>SHIP TO / توريد لـ</span>
                </div>
                <div className="p-3 space-y-1 text-[9px]">
                   <p className="font-black text-[11px] uppercase">{showInvoice?.customerName}</p>
                   <p className="text-gray-500 uppercase">{store.customers.find(c => c.id === showInvoice?.customerId)?.address || 'Address Not Available'}</p>
                   <p className="font-bold">Mobile: {store.customers.find(c => c.id === showInvoice?.customerId)?.phone}</p>
                </div>
             </div>
             <div className="border border-gray-800">
                <div className="bg-gray-100 px-3 py-1 border-b border-gray-800 flex justify-between font-black uppercase text-[8px]">
                   <span>BILL TO / فاتورة لـ</span>
                </div>
                <div className="p-3 space-y-1 text-[9px]">
                   <p className="font-black text-[11px] uppercase">{showInvoice?.customerName}</p>
                   <p className="text-gray-500 font-black">Customer TRN: 310866113500003</p>
                </div>
             </div>
          </div>

          {/* Specific Grid Row for Meta Info */}
          <div className="grid grid-cols-8 gap-0 border border-gray-800 mb-6 bg-gray-50 text-[7px] font-black uppercase text-center divide-x divide-gray-800 border-b-2 border-b-gray-800">
             <div className="p-2"><p className="text-gray-400 mb-1">Invoice No</p><span className="text-[9px] font-mono">{showInvoice?.id.replace('INV-', '')}</span></div>
             <div className="p-2"><p className="text-gray-400 mb-1">Sales Man</p>{user.name}</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Mobile</p>0560...</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Emirates</p>JEDDAH</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Site Code</p>20400516</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Cust Code</p>12008</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Currency</p>{store.settings.currency}</div>
             <div className="p-2"><p className="text-gray-400 mb-1">Payment</p>Credit / Cash</div>
          </div>

          {/* Professional Table matched to Image */}
          <table className="w-full border-collapse border border-gray-800 text-[8px]">
             <thead>
                <tr className="bg-gray-100 font-black text-center uppercase divide-x divide-gray-800 border-b border-gray-800">
                   <th className="p-1 w-12">Item Code</th>
                   <th className="p-1 w-10">UOM</th>
                   <th className="p-1 w-20">Quantity (CTN | PCS)</th>
                   <th className="p-1 w-14">Price / Unit</th>
                   <th className="p-1 w-16">Gross Amt</th>
                   <th className="p-1 w-14">Excise Duty</th>
                   <th className="p-1 w-14">Discount</th>
                   <th className="p-1 w-10">VAT %</th>
                   <th className="p-1 w-16">VAT Amt</th>
                   <th className="p-1 w-20">Total Incl VAT</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-gray-800">
                {showInvoice?.items.map((item, idx) => {
                   const gross = item.price * item.quantity;
                   const itemVat = gross * 0.15;
                   const totalWithVat = gross + itemVat;
                   const product = store.products.find(p => p.id === item.productId);
                   return (
                      <tr key={idx} className="divide-x divide-gray-800 h-8 align-middle text-center">
                         <td className="p-1 font-mono text-gray-500">{product?.sku || '58064'}</td>
                         <td className="p-1">24</td>
                         <td className="p-1 font-black">
                            <div className="flex justify-around"><span>{item.quantity}</span><span className="text-gray-300">|</span><span>0</span></div>
                         </td>
                         <td className="p-1">{item.price.toFixed(2)}</td>
                         <td className="p-1 font-bold">{gross.toFixed(2)}</td>
                         <td className="p-1">0.00</td>
                         <td className="p-1">0.00</td>
                         <td className="p-1">15%</td>
                         <td className="p-1">{itemVat.toFixed(2)}</td>
                         <td className="p-1 font-black bg-gray-50">{totalWithVat.toFixed(2)}</td>
                      </tr>
                   );
                })}
                {/* Product Description Rows beneath items */}
                {showInvoice?.items.map((item, idx) => (
                    <tr key={`desc-${idx}`} className="bg-gray-50/50">
                        <td className="p-0.5 px-2 text-[7px] text-gray-400 italic border-r border-gray-800" colSpan={10}>
                            Description: {item.productName} - (Item {idx + 1} details listed above)
                        </td>
                    </tr>
                ))}
                {/* Filler Rows */}
                {[...Array(5)].map((_, i) => (
                   <tr key={`filler-${i}`} className="divide-x divide-gray-800 h-8 opacity-20">
                      <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                   </tr>
                ))}
             </tbody>
          </table>

          {/* Summary Box Matched to Image Footer */}
          <div className="mt-6 flex justify-end">
             <div className="w-1/2 border-2 border-gray-800 divide-y-2 divide-gray-800 font-black">
                <div className="flex justify-between p-2 text-[9px]">
                   <span className="text-gray-500 uppercase tracking-tighter">Gross Subtotal (المجموع الفرعي):</span>
                   <span>{store.settings.currency} {showInvoice?.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 text-[9px] bg-gray-50">
                   <span className="text-gray-500 uppercase tracking-tighter">Total Excise Duty:</span>
                   <span>{store.settings.currency} 0.00</span>
                </div>
                <div className="flex justify-between p-2 text-[9px]">
                   <span className="text-gray-500 uppercase tracking-tighter">Total VAT (15%) (ضريبة القيمة المضافة):</span>
                   <span>{store.settings.currency} {showInvoice?.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-3 bg-blue-900 text-white font-black text-[14px]">
                   <span className="uppercase tracking-widest">Net Total (SR) / المجموع:</span>
                   <span>{showInvoice?.total.toFixed(2)}</span>
                </div>
             </div>
          </div>

          {/* Footer Text & Signatures */}
          <div className="mt-16 flex justify-between items-end text-[7px] font-black text-gray-400 uppercase">
             <div className="space-y-6 text-center">
                <p className="border-b-2 border-gray-100 pb-1">Receiver Signature / توقيع المستلم</p>
                <div className="w-40 h-8 bg-gray-50/50 rounded"></div>
             </div>
             <div className="text-center italic mb-4">
                Thank you for your business!<br/>
                <span className="text-blue-800">Cloud Powered by KHMTEAM POS Solutions</span>
             </div>
             <div className="space-y-6 text-center">
                <p className="border-b-2 border-gray-100 pb-1">Authorized Signature / توقيع معتمد</p>
                <div className="w-40 h-8 bg-gray-50/50 rounded ml-auto"></div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Sales;
