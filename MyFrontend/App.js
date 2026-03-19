import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Pantallas
import HomeScreen from './screens/home/HomeScreen';
import ListScreen from './screens/ListScreen';
import EditScreen from './screens/EditScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';

const Stack = createStackNavigator();

// Navegador Principal
export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerTintColor: '#1A237E' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
          <Stack.Screen name="Pastores" component={ListScreen} options={{ title: 'Pastores' }} />
          <Stack.Screen name="Iglesias" component={ListScreen} options={{ title: 'Iglesias' }} />
          <Stack.Screen name="Hijos" component={ListScreen} options={{ title: 'Hijos' }} />
          <Stack.Screen name="Reportes" component={ListScreen} options={{ title: 'Reportes' }} />
          <Stack.Screen name="Reuniones" component={ListScreen} options={{ title: 'Reuniones' }} />
          <Stack.Screen name="List" component={ListScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
          <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}