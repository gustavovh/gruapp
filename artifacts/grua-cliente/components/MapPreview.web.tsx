import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";

import type { LatLng } from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

interface Marker {
  id: string;
  coordinate: LatLng;
  color: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  label?: string;
}

interface Props {
  center: LatLng;
  markers?: Marker[];
  showRoute?: boolean;
  routeFrom?: LatLng;
  routeTo?: LatLng;
  style?: ViewStyle | ViewStyle[];
  interactive?: boolean;
}

export function MapPreview({
  center,
  markers = [],
  showRoute,
  routeFrom,
  routeTo,
  style,
}: Props) {
  const colors = useColors();

  const span = 0.04;
  const project = (p: LatLng) => {
    const x = (p.longitude - (center.longitude - span / 2)) / span;
    const y = 1 - (p.latitude - (center.latitude - span / 2)) / span;
    return {
      left: `${Math.min(95, Math.max(5, x * 100))}%`,
      top: `${Math.min(95, Math.max(5, y * 100))}%`,
    };
  };

  const fromPos = routeFrom ? project(routeFrom) : null;
  const toPos = routeTo ? project(routeTo) : null;

  return (
    <View
      style={[
        styles.container,
        styles.webMap,
        { backgroundColor: "#E8EEF4" },
        style,
      ]}
    >
      <View style={[styles.street, { top: "20%" }]} />
      <View style={[styles.street, { top: "45%" }]} />
      <View style={[styles.street, { top: "70%" }]} />
      <View style={[styles.streetVert, { left: "25%" }]} />
      <View style={[styles.streetVert, { left: "55%" }]} />
      <View style={[styles.streetVert, { left: "80%" }]} />

      {showRoute && fromPos && toPos ? (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.routeDot,
              {
                left: fromPos.left as `${number}%`,
                top: fromPos.top as `${number}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.routeDot,
              {
                left: toPos.left as `${number}%`,
                top: toPos.top as `${number}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </>
      ) : null}

      {markers.map((m) => {
        const pos = project(m.coordinate);
        return (
          <View
            key={m.id}
            style={[
              styles.marker,
              {
                left: pos.left as `${number}%`,
                top: pos.top as `${number}%`,
                backgroundColor: m.color,
              },
            ]}
          >
            {m.icon ? (
              <MaterialCommunityIcons name={m.icon} size={14} color="#fff" />
            ) : null}
          </View>
        );
      })}

      <View style={styles.badge}>
        <MaterialCommunityIcons
          name="map-outline"
          size={14}
          color={colors.mutedForeground}
        />
        <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>
          Vista de mapa
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", backgroundColor: "#E8EEF4" },
  webMap: { position: "relative" },
  street: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: "#fff",
    opacity: 0.9,
  },
  streetVert: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: "#fff",
    opacity: 0.9,
  },
  marker: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    transform: [{ translateX: -14 }, { translateY: -14 }],
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  routeDot: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    transform: [{ translateX: -5 }, { translateY: -5 }],
    opacity: 0.6,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_500Medium" },
});
