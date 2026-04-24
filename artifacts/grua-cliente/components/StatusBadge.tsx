import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import {
  statusLabel,
  type ServiceStatus,
} from "@/contexts/ServiceContext";

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const colors = useColors();

  const palette = (() => {
    switch (status) {
      case "completed":
        return { bg: colors.success + "22", fg: colors.success };
      case "cancelled":
        return { bg: colors.destructive + "22", fg: colors.destructive };
      case "in_progress":
      case "arrived":
        return { bg: colors.primary + "22", fg: colors.primaryDark };
      default:
        return { bg: colors.muted, fg: colors.foreground };
    }
  })();

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <View style={[styles.dot, { backgroundColor: palette.fg }]} />
      <Text style={[styles.text, { color: palette.fg }]}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "uppercase" as const,
  },
});
