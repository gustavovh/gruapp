import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const webTopInset = Platform.OS === "web" ? 67 : 0;
  const webBottomInset = Platform.OS === "web" ? 34 : 0;

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert("Datos incompletos", "Completa todos los campos.");
      return;
    }
    try {
      setLoading(true);
      await register({ name, email, phone, password });
      router.replace("/(tabs)");
    } catch {
      Alert.alert("Error", "No pudimos crear tu cuenta. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + webTopInset + 12,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={[styles.backBtn, { backgroundColor: colors.muted }]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Crear cuenta
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + webBottomInset + 32 },
        ]}
        bottomOffset={20}
      >
        <View style={styles.welcome}>
          <View
            style={[
              styles.welcomeIcon,
              { backgroundColor: colors.accent, borderRadius: colors.radius },
            ]}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={28}
              color={colors.primaryDark}
            />
          </View>
          <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
            Únete a GruaYa
          </Text>
          <Text
            style={[styles.welcomeSub, { color: colors.mutedForeground }]}
          >
            Completa tus datos para empezar a solicitar servicios.
          </Text>
        </View>

        <View style={styles.fields}>
          <Field
            icon="person-outline"
            value={name}
            onChange={setName}
            placeholder="Nombre completo"
          />
          <Field
            icon="mail-outline"
            value={email}
            onChange={setEmail}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Field
            icon="call-outline"
            value={phone}
            onChange={setPhone}
            placeholder="Teléfono"
            keyboardType="phone-pad"
          />
          <Field
            icon="lock-closed-outline"
            value={password}
            onChange={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />
        </View>

        <PrimaryButton
          label="Crear cuenta"
          onPress={handleRegister}
          loading={loading}
        />

        <Text style={[styles.terms, { color: colors.mutedForeground }]}>
          Al continuar aceptas los términos y condiciones del servicio.
        </Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

interface FieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  secureTextEntry?: boolean;
}

function Field({
  icon,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  autoCapitalize,
  secureTextEntry,
}: FieldProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.input,
        { backgroundColor: colors.muted, borderRadius: colors.radius },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.mutedForeground} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        style={[styles.inputText, { color: colors.foreground }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  welcome: {
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
    marginTop: 8,
  },
  welcomeSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
  fields: {
    gap: 12,
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
  terms: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
