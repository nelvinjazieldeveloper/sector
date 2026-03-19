import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import config from "../config";

export default function EditScreen({ route, navigation }) {
  const { path, item } = route.params;
  const [formData, setFormData] = useState(item || {});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // 1. Validación básica antes de enviar
    if (!formData || Object.keys(formData).length === 0) {
      Alert.alert("Error", "No hay datos para guardar");
      return;
    }

    setLoading(true);

    // 2. Determinar la llave primaria según el path
    const primaryKey =
      path === "pastores"
        ? "id_pastor"
        : path === "reporte"
          ? "id_reporte"
          : path === "hijos"
            ? "id_hijo"
            : path === "iglesias"
              ? "id_iglesia"
              : "id";

    // 3. Determinar si es Edición (PUT) o Nuevo (POST)
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
        style={styles.input}
        value={formData[key]?.toString()}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        keyboardType={keyboard}
      />
    </View>
  );

  const renderSwitch = (label, key) => (
    <TouchableOpacity
      style={styles.switchRow}
      onPress={() =>
        setFormData({ ...formData, [key]: formData[key] === 1 ? 0 : 1 })
      }
    >
      <View style={[styles.checkbox, formData[key] === 1 && styles.checked]} />
      <Text style={styles.switchLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: "#F8F9FA" }} 
      contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
      scrollEnabled={true}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.headerTitle}>
        {item.id ? "Editar" : "Nuevo"} Registro
      </Text>

      {path === "pastores" && (
        <>
          {renderInput("Nombre", "nombre")}
          {renderInput("Apellido", "apellido")}
          {renderInput("Cédula", "cedula", "numeric")}
          {renderInput("Edad", "edad", "numeric")}
          {renderInput("Esposa", "esposa")}
          {renderInput("Cantidad de Hijos", "hijos", "numeric")}
          {renderInput("Años de Ministerio", "anos_ministerio", "numeric")}
          {renderInput("Tipo Licencia", "tipo_licencia")}
          {renderInput("Cargo", "cargo")}
          {renderInput("ID de Iglesia", "id_iglesia", "numeric")}
          {renderInput("Zona", "zona", "numeric")}
          <View style={styles.infraBox}>
            {renderSwitch("Pastor Activo", "estatus_activo")}
          </View>
        </>
      )}

      {path === "iglesias" && (
        <>
          {renderInput("Nombre de la Iglesia", "nombre_iglesia")}
          {renderInput("Dirección", "direccion")}
          {renderInput("Cantidad de Miembros", "cantidad_miembros", "numeric")}
          {renderInput("Zona", "zona", "numeric")}
          {renderInput("Fecha Fundación (AAAA-MM-DD)", "fecha_fundacion")}
          <View style={styles.infraBox}>
            <Text style={styles.infraTitle}>Infraestructura y Estatus</Text>
            {renderSwitch("¿Tiene Terreno Propio?", "tiene_terreno")}
            {renderSwitch("¿Tiene Casa Pastoral?", "tiene_casa_pastoral")}
            {renderSwitch("Iglesia Activa", "estatus_activo")}
          </View>
        </>
      )}

      {path === "hijos" && (
        <>
          {renderInput("ID Pastor Padre", "id_pastor", "numeric")}
          {renderInput("Nombre", "nombre")}
          {renderInput("Apellido", "apellido")}
          {renderInput("Sexo (M o F)", "sexo")}
          {renderInput("Edad", "edad", "numeric")}
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

      <TouchableOpacity
        style={styles.btnSave}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.btnSaveText}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Text>
      </TouchableOpacity>
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
