import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const IglesiaListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: '#1A237E', borderLeftWidth: 5 }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={[styles.mainLabel, { color: '#1A237E' }]}>{item.nombre_iglesia || item.iglesia_nombre}</Text>
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
          {(item.latitud && item.longitud) && (
            <View style={[styles.propBadge, {backgroundColor:'#E3F2FD'}]}><Text style={[styles.propText, {color:'#1565C0'}]}>📍 Mapa</Text></View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#1A237E', flex: 1 },
  idBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 8, borderRadius: 6, color: '#1A237E', fontSize: 12, fontWeight: 'bold' },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
  subText: { fontSize: 12, color: '#777' },
  badgeRow: { flexDirection: 'row', marginTop: 8, gap: 5 },
  propBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  propText: { fontSize: 10, fontWeight: 'bold', color: '#E65100' },
});

export default IglesiaListItem;