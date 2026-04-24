import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Driver } from "@/contexts/ServiceContext";

interface Props {
  driver: Driver;
  phone?: string;
}

export function DriverCard({ driver, phone = "5215555555555" }: Props) {
  const colors = useColors();

  const initials = driver.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleCall = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    void Linking.openURL(`tel:${phone}`);
  };

  const handleMessage = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    void Linking.openURL(`sms:${phone}`);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: driver.photoColor },
          ]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.foreground }]}>
            {driver.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.meta}>
              <MaterialCommunityIcons name="star" size={14} color={colors.warning} />
              <Text style={[styles.metaText, { color: colors.foreground }]}>
                {driver.rating.toFixed(1)}
              </Text>
            </View>
            <Text style={[styles.dot, { color: colors.mutedForeground }]}>
              •
            </Text>
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {driver.totalTrips} viajes
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={handleCall}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons name="call" size={20} color={colors.primaryForeground} />
          </Pressable>
          <Pressable
            onPress={handleMessage}
            style={({ pressed }) => [
              styles.actionBtn,
              {
                backgroundColor: colors.muted,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Ionicons
              name="chatbubble"
              size={18}
              color={colors.foreground}
            />
          </Pressable>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.vehicleRow}>
        <MaterialCommunityIcons
          name="tow-truck"
          size={20}
          color={colors.mutedForeground}
        />
        <Text style={[styles.vehicle, { color: colors.foreground }]}>
          {driver.vehicle}
        </Text>
        <View
          style={[
            styles.plate,
            { backgroundColor: colors.foreground },
          ]}
        >
          <Text style={styles.plateText}>{driver.plate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  dot: {
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vehicle: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  plate: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  plateText: {
    color: "#FCD34D",
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    letterSpacing: 1.5,
  },
});
