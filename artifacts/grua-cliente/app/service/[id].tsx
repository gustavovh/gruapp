import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DriverCard } from "@/components/DriverCard";
import { MapPreview } from "@/components/MapPreview";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getServiceType } from "@/constants/serviceTypes";
import {
  statusLabel,
  useService,
  type ServiceRequest,
  type ServiceStatus,
} from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

const STATUS_FLOW: ServiceStatus[] = [
  "searching",
  "assigned",
  "enroute",
  "arrived",
  "in_progress",
  "completed",
];

export default function ServiceDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { active, history, cancelActive, rateService } = useService();

  const request: ServiceRequest | undefined =
    active?.id === params.id
      ? active
      : history.find((h) => h.id === params.id);

  const [pulse] = useState(new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (!request) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color={colors.mutedForeground}
        />
        <Text style={[styles.emptyText, { color: colors.foreground }]}>
          No encontramos este servicio
        </Text>
        <PrimaryButton
          label="Volver al inicio"
          onPress={() => router.replace("/(tabs)")}
          fullWidth={false}
        />
      </View>
    );
  }

  const type = getServiceType(request.typeId);
  const isFinished =
    request.status === "completed" || request.status === "cancelled";

  const handleCancel = () => {
    Alert.alert(
      "Cancelar servicio",
      "¿Estás seguro de cancelar tu solicitud?",
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              void Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              );
            }
            await cancelActive();
            router.replace("/(tabs)");
          },
        },
      ],
    );
  };

  const handleRate = async (stars: number) => {
    if (Platform.OS !== "web") {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await rateService(request.id, stars);
    setTimeout(() => router.replace("/(tabs)"), 250);
  };

  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Map */}
      <View style={styles.mapWrap}>
        <MapPreview
          center={request.pickup}
          markers={[
            {
              id: "pickup",
              coordinate: request.pickup,
              color: colors.primary,
              icon: "crosshairs-gps",
            },
            ...(request.driver
              ? [
                  {
                    id: "driver",
                    coordinate: request.driver.location,
                    color: colors.foreground,
                    icon: "tow-truck" as const,
                  },
                ]
              : []),
          ]}
          showRoute={
            !!request.driver &&
            (request.status === "enroute" || request.status === "assigned")
          }
          routeFrom={request.driver?.location}
          routeTo={request.pickup}
          interactive={false}
          style={StyleSheet.absoluteFill}
        />
        {request.status === "searching" ? (
          <View style={styles.searchingOverlay} pointerEvents="none">
            <Animated.View
              style={[
                styles.pulse,
                {
                  backgroundColor: colors.primary + "44",
                  transform: [
                    {
                      scale: pulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 2.4],
                      }),
                    },
                  ],
                  opacity: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            />
          </View>
        ) : null}
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderTopLeftRadius: colors.radius * 1.5,
            borderTopRightRadius: colors.radius * 1.5,
            paddingBottom: insets.bottom + webBottomInset + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.handle} />

        <View style={styles.statusRow}>
          <StatusBadge status={request.status} />
          <Text style={[styles.timestamp, { color: colors.mutedForeground }]}>
            {new Date(request.createdAt).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        <Text style={[styles.statusTitle, { color: colors.foreground }]}>
          {statusMessage(request.status)}
        </Text>
        <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
          {statusSub(request.status, type.name)}
        </Text>

        {/* Progress steps */}
        {!isFinished ? <ProgressBar status={request.status} /> : null}

        {/* Driver card */}
        {request.driver ? (
          <View style={{ marginTop: 20 }}>
            <DriverCard driver={request.driver} />
          </View>
        ) : null}

        {/* Trip details */}
        <View
          style={[
            styles.details,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <DetailRow
            icon="tow-truck"
            label="Servicio"
            value={type.name}
          />
          <Divider />
          <DetailRow
            icon="map-marker"
            label="Origen"
            value={request.pickupAddress}
          />
          {request.vehicleInfo ? (
            <>
              <Divider />
              <DetailRow
                icon="car"
                label="Vehículo"
                value={request.vehicleInfo}
              />
            </>
          ) : null}
          {request.notes ? (
            <>
              <Divider />
              <DetailRow
                icon="note-text-outline"
                label="Notas"
                value={request.notes}
              />
            </>
          ) : null}
          <Divider />
          <DetailRow
            icon="cash"
            label="Pago"
            value={`$${request.finalPrice ?? request.estimatedPrice} MXN · Efectivo`}
            highlight
          />
        </View>

        {/* Actions */}
        {request.status === "completed" ? (
          <RateBlock
            currentRating={request.rating}
            onRate={handleRate}
          />
        ) : null}

        {request.status !== "completed" &&
        request.status !== "cancelled" &&
        request.status !== "in_progress" ? (
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Cancelar servicio"
              onPress={handleCancel}
              variant="ghost"
            />
          </View>
        ) : null}

        {request.status === "cancelled" ? (
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Volver al inicio"
              onPress={() => router.replace("/(tabs)")}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function statusMessage(status: ServiceStatus): string {
  switch (status) {
    case "searching":
      return "Buscando un conductor cerca de ti...";
    case "assigned":
      return "Conductor asignado";
    case "enroute":
      return "Tu conductor va en camino";
    case "arrived":
      return "Tu conductor llegó";
    case "in_progress":
      return "Servicio en curso";
    case "completed":
      return "Servicio completado";
    case "cancelled":
      return "Servicio cancelado";
  }
}

function statusSub(status: ServiceStatus, typeName: string): string {
  switch (status) {
    case "searching":
      return "Estamos contactando al conductor más cercano para tu servicio.";
    case "assigned":
      return `${typeName}. Saliendo en camino hacia tu ubicación.`;
    case "enroute":
      return "Llega aproximadamente en 6 minutos. Recíbelo cuando llegue.";
    case "arrived":
      return "Acércate al conductor y verifica los datos del vehículo.";
    case "in_progress":
      return "Estamos atendiendo tu vehículo. Mantén la calma.";
    case "completed":
      return "Gracias por usar GruaYa. ¿Cómo estuvo tu experiencia?";
    case "cancelled":
      return "El servicio fue cancelado. Puedes solicitar uno nuevo cuando quieras.";
  }
}

function ProgressBar({ status }: { status: ServiceStatus }) {
  const colors = useColors();
  const currentIndex = STATUS_FLOW.indexOf(status);
  return (
    <View style={styles.progress}>
      {STATUS_FLOW.slice(0, 5).map((s, idx) => {
        const reached = idx <= currentIndex;
        return (
          <React.Fragment key={s}>
            <View style={styles.stepWrap}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: reached
                      ? colors.primary
                      : colors.muted,
                  },
                ]}
              >
                {reached ? (
                  <Ionicons name="checkmark" size={12} color="#0F172A" />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color: reached
                      ? colors.foreground
                      : colors.mutedForeground,
                    fontFamily: reached
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                {shortLabel(s)}
              </Text>
            </View>
            {idx < 4 ? (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      idx < currentIndex ? colors.primary : colors.muted,
                  },
                ]}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}

function shortLabel(status: ServiceStatus): string {
  switch (status) {
    case "searching":
      return "Buscando";
    case "assigned":
      return "Asignado";
    case "enroute":
      return "En camino";
    case "arrived":
      return "Llegó";
    case "in_progress":
      return "En curso";
    default:
      return statusLabel(status);
  }
}

function DetailRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={styles.detailRow}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={highlight ? colors.primaryDark : colors.mutedForeground}
      />
      <View style={{ flex: 1 }}>
        <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>
          {label}
        </Text>
        <Text
          style={[
            styles.detailValue,
            {
              color: colors.foreground,
              fontFamily: highlight ? "Inter_700Bold" : "Inter_500Medium",
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  const colors = useColors();
  return (
    <View style={[styles.divider, { backgroundColor: colors.border }]} />
  );
}

function RateBlock({
  currentRating,
  onRate,
}: {
  currentRating?: number;
  onRate: (n: number) => void;
}) {
  const colors = useColors();
  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
  return (
    <View
      style={[
        styles.rateCard,
        {
          backgroundColor: colors.accent,
          borderRadius: colors.radius,
        },
      ]}
    >
      <Text style={[styles.rateTitle, { color: colors.foreground }]}>
        Califica a tu conductor
      </Text>
      <Text style={[styles.rateSub, { color: colors.foreground + "AA" }]}>
        Tu opinión nos ayuda a mejorar el servicio.
      </Text>
      <View style={styles.starsRow}>
        {stars.map((n) => (
          <Pressable
            key={n}
            onPress={() => onRate(n)}
            hitSlop={6}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.92 : 1 }],
            })}
          >
            <MaterialCommunityIcons
              name={
                currentRating && n <= currentRating ? "star" : "star-outline"
              }
              size={36}
              color={colors.primaryDark}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  mapWrap: {
    height: 280,
    backgroundColor: "#E8EEF4",
  },
  searchingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  sheet: {
    paddingTop: 12,
    paddingHorizontal: 20,
    marginTop: -28,
    minHeight: 400,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timestamp: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  statusTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 12,
    lineHeight: 28,
  },
  statusSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  progress: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 20,
  },
  stepWrap: {
    alignItems: "center",
    width: 60,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 12,
    marginHorizontal: -8,
  },
  details: {
    marginTop: 20,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  rateCard: {
    marginTop: 20,
    padding: 20,
    alignItems: "center",
    gap: 4,
  },
  rateTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  rateSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    gap: 6,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  emptyText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
});
