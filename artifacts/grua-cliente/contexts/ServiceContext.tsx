import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getServiceType, type ServiceTypeId } from "@/constants/serviceTypes";

const HISTORY_KEY = "@gruaya/history";
const ACTIVE_KEY = "@gruaya/active-service";

export type ServiceStatus =
  | "searching"
  | "assigned"
  | "enroute"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  totalTrips: number;
  vehicle: string;
  plate: string;
  photoColor: string;
  location: LatLng;
}

export interface ServiceRequest {
  id: string;
  typeId: ServiceTypeId;
  status: ServiceStatus;
  pickup: LatLng;
  pickupAddress: string;
  destination?: LatLng;
  destinationAddress?: string;
  notes?: string;
  vehicleInfo?: string;
  estimatedPrice: number;
  finalPrice?: number;
  paymentMethod: "cash";
  driver?: Driver;
  createdAt: number;
  completedAt?: number;
  rating?: number;
}

const SAMPLE_DRIVERS: Omit<Driver, "location">[] = [
  {
    id: "drv-1",
    name: "Carlos Méndez",
    rating: 4.9,
    totalTrips: 1240,
    vehicle: "Ford F-450 Plataforma",
    plate: "GRA-823",
    photoColor: "#F59E0B",
  },
  {
    id: "drv-2",
    name: "Roberto Silva",
    rating: 4.8,
    totalTrips: 892,
    vehicle: "Chevrolet Kodiak",
    plate: "TOW-117",
    photoColor: "#10B981",
  },
  {
    id: "drv-3",
    name: "Miguel Ángel Torres",
    rating: 5.0,
    totalTrips: 2103,
    vehicle: "Isuzu NPR Plataforma",
    plate: "GRU-450",
    photoColor: "#3B82F6",
  },
  {
    id: "drv-4",
    name: "Diego Ramírez",
    rating: 4.7,
    totalTrips: 612,
    vehicle: "Hino 300 Gancho",
    plate: "ASR-209",
    photoColor: "#8B5CF6",
  },
];

interface ServiceContextValue {
  history: ServiceRequest[];
  active: ServiceRequest | null;
  loading: boolean;
  createRequest: (input: {
    typeId: ServiceTypeId;
    pickup: LatLng;
    pickupAddress: string;
    destination?: LatLng;
    destinationAddress?: string;
    notes?: string;
    vehicleInfo?: string;
    distanceKm: number;
  }) => Promise<ServiceRequest>;
  cancelActive: () => Promise<void>;
  rateService: (id: string, rating: number) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextValue | null>(null);

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function offsetLatLng(base: LatLng, meters: number, bearingDeg: number): LatLng {
  const R = 6378137;
  const bearing = (bearingDeg * Math.PI) / 180;
  const lat1 = (base.latitude * Math.PI) / 180;
  const lon1 = (base.longitude * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(meters / R) +
      Math.cos(lat1) * Math.sin(meters / R) * Math.cos(bearing),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(meters / R) * Math.cos(lat1),
      Math.cos(meters / R) - Math.sin(lat1) * Math.sin(lat2),
    );
  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (lon2 * 180) / Math.PI,
  };
}

function pickRandomDriver(pickup: LatLng): Driver {
  const base = SAMPLE_DRIVERS[Math.floor(Math.random() * SAMPLE_DRIVERS.length)]!;
  const distance = 800 + Math.random() * 1500;
  const bearing = Math.random() * 360;
  return {
    ...base,
    location: offsetLatLng(pickup, distance, bearing),
  };
}

export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<ServiceRequest[]>([]);
  const [active, setActive] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    intervalsRef.current.forEach((i) => clearInterval(i));
    timersRef.current = [];
    intervalsRef.current = [];
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [historyRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(ACTIVE_KEY),
        ]);
        if (historyRaw) setHistory(JSON.parse(historyRaw));
        if (activeRaw) {
          const parsed = JSON.parse(activeRaw) as ServiceRequest;
          if (
            parsed.status !== "completed" &&
            parsed.status !== "cancelled"
          ) {
            setActive(parsed);
          } else {
            await AsyncStorage.removeItem(ACTIVE_KEY);
          }
        }
      } catch (err) {
        console.warn("Service load failed", err);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const persistActive = useCallback(async (next: ServiceRequest | null) => {
    if (next) {
      await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(next));
    } else {
      await AsyncStorage.removeItem(ACTIVE_KEY);
    }
  }, []);

  const persistHistory = useCallback(async (next: ServiceRequest[]) => {
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, []);

  const updateActive = useCallback(
    (updater: (prev: ServiceRequest) => ServiceRequest) => {
      setActive((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        void persistActive(next);
        return next;
      });
    },
    [persistActive],
  );

  const startSimulation = useCallback(
    (req: ServiceRequest) => {
      clearTimers();

      timersRef.current.push(
        setTimeout(() => {
          const driver = pickRandomDriver(req.pickup);
          updateActive((prev) => ({ ...prev, status: "assigned", driver }));

          timersRef.current.push(
            setTimeout(() => {
              updateActive((prev) => ({ ...prev, status: "enroute" }));

              const driverInterval = setInterval(() => {
                setActive((prev) => {
                  if (!prev || !prev.driver) return prev;
                  if (prev.status !== "enroute") return prev;
                  const dx = prev.pickup.latitude - prev.driver.location.latitude;
                  const dy =
                    prev.pickup.longitude - prev.driver.location.longitude;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 0.0003) {
                    clearInterval(driverInterval);
                    const arrived: ServiceRequest = {
                      ...prev,
                      status: "arrived",
                      driver: { ...prev.driver, location: prev.pickup },
                    };
                    void persistActive(arrived);
                    timersRef.current.push(
                      setTimeout(() => {
                        updateActive((p) => ({ ...p, status: "in_progress" }));
                        timersRef.current.push(
                          setTimeout(() => {
                            setActive((p) => {
                              if (!p) return p;
                              const completed: ServiceRequest = {
                                ...p,
                                status: "completed",
                                completedAt: Date.now(),
                                finalPrice: p.estimatedPrice,
                              };
                              void persistActive(completed);
                              return completed;
                            });
                          }, 8000),
                        );
                      }, 4500),
                    );
                    return arrived;
                  }
                  const next: ServiceRequest = {
                    ...prev,
                    driver: {
                      ...prev.driver,
                      location: {
                        latitude:
                          prev.driver.location.latitude + dx * 0.18,
                        longitude:
                          prev.driver.location.longitude + dy * 0.18,
                      },
                    },
                  };
                  void persistActive(next);
                  return next;
                });
              }, 1100);
              intervalsRef.current.push(driverInterval);
            }, 2500),
          );
        }, 2800),
      );
    },
    [clearTimers, updateActive, persistActive],
  );

  // Resume simulation if there was an active service from storage
  useEffect(() => {
    if (!loading && active && active.status === "searching") {
      startSimulation(active);
    }
  }, [loading, active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const createRequest = useCallback<ServiceContextValue["createRequest"]>(
    async (input) => {
      const type = getServiceType(input.typeId);
      const estimatedPrice = Math.round(
        type.basePrice + type.pricePerKm * input.distanceKm,
      );
      const req: ServiceRequest = {
        id: makeId(),
        typeId: input.typeId,
        status: "searching",
        pickup: input.pickup,
        pickupAddress: input.pickupAddress,
        destination: input.destination,
        destinationAddress: input.destinationAddress,
        notes: input.notes,
        vehicleInfo: input.vehicleInfo,
        estimatedPrice,
        paymentMethod: "cash",
        createdAt: Date.now(),
      };
      setActive(req);
      await persistActive(req);
      startSimulation(req);
      return req;
    },
    [persistActive, startSimulation],
  );

  const cancelActive = useCallback(async () => {
    clearTimers();
    setActive((prev) => {
      if (!prev) return prev;
      const cancelled: ServiceRequest = {
        ...prev,
        status: "cancelled",
        completedAt: Date.now(),
      };
      setHistory((h) => {
        const next = [cancelled, ...h];
        void persistHistory(next);
        return next;
      });
      void persistActive(null);
      return null;
    });
  }, [clearTimers, persistActive, persistHistory]);

  // Move completed services into history
  useEffect(() => {
    if (active && active.status === "completed") {
      setHistory((h) => {
        const next = [active, ...h];
        void persistHistory(next);
        return next;
      });
    }
  }, [active?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const rateService = useCallback(
    async (id: string, rating: number) => {
      setHistory((h) => {
        const next = h.map((r) => (r.id === id ? { ...r, rating } : r));
        void persistHistory(next);
        return next;
      });
      if (active?.id === id) {
        updateActive((prev) => ({ ...prev, rating }));
        // dismiss completed active after rating
        setTimeout(() => {
          setActive(null);
          void persistActive(null);
        }, 200);
      }
    },
    [active?.id, persistHistory, updateActive, persistActive],
  );

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  const value = useMemo<ServiceContextValue>(
    () => ({
      history,
      active,
      loading,
      createRequest,
      cancelActive,
      rateService,
      clearHistory,
    }),
    [
      history,
      active,
      loading,
      createRequest,
      cancelActive,
      rateService,
      clearHistory,
    ],
  );

  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
}

export function useService() {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error("useService must be used within ServiceProvider");
  return ctx;
}

export function statusLabel(status: ServiceStatus): string {
  switch (status) {
    case "searching":
      return "Buscando conductor";
    case "assigned":
      return "Conductor asignado";
    case "enroute":
      return "En camino";
    case "arrived":
      return "Conductor en sitio";
    case "in_progress":
      return "Servicio en curso";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
  }
}
