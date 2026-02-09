
import React, { useState } from 'react';
import { Customer } from '../types';
import { UserPlus, Phone, MapPin, Search } from 'lucide-react';

interface CustomersProps {
  store: any;
  setStore: (updater: (prev: any) => any) => void;
}

const Customers: React.FC<CustomersProps> = ({ store, setStore }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return alert('Name and phone required');

    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...formData
    };

    setStore(prev => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
    setFormData({ name: '', phone: '', address: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
            Add New Customer
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Name</label>
              <input 
                type="text" required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Walking Customer"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+880123..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={3}
                placeholder="Dhaka, Bangladesh"
              ></textarea>
            </div>
            <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
              Save Customer
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-transparent border-none focus:ring-0 outline-none flex-1"
            />
          </div>
          <div className="divide-y">
            {store.customers.map((c: Customer) => (
              <div key={c.id} className="p-4 hover:bg-gray-50 flex justify-between items-center transition-colors">
                <div>
                  <h4 className="font-bold text-gray-900">{c.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {c.phone}</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {c.address || 'No Address'}</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 transition">
                  History
                </button>
              </div>
            ))}
            {store.customers.length === 0 && (
              <div className="p-10 text-center text-gray-400">No customers found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
