import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Datos incompletos", "Ingresa tu correo y contraseña.");
      return;
    }
    try {
      setLoading(true);
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "No pudimos iniciar tu sesión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={["#0F172A", "#1E293B"]}
        style={[styles.hero, { paddingTop: insets.top + webTopInset + 32 }]}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons
              name="tow-truck"
              size={28}
              color="#0F172A"
            />
          </View>
          <Text style={styles.logoText}>GruaYa</Text>
        </View>
        <Text style={styles.heroTitle}>Asistencia vehicular{"\n"}cuando la necesites</Text>
        <Text style={styles.heroSubtitle}>
          Solicita una grúa o ayuda en carretera con un toque.
        </Text>
      </LinearGradient>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + webBottomInset + 32 },
        ]}
        bottomOffset={20}
      >
        <Text style={[styles.formTitle, { color: colors.foreground }]}>
          Bienvenido de vuelta
        </Text>
        <Text style={[styles.formSubtitle, { color: colors.mutedForeground }]}>
          Inicia sesión para continuar
        </Text>

        <View style={styles.fields}>
          <View
            style={[
              styles.input,
              { backgroundColor: colors.muted, borderRadius: colors.radius },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.mutedForeground}
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              style={[styles.inputText, { color: colors.foreground }]}
            />
          </View>

          <View
            style={[
              styles.input,
              { backgroundColor: colors.muted, borderRadius: colors.radius },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.mutedForeground}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              autoComplete="password"
              style={[styles.inputText, { color: colors.foreground }]}
            />
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>
          </View>
        </View>

        <PrimaryButton
          label="Iniciar sesión"
          onPress={handleLogin}
          loading={loading}
        />

        <View style={styles.dividerRow}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text
            style={[styles.dividerText, { color: colors.mutedForeground }]}
          >
            o
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.mutedForeground }]}>
            ¿No tienes cuenta?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable hitSlop={8}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                Crear cuenta
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    lineHeight: 32,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 32,
    gap: 16,
  },
  formTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  formSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    marginBottom: 8,
  },
  fields: {
    gap: 12,
    marginBottom: 8,
  },
  input: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
  inputText: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 12,
  },
  divider: { flex: 1, height: 1 },
  dividerText: { fontFamily: "Inter_500Medium", fontSize: 12 },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  registerText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  registerLink: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
});
