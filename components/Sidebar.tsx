
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Settings, 
  PlusCircle 
} from 'lucide-react';
import { UserRole, User } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole: UserRole;
  userPermissions?: string[]; // Added permissions to check
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, userRole, userPermissions = [] }) => {
  const menuItems = [
    { id: 'personal', label: 'Dashboard (পার্সোনাল)', icon: LayoutDashboard, roles: ['ADMIN', 'SALESMAN'], permission: null },
    { id: 'sales', label: 'Salesman Sale (বিক্রয়)', icon: ShoppingCart, roles: ['ADMIN', 'SALESMAN'], permission: 'can_sale' },
    { id: 'purchase', label: 'Purchase Entry (ক্রয়)', icon: PlusCircle, roles: ['ADMIN'], permission: null },
    { id: 'inventory', label: 'Inventory (ইনভেন্টরি)', icon: Package, roles: ['ADMIN', 'SALESMAN'], permission: 'view_inventory' },
    { id: 'customers', label: 'Customers (কাস্টমার)', icon: Users, roles: ['ADMIN', 'SALESMAN'], permission: 'manage_customers' },
    { id: 'reports', label: 'Reports (রিপোর্ট)', icon: TrendingUp, roles: ['ADMIN'], permission: null },
    { id: 'admin-approval', label: 'Admin Approval', icon: ShieldCheck, roles: ['ADMIN'], permission: null },
    { id: 'settings', label: 'Settings (সেটিংস)', icon: Settings, roles: ['ADMIN'], permission: null },
  ];

  return (
    <nav className="mt-4 px-3 space-y-1">
      {menuItems.map((item) => {
        // 1. Check Role
        if (!item.roles.includes(userRole)) return null;
        
        // 2. Check Admin-controlled Permissions for Salesmen
        if (userRole === 'SALESMAN' && item.permission && !userPermissions.includes(item.permission)) {
          return null;
        }

        const Icon = item.icon;
        const isActive = currentPage === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${
              isActive 
                ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default Sidebar;
