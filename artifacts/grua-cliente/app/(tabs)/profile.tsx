import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useService } from "@/contexts/ServiceContext";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { history } = useService();

  const completedTrips = history.filter((h) => h.status === "completed").length;

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Seguro que quieres salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/(auth)/login");
          },
        },
      ],
    );
  };

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Perfil
          </Text>
        </View>

        {/* Hero card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: colors.foreground,
              borderRadius: colors.radius * 1.25,
            },
          ]}
        >
          <View style={styles.heroRow}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroName}>{user?.name ?? "Usuario"}</Text>
              <Text style={styles.heroEmail}>{user?.email}</Text>
              {user?.phone ? (
                <Text style={styles.heroPhone}>{user.phone}</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>{completedTrips}</Text>
              <Text style={styles.statLabel}>Servicios</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>5.0</Text>
              <Text style={styles.statLabel}>Calificación</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>Oro</Text>
              <Text style={styles.statLabel}>Nivel</Text>
            </View>
          </View>
        </View>

        {/* Vehicle card */}
        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: colors.accent },
              ]}
            >
              <MaterialCommunityIcons
                name="car"
                size={20}
                color={colors.primaryDark}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Mi vehículo
              </Text>
              <Text
                style={[styles.sectionSub, { color: colors.mutedForeground }]}
              >
                {user?.vehicle
                  ? `${user.vehicle.model} · ${user.vehicle.color} · ${user.vehicle.plate}`
                  : "Aún no agregaste tu vehículo"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.mutedForeground}
            />
          </View>
        </View>

        {/* Menu options */}
        <View style={styles.menuGroup}>
          <MenuItem
            icon="card-outline"
            label="Métodos de pago"
            sub="Solo efectivo disponible"
            onPress={() =>
              Alert.alert(
                "Métodos de pago",
                "El pago se realiza directamente al conductor en efectivo. Próximamente más opciones.",
              )
            }
          />
          <MenuItem
            icon="notifications-outline"
            label="Notificaciones"
            sub="Activadas"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            label="Seguridad y privacidad"
            sub="Datos protegidos"
            onPress={() => {}}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Centro de ayuda"
            sub="FAQs y soporte 24/7"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Acerca de GruaYa"
            sub="Versión 1.0.0"
            onPress={() => {}}
          />
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            {
              borderColor: colors.destructive + "33",
              borderRadius: colors.radius,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={colors.destructive}
          />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>
            Cerrar sesión
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sub?: string;
  onPress: () => void;
}

function MenuItem({ icon, label, sub, onPress }: MenuItemProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
          opacity: pressed ? 0.95 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          { backgroundColor: colors.muted },
        ]}
      >
        <Ionicons name={icon} size={20} color={colors.foreground} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>
          {label}
        </Text>
        {sub ? (
          <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>
            {sub}
          </Text>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={colors.mutedForeground}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  heroCard: {
    marginHorizontal: 24,
    padding: 20,
    marginBottom: 20,
    gap: 20,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#0F172A",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  heroName: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 18,
  },
  heroEmail: {
    color: "#94A3B8",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  heroPhone: {
    color: "#94A3B8",
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingVertical: 14,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  statLabel: {
    color: "#94A3B8",
    fontFamily: "Inter_500Medium",
    fontSize: 11,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  section: {
    marginHorizontal: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
  },
  sectionSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    marginTop: 2,
  },
  menuGroup: {
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  menuSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
});
