import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MenuButton = ({ title, onPress, subtitle }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 5 },
  cardSubtitle: { fontSize: 14, color: '#666' },
  arrow: { fontSize: 20, color: '#1A237E' },
});

export default MenuButton;