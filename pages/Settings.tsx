
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Settings as SettingsIcon, Save, Upload, Link } from 'lucide-react';

interface SettingsProps {
  store: any;
  setStore: (updater: (prev: any) => any) => void;
}

const Settings: React.FC<SettingsProps> = ({ store, setStore }) => {
  const [settings, setSettings] = useState<AppSettings>(store.settings);

  const handleSave = () => {
    setStore(prev => ({ ...prev, settings }));
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Company Settings</h2>
          </div>
          <button 
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
              <input 
                type="text" 
                value={settings.companyName}
                onChange={e => setSettings({...settings, companyName: e.target.value})}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">VAT Number</label>
              <input 
                type="text" 
                value={settings.vatNumber}
                onChange={e => setSettings({...settings, vatNumber: e.target.value})}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                value={settings.phone}
                onChange={e => setSettings({...settings, phone: e.target.value})}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Currency Symbol</label>
              <input 
                type="text" 
                value={settings.currency}
                onChange={e => setSettings({...settings, currency: e.target.value})}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="৳, $, etc"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
              <textarea 
                value={settings.address}
                onChange={e => setSettings({...settings, address: e.target.value})}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows={4}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Logo URL</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  value={settings.logo}
                  onChange={e => setSettings({...settings, logo: e.target.value})}
                  className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="mt-4 p-4 border border-dashed rounded-lg bg-gray-50 flex flex-col items-center">
                <p className="text-xs text-gray-400 mb-2 uppercase font-bold">Logo Preview</p>
                {settings.logo ? (
                  <img src={settings.logo} alt="Logo" className="h-20 object-contain" />
                ) : (
                  <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-gray-400">No Logo</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
