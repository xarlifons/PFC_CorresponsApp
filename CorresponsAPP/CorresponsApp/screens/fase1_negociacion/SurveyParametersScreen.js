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

export default function SurveyParametersScreen() {
  const {
    state,
    enviarEncuestaYRecibirUmbral,
    actualizarEstadoFase1,
    getUnidadInfoCompleta,
    logout,
    getGruposIniciales,
    getInitialConsensus,
    persistInitialConsensus,
  } = useAuth();

  const [grupos, setGrupos] = useState([]);
  const [respuestas, setRespuestas] = useState([]);
  const [umbral, setUmbral] = useState(null);
  const [unidadInfo, setUnidadInfo] = useState(null);
  const [showResumen, setShowResumen] = useState(false);
  const [refreshRedirect, setRefreshRedirect] = useState(false);
  const [isEnviando, setIsEnviando] = useState(false);

  // Redirige a TaskNegotiationThresholdScreen cuando estadoFase1 = "momento2"
  const redirect = useRedirectByEstadoFase1(
    "momento2",
    "TaskNegotiationThresholdScreen",
    refreshRedirect
  );

  // Carga inicial de grupos de encuesta
  useEffect(() => {
    (async () => {
      try {
        const data = await getGruposIniciales();
        if (!Array.isArray(data)) throw new Error("Formato inesperado");
        setGrupos(data);
        setRespuestas(
          data.map((g) => ({
            grupo: g.grupo,
            tarea: g.tarea,
            periodicidad: 1,
            intensidad: 5,
            cargaMental: 5,
          }))
        );
      } catch (e) {
        Alert.alert("❌ Error al cargar grupos", e.message);
      }
    })();
  }, []);

  // Maneja el cambio de sliders
  const handleSliderChange = (index, campo, valor) => {
    const copy = [...respuestas];
    copy[index][campo] = valor;
    setRespuestas(copy);
  };

  // 1) Envía encuesta y recibe umbral, muestra resumen (pero no avanza fase aún)
  const handleEnviar = async () => {
    try {
      setIsEnviando(true);
      const rawUmbral = await enviarEncuestaYRecibirUmbral(
        state.user.unidadAsignada,
        respuestas
      );
      const info = await getUnidadInfoCompleta(state.user.unidadAsignada);
      setUnidadInfo(info);
      setUmbral(rawUmbral.toFixed(1)); // Guardamos primitivo
      setShowResumen(true);
    } catch (e) {
      Alert.alert("❌ Error al enviar encuesta", e.message);
    } finally {
      setIsEnviando(false);
    }
  };

  // 2) Pantalla de resumen con umbral y botón para avanzar
  if (showResumen && unidadInfo) {
    const responded = unidadInfo.miembros.filter(
      (u) => u.surveyParameters?.length > 0
    ).length;
    const total = unidadInfo.miembros.length;

    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.title}>🎯 Resultado de tu encuesta</Text>

        <View style={styles.umbralCard}>
          <Text style={styles.umbralTitle}>Tu umbral de limpieza</Text>
          <Text style={styles.umbralValor}>{umbral} / 100</Text>
        </View>

        <Text style={styles.subtitle}>
          👥 En tu unidad hay {total} personas.
          {"\n"}📝 Han respondido: {responded} / {total}
        </Text>

        <Button
          title="💬 Vamos a por el consenso en las tareas"
          onPress={async () => {
            try {
              const mapa = await getInitialConsensus(state.user.unidadAsignada);
              const lista = Object.entries(mapa).map(([grupoId, dto]) => ({
                grupoId,
                periodicidad: dto.periodicidad,
                intensidad: dto.intensidad,
                cargaMental: dto.cargaMental,
              }));
              await persistInitialConsensus(state.user.unidadAsignada, lista);
              await actualizarEstadoFase1(
                state.user.unidadAsignada,
                "momento3"
              );
              setRefreshRedirect((prev) => !prev);
            } catch (e) {
              Alert.alert("❌ Error", e.message);
            }
          }}
          disabled={responded < total}
          color={responded < total ? "#ccc" : "#007AFF"}
        />
        {responded < total && (
          <Text style={styles.waitText}>
            Aún faltan personas por completar la encuesta.
          </Text>
        )}

        <View style={styles.actions}>
          <Button
            title="🔄 Volver a encuesta"
            onPress={() => setShowResumen(false)}
            color="#888"
          />
        </View>
        <View style={styles.actions}>
          <Button title="Cerrar sesión" onPress={logout} color="tomato" />
        </View>
        {redirect}
      </View>
    );
  }

  // 3) Render sliders antes de enviar
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📋 ¿Cómo ves tú las tareas del hogar?</Text>
      <Text style={styles.intro}>Ajusta estos parámetros para cada tarea:</Text>

      {grupos.map((g, i) => (
        <View key={g.grupo} style={styles.card}>
          <Text style={styles.groupTitle}>
            {i + 1}. {g.tarea}
          </Text>

          <Text style={styles.sliderLabel}>📅 Periodicidad</Text>
          <Slider
            minimumValue={0.5}
            maximumValue={30}
            step={0.5}
            value={respuestas[i].periodicidad}
            onValueChange={(v) => handleSliderChange(i, "periodicidad", v)}
          />
          <Text>Cada {respuestas[i].periodicidad.toFixed(1)} días</Text>

          <Text style={styles.sliderLabel}>💥 Esfuerzo</Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={respuestas[i].intensidad}
            onValueChange={(v) => handleSliderChange(i, "intensidad", v)}
          />
          <Text>{respuestas[i].intensidad.toFixed(0)} / 10</Text>

          <Text style={styles.sliderLabel}>🧠 Carga mental</Text>
          <Slider
            minimumValue={0}
            maximumValue={10}
            step={1}
            value={respuestas[i].cargaMental}
            onValueChange={(v) => handleSliderChange(i, "cargaMental", v)}
          />
          <Text>{respuestas[i].cargaMental.toFixed(0)} / 10</Text>
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
  container: { padding: 24, backgroundColor: "#fff" },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
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
  umbralCard: {
    backgroundColor: "#E6F4EA",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 20,
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
  waitText: {
    color: "#888",
    marginTop: 10,
    textAlign: "center",
  },
  actions: {
    marginTop: 16,
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
});
