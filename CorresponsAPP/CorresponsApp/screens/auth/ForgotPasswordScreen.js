import { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSend = () => {
    if (!email.includes("@")) {
      alert("Introduce un email válido.");
      return;
    }

    // Aquí irá la llamada al backend para enviar el email de recuperación
    console.log("Enviar recuperación a:", email);
    setSubmitted(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text variant="headlineSmall" style={styles.title}>
          Recuperar contraseña
        </Text>

        {submitted ? (
          <>
            <Text style={styles.successText}>
              Si el correo existe, se ha enviado un enlace para restablecer tu
              contraseña.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.goBack()}
              style={styles.button}
            >
              Volver
            </Button>
          </>
        ) : (
          <>
            <TextInput
              label="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <Button mode="contained" onPress={handleSend} style={styles.button}>
              Enviar enlace
            </Button>
            <Button onPress={() => navigation.goBack()} style={styles.link}>
              Volver al inicio de sesión
            </Button>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
  },
  link: {
    marginTop: 12,
    alignSelf: "center",
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    color: "green",
    marginBottom: 24,
  },
});
