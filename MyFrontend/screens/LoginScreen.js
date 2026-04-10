import * as Font from 'expo-font';
import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/usuarios/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar sesión
        await AsyncStorage.setItem('user_session', JSON.stringify(data.user));
        if (onLoginSuccess) {
           onLoginSuccess(data.user);
        }
      } else {
        Alert.alert("Error de Acceso", data.error || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error("Login Error:", err);
      Alert.alert("Error de Red", "No se pudo conectar con el servidor. Verifica tu conexión e IP.");
    } finally {
      setLoading(false);
    }
  };
      const [fontsLoaded, setFontsLoaded] = useState(false);
    useEffect(() => {
  async function loadFonts() {
    await Font.loadAsync({
      // "Apodo" que tú inventas : Ruta real del archivo
        'titulo': require('../assets/fonts/Boldonse/Boldonse-Regular.ttf'),   });
    
    // Una vez que termina de cargar, cambiamos el estado a true
    setFontsLoaded(true);
  }
  
  loadFonts();
}, []);
  return (
    <LinearGradient colors={['#FAFAFA','#EAEAFA']} style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <view style={styles.parrafo}>
          <Text style={[styles.titulo, {fontSize: 40, fontFamily: 'titulo', color: '#1A237E'}]} >EFECTO ESDRAS</Text>
          </view>
        <View style={styles.card}>
          <Text style={styles.logo}>SECTOR</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Ministerial</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario</Text>
            <TextInput 
              style={styles.input}
              placeholder="Ingresa tu usuario"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput 
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.loginBtn} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1A237E" />
            ) : (
              <Text style={styles.loginBtnText}>INICIAR SESIÓN</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.footer}>Distrito Metropolitano © 2026</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { 
    width: '85%', 
    backgroundColor: 'rgba(255,255,255,1)', 
    borderRadius: 20, 
    padding: 30, 
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10
  },
  logo: { 

    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1A237E', 
    textAlign: 'center',
    letterSpacing: 4
  },
  subtitle: { 
    fontSize: 14, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 30,
    marginTop: 5
  },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#3949AB', marginBottom: 8, textTransform: 'uppercase' },
  input: { 
    backgroundColor: '#F5F5F5', 
    borderRadius: 10, 
    padding: 12, 
    fontSize: 16, 
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  loginBtn: { 
    backgroundColor: '#FFD700', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    marginTop: 10,
    elevation: 3
  },
  loginBtnText: { color: '#1A237E', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 },
  footer: { marginTop: 30, color: '#BBDEFB', fontSize: 12, opacity: 0.8 }
});
