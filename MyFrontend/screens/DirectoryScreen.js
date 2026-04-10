import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, StyleSheet, TextInput, 
  TouchableOpacity, Linking, Platform, ActivityIndicator 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../config';

const DirectoryScreen = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDirectory();
  }, []);

  const fetchDirectory = async () => {
    try {
      const response = await fetch(`${config.API_URL}/iglesias/?view=directorio`);
      const json = await response.json();
      setData(json);
      setFilteredData(json);
    } catch (error) {
      console.error("Error fetching directory:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) {
      setFilteredData(data);
      return;
    }
    const filtered = data.filter(item => {
      const searchStr = `${item.nombre_iglesia} ${item.pastor_nombre} ${item.pastor_apellido} ${item.zona}`.toLowerCase();
      return searchStr.includes(text.toLowerCase());
    });
    setFilteredData(filtered);
  };

  const makeCall = (phoneNumber) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const openMap = (lat, lon, label) => {
    if (!lat || !lon) return;
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lon}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.churchInfo}>
          <Text style={styles.churchName}>{item.nombre_iglesia}</Text>
          <Text style={styles.zoneLabel}>Zona {item.zona}</Text>
        </View>
        {(item.latitud && item.longitud) && (
          <TouchableOpacity 
            style={styles.mapBtn} 
            onPress={() => openMap(item.latitud, item.longitud, item.nombre_iglesia)}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={24} color="#1A237E" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.contentRow}>
        <MaterialCommunityIcons name="account-tie" size={20} color="#555" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          {item.pastor_nombre ? item.pastor_nombre.split(', ').map((name, idx) => (
            <Text key={idx} style={styles.pastorName}>{name}</Text>
          )) : (
            <Text style={styles.pastorName}>Sin pastor asignado</Text>
          )}
        </View>
      </View>

      <View style={styles.contentRow}>
        <MaterialCommunityIcons name="map-marker" size={20} color="#555" />
        <Text style={styles.addressText} numberOfLines={2}>{item.direccion || "Sin dirección registrada"}</Text>
      </View>

      {item.pastor_telefono && item.pastor_telefono.split(' / ').map((tel, idx) => (
        <TouchableOpacity key={idx} style={styles.phoneBtn} onPress={() => makeCall(tel.trim())}>
          <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
          <Text style={styles.phoneText}>{tel.trim()}</Text>
          <Text style={styles.callNow}>Llamar</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={24} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar iglesia, pastor o zona..."
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id_iglesia.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron resultados.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    margin: 15, 
    paddingHorizontal: 15, 
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { padding: 15, paddingBottom: 30 },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  churchInfo: { flex: 1 },
  churchName: { fontSize: 18, fontWeight: 'bold', color: '#1A237E' },
  zoneLabel: { fontSize: 12, color: '#666', marginTop: 2 },
  mapBtn: { padding: 8, backgroundColor: '#E8EAF6', borderRadius: 10 },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  contentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  pastorName: { fontSize: 15, color: '#333', fontWeight: '500' },
  addressText: { marginLeft: 10, fontSize: 14, color: '#666', flex: 1 },
  phoneBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2E7D32', 
    padding: 12, 
    borderRadius: 10,
    marginTop: 5,
  },
  phoneText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10, fontSize: 16, flex: 1 },
  callNow: { color: '#FFF', fontSize: 12, opacity: 0.9, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 16 },
});

export default DirectoryScreen;
