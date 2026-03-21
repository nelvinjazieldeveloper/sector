import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, ActivityIndicator, FlatList, StyleSheet, 
  TouchableOpacity, SafeAreaView, RefreshControl, TextInput,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import PastorListItem from '../components/listItems/PastorListItem';
import IglesiaListItem from '../components/listItems/IglesiaListItem';
import ReporteListItem from '../components/listItems/ReporteListItem';
import ReunionListItem from '../components/listItems/ReunionListItem';
import HijoListItem from '../components/listItems/HijoListItem';

export default function ListScreen({ route, navigation }) {
  const { path, title, id_pastor, user_rol } = route.params;
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Determinar si el usuario tiene permiso de añadir registros
  const rol = user_rol?.toLowerCase();
  const canAdd = rol === 'admin' || rol === 'presbitero' || rol === 'secretario';

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [path]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Si el id_pastor viene en los params, lo añadimos a la URL
      const url = id_pastor 
        ? `${config.API_URL}/${path}/?id_pastor=${id_pastor}`
        : `${config.API_URL}/${path}/`;
        
      const response = await fetch(url);
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
    const onPress = () => {
      if (path === 'reporte') {
        navigation.navigate('DetalleReporte', { item });
      } else {
        // Solo permitir editar si canAdd es true (o una lógica específica de edición)
        // Por ahora, si no puede añadir, asumimos que no debe editar registros generales
        if (canAdd) {
          navigation.navigate('Edit', { path, item, origin: 'List' });
        } else {
          // Para pastores, quizás solo ver? Por ahora bloqueamos edición general
          Alert.alert("Acceso Restringido", "No tienes permisos para editar este registro.");
        }
      }
    };

    switch (path) {
      case 'pastores':
        return <PastorListItem item={item} onPress={onPress} />;
      case 'iglesias':
        return <IglesiaListItem item={item} onPress={onPress} />;
      case 'reporte':
        return <ReporteListItem item={item} onPress={onPress} />;
      case 'reuniones':
        return <ReunionListItem item={item} onPress={onPress} user_rol={rol} />;
      case 'hijos':
        return <HijoListItem item={item} onPress={onPress} />;
      default:
        return <PastorListItem item={item} onPress={onPress} />; // fallback
    }
  };

  return (
    <LinearGradient colors={['#1A237E', '#3949AB']} style={styles.container}>
      <Header 
        title={title} 
        onAddPress={() => navigation.navigate('Edit', { path, item: {}, origin: 'List' })} 
        hideAdd={!canAdd}
      />
      <SearchBar value={searchText} onChangeText={handleSearch} />
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#FFD700" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15, paddingBottom: 50 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFF" />}
          />
        )}
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
});