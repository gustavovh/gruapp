import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { ServiceType } from "@/constants/serviceTypes";

interface Props {
  service: ServiceType;
  selected?: boolean;
  onSelect: (id: ServiceType["id"]) => void;
}

export function ServiceTypeCard({ service, selected, onSelect }: Props) {
  const colors = useColors();

  const handlePress = () => {
    if (Platform.OS !== "web") {
      void Haptics.selectionAsync();
    }
    onSelect(service.id);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.accent : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: selected ? colors.primary : colors.muted,
            borderRadius: 14,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={service.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={28}
          color={selected ? "#fff" : colors.foreground}
        />
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.foreground }]}>
          {service.name}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground }]}>
          {service.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {service.estimatedTime}
            </Text>
          </View>
          <Text style={[styles.price, { color: colors.foreground }]}>
            desde ${service.basePrice}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected ? colors.primary : "transparent",
          },
        ]}
      >
        {selected ? (
          <MaterialCommunityIcons name="check" size={14} color="#fff" />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderWidth: 1.5,
    gap: 14,
  },
  iconWrap: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  desc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  price: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
