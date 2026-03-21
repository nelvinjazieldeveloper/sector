import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import config from "../config";

export default function EditScreen({ route, navigation }) {
  const { path, item } = route.params;
  const [formData, setFormData] = useState(item || {});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnimSave = useRef(new Animated.Value(1)).current;
  const scaleAnimCancel = useRef(new Animated.Value(1)).current;

  const animateButton = (anim, toValue) => {
    Animated.spring(anim, {
      toValue,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);
  const [loading, setLoading] = useState(false);
  const [iglesiasList, setIglesiasList] = useState([]);
  const [pastoresList, setPastoresList] = useState([]);

  useEffect(() => {
    // Seguridad: Solo admin puede entrar a usuarios
    const { user_rol } = route.params;
    if (path === 'usuarios' && user_rol?.toLowerCase() !== 'admin') {
      Alert.alert("Acceso Denegado", "No tienes permisos para gestionar usuarios.");
      navigation.goBack();
      return;
    }

    // Carga de Iglesias
    if (["pastores", "iglesias", "hijos", "reporte"].includes(path)) {
      fetch(`${config.API_URL}/iglesias/`)
        .then((r) => r.json())
        .then((data) => setIglesiasList(Array.isArray(data) ? data : []))
        .catch((e) => console.log("Error IG fetch", e));
    }
    // Carga de Pastores
    if (["hijos", "reporte", "usuarios"].includes(path)) {
      fetch(`${config.API_URL}/pastores/`)
        .then((r) => r.json())
        .then((data) => setPastoresList(Array.isArray(data) ? data : []))
        .catch((e) => console.log("Error PT fetch", e));
    }
  }, [path]);

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
              : path === "reuniones"
                ? "id_reunion"
                : path === "usuarios"
                  ? "id_usuario"
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

  const [showDatePicker, setShowDatePicker] = useState({ show: false, key: "" });

  const onDateChange = (event, selectedDate, key) => {
    setShowDatePicker({ show: false, key: "" });
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      setFormData({ ...formData, [key]: formattedDate });
    }
  };

  const renderDatePicker = (label, key) => {
    const currentDate = formData[key] ? new Date(formData[key]) : new Date();
    // Validar si la fecha es válida, si no, usar hoy
    const validDate = isNaN(currentDate.getTime()) ? new Date() : currentDate;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={styles.datePickerButton} 
          onPress={() => setShowDatePicker({ show: true, key })}
        >
          <Text style={styles.dateText}>
            {formData[key] ? formData[key] : "Seleccionar fecha..."}
          </Text>
          <Text style={styles.calendarIcon}>📅</Text>
        </TouchableOpacity>
        {showDatePicker.show && showDatePicker.key === key && (
          <DateTimePicker
            value={validDate}
            mode="date"
            display="default"
            onChange={(event, date) => onDateChange(event, date, key)}
          />
        )}
      </View>
    );
  };

  const renderInput = (label, key, keyboard = "default", secure = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={formData[key]?.toString()}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        keyboardType={keyboard}
        secureTextEntry={secure}
      />
    </View>
  );

  const renderPicker = (label, key, options) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={formData[key]}
          onValueChange={(itemValue) => setFormData({ ...formData, [key]: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione una opción..." value="" />
          {options.map((opt, i) => (
            <Picker.Item key={i} label={String(opt.label)} value={opt.value} />
          ))}
        </Picker>
      </View>
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

    const isEditMode = !!(formData.id_pastor || formData.id_iglesia || formData.id_reunion || formData.id_reporte || formData.id_hijo || formData.id_usuario);
    return (
      <LinearGradient colors={["#1A237E", "#3949AB"]} style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView 
            style={{ flex: 1 }} 
            contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
        <Text style={styles.headerTitle}>
          {isEditMode ? "Editar" : "Nuevo"} Registro
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
          {renderPicker("Iglesia", "id_iglesia", iglesiasList.map(ig => ({label: ig.nombre_iglesia, value: ig.id_iglesia})))}
          {renderPicker("Zona", "zona", [1,2,3,4,5,6].map(z => ({label: `Zona ${z}`, value: z})))}
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
          {renderPicker("Zona", "zona", [1,2,3,4,5,6].map(z => ({label: `Zona ${z}`, value: z})))}
          {renderDatePicker("Fecha Fundación", "fecha_fundacion")}
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
          {renderPicker("Pastor Padre", "id_pastor", pastoresList.map(p => ({label: `${p.nombre} ${p.apellido}`, value: p.id_pastor})))}
          {renderInput("Nombre", "nombre")}
          {renderInput("Apellido", "apellido")}
          {renderPicker("Sexo", "sexo", [{label: "Masculino", value: "M"}, {label: "Femenino", value: "F"}])}
          {renderInput("Edad", "edad", "numeric")}
        </>
      )}

      {path === "reporte" && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>General</Text>
          </View>
          {renderPicker("Pastor", "id_pastor", pastoresList.map(p => ({label: `${p.nombre} ${p.apellido}`, value: p.id_pastor})))}
          {renderPicker("Iglesia", "id_iglesia", iglesiasList.map(ig => ({label: ig.nombre_iglesia, value: ig.id_iglesia})))}
          {renderPicker("Mes", "mes_reportado", [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
          ].map(m => ({label: m, value: m})))}
          {renderInput("Año", "anio_reportado", "numeric")}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Finanzas en Bolívares (BS)</Text>
          </View>
          {renderInput("Diezmos BS", "diezmos_bs", "numeric")}
          {renderInput("Poder del Uno BS", "poder_del_uno_bs", "numeric")}
          {renderInput("Única Sectorial BS", "unica_sectorial_bs", "numeric")}
          {renderInput("Campamento BS", "campamento_bs", "numeric")}
          {renderInput("Convención BS", "convencion_bs", "numeric")}
          
          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 5}}>
              {renderInput("Otro Nombre 1", "ofrenda_1_nombre")}
            </View>
            <View style={{flex: 1}}>
              {renderInput("Monto BS 1", "ofrenda_1_bs", "numeric")}
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Finanzas en Dólares (USD)</Text>
          </View>
          {renderInput("Diezmos USD", "diezmos_usd", "numeric")}
          {renderInput("Poder del Uno USD", "poder_del_uno_usd", "numeric")}
          {renderInput("Única Sectorial USD", "unica_sectorial_usd", "numeric")}
          {renderInput("Campamento USD", "campamento_usd", "numeric")}
          {renderInput("Convención USD", "convencion_usd", "numeric")}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Finanzas en Pesos (COP)</Text>
          </View>
          {renderInput("Diezmos COP", "diezmos_cop", "numeric")}
          {renderInput("Poder del Uno COP", "poder_del_uno_cop", "numeric")}
          {renderInput("Única Sectorial COP", "unica_sectorial_cop", "numeric")}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Información de Pago</Text>
          </View>
          {renderPicker("Tipo de Pago", "tipo_pago", [
            {label: "Efectivo", value: "Efectivo"},
            {label: "Pago Móvil", value: "Pago Movil"},
            {label: "Transferencia", value: "Transferencia"}
          ])}
          {renderInput("Banco Destino", "banco_destino")}
          {renderDatePicker("Fecha de Pago", "fecha_pago")}
          {renderInput("Referencia", "referencia")}
          {renderInput("Observaciones", "observaciones")}
        </>
      )}

      {path === "reuniones" && (
        <>
          {renderInput("Título", "titulo")}
          {renderDatePicker("Fecha", "fecha")}
          {renderInput("Lugar", "lugar")}
          {renderInput("Descripción", "descripcion")}
        </>
      )}
      
      {path === "usuarios" && (
        <>
          {renderInput("Nombre de Usuario", "username")}
          {renderInput("Contraseña (Dejar vacío para no cambiar)", "password", "default", true)}
          {renderPicker("Rol del Sistema", "rol", [
            {label: "Administrador (Admin)", value: "Admin"},
            {label: "Presbítero", value: "Presbitero"},
            {label: "Secretario", value: "Secretario"},
            {label: "Tesorero", value: "Tesorero"},
            {label: "Pastor", value: "Pastor"}
          ])}
          {renderPicker("Vincular con Pastor", "id_pastor", pastoresList.map(p => ({label: `${p.nombre} ${p.apellido}`, value: p.id_pastor})))}
          <Text style={styles.infoNote}>* Al asignar un rol especial (Presbítero, Tesorero, Secretario), el sistema removerá automáticamente ese rol del usuario anterior.</Text>
        </>
      )}

      <View style={{ marginTop: 20, marginBottom: 40 }}>
        <Animated.View style={{ transform: [{ scale: scaleAnimSave }] }}>
          <TouchableOpacity
            style={styles.btnSave}
            onPress={handleSave}
            disabled={loading}
            onPressIn={() => animateButton(scaleAnimSave, 0.95)}
            onPressOut={() => animateButton(scaleAnimSave, 1)}
            activeOpacity={1}
          >
            <Text style={styles.btnSaveText}>
              {loading ? "Guardando..." : "GUARDAR CAMBIOS"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: scaleAnimCancel }] }}>
          <TouchableOpacity
            style={styles.btnCancel}
            onPress={() => navigation.goBack()}
            onPressIn={() => animateButton(scaleAnimCancel, 0.95)}
            onPressOut={() => animateButton(scaleAnimCancel, 1)}
            activeOpacity={1}
          >
            <Text style={styles.btnCancelText}>CANCELAR REGISTRO</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 25,
    textAlign: "center",
  },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "bold", color: "#555", marginBottom: 5 },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    color: "#333",
  },
  datePickerButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  calendarIcon: {
    fontSize: 18,
  },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
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
    backgroundColor: "#2E7D32", // Verde éxito
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
  btnCancel: {
    marginTop: 15,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#C62828", // Rojo cancelar
  },
  btnCancelText: { color: "#C62828", fontWeight: "bold", fontSize: 14 },
  sectionHeader: {
    backgroundColor: "#D4AF37", // Oro
    padding: 10,
    borderRadius: 8,
    marginTop: 25,
    marginBottom: 12,
  },
  sectionTitle: { color: "#FFF", fontWeight: "bold", fontSize: 13, textTransform: "uppercase", letterSpacing: 1.5 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  infoNote: { color: "#FFF", fontSize: 12, fontStyle: "italic", marginTop: 10, opacity: 0.8 },
});
