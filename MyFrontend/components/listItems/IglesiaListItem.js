import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const IglesiaListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.mainLabel}>{item.nombre_iglesia || item.iglesia_nombre}</Text>
        <Text style={styles.idBadge}>#{item.id_iglesia}</Text>
      </View>
      <View>
        <Text style={styles.infoText}>📍 {item.direccion}</Text>
        <Text style={styles.subText}>Miembros: {item.cantidad_miembros}</Text>
        <View style={styles.badgeRow}>
          {parseInt(item.tiene_terreno) === 1 && (
            <View style={styles.propBadge}><Text style={styles.propText}>🌱 Terreno</Text></View>
          )}
          {parseInt(item.tiene_casa_pastoral) === 1 && (
            <View style={[styles.propBadge, {backgroundColor:'#E8F5E9'}]}><Text style={[styles.propText, {color:'#2E7D32'}]}>🏠 Casa</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  idBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 6, borderRadius: 4, color: '#1A237E', fontSize: 12 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
  subText: { fontSize: 12, color: '#777' },
  badgeRow: { flexDirection: 'row', marginTop: 8, gap: 5 },
  propBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  propText: { fontSize: 10, fontWeight: 'bold', color: '#E65100' },
});

export default IglesiaListItem;