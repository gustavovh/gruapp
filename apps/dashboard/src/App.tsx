import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DispatchModal from './components/DispatchModal';
import LiveMap from './components/LiveMap';
import HistoryView from './components/HistoryView';
import { Truck, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

function App() {
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');

  // Fallback if env vars are missing
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    return (
      <div className="h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error de Configuración</h1>
        <p className="opacity-50 max-w-md">
          Faltan las variables de entorno en Vercel (VITE_SUPABASE_URL). 
          Por favor, configúralas en el panel de Vercel y haz un "Redeploy".
        </p>
      </div>
    );
  }

  return (
    <Layout 
      onNewDispatch={() => setIsDispatchModalOpen(true)}
      currentTab={currentTab}
      onTabChange={setCurrentTab}
    >
      <div className="space-y-8 animate-in fade-in duration-700">
        <DispatchModal 
          isOpen={isDispatchModalOpen} 
          onClose={() => setIsDispatchModalOpen(false)} 
        />

        {currentTab === 'overview' ? (
          <>
            <header>
              <h2 className="text-3xl font-bold text-white">Resumen de Flota</h2>
              <p className="text-white/50">Monitoreo en tiempo real de operaciones de grúas</p>
            </header>

            {/* Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Servicios Activos" 
                value="12" 
                icon={<Clock size={24} className="text-yellow-500" />} 
              />
              <StatCard 
                title="Flota Total" 
                value="24" 
                icon={<Truck size={24} className="text-blue-500" />} 
              />
              <StatCard 
                title="Grúas Libres" 
                value="8" 
                icon={<CheckCircle2 size={24} className="text-green-500" />} 
              />
              <StatCard 
                title="Alertas" 
                value="2" 
                icon={<AlertCircle size={24} className="text-red-500" />} 
              />
            </div>

            {/* Live Tracking Map */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-[600px] backdrop-blur-sm shadow-2xl">
              <LiveMap />
            </div>
          </>
        ) : currentTab === 'history' ? (
          <HistoryView />
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px] text-white/30 italic gap-4">
             <div className="p-4 bg-white/5 rounded-full">
                <Truck size={48} className="animate-pulse" />
             </div>
             <span>Módulo "{currentTab}" en desarrollo...</span>
          </div>
        )}
      </div>
    </Layout>
  );
}

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm hover:bg-white/10 transition-colors group">
    <div className="flex justify-between items-start mb-4">
      <div className="text-white/40 text-xs font-bold uppercase tracking-widest">{title}</div>
      <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
  </div>
);

export default App;
