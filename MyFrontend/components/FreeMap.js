import React, { useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const FreeMap = ({ latitud, longitud, onLocationChange }) => {
  const webViewRef = useRef(null);

  const parsedLat = parseFloat(latitud);
  const parsedLng = parseFloat(longitud);
  const initialLat = !isNaN(parsedLat) ? parsedLat : 9.3700;
  const initialLng = !isNaN(parsedLng) ? parsedLng : -70.4400;

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
          var map = L.map('map', { tap: false }).setView([${initialLat}, ${initialLng}], 15);
          
          // Usamos capas de Google Maps para mayor detalle callejero
          L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            attribution: 'Google Maps'
          }).addTo(map);

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
});

export default FreeMap;
