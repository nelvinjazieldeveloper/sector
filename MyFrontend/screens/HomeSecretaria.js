import React from 'react';
// IMPORTANTE: Agregar ScrollView, StyleSheet, etc.
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const MenuButton = ({ title, icon, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeSecretaria({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionLabel}>Gestión de Personal y Sedes</Text>
      <MenuButton title="Pastores" icon="👨‍💼" onPress={() => navigation.navigate('List', { path: 'pastores', title: 'Pastores' })} />
      <MenuButton title="Iglesias" icon="⛪" onPress={() => navigation.navigate('List', { path: 'iglesias', title: 'Iglesias' })} />
      <MenuButton title="Hijos" icon="👶" onPress={() => navigation.navigate('List', { path: 'hijos', title: 'Hijos' })} />
      <MenuButton title="Reuniones" icon="📅" onPress={() => navigation.navigate('List', { path: 'reuniones', title: 'Reuniones' })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginBottom: 15, textTransform: 'uppercase' },
  menuCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  menuIcon: { fontSize: 24, marginRight: 15 },
  menuTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
});