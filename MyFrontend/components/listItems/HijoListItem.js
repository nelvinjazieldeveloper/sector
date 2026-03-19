import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HijoListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.mainLabel}>{item.nombre} {item.apellido || ''}</Text>
        <Text style={styles.idBadge}>#{item.id_hijo}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  idBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 6, borderRadius: 4, color: '#1A237E', fontSize: 12 },
});

export default HijoListItem;