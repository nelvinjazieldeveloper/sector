import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const UserListItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: '#FFD700', borderLeftWidth: 5 }]} 
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        <View style={styles.row}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{item.rol}</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {item.nombre ? `Vínculo: ${item.nombre} ${item.apellido}` : 'Sin vínculo a pastor'}
        </Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
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
  cardContent: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  username: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginRight: 10 },
  roleBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  roleText: { color: '#3949AB', fontSize: 12, fontWeight: 'bold' },
  subtitle: { fontSize: 13, color: '#666' },
  arrow: { fontSize: 20, color: '#FFD700', fontWeight: 'bold' }
});

export default UserListItem;
