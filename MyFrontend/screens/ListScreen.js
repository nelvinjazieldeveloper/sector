import React, { useEffect, useState } from 'react';
import { 
  View, Text, ActivityIndicator, FlatList, StyleSheet, 
  TouchableOpacity, SafeAreaView, RefreshControl, TextInput 
} from 'react-native';
import config from '../config';
import Header from '../components/common/Header';
import SearchBar from '../components/common/SearchBar';
import PastorListItem from '../components/listItems/PastorListItem';
import IglesiaListItem from '../components/listItems/IglesiaListItem';
import ReporteListItem from '../components/listItems/ReporteListItem';
import ReunionListItem from '../components/listItems/ReunionListItem';
import HijoListItem from '../components/listItems/HijoListItem';

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
    const onPress = () => {
      if (path === 'reporte') {
        navigation.navigate('DetalleReporte', { item });
      } else {
        navigation.navigate('Edit', { path, item, origin: 'List' });
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
        return <ReunionListItem item={item} onPress={onPress} />;
      case 'hijos':
        return <HijoListItem item={item} onPress={onPress} />;
      default:
        return <PastorListItem item={item} onPress={onPress} />; // fallback
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={title} onAddPress={() => navigation.navigate('Edit', { path, item: {}, origin: 'List' })} />
      <SearchBar value={searchText} onChangeText={handleSearch} />
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
});