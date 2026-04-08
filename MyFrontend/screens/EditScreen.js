import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import FreeMap from "../components/FreeMap";
import config from "../config";

export default function EditScreen({ route, navigation }) {
  const { path, item, readOnly } = route.params;
  const [formData, setFormData] = useState(item || {});
  const [loading, setLoading] = useState(false);

  // Determinar la llave primaria según el path
  const primaryKey =
    path === "pastores"
      ? "id_pastor"
      : path === "reporte"
        ? "id_reporte"
        : path === "hijos"
          ? "id_hijo"
          : path === "iglesias"
            ? "id_iglesia"
            : path === "usuarios"
              ? "id_usuario"
              : path === "reuniones"
                ? "id_reunion"
                : "id";

  const handleSave = async () => {
    // 1. Validación básica antes de enviar
    if (!formData || Object.keys(formData).length === 0) {
      Alert.alert("Error", "No hay datos para guardar");
      return;
    }

    setLoading(true);

    // 2. Determinar si es Edición (PUT) o Nuevo (POST)
    const isEditing = item && item[primaryKey];
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${config.API_URL}/${path}/?id=${item[primaryKey]}` : `${config.API_URL}/${path}/`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData), // Enviamos todo el objeto formData
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Éxito", "Registro procesado correctamente");
        navigation.goBack();
      } else {
        // Aquí capturamos el error "ID y datos requeridos" que envía tu PHP
        Alert.alert("Error del Servidor", result.error || "Datos incompletos");
      }
    } catch (error) {
      console.error("Error en handleSave:", error);
      Alert.alert(
        "Error de Conexión",
        "Asegúrate de que XAMPP esté corriendo y la URL sea correcta.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, key, keyboard = "default") => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, readOnly && styles.inputReadOnly]}
        value={formData[key]?.toString()}
        onChangeText={(text) => !readOnly && setFormData({ ...formData, [key]: text })}
        keyboardType={keyboard}
        editable={!readOnly}
      />
    </View>
  );

  const renderSwitch = (label, key) => (
    <TouchableOpacity
      style={styles.switchRow}
      onPress={() =>
        !readOnly && setFormData({ ...formData, [key]: formData[key] === 1 ? 0 : 1 })
      }
      disabled={readOnly}
    >
      <View style={[styles.checkbox, formData[key] === 1 && styles.checked, readOnly && styles.checkboxReadOnly]} />
      <Text style={styles.switchLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>
        {readOnly ? "Detalles del" : item[primaryKey] ? "Editar" : "Nuevo"} Registro
      </Text>

      {path === "pastores" && (
        <>
          {renderInput("Nombre", "nombre")}
          {renderInput("Apellido", "apellido")}
          {renderInput("Cédula", "cedula", "numeric")}
          {renderInput("Zona", "zona")}
        </>
      )}

      {path === "iglesias" && (
        <>
          {renderInput("Nombre de la Iglesia", "nombre_iglesia")}
          {renderInput("Dirección", "direccion")}
          {renderInput("Cantidad de Miembros", "cantidad_miembros", "numeric")}
          {renderInput("Zona", "zona")}
          <View style={styles.infraBox}>
            <Text style={styles.infraTitle}>Infraestructura Propia</Text>
            {renderSwitch("¿Tiene Terreno Propio?", "tiene_terreno")}
            {renderSwitch("¿Tiene Casa Pastoral?", "tiene_casa_pastoral")}
          </View>
          <View style={styles.infraBox}>
            <Text style={styles.infraTitle}>Ubicación Satelital (Mapa)</Text>
            {!readOnly && (
              <Text style={{ fontSize: 13, color: '#666', marginBottom: 10 }}>Mantén presionado y arrastra el marcador rojo para establecer la ubicación exacta.</Text>
            )}
            <View style={{ height: 250, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#DDD' }}>
              <FreeMap
                latitud={formData.latitud}
                longitud={formData.longitud}
                onLocationChange={(coords) => {
                  setFormData({ ...formData, latitud: coords.latitude.toString(), longitud: coords.longitude.toString() });
                }}
              />
            </View>
          </View>
        </>
      )}

      {path === "reuniones" && (
        <>
          {renderInput("Título", "titulo")}
          {renderInput("Fecha (AAAA-MM-DD)", "fecha")}
          {renderInput("Lugar", "lugar")}
          {renderInput("Descripción", "descripcion")}
        </>
      )}

      {path === "hijos" && (
        <>
          {renderInput("Nombre", "nombre")}
          {renderInput("Apellido", "apellido")}
          {renderInput("Sexo", "sexo")}
          {renderInput("Edad", "edad", "numeric")}
          {renderInput("Talentos", "talentos")}
          {renderInput("Estudios", "estudios")}
        </>
      )}

      {path === "usuarios" && (
        <>
          {renderInput("Usuario", "username")}
          {renderInput("Contraseña", "password")}
          {renderInput("Rol", "rol")}
          {renderInput("ID Pastor", "id_pastor", "numeric")}
        </>
      )}

      {!readOnly && (
        <TouchableOpacity
          style={styles.btnSave}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.btnSaveText}>
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA", padding: 20 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A237E",
    marginBottom: 20,
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", color: "#555", marginBottom: 5 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
  },
  inputReadOnly: {
    backgroundColor: "#F1F3F4",
    color: "#777",
    borderColor: "#EEE",
  },
  checkboxReadOnly: {
    opacity: 0.6,
  },
  infraBox: {
    backgroundColor: "#E8EAF6",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  infraTitle: { fontWeight: "bold", color: "#1A237E", marginBottom: 10 },
  switchRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#1A237E",
    borderRadius: 5,
    marginRight: 10,
  },
  checked: { backgroundColor: "#1A237E" },
  switchLabel: { fontSize: 15, color: "#333" },
  btnSave: {
    backgroundColor: "#1A237E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
