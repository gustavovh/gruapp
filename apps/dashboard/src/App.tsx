import React, { useState } from 'react';
import Layout from './components/Layout';
import DispatchModal from './components/DispatchModal';
import LiveMap from './components/LiveMap';
import HistoryView from './components/HistoryView';
import { Truck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

function App() {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  return (
    <Layout onNewDispatch={() => setIsDispatchModalOpen(true)}>
      <div className="space-y-8 animate-in fade-in duration-700">
        <DispatchModal 
          isOpen={isDispatchModalOpen} 
          onClose={() => setIsDispatchModalOpen(false)} 
        />
        <header>
          <h2 className="text-3xl font-bold">Fleet Overview</h2>
          <p className="text-white/50">Real-time monitoring of towing operations</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Units" 
            value="24" 
            icon={<Truck size={24} className="text-blue-500" />} 

        {currentTab === 'overview' ? (
          <>
            <header>
              <h2 className="text-3xl font-bold">Resumen de Flota</h2>
              <p className="text-white/50">Monitoreo en tiempo real de operaciones de grúas</p>
            </header>

            {/* Metrics Bar */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Servicios Activos</div>
                <div className="text-3xl font-bold">12</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Flota Total</div>
                <div className="text-3xl font-bold text-blue-500">24</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Grúas Libres</div>
                <div className="text-3xl font-bold text-green-500">8</div>
              </div>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                <div className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Alertas</div>
                <div className="text-3xl font-bold text-red-500">2</div>
              </div>
            </div>

            {/* Live Tracking Map */}
            <LiveMap />
          </>
        ) : currentTab === 'history' ? (
          <HistoryView />
        ) : (
          <div className="flex items-center justify-center h-64 text-white/30 italic">
            Módulo en desarrollo...
          </div>
        )}

        {/* Services Monitoring Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="flex-1 space-y-4">
              <ActivityItem 
                user="Juan Perez (G-01)" 
                action="Accepted job" 
                target="Audi A4 - Downtown" 
                time="2m ago" 
              />
              <ActivityItem 
                user="System" 
                action="Auto-assigned" 
                target="Toyota Corolla - Highway" 
                time="5m ago" 
              />
              <ActivityItem 
                user="Carlos Ruiz (G-04)" 
                action="Completed service" 
                target="BMW X5 - North Side" 
                time="12m ago" 
              />
              <ActivityItem 
                user="Maria Gomez" 
                action="Registered new truck" 
                target="Merc-Benz Atego" 
                time="45m ago" 
              />
            </div>
            <button className="w-full mt-6 text-sm text-blue-500 hover:text-blue-400 font-medium py-2 border border-blue-500/20 rounded-lg transition-colors">
              View All Logs
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

const StatCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-[#0a0a0a] rounded-xl border border-white/5 shadow-inner">
        {icon}
      </div>
      <div className="text-xs text-white/40">Real-time</div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
    </div>
    <p className="mt-4 text-xs text-white/30 border-t border-white/5 pt-4">{trend}</p>
  </div>
);

const ActivityItem = ({ user, action, target, time }: { user: string, action: string, target: string, time: string }) => (
  <div className="flex items-start gap-3 py-1 border-l-2 border-blue-500/20 pl-4">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium">{user}</p>
      <p className="text-xs text-white/60">{action} <span className="text-blue-400 font-medium">{target}</span></p>
      <p className="text-[10px] text-white/30 mt-1">{time}</p>
    </div>
  </div>
);

const MapMarker = ({ x, y, label, status }: { x: string, y: string, label: string, status: 'active' | 'idle' | 'maintenance' }) => {
  const color = status === 'active' ? 'bg-blue-500' : status === 'idle' ? 'bg-green-500' : 'bg-red-500';
  return (
    <div className="absolute group/marker" style={{ left: x, top: y }}>
      <div className={`w-4 h-4 ${color} rounded-full border-2 border-[#0a0a0a] shadow-lg animate-pulse`} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0a0a0a] border border-white/10 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover/marker:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </div>
    </div>
  );
};

export default App;
