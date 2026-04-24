import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, DollarSign, Download, Filter } from 'lucide-react';

interface CompletedService {
  id: number;
  customerName: string;
  totalAmount: number;
  driverName: string;
  createdAt: string;
  vehicleType: string;
}

const HistoryView = () => {
  const [services, setServices] = useState<CompletedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDriver, setFilterDriver] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // In a real app we'd fetch with filters
    axios.get(`${API_URL}/api/services`).then(res => {
      // Mocked cleanup/sorting for "Completed" services
      setServices(res.data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = services.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold">Historial de Servicios</h2>
          <p className="text-white/50">Resumen de operaciones y recaudación</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10 transition-all">
            <Download size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <DollarSign size={32} className="text-white" />
          </div>
          <div>
            <div className="text-blue-400 text-sm font-bold uppercase tracking-widest mb-1">Total Facturado (Hoy)</div>
            <div className="text-4xl font-bold">{totalRevenue.toLocaleString()} <span className="text-lg font-normal opacity-50">Gs.</span></div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white/40 text-xs font-medium mb-1">Servicios Liquidados</div>
          <div className="text-2xl font-bold">{services.length}</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex-1 relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por chofer..."
            className="w-full bg-transparent pl-12 pr-4 py-2 outline-none"
            onChange={(e) => setFilterDriver(e.target.value)}
          />
        </div>
        <div className="flex-1 relative border-l border-white/10 pl-4">
          <Calendar className="absolute left-8 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="date" 
            className="w-full bg-transparent pl-12 pr-4 py-2 outline-none [color-scheme:dark]"
          />
        </div>
        <button className="bg-white/10 hover:bg-white/20 p-2 px-4 rounded-xl transition-all">
          <Filter size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-white/50 text-xs uppercase tracking-widest">
              <th className="p-6 font-bold">Servicio</th>
              <th className="p-6 font-bold">Cliente</th>
              <th className="p-6 font-bold">Chofer</th>
              <th className="p-6 font-bold">Tipo</th>
              <th className="p-6 font-bold">Fecha</th>
              <th className="p-6 font-bold text-right">Total (Gs.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map(service => (
              <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-6">
                  <span className="text-blue-500 font-mono font-bold">#{service.id}</span>
                </td>
                <td className="p-6 font-medium">{service.customerName}</td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10" />
                    <span>Driver {service.driverName || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-tight">
                    {service.vehicleType || 'Ligero'}
                  </span>
                </td>
                <td className="p-6 text-white/50 text-sm">
                  {new Date(service.createdAt).toLocaleDateString('es-PY')}
                </td>
                <td className="p-6 text-right font-bold text-green-500">
                  {service.totalAmount?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryView;
