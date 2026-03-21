import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../../config';

export const MenuButton = ({ title, onPress, subtitle, color = '#1A237E', index = 0 }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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

export default function HomeScreen({ navigation, user }) {
  const [pathInfo, setPathInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${config.API_URL}/path/`)
      .then(res => res.json())
      .then(json => setPathInfo(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const userRol = user?.rol?.toLowerCase();
  const isAdmin = userRol === 'admin';
  const isManager = isAdmin || userRol === 'presbitero' || userRol === 'secretario';
  const isTesorero = userRol === 'tesorero';
  const isSectorStaff = isManager || isTesorero; // Roles que ven datos globales
  
  // LOG PARA DEPURACIÓN (Verificar en consola de Expo si id_pastor existe)
  // console.log("Session User:", userRol, user?.id_pastor);

  const extraParams = !isSectorStaff && user?.id_pastor ? { id_pastor: user.id_pastor } : {};

  // Forzar que el pastor vea sus propios datos siempre
  useEffect(() => {
    if (userRol === 'pastor' && !user?.id_pastor) {
      console.warn("Advertencia: El usuario Pastor no tiene id_pastor vinculado.");
    }
  }, [user]);

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
            <Text style={styles.welcome}>Hola, {user?.nombre || user?.username}</Text>
            <Text style={styles.title}>{user?.rol || 'Usuario'}</Text>
          </View>
        </View>
      </View>

        {error && <Text style={styles.errorText}>Error de conexión: {error}</Text>}

        <View style={styles.menuGrid}>
          {/* SECCIÓN SECRETARÍA */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Secretaría</Text>
          </View>
          
          {isManager && (
            <>
              <MenuButton 
                index={0}
                title="Pastores" subtitle="Gestión ministerial" color="#2E7D32" 
                onPress={() => navigation.navigate('Pastores', { path: 'pastores', title: 'Pastores', user_rol: user.rol, ...extraParams })} 
              />
              <MenuButton 
                index={1}
                title="Iglesias" subtitle="Sedes y membresía" color="#1A237E" 
                onPress={() => navigation.navigate('Iglesias', { path: 'iglesias', title: 'Iglesias', user_rol: user.rol, ...extraParams })} 
              />
              <MenuButton 
                index={2}
                title="Hijos" subtitle="Registro familiar" color="#C62828" 
                onPress={() => navigation.navigate('Hijos', { path: 'hijos', title: 'Hijos', user_rol: user.rol, ...extraParams })} 
              />
            </>
          )}
          
          {/* Reuniones es Operativo para todos */}
          <MenuButton 
            index={3}
            title="Reuniones" subtitle="Agenda sectorial" color="#6A1B9A" 
            onPress={() => navigation.navigate('Reuniones', { path: 'reuniones', title: 'Reuniones', user_rol: user.rol })} 
          />

          {/* SECCIÓN TESORERÍA */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tesorería</Text>
          </View>
          <MenuButton 
            index={4}
            title="Reportes" subtitle="Finanzas y estadísticas" color="#D4AF37" 
            onPress={() => navigation.navigate('Reportes', { path: 'reporte', title: 'Reportes', user_rol: user.rol, ...extraParams })} 
          />

          {/* Administración (SOLO ADMIN) */}
          {isAdmin && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Administración</Text>
              </View>
              <MenuButton 
                index={5}
                title="Usuarios" subtitle="Roles y Permisos" color="#000000" 
                onPress={() => navigation.navigate('List', { path: 'usuarios', title: 'Gestión de Usuarios', user_rol: user.rol })} 
              />
            </>
          )}
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
  errorText: { color: '#FFEBEE', textAlign: 'center', marginBottom: 10, fontWeight: 'bold' },
  sectionHeader: { 
    width: '100%', 
    paddingHorizontal: 10, 
    marginTop: 25, 
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    paddingBottom: 5
  },
  sectionTitle: { 
    color: '#FFD700', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    letterSpacing: 2 
  },
});

// Final del archivo - Cerramos ScrollView y LinearGradient
export const Footer = () => (
  <View style={{ height: 40 }} />
);