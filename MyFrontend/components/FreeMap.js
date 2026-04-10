import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FreeMap = ({ latitud, longitud, onLocationChange }) => {
  const webViewRef = useRef(null);

  const parsedLat = parseFloat(latitud);
  const parsedLng = parseFloat(longitud);
  const initialLat = !isNaN(parsedLat) ? parsedLat : 9.3700;
  const initialLng = !isNaN(parsedLng) ? parsedLng : -70.4400;
  const [locating, setLocating] = useState(false);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para ubicarte en el mapa.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      
      // Actualizar el mapa mediante inyección de JS
      const script = `
        var newLat = ${latitude};
        var newLng = ${longitude};
        marker.setLatLng([newLat, newLng]);
        map.setView([newLat, newLng], 17);
        reportCoords(newLat, newLng);
      `;
      webViewRef.current.injectJavaScript(script);
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
    } finally {
      setLocating(false);
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Capas de Google Maps
          var streetLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Road'
          });

          var satelliteLayer = L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Hybrid'
          });

          var map = L.map('map', { 
            tap: false, 
            layers: [streetLayer] // Capa por defecto
          }).setView([${initialLat}, ${initialLng}], 15);

          // Control de Capas
          var baseMaps = {
            "Callejero": streetLayer,
            "Satélite": satelliteLayer
          };
          L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

          var marker = L.marker([${initialLat}, ${initialLng}], {
            draggable: true
          }).addTo(map);

          // Función para reportar coordenadas a React Native
          function reportCoords(lat, lng) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              latitude: lat,
              longitude: lng
            }));
          }

          // Reportar coordenadas iniciales detectadas
          reportCoords(${initialLat}, ${initialLng});

          // Escuchar clics en el mapa para mover el marcador
          map.on('click', function(e) {
            var coords = e.latlng;
            marker.setLatLng(coords);
            reportCoords(coords.lat, coords.lng);
          });

          // Escuchar cuando se termina de arrastrar el marcador
          marker.on('dragend', function (e) {
            var coords = e.target.getLatLng();
            reportCoords(coords.lat, coords.lng);
          });

          // Ajustar mapa si cambian las coordenadas desde afuera
          window.addEventListener('message', function(event) {
            var data = JSON.parse(event.data);
            if (data.type === 'update') {
               marker.setLatLng([data.lat, data.lng]);
               map.setView([data.lat, data.lng], 15);
            }
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (onLocationChange) {
      onLocationChange(data);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        nestedScrollEnabled={true}
        overScrollMode="never"
      />
      <TouchableOpacity 
        style={styles.locationBtn} 
        onPress={useCurrentLocation}
        disabled={locating}
      >
        <MaterialCommunityIcons 
          name={locating ? "loading" : "crosshairs-gps"} 
          size={22} 
          color="#1A237E" 
        />
        <Text style={styles.locationBtnText}>
          {locating ? "Ubicando..." : "Mi ubicación actual"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  locationBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationBtnText: {
    color: '#1A237E',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 13,
  },
});

export default FreeMap;
