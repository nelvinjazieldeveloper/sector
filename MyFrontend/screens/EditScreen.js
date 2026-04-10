import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Re-adding for convenience if needed
import { MaterialCommunityIcons } from '@expo/vector-icons';
import FreeMap from "../components/FreeMap";
import config from "../config";

export default function EditScreen({ route, navigation }) {
  const { path, item, readOnly } = route.params;
  const [formData, setFormData] = useState(item || {});
  const [loading, setLoading] = useState(false);
  const [churches, setChurches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Inicialización de valores por defecto
  useEffect(() => {
    if (!item || Object.keys(item).length === 0) {
      setFormData({
        estatus_activo: 1,
        estatus_infraestructura: "Propio",
        bautizados: "0",
        por_bautizar: "0",
        ninos: "0",
        cantidad_miembros: "0"
      });
    }
  }, [item]);

  // Cálculo automático del total de miembros
  useEffect(() => {
    if (path === 'iglesias') {
      const b = parseInt(formData.bautizados) || 0;
      const pb = parseInt(formData.por_bautizar) || 0;
      const n = parseInt(formData.ninos) || 0;
      const total = b + pb + n;
      if (total.toString() !== formData.cantidad_miembros?.toString()) {
        setFormData(prev => ({ ...prev, cantidad_miembros: total.toString() }));
      }
    }
  }, [formData.bautizados, formData.por_bautizar, formData.ninos]);

  // Cargar iglesias si estamos en pastores
  useEffect(() => {
    if (path === "pastores") {
      fetchChurches();
      const unsubscribe = navigation.addListener('focus', () => {
        fetchChurches();
      });
      return unsubscribe;
    }
  }, [navigation, path]);

  const fetchChurches = async () => {
    try {
      // Cargar iglesias
      const res = await fetch(`${config.API_URL}/iglesias/`);
      const data = await res.json();
      setChurches(Array.isArray(data) ? data : []);

      // Contar hijos registrados si estamos editando un pastor
      if (item && item.id_pastor) {
        const resHijos = await fetch(`${config.API_URL}/hijos/?id_pastor=${item.id_pastor}`);
        const dataHijos = await resHijos.json();
        const count = Array.isArray(dataHijos) ? dataHijos.length : 0;
        setFormData(prev => ({ ...prev, hijos: count.toString() }));
      }
    } catch (error) {
      console.error("Error fetching dependencies:", error);
    }
  };

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

  const renderInput = (label, key, keyboard = "default") => {
    // Campos automáticos bloqueados
    const isAuto = (path === "pastores" && (key === "zona" || key === "hijos"));
    const shouldBeReadOnly = readOnly || isAuto;

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={[styles.input, shouldBeReadOnly && styles.inputReadOnly, keyboard === 'multiline' && { height: 80, textAlignVertical: 'top' }]}
          value={formData[key]?.toString() || ""}
          onChangeText={(text) => !shouldBeReadOnly && setFormData({ ...formData, [key]: text })}
          keyboardType={keyboard === 'multiline' ? 'default' : keyboard}
          editable={!shouldBeReadOnly}
          multiline={keyboard === 'multiline'}
        />
      </View>
    );
  };

  const renderCivilStatusPicker = (label, key) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerContainer, readOnly && styles.inputReadOnly]}>
        <Picker
          selectedValue={formData[key]}
          onValueChange={(itemValue) => !readOnly && setFormData({ ...formData, [key]: itemValue })}
          enabled={!readOnly}
          style={styles.picker}
        >
          <Picker.Item label="Seleccione estado civil..." value="" />
          <Picker.Item label="Soltero" value="Soltero" />
          <Picker.Item label="Casado" value="Casado" />
          <Picker.Item label="Divorciado" value="Divorciado" />
          <Picker.Item label="Viudo" value="Viudo" />
        </Picker>
      </View>
    </View>
  );

  const renderInfrastructurePicker = (label, key) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.pickerContainer, readOnly && styles.inputReadOnly]}>
        <Picker
          selectedValue={formData[key] || "Propio"}
          onValueChange={(itemValue) => !readOnly && setFormData({ ...formData, [key]: itemValue })}
          enabled={!readOnly}
          style={styles.picker}
        >
          <Picker.Item label="Propio" value="Propio" />
          <Picker.Item label="Alquilado" value="Alquilado" />
          <Picker.Item label="Prestado" value="Prestado" />
          <Picker.Item label="Itinerante" value="Itinerante" />
          <Picker.Item label="En construcción" value="En construcción" />
        </Picker>
      </View>
    </View>
  );

  const renderDatePicker = (label, key) => {
    const onChange = (event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const dateStr = selectedDate.toISOString().split('T')[0];
        setFormData({ ...formData, [key]: dateStr });
      }
    };

    const dateValue = formData[key] ? new Date(formData[key]) : new Date();

    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity 
          style={[styles.selectorBtn, readOnly && styles.inputReadOnly]} 
          onPress={() => !readOnly && setShowDatePicker(true)}
          disabled={readOnly}
        >
          <Text style={{ color: formData[key] ? '#333' : '#999' }}>
            {formData[key] || "Seleccione fecha..."}
          </Text>
          <MaterialCommunityIcons name="calendar" size={20} color="#1A237E" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateValue}
            mode="date"
            display="default"
            onChange={onChange}
          />
        )}
      </View>
    );
  };

  const renderGenderPicker = (label, key) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity 
          style={[styles.genderBtn, formData[key] === 'Masculino' && styles.genderBtnActive]}
          onPress={() => !readOnly && setFormData({ ...formData, [key]: 'Masculino' })}
          disabled={readOnly}
        >
          <MaterialCommunityIcons name="gender-male" size={20} color={formData[key] === 'Masculino' ? '#FFF' : '#1A237E'} />
          <Text style={[styles.genderBtnText, formData[key] === 'Masculino' && styles.genderBtnTextActive]}>Masculino</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.genderBtn, formData[key] === 'Femenino' && styles.genderBtnActive]}
          onPress={() => !readOnly && setFormData({ ...formData, [key]: 'Femenino' })}
          disabled={readOnly}
        >
          <MaterialCommunityIcons name="gender-female" size={20} color={formData[key] === 'Femenino' ? '#FFF' : '#1A237E'} />
          <Text style={[styles.genderBtnText, formData[key] === 'Femenino' && styles.genderBtnTextActive]}>Femenino</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSwitch = (label, key) => {
    const isActive = Number(formData[key]) === 1;
    return (
      <TouchableOpacity
        style={styles.switchRow}
        onPress={() =>
          !readOnly && setFormData({ ...formData, [key]: isActive ? 0 : 1 })
        }
        disabled={readOnly}
      >
        <View style={[styles.checkbox, isActive && styles.checked, readOnly && styles.checkboxReadOnly]} />
        <Text style={styles.switchLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const renderSearchModal = () => {
    const filteredChurches = churches.filter(c => 
      c.nombre_iglesia?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.zona?.toString().includes(searchQuery)
    );

    return (
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Iglesia</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBar}>
              <MaterialCommunityIcons name="magnify" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nombre o zona..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={true}
              />
            </View>

            <FlatList
              data={filteredChurches}
              keyExtractor={(item) => item.id_iglesia.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.churchItem}
                  onPress={() => {
                    setFormData({ 
                      ...formData, 
                      id_iglesia: item.id_iglesia,
                      zona: item.zona || formData.zona // Sincronizar zona automáticamente
                    });
                    setIsModalVisible(false);
                    setSearchQuery("");
                  }}
                >
                  <MaterialCommunityIcons name="church" size={20} color="#1A237E" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.churchItemName}>{item.nombre_iglesia}</Text>
                    <Text style={styles.churchItemZone}>Zona {item.zona}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListFooterComponent={() => (
                <TouchableOpacity 
                  style={[styles.churchItem, styles.newItem]}
                  onPress={() => {
                    setIsModalVisible(false);
                    setSearchQuery("");
                    navigation.navigate("Edit", { path: "iglesias", item: {}, origin: "EditPastor" });
                  }}
                >
                  <MaterialCommunityIcons name="plus-circle" size={20} color="#1A237E" />
                  <Text style={[styles.churchItemName, { marginLeft: 10, color: '#1A237E' }]}>Registrar nueva iglesia...</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: '#999' }}>No se encontraron coincidencias.</Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderChurchPicker = () => {
    const selectedChurch = churches.find(c => c.id_iglesia.toString() === formData.id_iglesia?.toString());
    
    return (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Iglesia Asignada</Text>
        <TouchableOpacity 
          style={[styles.selectorBtn, readOnly && styles.inputReadOnly]}
          onPress={() => !readOnly && setIsModalVisible(true)}
          disabled={readOnly}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="church" size={20} color="#1A237E" style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, color: selectedChurch ? '#333' : '#999' }}>
              {selectedChurch ? `${selectedChurch.nombre_iglesia} (Zona ${selectedChurch.zona})` : "Seleccione una iglesia..."}
            </Text>
          </View>
          {!readOnly && <MaterialCommunityIcons name="chevron-down" size={20} color="#666" />}
        </TouchableOpacity>
        {renderSearchModal()}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
        <Text style={styles.headerTitle}>
          {readOnly ? "Detalles del" : item[primaryKey] ? "Editar" : "Nuevo"} Registro
        </Text>
        
        {/* ... Rest of the form ... */}
        {path === "pastores" && (
          <>
            {renderInput("Nombre", "nombre")}
            {renderInput("Apellido", "apellido")}
            {renderInput("Cédula", "cedula", "numeric")}
            {renderDatePicker("Fecha de Nacimiento", "fecha_nacimiento")}
            {renderCivilStatusPicker("Estado Civil", "estado_civil")}
            {renderInput("Nombre de la Esposa", "esposa")}
            {renderInput("Cantidad de Hijos (Auto)", "hijos", "numeric")}
            {renderInput("Teléfono", "telefono", "phone-pad")}
            {renderInput("Dirección de Habitación", "direccion_habitacion", "multiline")}
            {renderInput("Grado Académico", "grado_academico")}
            {renderInput("Años de Ministerio", "anos_ministerio", "numeric")}
            {renderInput("Cargo", "cargo")}
            {renderInput("Tipo de Licencia", "tipo_licencia")}
            {renderInput("Zona (Auto)", "zona")}
            {renderChurchPicker()}
            {renderInput("Iglesias donde ha pastoreado", "iglesias_pastoreadas", "multiline")}
            {renderInput("Cargos que ha desempeñado", "cargos_desempenados", "multiline")}
            {renderSwitch("Estatus Activo", "estatus_activo")}
          </>
        )}

        {path === "iglesias" && (
          <>
            {renderInput("Nombre de la Iglesia", "nombre_iglesia")}
            {renderInput("Dirección", "direccion")}
            {renderInput("Zona", "zona")}
            
            <View style={styles.infraBox}>
              <Text style={styles.infraTitle}>Membresía Detallada</Text>
              {renderInput("Bautizados", "bautizados", "numeric")}
              {renderInput("Por Bautizar", "por_bautizar", "numeric")}
              {renderInput("Niños", "ninos", "numeric")}
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Total de Miembros (Auto):</Text>
                <Text style={styles.totalValue}>{formData.cantidad_miembros || 0}</Text>
              </View>
            </View>

            <View style={styles.infraBox}>
              <Text style={styles.infraTitle}>Infraestructura</Text>
              {renderInfrastructurePicker("Estatus de Infraestructura", "estatus_infraestructura")}
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
          {renderGenderPicker("Sexo", "sexo")}
          {renderDatePicker("Fecha de Nacimiento", "fecha_nacimiento")}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollContainer: { padding: 20, paddingBottom: 50 },
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
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(26, 35, 126, 0.2)',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A237E',
  },
  btnSave: {
    backgroundColor: "#1A237E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  btnSaveText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  pickerContainer: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 55,
    width: "100%",
  },
  selectorBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
  },
  churchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  churchItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  churchItemZone: {
    fontSize: 12,
    color: '#666',
  },
  newItem: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  genderBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#1A237E',
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  genderBtnActive: {
    backgroundColor: '#1A237E',
  },
  genderBtnText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#1A237E',
  },
  genderBtnTextActive: {
    color: '#FFF',
  },
});
