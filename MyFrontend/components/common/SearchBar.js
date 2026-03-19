import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

const SearchBar = ({ value, onChangeText, placeholder = "Buscar..." }) => {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: { paddingHorizontal: 15, paddingBottom: 10, backgroundColor: '#FFF' },
  searchInput: { backgroundColor: '#F1F3F4', padding: 10, borderRadius: 8 },
});

export default SearchBar;