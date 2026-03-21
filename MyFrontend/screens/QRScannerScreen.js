import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import config from '../config';

export default function QRScannerScreen({ route, navigation }) {
  const { meeting } = route.params;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FFD700" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para usar la cámara</Text>
        <Button onPress={requestPermission} title="Dar permiso" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);

    try {
      // 1. Parsear JSON del QR
      console.log("QR Data:", data);
      const pastorData = JSON.parse(data);
      const { number_cedula } = pastorData;

      if (!number_cedula) {
        throw new Error("El QR no contiene una cédula válida");
      }

      // 2. Buscar pastor por cédula
      const pastorRes = await fetch(`${config.API_URL}/pastores/?cedula=${number_cedula}`);
      const pastor = await pastorRes.json();

      if (!pastor || !pastor.id_pastor) {
        throw new Error(`Pastor con cédula ${number_cedula} no encontrado en el sistema`);
      }

      // 3. Registrar asistencia
      const attendanceRes = await fetch(`${config.API_URL}/asistencias/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_reunion: meeting.id_reunion,
          id_pastor: pastor.id_pastor,
          motivo: 'Escaneado vía QR',
          justificada: 0
        })
      });

      const attendanceResJson = await attendanceRes.json();

      if (attendanceRes.ok) {
        Alert.alert(
          "Asistencia Registrada",
          `Pastor: ${pastor.apellido}, ${pastor.nombre}\nCédula: ${number_cedula}`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        // Podría ser que ya esté registrado
        if (attendanceResJson.error && attendanceResJson.error.includes("Duplicate entry")) {
             Alert.alert("Aviso", "Este pastor ya tiene asistencia registrada para esta reunión.", 
             [{ text: "OK", onPress: () => setScanned(false) }]);
        } else {
            throw new Error(attendanceResJson.error || "No se pudo registrar la asistencia");
        }
      }

    } catch (err) {
      console.error("QR Error:", err);
      Alert.alert("Error de Escaneo", err.message || "Formato de QR no válido", [
        { text: "Reintentar", onPress: () => setScanned(false) }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View style={styles.overlay}>
         <View style={styles.scanTarget} />
         <Text style={styles.instruction}>Escanea el QR de la licencia del pastor</Text>
         {loading && <ActivityIndicator size="large" color="#FFD700" style={{marginTop: 20}} />}
         <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>Cancelar</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#000'
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#FFF'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'transparent',
    borderRadius: 20
  },
  instruction: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 40
  },
  cancelButton: {
    marginTop: 50,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10
  },
  cancelText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
