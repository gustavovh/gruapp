import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@workspace/integrations';
import { Truck, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react';

mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

const PublicTracking = ({ serviceId }: { serviceId: string }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [status, setStatus] = useState('En camino');
  const [driver, setDriver] = useState({ name: 'Juan Pérez', vehicle: 'Grúa Plataforma G-01' });

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/navigation-night-v1',
        center: [-57.62, -25.29],
        zoom: 14,
      });
    }
  }, []);

  useEffect(() => {
    // Subscribe only to this service's driver
    const channel = supabase.channel(`tracking:service:${serviceId}`)
      .on('broadcast', { event: 'location-update' }, (payload) => {
        const { lat, lng, heading } = payload.payload;
        
        if (map.current) {
          if (!marker.current) {
            const el = document.createElement('div');
            el.className = 'customer-tracking-marker';
            marker.current = new mapboxgl.Marker(el)
              .setLngLat([lng, lat])
              .addTo(map.current);
          } else {
            marker.current.setLngLat([lng, lat]);
          }
          map.current.easeTo({ center: [lng, lat], duration: 1000 });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [serviceId]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm">GruaDirect Tracking</h1>
            <p className="text-[10px] text-white/50 uppercase">Seguimiento Seguro</p>
          </div>
        </div>
        <button className="p-2 bg-white/5 rounded-full">
          <Phone size={18} />
        </button>
      </div>

      {/* Map Content */}
      <div ref={mapContainer} className="flex-1 w-full" />

      {/* Status Card */}
      <div className="absolute bottom-6 left-6 right-6 bg-[#0f0f12] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-500">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">{status}</h2>
            <div className="flex items-center gap-2 text-blue-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest">En Tiempo Real</span>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
            <Truck size={24} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-white/20" />
          <div className="flex-1">
            <h4 className="font-bold">{driver.name}</h4>
            <p className="text-xs text-white/40">{driver.vehicle}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-white/30 uppercase font-bold">Llegada Est.</div>
            <div className="font-mono font-bold text-blue-500">8-12 min</div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 text-[10px] text-white/40 uppercase font-bold tracking-widest text-center">
          <div className="flex-1 py-3 bg-white/5 rounded-xl border border-white/5">Localizar Grúa</div>
          <div className="flex-1 py-3 bg-white/5 rounded-xl border border-white/5">Contactar Central</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .customer-tracking-marker {
          width: 40px;
          height: 40px;
          background-image: url('https://img.icons8.com/isometric/50/tow-truck.png');
          background-size: contain;
          background-repeat: no-repeat;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
        }
      `}} />
    </div>
  );
};

export default PublicTracking;
