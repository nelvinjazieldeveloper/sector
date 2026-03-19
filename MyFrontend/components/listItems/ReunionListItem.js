import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ReunionListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: '#6A1B9A', borderLeftWidth: 5 }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.mainLabel, { color: '#6A1B9A' }]}>{item.titulo || "Sin título"}</Text>
        <Text style={styles.idBadge}>#{item.id_reunion}</Text>
      </View>
      <View>
        <Text style={styles.infoText}>📅 Fecha: {item.fecha}</Text>
        <Text style={styles.infoText}>📍 Lugar: {item.lugar}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  idBadge: { backgroundColor: '#F3E5F5', paddingHorizontal: 8, borderRadius: 6, color: '#6A1B9A', fontSize: 12, fontWeight: 'bold' },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
});

export default ReunionListItem;