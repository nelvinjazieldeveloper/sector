import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Header = ({ title, onAddPress, hideAdd = false }) => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {!hideAdd && (
        <TouchableOpacity style={styles.btnAdd} onPress={onAddPress}>
          <Text style={styles.btnAddText}>+ Nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  btnAdd: { backgroundColor: '#E8EAF6', padding: 8, borderRadius: 8 },
  btnAddText: { color: '#1A237E', fontWeight: 'bold' },
});

export default Header;