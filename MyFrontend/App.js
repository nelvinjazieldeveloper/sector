import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

// Pantallas
import ListScreen from './screens/ListScreen';
import EditScreen from './screens/EditScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import HomeSecretaria from './screens/HomeSecretaria';
import HomeTesoreria from './screens/HomeTesoreria';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 1. Stack de Secretaría (Mantiene el historial dentro de la pestaña)
function SecretariaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: '#1A237E' }}>
      <Stack.Screen name="HomeSecretaria" component={HomeSecretaria} options={{ title: 'Secretaría' }} />
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="Edit" component={EditScreen} />
    </Stack.Navigator>
  );
}

// 2. Stack de Tesorería
function TesoreriaStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: '#1A237E' }}>
      <Stack.Screen name="HomeTesoreria" component={HomeTesoreria} options={{ title: 'Tesorería' }} />
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} />
    </Stack.Navigator>
  );
}

// 3. Navegador Inferior Global
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // Ocultamos el header del Tab para usar el del Stack
          tabBarActiveTintColor: '#1A237E',
          tabBarInactiveTintColor: '#6C757D',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tab.Screen 
          name="SecretariaTab" 
          component={SecretariaStack} 
          options={{ 
            tabBarLabel: 'Secretaría',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📁</Text> 
          }} 
        />
        <Tab.Screen 
          name="TesoreriaTab" 
          component={TesoreriaStack} 
          options={{ 
            tabBarLabel: 'Tesorería',
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💰</Text> 
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  }
});