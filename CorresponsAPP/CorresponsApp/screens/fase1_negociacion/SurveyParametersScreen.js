import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import Slider from "@react-native-community/slider";
import { useAuth } from "../../context/AuthContext";
import { useRedirectByEstadoFase1 } from "../../hooks/useRedirectByEstadoFase1";

export default function SurveyParamsScreen() {
  const {
    state,
    enviarParametrosEncuesta,
    actualizarEstadoFase1,
    getUnidadInfoCompleta,
    logout,
    getGruposIniciales,
  } = useAuth();

  const [grupos, setGrupos] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [umbral, setUmbral] = useState(null);
  const [unidadInfo, setUnidadInfo] = useState(null);
  const [showResumen, setShowResumen] = useState(false);
  const [refreshRedirect, setRefreshRedirect] = useState(false);
  const [encuestaRegistrada, setEncuestaRegistrada] = useState(false);
  const [isEnviando, setIsEnviando] = useState(false);

  const redirect = useRedirectByEstadoFase1(
    "momento2",
    "TaskNegotiationThresholdScreen",
    refreshRedirect
  );

  useEffect(() => {
    const cargarGrupos = async () => {
      try {
        const data = await getGruposIniciales();
        if (!Array.isArray(data)) {
          throw new Error("El formato recibido no es una lista de grupos.");
        }
        console.log("📥 Grupos recibidos:", data);
        setGrupos(data);
        const respuestasIniciales = data.map((g) => ({
          grupo: g.grupo,
          periodicidad: 1,
          intensidad: 5,
          cargaMental: 5,
        }));
        setRespuestas(respuestasIniciales);
      } catch (error) {
        console.log("🔍 Detalles del error en getGruposIniciales:", error);
        const mensaje =
          error?.message ||
          (typeof error === "string" ? error : JSON.stringify(error)) ||
          "Error desconocido";
        console.error("❌ Error en getGruposIniciales:", mensaje);
        Alert.alert(
          "❌ Error",
          `Error al obtener grupos de encuesta: ${mensaje}`
        );
      }
    };
    cargarGrupos();
  }, []);

  const handleSliderChange = (index, campo, valor) => {
    const nuevas = [...respuestas];
    nuevas[index][campo] = valor;
    setRespuestas(nuevas);
  };

  const calcularUmbral = () => {
    const total = respuestas.length;
    const suma = respuestas.reduce(
      (acc, r) => {
        acc.periodicidad += r.periodicidad;
        acc.intensidad += r.intensidad;
        acc.cargaMental += r.cargaMental;
        return acc;
      },
      { periodicidad: 0, intensidad: 0, cargaMental: 0 }
    );
    const valor = (
      (suma.intensidad + suma.cargaMental + (30 - suma.periodicidad)) /
      total /
      2
    ).toFixed(1);
    return { valor };
  };

  const handleEnviar = async () => {
    try {
      setIsEnviando(true);
      console.log(
        "🧾 Aqui la respuestas a enviar:",
        JSON.stringify(respuestas, null, 2)
      );
      await enviarParametrosEncuesta(respuestas);
      await actualizarEstadoFase1(state.user.unidadAsignada, "momento2");

      setTimeout(async () => {
        const info = await getUnidadInfoCompleta(state.user.unidadAsignada);
        setUnidadInfo(info);
        setUmbral(calcularUmbral());
        setEncuestaRegistrada(true);
        setShowResumen(true);
        setIsEnviando(false);
      }, 800);
    } catch (error) {
      Alert.alert("❌ Error", error.message);
      setIsEnviando(false);
    }
  };

  const handleRefrescar = async () => {
    try {
      const info = await getUnidadInfoCompleta(state.user.unidadAsignada);
      setUnidadInfo(info);
    } catch (error) {
      Alert.alert("❌ Error al refrescar", error.message);
    }
  };

  if (showResumen && unidadInfo) {
    const respuestasConfirmadas = unidadInfo.miembros.filter(
      (u) => u.surveyParameters?.length > 0
    ).length;
    const total = unidadInfo.miembros.length;

    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>🎯 Resultado de tu encuesta</Text>

        <View style={styles.umbralCard}>
          <Text style={styles.umbralTitle}>Tu umbral de limpieza</Text>
          <Text style={styles.umbralValor}>{umbral.valor} / 100</Text>
        </View>

        <Text style={styles.subtitle}>
          👥 En tu unidad hay {total} persona(s).
          {"\n"}📝 Han respondido: {respuestasConfirmadas} / {total}
        </Text>

        <Button
          title="💬 Vamos a por el consenso en las tareas"
          onPress={async () => {
            try {
              await actualizarEstadoFase1(
                state.user.unidadAsignada,
                "momento3"
              );
              setRefreshRedirect((prev) => !prev);
            } catch (error) {
              Alert.alert(
                "❌ Error",
                "No se pudo avanzar al siguiente momento."
              );
            }
          }}
          disabled={respuestasConfirmadas < total}
          color={respuestasConfirmadas < total ? "#ccc" : "#007AFF"}
        />

        {respuestasConfirmadas < total && (
          <Text style={{ color: "#888", marginTop: 10, textAlign: "center" }}>
            Aún faltan personas por completar la encuesta.
          </Text>
        )}

        <View style={{ marginTop: 20 }}>
          <Button
            title="🔄 Refrescar datos"
            onPress={handleRefrescar}
            color="#888"
          />
        </View>

        <View style={{ marginTop: 20 }}>
          <Button title="Cerrar sesión" onPress={logout} color="tomato" />
        </View>
        {redirect}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 ¿Cómo ves tú las tareas del hogar?</Text>
      <Text style={styles.intro}>
        Esta encuesta es rápida y sencilla:
        {"\n"}Solo te pediremos tu opinión sobre 10 tareas representativas del
        hogar.
        {"\n\n"}Por cada tarea, dinos tres cosas:
        {"\n\n"}🕒 Con qué periodicidad crees que debería hacerse esa tarea
        {"\n"}💥 Qué esfuerzo te genera la realización de esta tarea.
        {"\n"}🧠 Qué carga mental supone tenerla en cuenta o recordarla (no
        realizarla).
        {"\n\n"}Tus respuestas nos ayudarán a conocer tu umbral de limpieza.
      </Text>

      {grupos.map((g, index) => (
        <View key={g.grupo} style={styles.card}>
          <Text style={styles.groupTitle}>
            {index + 1}. {g.tarea}
          </Text>

          <Text style={styles.sliderLabel}>📅 Periodicidad</Text>
          <Slider
            minimumValue={0.5}
            maximumValue={30}
            step={0.5}
            value={respuestas[index]?.periodicidad || 1}
            onValueChange={(v) => handleSliderChange(index, "periodicidad", v)}
          />
          <Text>
            🕒 Cada {respuestas[index]?.periodicidad?.toFixed(1)} días
          </Text>

          <Text style={styles.sliderLabel}>💥 Esfuerzo</Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={respuestas[index]?.intensidad || 5}
            onValueChange={(v) => handleSliderChange(index, "intensidad", v)}
          />
          <Text>{respuestas[index]?.intensidad?.toFixed(0)} / 10</Text>

          <Text style={styles.sliderLabel}>🧠 Carga mental</Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={respuestas[index]?.cargaMental || 5}
            onValueChange={(v) => handleSliderChange(index, "cargaMental", v)}
          />
          <Text>{respuestas[index]?.cargaMental?.toFixed(0)} / 10</Text>
        </View>
      ))}

      <Button
        title={isEnviando ? "Enviando..." : "Enviar respuestas"}
        onPress={handleEnviar}
        disabled={isEnviando}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  intro: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: "left",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginBottom: 24,
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sliderLabel: {
    marginTop: 12,
    fontSize: 14,
  },
  umbralCard: {
    backgroundColor: "#E6F4EA",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginVertical: 20,
    width: "100%",
  },
  umbralTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D6A4F",
    marginBottom: 10,
  },
  umbralValor: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1B4332",
  },
});
