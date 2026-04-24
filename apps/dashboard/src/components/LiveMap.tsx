import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@workspace/integrations/supabase';

// Mapbox Token Placeholder - User should update this
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';

interface DriverPoint {
  driverId: number;
  fullName: string;
  lat: number;
  lng: number;
  status: 'available' | 'busy' | 'offline';
  heading: number;
}

const LiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<{ [key: number]: mapboxgl.Marker }>({});
  const [drivers, setDrivers] = useState<{ [key: number]: DriverPoint }>({});

  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-57.62, -25.29], // Center in Asunción, Paraguay
        zoom: 12,
        pitch: 45
      });
    }
  }, []);

  useEffect(() => {
    // 1. Subscribe to Real-time updates from all drivers
    const channel = supabase.channel('fleet-tracking')
      .on('broadcast', { event: 'location-update' }, (payload) => {
        const { driverId, lat, lng, heading, status } = payload.payload;
        
        // Update local state and map markers
        updateDriverMarker(driverId, lat, lng, heading, status);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateDriverMarker = (id: number, lat: number, lng: number, heading: number, status: string) => {
    if (!map.current) return;

    // Create marker if it doesn't exist
    if (!markers.current[id]) {
      const el = document.createElement('div');
      el.className = 'driver-marker';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>Driver ${id}</h3><p>Status: ${status}</p>`))
        .addTo(map.current);
      
      markers.current[id] = marker;
    } else {
      // Update existing marker
      markers.current[id].setLngLat([lng, lat]);
      
      // Update rotation based on heading
      const el = markers.current[id].getElement();
      el.style.transform = `${el.style.transform} rotate(${heading || 0}deg)`;
      
      // Update color based on status
      el.style.backgroundColor = status === 'available' ? '#10b981' : (status === 'busy' ? '#3b82f6' : '#64748b');
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Fleet Status</h4>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>On Service (Busy)</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-slate-500" />
          <span>Offline</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .driver-marker {
          width: 32px;
          height: 32px;
          background-image: url('https://img.icons8.com/isometric/50/tow-truck.png');
          background-size: contain;
          background-repeat: no-repeat;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transition: all 0.5s ease-out;
        }
      `}} />
    </div>
  );
};

export default LiveMap;
