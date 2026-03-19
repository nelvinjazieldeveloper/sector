import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HijoListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: '#C62828', borderLeftWidth: 5 }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.mainLabel, { color: '#C62828' }]}>{item.nombre} {item.apellido || ''}</Text>
        <Text style={styles.idBadge}>#{item.id_hijo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  idBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, borderRadius: 6, color: '#C62828', fontSize: 12, fontWeight: 'bold' },
});

export default HijoListItem;