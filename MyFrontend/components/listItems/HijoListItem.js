import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HijoListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: '#C62828', borderLeftWidth: 5 }]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.mainLabel, { color: '#C62828' }]}>{item.nombre} {item.apellido || ''}</Text>
          <Text style={styles.subLabel}>Hijo(a) de: {item.pastor_nombre || 'Desconocido'}</Text>
        </View>
        <Text style={styles.idBadge}>#{item.id_hijo}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>EDAD</Text>
          <Text style={styles.infoValue}>{item.edad} años</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>SEXO</Text>
          <Text style={styles.infoValue}>{item.sexo === 'M' ? 'Masc' : 'Fem'}</Text>
        </View>
      </View>

      {item.talentos ? (
        <View style={styles.talentBox}>
          <Text style={styles.talentLabel}>🌟 Talentos / Habilidades:</Text>
          <Text style={styles.talentText}>{item.talentos}</Text>
        </View>
      ) : null}

      {item.estudios ? (
        <View style={styles.talentBox}>
          <Text style={styles.talentLabel}>🎓 Estudios / Profesión:</Text>
          <Text style={styles.talentText}>{item.estudios}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  subLabel: { fontSize: 13, color: '#666', marginTop: 2 },
  idBadge: { backgroundColor: '#FFEBEE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, color: '#C62828', fontSize: 11, fontWeight: 'bold' },
  detailsRow: { flexDirection: 'row', marginTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoBox: { marginRight: 25 },
  infoLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#444' },
  talentBox: { marginTop: 10, backgroundColor: '#F8F9FA', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#EEE' },
  talentLabel: { fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 2 },
  talentText: { fontSize: 14, color: '#333', fontStyle: 'italic' },
});

export default HijoListItem;