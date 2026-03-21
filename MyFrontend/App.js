import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Pantallas
import HomeScreen from './screens/home/HomeScreen';
import ListScreen from './screens/ListScreen';
import EditScreen from './screens/EditScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import LoginScreen from './screens/LoginScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_session');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A237E' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerTintColor: '#FFF',
            headerStyle: { backgroundColor: '#1A237E' },
            headerTitleStyle: { fontWeight: 'bold' },
            headerRight: () => user ? (
              <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                <Text style={{ color: '#FFD700', fontWeight: 'bold', fontSize: 12 }}>SALIR</Text>
              </TouchableOpacity>
            ) : null
          }}
        >
          {!user ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLoginSuccess={setUser} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Home" options={{ title: 'Inicio' }}>
                {(props) => <HomeScreen {...props} user={user} />}
              </Stack.Screen>
              <Stack.Screen name="Pastores" component={ListScreen} options={{ title: 'Pastores' }} />
              <Stack.Screen name="Iglesias" component={ListScreen} options={{ title: 'Iglesias' }} />
              <Stack.Screen name="Hijos" component={ListScreen} options={{ title: 'Hijos' }} />
              <Stack.Screen name="Reportes" component={ListScreen} options={{ title: 'Reportes' }} />
              <Stack.Screen name="Reuniones" component={ListScreen} options={{ title: 'Reuniones' }} />
              <Stack.Screen name="List" component={ListScreen} />
              <Stack.Screen name="Edit" component={EditScreen} />
              <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} />
              <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Control de Asistencia' }} />
              <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}