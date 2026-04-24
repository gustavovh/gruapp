import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getServiceType } from "@/constants/serviceTypes";
import { useService, type ServiceRequest } from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { history, active, clearHistory } = useService();

  const items = useMemo(() => {
    return active && active.status !== "completed" && active.status !== "cancelled"
      ? [active, ...history]
      : history;
  }, [history, active]);

  const totalSpent = history
    .filter((h) => h.finalPrice)
    .reduce((acc, h) => acc + (h.finalPrice ?? 0), 0);

  const completedCount = history.filter((h) => h.status === "completed").length;

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 84 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 16,
          paddingBottom: insets.bottom + webBottomInset + 32,
          paddingHorizontal: 24,
          gap: 12,
        }}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Historial
            </Text>
            <Text
              style={[styles.subtitle, { color: colors.mutedForeground }]}
            >
              Tus servicios anteriores y activos
            </Text>

            {history.length > 0 ? (
              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.foreground,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text style={styles.statLabel}>Servicios</Text>
                  <Text style={styles.statValue}>{completedCount}</Text>
                </View>
                <View
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: colors.primary,
                      borderRadius: colors.radius,
                    },
                  ]}
                >
                  <Text
                    style={[styles.statLabel, { color: "#0F172A99" }]}
                  >
                    Total gastado
                  </Text>
                  <Text style={[styles.statValue, { color: "#0F172A" }]}>
                    ${totalSpent}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <HistoryItem
            request={item}
            onPress={() => {
              if (
                item.status !== "completed" &&
                item.status !== "cancelled"
              ) {
                router.push(`/service/${item.id}`);
              }
            }}
          />
        )}
        ListEmptyComponent={
          <View style={{ marginTop: 40 }}>
            <EmptyState
              icon="history"
              title="Aún no tienes servicios"
              description="Cuando solicites tu primera grúa o asistencia, aparecerá aquí."
              action={
                <PrimaryButton
                  label="Solicitar ahora"
                  onPress={() => router.push("/(tabs)")}
                />
              }
            />
          </View>
        }
        ListFooterComponent={
          history.length > 0 ? (
            <Pressable
              onPress={() => {
                Alert.alert(
                  "Borrar historial",
                  "¿Seguro que quieres eliminar todos tus servicios pasados?",
                  [
                    { text: "Cancelar", style: "cancel" },
                    {
                      text: "Borrar",
                      style: "destructive",
                      onPress: () => void clearHistory(),
                    },
                  ],
                );
              }}
              hitSlop={8}
              style={styles.clearBtn}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color={colors.mutedForeground}
              />
              <Text
                style={[styles.clearText, { color: colors.mutedForeground }]}
              >
                Borrar historial
              </Text>
            </Pressable>
          ) : null
        }
        scrollEnabled={items.length > 0}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function HistoryItem({
  request,
  onPress,
}: {
  request: ServiceRequest;
  onPress: () => void;
}) {
  const colors = useColors();
  const type = getServiceType(request.typeId);
  const date = new Date(request.createdAt);
  const dateStr = date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isActive =
    request.status !== "completed" && request.status !== "cancelled";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: colors.card,
          borderColor: isActive ? colors.primary : colors.border,
          borderRadius: colors.radius,
          borderWidth: isActive ? 1.5 : 1,
          opacity: pressed && isActive ? 0.95 : 1,
        },
      ]}
    >
      <View style={styles.itemHeader}>
        <View
          style={[
            styles.itemIcon,
            { backgroundColor: colors.muted, borderRadius: 12 },
          ]}
        >
          <MaterialCommunityIcons
            name={type.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={22}
            color={colors.foreground}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.itemTitle, { color: colors.foreground }]}>
            {type.name}
          </Text>
          <Text style={[styles.itemDate, { color: colors.mutedForeground }]}>
            {dateStr} · {timeStr}
          </Text>
        </View>
        <Text style={[styles.itemPrice, { color: colors.foreground }]}>
          ${request.finalPrice ?? request.estimatedPrice}
        </Text>
      </View>

      <View style={styles.itemFooter}>
        <View style={styles.addressRow}>
          <Ionicons
            name="location"
            size={14}
            color={colors.mutedForeground}
          />
          <Text
            style={[styles.address, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {request.pickupAddress}
          </Text>
        </View>
        <StatusBadge status={request.status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerWrap: {
    marginBottom: 8,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    color: "#94A3B8",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 24,
  },
  item: {
    padding: 14,
    gap: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  itemDate: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
  },
  itemFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  addressRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  address: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 16,
    marginTop: 8,
  },
  clearText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
});
