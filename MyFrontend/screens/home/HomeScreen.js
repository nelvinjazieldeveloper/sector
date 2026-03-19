import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../../config';

const MenuButton = ({ title, onPress, subtitle, color = '#1A237E', index = 0 }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay: index * 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={{ 
      opacity: fadeAnim, 
      transform: [{ translateY: slideAnim }, { scale: scaleAnim }] 
    }}>
      <TouchableOpacity 
        style={[styles.card, { borderLeftColor: color, borderLeftWidth: 6 }]} 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color }]}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Text style={[styles.arrow, { color }]}>→</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

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
    <LinearGradient
      colors={['#1A237E', '#3949AB', '#5C6BC0']}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={[{ flexGrow: 1 }, styles.container]}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} />
          </View>
          <View>
            <Text style={styles.welcome}>Bienvenido,</Text>
            <Text style={styles.title}>Efecto Esdras</Text>
          </View>
        </View>
      </View>

        {error && <Text style={styles.errorText}>Error de conexión: {error}</Text>}

        <View style={styles.menuGrid}>
          <MenuButton 
            index={0}
            title="Pastores" 
            subtitle="Gestión ministerial" 
            color="#2E7D32" 
            onPress={() => navigation.navigate('Pastores', { path: 'pastores', title: 'Pastores' })} 
          />
          <MenuButton 
            index={1}
            title="Iglesias" 
            subtitle="Sedes y membresía" 
            color="#1A237E" 
            onPress={() => navigation.navigate('Iglesias', { path: 'iglesias', title: 'Iglesias' })} 
          />
          <MenuButton 
            index={2}
            title="Hijos" 
            subtitle="Registro familiar" 
            color="#C62828" 
            onPress={() => navigation.navigate('Hijos', { path: 'hijos', title: 'Hijos' })} 
          />
          <MenuButton 
            index={3}
            title="Reportes" 
            subtitle="Finanzas y estadísticas" 
            color="#D4AF37" 
            onPress={() => navigation.navigate('Reportes', { path: 'reporte', title: 'Reportes' })} 
          />
          <MenuButton 
            index={4}
            title="Reuniones" 
            subtitle="Agenda sectorial" 
            color="#6A1B9A" 
            onPress={() => navigation.navigate('Reuniones', { path: 'reuniones', title: 'Reuniones' })} 
          />
        </View>
    </ScrollView>
  </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { marginBottom: 30, marginTop: 40 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center' },
  logoContainer: { 
    backgroundColor: '#FFF', 
    borderRadius: 50, 
    marginRight: 15,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Asegura que el logo no se salga del círculo
  },
  logo: { width: '100%', height: '100%', resizeMode: 'cover' },
  welcome: { fontSize: 16, color: '#E8EAF6', fontWeight: '500', opacity: 0.9 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  menuGrid: { gap: 15, paddingBottom: 40 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 15,
    padding: 22,
    marginBottom: 15,
    elevation: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#555', fontWeight: '500' },
  arrow: { fontSize: 22, fontWeight: 'bold' },
  errorText: { color: '#FFEBEE', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' }
});

// Final del archivo - Cerramos ScrollView y LinearGradient
export const Footer = () => (
  <View style={{ height: 40 }} />
);