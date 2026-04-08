import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../config';

export default function GlobalMapScreen({ navigation }) {
  const [churches, setChurches] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const webViewRef = useRef(null);

  useEffect(() => {
    (async () => {
      // 1. Pedir permisos de ubicación
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la ubicación para encontrar la iglesia más cercana.');
      } else {
        let location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);
      }

      // 2. Cargar todas las iglesias
      try {
        const response = await fetch(`${config.API_URL}/iglesias/`);
        const data = await response.json();
        setChurches(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading churches:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const findNearest = () => {
    if (!userLocation || churches.length === 0) return;

    let nearest = null;
    let minDistance = Infinity;

    churches.forEach(iglesia => {
      if (iglesia.latitud && iglesia.longitud) {
        const dist = calculateDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          parseFloat(iglesia.latitud), 
          parseFloat(iglesia.longitud)
        );
        if (dist < minDistance) {
          minDistance = dist;
          nearest = iglesia;
        }
      }
    });

    if (nearest) {
      Alert.alert(
        'Iglesia más cercana',
        `${nearest.nombre_iglesia} está a ${minDistance.toFixed(2)} km de ti.`,
        [
          { text: 'Ver en Mapa', onPress: () => centerOn(nearest) },
          { text: 'Ir ahora', onPress: () => openNavigation(nearest) },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const centerOn = (iglesia) => {
    const script = `window.centerOn(${iglesia.latitud}, ${iglesia.longitud}, "${iglesia.nombre_iglesia}");`;
    webViewRef.current.injectJavaScript(script);
  };

  const openNavigation = (iglesia) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${iglesia.latitud},${iglesia.longitud}`,
      android: `geo:0,0?q=${iglesia.latitud},${iglesia.longitud}(${iglesia.nombre_iglesia})`,
    });
    Linking.openURL(url);
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
          .custom-popup .leaflet-popup-content-wrapper { border-radius: 8px; padding: 5px; }
          .btn-nav { 
            background: #1A237E; color: white; border: none; padding: 8px 12px; 
            border-radius: 5px; cursor: pointer; margin-top: 10px; width: 100%; font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { tap: false, zoomControl: false }).setView([9.3700, -70.4400], 10);
          L.control.zoom({ position: 'bottomright' }).addTo(map);

          L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Maps'
          }).addTo(map);

          var churches = ${JSON.stringify(churches)};
          var userLoc = ${JSON.stringify(userLocation)};

          // Iconos
          var churchIcon = L.icon({
            iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
            iconSize: [35, 35],
            iconAnchor: [17, 34],
            popupAnchor: [0, -30]
          });

          var userIcon = L.icon({
            iconUrl: 'https://cdn4.iconfinder.com/data/icons/miu/24/editor-location-pin-map-gps-user-view-512.png',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          });

          // Marcador de usuario
          if (userLoc) {
            L.marker([userLoc.latitude, userLoc.longitude], { icon: userIcon }).addTo(map).bindPopup("<b>Tu ubicación</b>");
          }

          // Marcadores de iglesias
          churches.forEach(function(iglesia) {
            if (iglesia.latitud && iglesia.longitud) {
              var m = L.marker([iglesia.latitud, iglesia.longitud], { icon: churchIcon }).addTo(map);
              
              var popupContent = '<div>' +
                '<h3 style="margin:0">' + iglesia.nombre_iglesia + '</h3>' +
                '<p style="margin:5px 0">' + iglesia.direccion + '</p>' +
                '<button class="btn-nav" onclick="window.ReactNativeWebView.postMessage(JSON.stringify({type: \\'nav\\', lat: ' + iglesia.latitud + ', lng: ' + iglesia.longitud + ', name: \\'' + iglesia.nombre_iglesia + '\\'}))">Cómo llegar</button>' +
              '</div>';
              
              m.bindPopup(popupContent, { className: 'custom-popup' });
            }
          });

          window.centerOn = function(lat, lng, name) {
            map.flyTo([lat, lng], 16);
            // Abrir el popup correspondiente
            // (Podríamos guardar una referencia a los markers, pero por ahora solo centramos)
          };

          window.addEventListener('message', function(event) {
            // Manejar mensajes si fuera necesario
          });
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'nav') {
      openNavigation({ latitud: data.lat, longitud: data.lng, nombre_iglesia: data.name });
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1A237E" />
          <Text style={styles.loaderText}>Cargando mapa e iglesias...</Text>
        </View>
      ) : (
        <>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            onMessage={handleMessage}
            style={styles.map}
            javaScriptEnabled={true}
          />
          
          <TouchableOpacity style={styles.fabNearest} onPress={findNearest}>
            <MaterialCommunityIcons name="map-marker-check" size={24} color="#FFF" />
            <Text style={styles.fabText}>Más cercana</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A237E" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10, color: '#1A237E', fontWeight: 'bold' },
  btnBack: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width:0, height:2 },
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  fabNearest: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#1A237E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width:0, height:4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  fabText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
});
