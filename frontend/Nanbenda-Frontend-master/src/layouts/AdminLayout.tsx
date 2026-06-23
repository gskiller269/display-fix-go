import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Shield, ClipboardList, Users, Store, User, MessageSquare } from 'lucide-react';

interface AdminLayoutProps {
  user: any;
}

export default function AdminLayout({ user }: AdminLayoutProps) {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const pagename = pathParts[pathParts.length - 1];
  
  let formattedPageName = 'Dashboard';
  if (pagename && pagename !== 'admin') {
    formattedPageName = pagename.charAt(0).toUpperCase() + pagename.slice(1).replace(/_/g, ' ');
    if (location.pathname.includes('/staff/add')) formattedPageName = 'Add Technician';
    if (location.pathname.includes('/staff/map')) formattedPageName = 'Live Technicians Map';
  }

  const navItems = [
    { to: '/admin/dashboard', icon: Shield, label: 'Dashboard' },
    { to: '/admin/repairs', icon: ClipboardList, label: 'Repairs' },
    { to: '/admin/staff', icon: Users, label: 'Technicians' },
    { to: '/admin/support', icon: MessageSquare, label: 'Support' },
    { to: '/admin/mart', icon: Store, label: 'Mart' },
    { to: '/admin/account', icon: User, label: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9fc] flex flex-col font-sans text-slate-800 pb-24 overflow-x-hidden max-w-md mx-auto border-x border-slate-100 shadow-2xl relative">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 max-w-md w-full z-[9999] px-4 py-2.5 bg-white border-b-2 border-[#004c4c] flex items-center justify-between select-none shadow-xs">
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-black text-[#004c4c] leading-tight">
            Display Fix Go Admin
          </h1>
          <span className="text-[10px] font-extrabold text-slate-500 leading-none mt-0.5">
            {formattedPageName}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-black text-slate-700 max-w-[100px] truncate">
            {user?.full_name || user?.username || 'Admin'}
          </span>
          <div className="w-8 h-8 rounded-full bg-teal-50 border-2 border-teal-500/20 flex items-center justify-center shadow-xs">
            <Shield className="h-3.5 w-3.5 text-[#004c4c]" />
          </div>
        </div>
      </header>

      <main className="pt-16 flex-1 overflow-x-hidden">
        <div className="scale-down-20">
          <Outlet />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-md w-full bg-white border-t border-slate-100 flex items-center justify-around z-[9999] shadow-md" style={{ height: '72px' }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin/staff' ? false : true}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive ? 'text-[#004c4c]' : 'text-slate-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-teal-50' : ''}`}>
                  <Icon className={`transition-all duration-200 ${isActive ? 'h-5.5 w-5.5 stroke-[2.5]' : 'h-5 w-5 stroke-2'}`} style={{ width: isActive ? '22px' : '20px', height: isActive ? '22px' : '20px' }} />
                </div>
                <span className={`text-[10px] leading-none transition-all ${isActive ? 'font-black text-[#004c4c]' : 'font-medium text-slate-400'}`}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#004c4c]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
