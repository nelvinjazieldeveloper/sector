import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, ActivityIndicator, FlatList, StyleSheet, 
  TouchableOpacity, SafeAreaView, RefreshControl, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

export default function AttendanceScreen({ route, navigation }) {
  const { meeting } = route.params;
  const [pastors, setPastors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/asistencias/?id_reunion=${meeting.id_reunion}`);
      const json = await response.json();
      setPastors(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      // Solo alertar si no es por navegación (para evitar alertas dobles)
      if (err.message !== "Aborted") {
        Alert.alert("Error", "No se pudo cargar la lista de asistencia");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar al entrar o volver a la pantalla
  useFocusEffect(
    useCallback(() => {
      fetchAttendance();
    }, [meeting.id_reunion])
  );

  const toggleAttendance = async (pastor) => {
    const isAttending = pastor.id_asistencia !== null;
    const url = isAttending 
      ? `${config.API_URL}/asistencias/?id=${pastor.id_asistencia}`
      : `${config.API_URL}/asistencias/`;
    
    // ... rest of the function remains same
    
    const method = isAttending ? 'DELETE' : 'POST';
    const body = isAttending ? null : JSON.stringify({
      id_reunion: meeting.id_reunion,
      id_pastor: pastor.id_pastor,
      motivo: '',
      justificada: 0
    });

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body
      });

      if (response.ok) {
        fetchAttendance(); // Refresh list
      } else {
        const resJson = await response.json();
        Alert.alert("Error", resJson.error || "No se pudo actualizar la asistencia");
      }
    } catch (err) {
      console.error("Error toggling attendance:", err);
      Alert.alert("Error", "Error de conexión con el servidor");
    }
  };

  const renderPastor = ({ item }) => {
    const isAttending = item.id_asistencia !== null;
    return (
      <TouchableOpacity 
        style={[styles.pastorCard, isAttending && styles.attendingCard]} 
        onPress={() => toggleAttendance(item)}
      >
        <View style={styles.pastorInfo}>
          <Text style={[styles.pastorName, isAttending && styles.attendingText]}>
            {item.apellido}, {item.nombre}
          </Text>
          <Text style={styles.statusLabel}>
            {isAttending ? "✅ Asistió" : "❌ Inasistente"}
          </Text>
        </View>
        <View style={[styles.checkbox, isAttending && styles.checkboxChecked]}>
          {isAttending && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#1A237E', '#3949AB']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Asistencia</Text>
          <TouchableOpacity 
            style={styles.qrButton} 
            onPress={() => navigation.navigate('QRScanner', { meeting })}
          >
            <Text style={styles.qrButtonText}>📷 ESCANEAR QR</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.meetingTitle}>{meeting.titulo}</Text>
        <Text style={styles.meetingInfo}>📅 {meeting.fecha} | 📍 {meeting.lugar}</Text>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={pastors}
          keyExtractor={(item) => item.id_pastor.toString()}
          renderItem={renderPastor}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchAttendance();}} tintColor="#FFF" />
          }
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  headerTitle: { fontSize: 14, color: '#BBDEFB', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  qrButton: { backgroundColor: '#FFD700', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, elevation: 5 },
  qrButtonText: { color: '#1A237E', fontSize: 12, fontWeight: 'bold' },
  meetingTitle: { fontSize: 22, color: '#FFF', fontWeight: 'bold', marginTop: 5 },
  meetingInfo: { fontSize: 14, color: '#E3F2FD', marginTop: 5, opacity: 0.9 },
  listContainer: { padding: 15, paddingBottom: 50 },
  pastorCard: { 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 10, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  attendingCard: { backgroundColor: '#E8F5E9', borderColor: '#2E7D32', borderLeftWidth: 5 },
  pastorInfo: { flex: 1 },
  pastorName: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },
  attendingText: { color: '#1B5E20' },
  statusLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  checkbox: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    borderWidth: 2, 
    borderColor: '#3949AB', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  checkboxChecked: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  checkMark: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
