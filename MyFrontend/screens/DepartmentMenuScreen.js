import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen, { MenuButton } from './home/HomeScreen';

export default function DepartmentMenuScreen({ route, navigation, user }) {
  const { department, title, color } = route.params;
  const userRol = user?.rol?.toLowerCase();
  const isAdmin = userRol === 'admin';
  const isManager = isAdmin || userRol === 'presbitero' || userRol === 'secretario';
  const isTesorero = userRol === 'tesorero';
  const isSectorStaff = isManager || isTesorero;

  const extraParams = !isSectorStaff && user?.id_pastor ? { id_pastor: user.id_pastor } : {};

  return (
    <LinearGradient colors={['#1A237E', '#3949AB']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name={department === 'Secretaría' ? 'folder-account' : 'cash-register'} 
            size={60} 
            color="#FFD700" 
          />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Módulos Administrativos</Text>
        </View>

        <View style={styles.menuContainer}>
          {department === 'Secretaría' && (
            <>
              {isManager && (
                <>
                  <MenuButton 
                    index={0} title="Pastores" subtitle="Gestión ministerial" color="#2E7D32" 
                    onPress={() => navigation.navigate('Pastores', { path: 'pastores', title: 'Pastores', user_rol: user.rol, ...extraParams })} 
                  />
                </>
              )}
              <MenuButton 
                index={3} title="Reuniones" subtitle="Agenda sectorial" color="#6A1B9A" 
                onPress={() => navigation.navigate('Reuniones', { path: 'reuniones', title: 'Reuniones', user_rol: user.rol })} 
              />
            </>
          )}

          {department === 'Tesorería' && (
            <>
              <MenuButton 
                index={0} title="Reportes" subtitle="Finanzas y estadísticas" color="#D4AF37" 
                onPress={() => navigation.navigate('Reportes', { path: 'reporte', title: 'Reportes', user_rol: user.rol, ...extraParams })} 
              />
              {/* Espacio para futuros módulos de tesorería */}
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#BBDEFB', opacity: 0.8 },
  menuContainer: { width: '100%' }
});
