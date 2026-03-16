import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import config from '../config';

const MenuButton = ({ title, onPress, subtitle }) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.arrow}>→</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const [pathInfo, setPathInfo] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch(`${config.API_URL}/path/`)
      .then(res => res.json())
      .then(json => setPathInfo(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Bienvenido,</Text>
          <Text style={styles.title}>Sector Nor Occidente 1</Text>
        </View>

        {error && <Text style={styles.errorText}>Error de conexión: {error}</Text>}

        <View style={styles.menuGrid}>
          <MenuButton title="Pastores" subtitle="Gestión ministerial" onPress={() => navigation.navigate('Pastores')} />
          <MenuButton title="Iglesias" subtitle="Sedes y membresía" onPress={() => navigation.navigate('Iglesias')} />
          <MenuButton title="Hijos" subtitle="Registro familiar" onPress={() => navigation.navigate('Hijos')} />
          <MenuButton title="Reportes" subtitle="Finanzas y estadísticas" onPress={() => navigation.navigate('Reportes')} />
          <MenuButton title="Reuniones" subtitle="Agenda sectorial" onPress={() => navigation.navigate('Reuniones')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { marginBottom: 30, marginTop: 20 },
  welcome: { fontSize: 16, color: '#6C757D', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A237E' },
  menuGrid: { gap: 15 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardSubtitle: { fontSize: 14, color: '#888', marginTop: 2 },
  arrow: { fontSize: 20, color: '#1A237E', fontWeight: 'bold' },
  errorText: { color: '#D32F2F', textAlign: 'center', marginBottom: 10 }
});