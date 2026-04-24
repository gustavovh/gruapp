export type ServiceTypeId =
  | "platform"
  | "hook"
  | "tire"
  | "fuel"
  | "battery"
  | "lockout";

export interface ServiceType {
  id: ServiceTypeId;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerKm: number;
  estimatedTime: string;
}

export const SERVICE_TYPES: ServiceType[] = [
  {
    id: "platform",
    name: "Grúa plataforma",
    description: "Para autos sin tracción o accidentados",
    icon: "truck-flatbed",
    basePrice: 350,
    pricePerKm: 18,
    estimatedTime: "20-35 min",
  },
  {
    id: "hook",
    name: "Grúa de gancho",
    description: "Remolque tradicional con gancho",
    icon: "tow-truck",
    basePrice: 280,
    pricePerKm: 15,
    estimatedTime: "15-30 min",
  },
  {
    id: "tire",
    name: "Cambio de llanta",
    description: "Cambio de neumático ponchado",
    icon: "tire",
    basePrice: 180,
    pricePerKm: 8,
    estimatedTime: "10-20 min",
  },
  {
    id: "fuel",
    name: "Combustible",
    description: "Entrega de gasolina o diésel",
    icon: "gas-station",
    basePrice: 220,
    pricePerKm: 10,
    estimatedTime: "15-25 min",
  },
  {
    id: "battery",
    name: "Pasacorriente",
    description: "Batería descargada o cambio",
    icon: "car-battery",
    basePrice: 200,
    pricePerKm: 9,
    estimatedTime: "10-20 min",
  },
  {
    id: "lockout",
    name: "Cerrajería",
    description: "Llaves dentro del vehículo",
    icon: "key",
    basePrice: 250,
    pricePerKm: 10,
    estimatedTime: "15-25 min",
  },
];

export function getServiceType(id: ServiceTypeId): ServiceType {
  return SERVICE_TYPES.find((s) => s.id === id) ?? SERVICE_TYPES[0]!;
}
