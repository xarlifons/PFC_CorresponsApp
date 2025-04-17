import React, { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen({ navigation }) {
  const { state } = useAuth();

  useEffect(() => {
    if (!state.isLoading) {
      if (state.isAuthenticated) {
        navigation.replace("MainStack"); // ← lo conectaremos pronto
      } else {
        navigation.replace("AuthStack");
      }
    }
  }, [state.isLoading, state.isAuthenticated]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CorresponsAPP</Text>
      <ActivityIndicator size="large" color="#6200ee" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#777",
  },
});
