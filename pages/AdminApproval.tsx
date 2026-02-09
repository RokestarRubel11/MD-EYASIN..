
import React, { useState } from 'react';
import { User } from '../types';
import { CheckCircle, XCircle, Shield, Mail, UserCheck, Settings2, X } from 'lucide-react';
import { StoreData } from '../store';

interface AdminApprovalProps {
  store: StoreData;
  setStore: (updater: (prev: StoreData) => StoreData) => void;
}

const AdminApproval: React.FC<AdminApprovalProps> = ({ store, setStore }) => {
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);

  const handleApprove = (userId: string, status: 'APPROVED' | 'PENDING') => {
    setStore(prev => ({
      ...prev,
      users: prev.users.map((u: User) => {
        if (u.id === userId) {
          // Default permissions for new approvals
          const defaultPerms = status === 'APPROVED' ? ['can_sale', 'view_inventory', 'manage_customers'] : [];
          return { ...u, status, permissions: u.permissions.length > 0 ? u.permissions : defaultPerms };
        }
        return u;
      })
    }));
  };

  const togglePermission = (userId: string, permission: string) => {
    setStore(prev => ({
      ...prev,
      users: prev.users.map((u: User) => {
        if (u.id === userId) {
          const hasPerm = u.permissions.includes(permission);
          const nextPerms = hasPerm 
            ? u.permissions.filter(p => p !== permission)
            : [...u.permissions, permission];
          return { ...u, permissions: nextPerms };
        }
        return u;
      })
    }));
  };

  const pendingUsers = store.users.filter((u: User) => u.status === 'PENDING');
  const approvedUsers = store.users.filter((u: User) => u.status === 'APPROVED' && u.role === 'SALESMAN');

  return (
    <div className="space-y-8">
      {/* Pending Approvals */}
      <div className="bg-white rounded-xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-orange-800 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Pending Registration Requests
          </h3>
          <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
            {pendingUsers.length} Pending
          </span>
        </div>
        <div className="divide-y">
          {pendingUsers.map((user: User) => (
            <div key={user.id} className="p-6 flex items-center justify-between hover:bg-orange-50/30 transition">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500 flex items-center"><Mail className="w-3 h-3 mr-1" /> {user.email}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => handleApprove(user.id, 'APPROVED')}
                  className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button className="flex items-center space-x-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition">
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
          {pendingUsers.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic">No pending salesman requests.</div>
          )}
        </div>
      </div>

      {/* Approved Salesmen Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
            Active Salesmen & Permissions
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Salesman</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Active Permissions</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {approvedUsers.map((user: User) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.permissions.map(p => (
                        <span key={p} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                          {p.replace('_', ' ')}
                        </span>
                      ))}
                      {user.permissions.length === 0 && <span className="text-xs text-red-400 italic">No Access</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={() => setEditingPermissions(user.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-100"
                        title="Manage Permissions"
                      >
                        <Settings2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleApprove(user.id, 'PENDING')}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition border border-red-100"
                        title="Revoke Access"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission Modal */}
      {editingPermissions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <h4 className="text-xl font-bold text-gray-800">Assign Permissions</h4>
              <button onClick={() => setEditingPermissions(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Select which modules <strong>{store.users.find(u => u.id === editingPermissions)?.name}</strong> can access:
              </p>
              
              {[
                { id: 'can_sale', label: 'Salesman Sale (বিক্রয়)', desc: 'Allows access to the checkout and invoice page.' },
                { id: 'view_inventory', label: 'View Inventory (ইনভেন্টরি)', desc: 'Allows salesman to see products assigned to them.' },
                { id: 'manage_customers', label: 'Manage Customers (কাস্টমার)', desc: 'Allows adding and viewing customers.' }
              ].map(perm => (
                <label key={perm.id} className="flex items-start p-4 border rounded-xl hover:bg-blue-50 transition cursor-pointer group">
                  <div className="flex items-center h-5 mt-1">
                    <input 
                      type="checkbox"
                      checked={store.users.find(u => u.id === editingPermissions)?.permissions.includes(perm.id)}
                      onChange={() => togglePermission(editingPermissions, perm.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                  <div className="ml-4">
                    <span className="block font-bold text-gray-800 group-hover:text-blue-700">{perm.label}</span>
                    <span className="block text-xs text-gray-500">{perm.desc}</span>
                  </div>
                </label>
              ))}
            </div>
            <div className="p-6 bg-gray-50 border-t">
              <button 
                onClick={() => setEditingPermissions(null)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApproval;
