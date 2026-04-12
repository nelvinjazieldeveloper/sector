import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interceptor de Red para ver peticiones en consola (SOLO EN DESARROLLO)
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (...args) => {
    const [url, config] = args;
    const method = config?.method || 'GET';
    const startTime = Date.now();
    
    console.log(`%c[FETCH START] ${method} %c${url}`, 'color: #2196F3; font-weight: bold', 'color: #333');
    if (config?.body) console.log('Body:', config.body);

    try {
      const response = await originalFetch(...args);
      const duration = Date.now() - startTime;
      const clone = response.clone();
      const text = await clone.text();
      
      let data;
      try { data = JSON.parse(text); } catch (e) { data = text; }

      const statusColor = response.ok ? '#4CAF50' : '#F44336';
      console.log(`%c[FETCH END] ${response.status} %c${url} (${duration}ms)`, `color: ${statusColor}; font-weight: bold`, 'color: #333');
      console.log('Response:', data);
      
      return response;
    } catch (error) {
      console.log(`%c[FETCH ERROR] ${url}`, 'color: #F44336; font-weight: bold', error);
      throw error;
    }
  };
}

// Pantallas
import HomeScreen from './screens/home/HomeScreen';
import ListScreen from './screens/ListScreen';
import EditScreen from './screens/EditScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import AttendanceScreen from './screens/AttendanceScreen';
import QRScannerScreen from './screens/QRScannerScreen';
import LoginScreen from './screens/LoginScreen';
import DepartmentMenuScreen from './screens/DepartmentMenuScreen';
import GlobalMapScreen from './screens/GlobalMapScreen';
import DetailScreen from './screens/DetailScreen';
import DirectoryScreen from './screens/DirectoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Stack compartido para que el Tab Bar sea global en estas pantallas
function SharedStack({ user, handleLogout }) {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerTintColor: '#FFF',
        headerStyle: { backgroundColor: '#2dabff' },
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 12 }}>SALIR</Text>
          </TouchableOpacity>
        )
      }}
    >
      <Stack.Screen name="Home" options={{ title: 'Inicio' }}>
        {(props) => <HomeScreen {...props} user={user} />}
      </Stack.Screen>
      <Stack.Screen name="Pastores" component={ListScreen} options={{ title: 'Pastores' }} />
      <Stack.Screen name="Iglesias" component={ListScreen} options={{ title: 'Iglesias' }} />
      <Stack.Screen name="Hijos" component={ListScreen} options={{ title: 'Hijos' }} />
      <Stack.Screen name="Reportes" component={ListScreen} options={{ title: 'Reportes' }} />
      <Stack.Screen name="Reuniones" component={ListScreen} options={{ title: 'Reuniones' }} />
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen name="Edit" component={EditScreen} options={{ title: 'Editar Registro' }} />
      <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} options={{ title: 'Detalle de Reporte' }} />
      <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Control de Asistencia' }} />
      <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GlobalMap" component={GlobalMapScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalles' }} />
      <Stack.Screen name="Directorio" component={DirectoryScreen} options={{ title: 'Directorio de Iglesias' }} />
    </Stack.Navigator>
  );
}

// Stacks específicos para los Tabs (para que cada uno tenga su raíz)
const SecretariaStack = ({ user, handleLogout }) => (
  <Stack.Navigator 
    screenOptions={{ 
      headerStyle: { backgroundColor: '#2dabff' }, 
      headerTintColor: '#FFF',
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <Text style={{ color: '#ffffffff', fontWeight: 'bold', fontSize: 12 }}>SALIR</Text>
        </TouchableOpacity>
      )
    }}
  >
    <Stack.Screen 
      name="SecretariaMenu" 
      options={{ title: 'Secretaría' }}
    >
      {props => <DepartmentMenuScreen {...props} user={user} route={{...props.route, params: { department: 'Secretaría', title: 'Secretaría' }}} />}
    </Stack.Screen>
    <Stack.Screen name="Pastores" component={ListScreen} options={{ title: 'Pastores' }} />
    <Stack.Screen name="Iglesias" component={ListScreen} options={{ title: 'Iglesias' }} />
    <Stack.Screen name="Hijos" component={ListScreen} options={{ title: 'Hijos' }} />
    <Stack.Screen name="Reuniones" component={ListScreen} options={{ title: 'Reuniones' }} />
    <Stack.Screen name="List" component={ListScreen} />
    <Stack.Screen name="Edit" component={EditScreen} options={{ title: 'Editar Registro' }} />
    <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} options={{ title: 'Detalle de Reporte' }} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Control de Asistencia' }} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalles' }} />
    <Stack.Screen name="Directorio" component={DirectoryScreen} options={{ title: 'Directorio de Iglesias' }} />
  </Stack.Navigator>
);

const TesoreriaStack = ({ user, handleLogout }) => (
  <Stack.Navigator 
    screenOptions={{ 
      headerStyle: { backgroundColor: '#2dabff' }, 
      headerTintColor: '#FFF',
      headerRight: () => (
        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
          <Text style={{ color: '#ffffffff', fontWeight: 'bold', fontSize: 12 }}>SALIR</Text>
        </TouchableOpacity>
      )
    }}
  >
    <Stack.Screen 
      name="TesoreriaMenu" 
      options={{ title: 'Tesorería' }}
    >
      {props => <DepartmentMenuScreen {...props} user={user} route={{...props.route, params: { department: 'Tesorería', title: 'Tesorería' }}} />}
    </Stack.Screen>
    <Stack.Screen name="Reportes" component={ListScreen} options={{ title: 'Reportes' }} />
    <Stack.Screen name="DetalleReporte" component={ReportDetailScreen} options={{ title: 'Detalle de Reporte' }} />
    <Stack.Screen name="List" component={ListScreen} />
    <Stack.Screen name="Edit" component={EditScreen} options={{ title: 'Editar Registro' }} />
    <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Control de Asistencia' }} />
    <Stack.Screen name="QRScanner" component={QRScannerScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Detail" component={DetailScreen} options={{ title: 'Detalles' }} />
  </Stack.Navigator>
);

function MainTabs({ user, onLogout }) {
  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home-variant';
          else if (route.name === 'Secretaría') iconName = 'folder-account';
          else if (route.name === 'Tesorería') iconName = 'cash-register';
          else if (route.name === 'Admin') iconName = 'shield-account';
          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000b0',
        tabBarInactiveTintColor: '#ffffff',
        tabBarStyle: { 
          backgroundColor: '#2dabff', 
          borderTopWidth: 0, 
          height: 95, 
          paddingBottom: 35,
          paddingTop: 10 
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold', marginBottom: 0 },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Inicio">
        {props => <SharedStack {...props} user={user} handleLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Secretaría">
        {props => <SecretariaStack {...props} user={user} handleLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen name="Tesorería">
        {props => <TesoreriaStack {...props} user={user} handleLogout={onLogout} />}
      </Tab.Screen>
      {isAdmin && (
        <Tab.Screen name="Admin">
          {props => (
            <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#2dabff' }, headerTintColor: '#FFF' }}>
              <Stack.Screen name="AdminList" component={ListScreen} initialParams={{ path: 'usuarios', title: 'Usuarios', user_rol: user.rol }} options={{ title: 'Gestión de Usuarios' }} />
            </Stack.Navigator>
          )}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
}

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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2dabff' }}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLoginSuccess={setUser} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Main">
              {(props) => <MainTabs {...props} user={user} onLogout={handleLogout} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}