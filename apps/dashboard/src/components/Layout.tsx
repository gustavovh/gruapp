import React from 'react';
import { LayoutDashboard, Truck, Users, History, Settings, Bell, Search } from 'lucide-react';

const Layout: React.FC<{ 
  children: React.ReactNode, 
  onNewDispatch?: () => void,
  currentTab: string,
  onTabChange: (tab: string) => void
}> = ({ children, onNewDispatch, currentTab, onTabChange }) => {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col pt-6 glassmorphism">
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Truck className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GruaDirect</h1>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Vistas Live" active={currentTab === 'overview'} onClick={() => onTabChange('overview')} />
          <SidebarItem icon={<Truck size={20} />} label="Flota" active={currentTab === 'fleet'} onClick={() => onTabChange('fleet')} />
          <SidebarItem icon={<Users size={20} />} label="Conductores" active={currentTab === 'drivers'} onClick={() => onTabChange('drivers')} />
          <SidebarItem icon={<History size={20} />} label="Historial" active={currentTab === 'history'} onClick={() => onTabChange('history')} />
          <SidebarItem icon={<Settings size={20} />} label="Ajustes" active={currentTab === 'settings'} onClick={() => onTabChange('settings')} />
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
            <div className="text-sm">
              <p className="font-medium">Admin User</p>
              <p className="text-white/50 text-xs">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4 w-1/3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                placeholder="Search services, drivers..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full relative transition-colors">
              <Bell size={20} className="text-white/70" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#0a0a0a]" />
            </button>
            <button 
              onClick={onNewDispatch}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              New Dispatch
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/50 hover:bg-white/5'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default Layout;
