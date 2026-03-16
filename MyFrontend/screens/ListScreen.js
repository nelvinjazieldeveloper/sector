import React, { useEffect, useState } from 'react';
import { 
  View, Text, ActivityIndicator, FlatList, StyleSheet, 
  TouchableOpacity, SafeAreaView, RefreshControl, TextInput 
} from 'react-native';
import config from '../config';

export default function ListScreen({ route, navigation }) {
  const { path, title } = route.params;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/${path}/`);
      const json = await response.json();
      const list = Array.isArray(json) ? json : [];
      setData(list);
      setFilteredData(list);
    } catch (err) {
      console.error("Error fetching data:", err);
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [path]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchData();
    });
    return unsubscribe;
  }, [navigation]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text.trim()) {
      setFilteredData(data);
      return;
    }
    const query = text.toLowerCase();
    const filtered = data.filter(item => {
      const p = (item.nombre_pastor || item.apellido || item.pastor_nombre || "").toLowerCase();
      const i = (item.nombre_iglesia || item.iglesia_nombre || "").toLowerCase();
      const t = (item.titulo || "").toLowerCase();
      const n = (item.nombre || "").toLowerCase();
      return p.includes(query) || i.includes(query) || t.includes(query) || n.includes(query);
    });
    setFilteredData(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearchText('');
    fetchData();
  };

  const renderItem = ({ item }) => {
    const primaryKey = path === 'pastores' ? 'id_pastor' : 
                       path === 'reporte' ? 'id_reporte' : 
                       path === 'hijos' ? 'id_hijo' :
                       `id_${path.replace(/es$/, '').replace(/s$/, '')}`;

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => {
          if (path === 'reporte') {
            navigation.navigate('DetalleReporte', { item });
          } else {
            navigation.navigate('Edit', { path, item, origin: 'List' });
          }
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.mainLabel}>
            {path === 'reuniones' ? (item.titulo || "Sin título") : 
             item.nombre ? `${item.nombre} ${item.apellido || ''}` : 
             (item.nombre_iglesia || item.iglesia_nombre || item.titulo || 'Sin ID')}
          </Text>
          <Text style={styles.idBadge}>#{item[primaryKey]}</Text>
        </View>
        
        {path === 'reuniones' && (
          <View>
            <Text style={styles.infoText}>📅 Fecha: {item.fecha}</Text>
            <Text style={styles.infoText}>📍 Lugar: {item.lugar}</Text>
          </View>
        )}

        {path === 'reporte' && (
          <View>
            <Text style={styles.infoText}>⛪ Iglesia: <Text style={{fontWeight: 'bold'}}>{item.nombre_iglesia || item.iglesia_nombre}</Text></Text>
            <Text style={[styles.infoText, { color: '#1A237E' }]}>👤 Pastor: {item.apellido || item.nombre_pastor}</Text>
            <Text style={styles.subText}>Periodo: {item.mes_reportado}/{item.anio_reportado}</Text>
          </View>
        )}

        {path === 'iglesias' && (
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
        )}

        {path === 'pastores' && (
          <View>
            <Text style={styles.infoText}>C.I: {item.cedula}</Text>
            <Text style={styles.subText}>Zona: {item.zona || 'N/A'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.btnAdd} onPress={() => navigation.navigate('Edit', { path, item: {}, origin: 'List' })}>
          <Text style={styles.btnAddText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Buscar..." value={searchText} onChangeText={handleSearch} />
      </View>
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  btnAdd: { backgroundColor: '#E8EAF6', padding: 8, borderRadius: 8 },
  btnAddText: { color: '#1A237E', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 15, paddingBottom: 10, backgroundColor: '#FFF' },
  searchInput: { backgroundColor: '#F1F3F4', padding: 10, borderRadius: 8 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 5, marginBottom: 8 },
  mainLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  idBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 6, borderRadius: 4, color: '#1A237E', fontSize: 12 },
  infoText: { fontSize: 14, color: '#555', marginBottom: 2 },
  subText: { fontSize: 12, color: '#777' },
  badgeRow: { flexDirection: 'row', marginTop: 8, gap: 5 },
  propBadge: { backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  propText: { fontSize: 10, fontWeight: 'bold', color: '#E65100' }
});