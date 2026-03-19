import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReporteListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: '#D4AF37', borderLeftWidth: 5 }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.mainLabel, { color: '#D4AF37' }]}>{item.nombre_iglesia || item.iglesia_nombre || item.titulo || 'Sin ID'}</Text>
        <Text style={styles.idBadge}>#{item.id_reporte}</Text>
      </View>
      <View>
        <Text style={styles.infoText}>⛪ Iglesia: <Text style={{fontWeight: 'bold'}}>{item.nombre_iglesia || item.iglesia_nombre}</Text></Text>
        <Text style={[styles.infoText, { color: '#1A237E' }]}>👤 Pastor: {item.apellido || item.nombre_pastor}</Text>
        <Text style={styles.subText}>Periodo: {item.mes_reportado}/{item.anio_reportado}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  idBadge: { backgroundColor: '#FFF9C4', paddingHorizontal: 8, borderRadius: 6, color: '#FBC02D', fontSize: 12, fontWeight: 'bold' },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
  subText: { fontSize: 12, color: '#777' },
});

export default ReporteListItem;