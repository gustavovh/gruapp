import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ServiceTypeCard } from "@/components/ServiceTypeCard";
import {
  SERVICE_TYPES,
  getServiceType,
  type ServiceTypeId,
} from "@/constants/serviceTypes";
import { useService, type LatLng } from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

export default function SelectTypeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    preselect?: string;
    lat?: string;
    lng?: string;
    address?: string;
  }>();
  const { createRequest } = useService();

  const initialId = (params.preselect ??
    SERVICE_TYPES[0]!.id) as ServiceTypeId;
  const [selected, setSelected] = useState<ServiceTypeId>(initialId);
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pickup: LatLng = useMemo(
    () => ({
      latitude: params.lat ? parseFloat(params.lat) : 19.4326,
      longitude: params.lng ? parseFloat(params.lng) : -99.1332,
    }),
    [params.lat, params.lng],
  );
  const pickupAddress = params.address ?? "Tu ubicación actual";

  const distanceKm = 4.5; // simulated
  const selectedType = getServiceType(selected);
  const estimated = Math.round(
    selectedType.basePrice + selectedType.pricePerKm * distanceKm,
  );

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const req = await createRequest({
        typeId: selected,
        pickup,
        pickupAddress,
        vehicleInfo,
        notes,
        distanceKm,
      });
      router.replace(`/service/${req.id}`);
    } catch {
      Alert.alert("Error", "No pudimos crear tu solicitud. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingBottom: insets.bottom + webBottomInset + 200,
        }}
        bottomOffset={20}
      >
        {/* Pickup address */}
        <View style={styles.pickupSection}>
          <View
            style={[
              styles.pickupCard,
              {
                backgroundColor: colors.foreground,
                borderRadius: colors.radius,
              },
            ]}
          >
            <View
              style={[
                styles.pickupIcon,
                { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons name="location" size={18} color="#0F172A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pickupLabel}>Origen del servicio</Text>
              <Text style={styles.pickupText} numberOfLines={2}>
                {pickupAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* Service type selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Selecciona el servicio
          </Text>
          <Text
            style={[styles.sectionSub, { color: colors.mutedForeground }]}
          >
            Elige el tipo de asistencia que necesitas.
          </Text>
          <View style={styles.list}>
            {SERVICE_TYPES.map((s) => (
              <ServiceTypeCard
                key={s.id}
                service={s}
                selected={selected === s.id}
                onSelect={setSelected}
              />
            ))}
          </View>
        </View>

        {/* Vehicle info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Detalles
          </Text>

          <View
            style={[
              styles.input,
              {
                backgroundColor: colors.muted,
                borderRadius: colors.radius,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="car-info"
              size={20}
              color={colors.mutedForeground}
            />
            <TextInput
              value={vehicleInfo}
              onChangeText={setVehicleInfo}
              placeholder="Marca, modelo y placa"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.inputText, { color: colors.foreground }]}
            />
          </View>

          <View
            style={[
              styles.input,
              styles.inputMulti,
              {
                backgroundColor: colors.muted,
                borderRadius: colors.radius,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="note-text-outline"
              size={20}
              color={colors.mutedForeground}
            />
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Notas para el conductor (opcional)"
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={3}
              style={[
                styles.inputText,
                { color: colors.foreground, minHeight: 60 },
              ]}
              textAlignVertical="top"
            />
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      {/* Bottom summary */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + webBottomInset + 16,
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              Costo estimado · Pago en efectivo
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.price, { color: colors.foreground }]}>
                ${estimated}
              </Text>
              <Text style={[styles.currency, { color: colors.mutedForeground }]}>
                MXN
              </Text>
              <View
                style={[
                  styles.cashChip,
                  { backgroundColor: colors.success + "22" },
                ]}
              >
                <Ionicons name="cash" size={12} color={colors.success} />
                <Text style={[styles.cashText, { color: colors.success }]}>
                  Efectivo
                </Text>
              </View>
            </View>
          </View>
        </View>
        <PrimaryButton
          label="Confirmar solicitud"
          onPress={handleConfirm}
          loading={submitting}
          icon={
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={colors.primaryForeground}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pickupSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pickupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  pickupIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pickupLabel: {
    color: "#94A3B8",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickupText: {
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 4,
  },
  list: {
    gap: 10,
    marginTop: 14,
  },
  input: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginTop: 12,
  },
  inputMulti: {
    minHeight: 80,
  },
  inputText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
  },
  currency: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  cashChip: {
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  cashText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
