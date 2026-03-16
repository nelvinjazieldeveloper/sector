import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Switch, ActivityIndicator, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import config from '../config';

export default function AttendanceScreen({ route }) {
  const { id_reunion, titulo_reunion } = route.params;
  const [loading, setLoading] = useState(true);
  const [pastores, setPastores] = useState([]);

  const loadData = async () => {
    try {
      const response = await fetch(`${config.API_URL}/inasistencias/?id_reunion=${id_reunion}`);
      const resJson = await response.json();
      setPastores(resJson);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const toggleSwitch = async (item) => {
    setLoading(true);
    if (item.estatus === 'Inasistente') {
      await fetch(`${config.API_URL}/inasistencias/?id=${item.id_inasistencia}`, { method: 'DELETE' });
    } else {
      await fetch(`${config.API_URL}/inasistencias/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_reunion, id_pastor: item.id_pastor, motivo: 'Pendiente', justificada: 0 })
      });
    }
    loadData();
  };

  // Función para guardar la justificación
  const handleJustify = (item) => {
    Alert.prompt(
      "Justificar Inasistencia",
      `Motivo para: ${item.apellido}`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Guardar",
          onPress: async (motivo) => {
            setLoading(true);
            await fetch(`${config.API_URL}/inasistencias/?id=${item.id_inasistencia}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ justificada: 1, motivo: motivo || 'Sin motivo específico' })
            });
            loadData();
          }
        }
      ],
      "plain-text",
      item.motivo === 'Inasistencia' ? "" : item.motivo
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Control de Asistencia</Text>
        <Text style={styles.subtitle}>{titulo_reunion}</Text>
      </View>

      {loading && <ActivityIndicator color="#1A237E" style={{ margin: 10 }} />}

      <FlatList
        data={pastores}
        keyExtractor={(item) => item.id_pastor.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.apellido}, {item.nombre}</Text>
              <Text style={item.estatus === 'Asistió' ? styles.txtAsistio : styles.txtFalto}>
                {item.estatus} {item.justificada == 1 ? "(Justificada)" : ""}
              </Text>
              {item.justificada == 1 && <Text style={styles.motivoText}>📝 {item.motivo}</Text>}
            </View>
            
            <View style={styles.actions}>
              {item.estatus === 'Inasistente' && (
                <TouchableOpacity onPress={() => handleJustify(item)} style={styles.btnJustify}>
                  <Text style={{ fontSize: 18 }}>✏️</Text>
                </TouchableOpacity>
              )}
              <Switch
                value={item.estatus === 'Inasistente'}
                onValueChange={() => toggleSwitch(item)}
                trackColor={{ false: "#ccc", true: "#f44336" }}
              />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { padding: 20, backgroundColor: '#1A237E', borderBottomLeftRadius: 15, borderBottomRightRadius: 15 },
  title: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  subtitle: { color: '#90CAF9', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#FFF', marginBottom: 5, marginHorizontal: 10, borderRadius: 10, elevation: 2 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  txtAsistio: { color: '#4CAF50', fontSize: 12, fontWeight: 'bold' },
  txtFalto: { color: '#F44336', fontSize: 12, fontWeight: 'bold' },
  motivoText: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },
  actions: { flexDirection: 'row', alignItems: 'center' },
  btnJustify: { marginRight: 15, padding: 5, backgroundColor: '#E3F2FD', borderRadius: 5 }
});