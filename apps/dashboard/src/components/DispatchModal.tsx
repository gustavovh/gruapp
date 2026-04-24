import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Truck, User, Calculator, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface Driver {
  id: number;
  fullName: string;
}

interface PricingEstimate {
  baseFee: number;
  pricePerKm: number;
  distanceKm: number;
  maneuverExtras: number;
  netAmount: number;
  ivaAmount: number;
  totalAmount: number;
}

const DispatchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    originAddress: '',
    destinationAddress: '',
    vehicleType: 'light',
    driverId: '',
    maneuverExtras: 0,
    totalDistance: 0,
  });
  const [estimate, setEstimate] = useState<PricingEstimate | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      axios.get('http://localhost:3000/api/drivers').then(res => setDrivers(res.data));
    }
  }, [isOpen]);

  const handleEstimate = async () => {
    setLoading(true);
    try {
      // Mocked distance for now, normally from Mapbox
      const mockDistance = 12.5; 
      const res = await axios.post('http://localhost:3000/api/pricing/estimate', {
        vehicleType: formData.vehicleType,
        distanceKm: mockDistance,
        maneuverExtras: Number(formData.maneuverExtras)
      });
      setEstimate(res.data);
      setFormData({ ...formData, totalDistance: mockDistance });
      setStep(2);
    } catch (err) {
      alert("Error calculating price");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:3000/api/services', {
        ...formData,
        driverId: Number(formData.driverId),
        originLat: -25.2867, // Mocked
        originLng: -57.6470,
        destLat: -25.3200,
        destLng: -57.5800,
        status: 'pending'
      });
      alert("Service dispatched successfully!");
      onClose();
    } catch (err) {
      alert("Error dispatching service");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0f0f12] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold">New Service Dispatch</h2>
            <p className="text-sm text-white/40">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Customer Name</label>
                  <input 
                    type="text" 
                    value={formData.customerName}
                    onChange={e => setFormData({...formData, customerName: e.target.value})}
                    placeholder="e.g. Elena Mendoza"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.customerPhone}
                    onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                    placeholder="+595 9xx..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.originAddress}
                    onChange={e => setFormData({...formData, originAddress: e.target.value})}
                    placeholder="Pickup Address (Origin)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
                <div className="relative">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  <input 
                    type="text" 
                    value={formData.destinationAddress}
                    onChange={e => setFormData({...formData, destinationAddress: e.target.value})}
                    placeholder="Drop-off Address (Destination)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Truck Type</label>
                  <select 
                    value={formData.vehicleType}
                    onChange={e => setFormData({...formData, vehicleType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all appearance-none"
                  >
                    <option value="light">Light Duty</option>
                    <option value="flatbed">Flatbed</option>
                    <option value="heavy">Heavy Duty</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Maneuver Extras (PYG)</label>
                  <input 
                    type="number" 
                    value={formData.maneuverExtras}
                    onChange={e => setFormData({...formData, maneuverExtras: Number(e.target.value)})}
                    placeholder="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-blue-500/50 outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleEstimate}
                disabled={loading || !formData.customerName || !formData.originAddress}
                className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                  <>
                    <Calculator size={20} />
                    Calculate Price & Proceed
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right duration-300">
              {/* Quote Recap */}
              <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm text-blue-400 font-medium">Service Quote</span>
                  <span className="text-xs text-white/30">{formData.totalDistance} KM estimated</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Base Fee:</span>
                    <span>{estimate?.baseFee.toLocaleString()} PYG</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Travel ({formData.totalDistance}km):</span>
                    <span>{(estimate && estimate.netAmount - estimate.baseFee - estimate.maneuverExtras).toLocaleString()} PYG</span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2">
                    <span className="text-white/60 font-bold text-lg">Total + IVA (10%):</span>
                    <span className="text-2xl font-bold text-white">{estimate?.totalAmount.toLocaleString()} PYG</span>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Assign Driver</label>
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <select 
                        value={formData.driverId}
                        onChange={e => setFormData({...formData, driverId: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 focus:border-blue-500/50 outline-none transition-all appearance-none"
                      >
                        <option value="">Select a driver...</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.fullName}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={loading || !formData.driverId}
                  className="flex-[2] bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                    <>
                      <ChevronRight size={20} />
                      Confirm & Dispatch Units
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchModal;
