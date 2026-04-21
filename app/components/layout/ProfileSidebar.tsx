import React from 'react'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, MapPin, Package, Lock, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileSidebar: React.FC = () => {
  const location = usePathname();
  const { logout } = useAuth();

  const menuItems = [
    {
      path: '/profile',
      label: 'Detail Profil',
      icon: User,
    },
    {
      path: '/profile/address',
      label: 'Alamat',
      icon: MapPin,
    },
    {
      path: '/profile/orders',
      label: 'Histori Pesanan',
      icon: Package,
    },
    {
      path: '/profile/password',
      label: 'Ganti Password',
      icon: Lock,
    },
  ];

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="w-full md:w-64 bg-[#121212] border border-zinc-800 rounded-lg p-4">
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-white text-black'
                  : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">Logout</span>
        </button>
      </nav>
    </aside>
  );
};
