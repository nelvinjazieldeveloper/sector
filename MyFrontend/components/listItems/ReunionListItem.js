import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ReunionListItem = ({ item, onPress, user_rol }) => {
  const navigation = useNavigation();
  const rol = user_rol?.toLowerCase();
  const canManageAttendance = rol === 'admin' || rol === 'presbitero' || rol === 'secretario';

  return (
    <View style={[styles.card, { borderLeftColor: '#6A1B9A', borderLeftWidth: 5 }]}>
      <TouchableOpacity style={styles.cardMain} onPress={onPress}>
        <View style={styles.cardHeader}>
          <Text style={[styles.mainLabel, { color: '#2dabff' }]}>{item.titulo || "Sin título"}</Text>
          <Text style={styles.idBadge}>#{item.id_reunion}</Text>
        </View>
        <View>
          <Text style={styles.infoText}>📅 Fecha: {item.fecha}</Text>
          <Text style={styles.infoText}>📍 Lugar: {item.lugar}</Text>
        </View>
      </TouchableOpacity>
      
      {canManageAttendance && (
        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.attendanceBtn} 
            onPress={() => navigation.navigate('Attendance', { meeting: item })}
          >
            <Text style={styles.attendanceBtnText}> PASAR ASISTENCIA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, overflow: 'hidden' },
  cardMain: { padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  idBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: 8, borderRadius: 6, color: '#2dabff', fontSize: 12, fontWeight: 'bold' },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
  cardFooter: { borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FAFAFA' },
  attendanceBtn: { padding: 12, alignItems: 'center', backgroundColor: '#F3E5F5' },
  attendanceBtnText: { color: '#2dabff', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
});

export default ReunionListItem;