import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MapPreview } from "@/components/MapPreview";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useService, type LatLng } from "@/contexts/ServiceContext";
import { getServiceType } from "@/constants/serviceTypes";
import { useColors } from "@/hooks/useColors";

const FALLBACK_LOCATION: LatLng = {
  latitude: 19.4326,
  longitude: -99.1332, // Mexico City center
};

const QUICK_ACTIONS = [
  { id: "platform" as const, label: "Grúa", icon: "tow-truck" as const },
  { id: "tire" as const, label: "Llanta", icon: "tire" as const },
  { id: "battery" as const, label: "Batería", icon: "car-battery" as const },
  { id: "fuel" as const, label: "Gasolina", icon: "gas-station" as const },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { active } = useService();

  const [location, setLocation] = useState<LatLng>(FALLBACK_LOCATION);
  const [address, setAddress] = useState<string>("Obteniendo ubicación...");
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (Platform.OS === "web") {
          // Use browser geolocation if available
          if (
            typeof navigator !== "undefined" &&
            navigator.geolocation
          ) {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                if (cancelled) return;
                setLocation({
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                });
                setAddress("Tu ubicación actual");
                setLocationLoading(false);
              },
              () => {
                if (cancelled) return;
                setAddress("Ciudad de México, CDMX");
                setLocationLoading(false);
              },
              { timeout: 5000 },
            );
          } else {
            setAddress("Ciudad de México, CDMX");
            setLocationLoading(false);
          }
          return;
        }

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (cancelled) return;
          setAddress("Ciudad de México, CDMX");
          setLocationLoading(false);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;
        const next: LatLng = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setLocation(next);

        try {
          const places = await Location.reverseGeocodeAsync(next);
          const place = places[0];
          if (place) {
            const parts = [
              place.street,
              place.streetNumber,
              place.city ?? place.subregion,
            ].filter(Boolean);
            setAddress(parts.join(" ") || "Tu ubicación actual");
          } else {
            setAddress("Tu ubicación actual");
          }
        } catch {
          setAddress("Tu ubicación actual");
        }
      } catch {
        if (cancelled) return;
        setAddress("Ciudad de México, CDMX");
      } finally {
        if (!cancelled) setLocationLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  })();

  const firstName = user?.name.split(" ")[0] ?? "";

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 84 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 16,
          paddingBottom: insets.bottom + webBottomInset + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              {greeting}
            </Text>
            <Text style={[styles.name, { color: colors.foreground }]}>
              {firstName || "Bienvenido"}
            </Text>
          </View>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {(firstName[0] ?? "U").toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Active service callout */}
        {active ? (
          <Pressable
            onPress={() => router.push(`/service/${active.id}`)}
            style={({ pressed }) => [
              styles.activeCard,
              {
                backgroundColor: colors.foreground,
                borderRadius: colors.radius,
                opacity: pressed ? 0.95 : 1,
              },
            ]}
          >
            <View style={styles.activeRow}>
              <View
                style={[
                  styles.activeIcon,
                  { backgroundColor: colors.primary },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    getServiceType(active.typeId)
                      .icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color="#0F172A"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.activeTitle}>Servicio en curso</Text>
                <Text style={styles.activeSubtitle}>
                  {getServiceType(active.typeId).name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </View>
            <View style={styles.activeFooter}>
              <StatusBadge status={active.status} />
              <Text style={styles.activePrice}>
                ${active.estimatedPrice} MXN
              </Text>
            </View>
          </Pressable>
        ) : null}

        {/* Map preview */}
        <View style={styles.mapWrap}>
          <MapPreview
            center={location}
            interactive={false}
            markers={[
              {
                id: "me",
                coordinate: location,
                color: colors.primary,
                icon: "crosshairs-gps",
              },
            ]}
            style={[
              styles.map,
              { borderRadius: colors.radius * 1.25 },
            ]}
          />
          <View
            style={[
              styles.locationCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.locationDot,
                { backgroundColor: colors.primary },
              ]}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.locationLabel, { color: colors.mutedForeground }]}
              >
                Tu ubicación
              </Text>
              <Text
                style={[styles.locationText, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {locationLoading ? "Detectando..." : address}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            ¿Qué necesitas hoy?
          </Text>
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable
                key={action.id}
                onPress={() =>
                  router.push({
                    pathname: "/service/select-type",
                    params: {
                      preselect: action.id,
                      lat: String(location.latitude),
                      lng: String(location.longitude),
                      address,
                    },
                  })
                }
                disabled={!!active}
                style={({ pressed }) => [
                  styles.quickItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderRadius: colors.radius,
                    opacity: active ? 0.5 : pressed ? 0.9 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.quickIcon,
                    { backgroundColor: colors.accent, borderRadius: 12 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={action.icon}
                    size={22}
                    color={colors.primaryDark}
                  />
                </View>
                <Text
                  style={[styles.quickLabel, { color: colors.foreground }]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Main CTA */}
        <View style={styles.cta}>
          <PrimaryButton
            label={active ? "Ver servicio activo" : "Solicitar servicio"}
            onPress={() => {
              if (active) {
                router.push(`/service/${active.id}`);
              } else {
                router.push({
                  pathname: "/service/select-type",
                  params: {
                    lat: String(location.latitude),
                    lng: String(location.longitude),
                    address,
                  },
                });
              }
            }}
            icon={
              <MaterialCommunityIcons
                name={active ? "navigation-variant" : "tow-truck"}
                size={20}
                color={colors.primaryForeground}
              />
            }
          />
        </View>

        {/* Info banner */}
        <View
          style={[
            styles.infoBanner,
            {
              backgroundColor: colors.accent,
              borderRadius: colors.radius,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="shield-check"
            size={22}
            color={colors.primaryDark}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.bannerTitle, { color: colors.primaryDark }]}
            >
              Servicio 24/7
            </Text>
            <Text
              style={[styles.bannerText, { color: colors.foreground }]}
            >
              Conductores certificados disponibles toda la noche.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  greeting: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0F172A",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  activeCard: {
    marginHorizontal: 24,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  activeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTitle: {
    color: "#94A3B8",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeSubtitle: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    marginTop: 2,
  },
  activeFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activePrice: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  mapWrap: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  map: {
    height: 220,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: -32,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickItem: {
    width: "47%",
    flexGrow: 1,
    padding: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quickIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  cta: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoBanner: {
    marginHorizontal: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bannerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  bannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
});
