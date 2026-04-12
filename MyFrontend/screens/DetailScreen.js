import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Linking, Platform 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import config from '../config';

const DetailScreen = ({ route, navigation }) => {
  const { path, item: initialItem, user_rol } = route.params;
  const [item, setItem] = useState(initialItem);
  const [loading, setLoading] = useState(false);
  const [church, setChurch] = useState(null);
  const [children, setChildren] = useState([]);
  const [parent, setParent] = useState(null);

  const isAdmin = user_rol?.toLowerCase() === 'admin' || user_rol?.toLowerCase() === 'presbitero' || user_rol?.toLowerCase() === 'secretario';

  useEffect(() => {
    // Resetear estados al cambiar de item o path para evitar mostrar datos viejos
    setItem(initialItem);
    setChurch(null);
    setChildren([]);
    setParent(null);
    
    fetchMainData();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchMainData();
    });
    return unsubscribe;
  }, [navigation, path, initialItem]); 

  const fetchMainData = async () => {
    // Usar initialItem para asegurar que tenemos el ID correcto incluso si el estado 'item' no se ha actualizado
    if (!initialItem) return;
    
    // No poner loading si ya tenemos datos básicos para evitar parpadeo
    setLoading(true); 
    try {
      const primaryKey = getPrimaryKey(path);
      const targetId = initialItem[primaryKey] || initialItem.id;
      
      if (!targetId) {
        console.warn("No se encontró ID para el registro:", path, initialItem);
        return;
      }

      // Siempre refrescar el item principal desde el servidor
      const res = await fetch(`${config.API_URL}/${path}/?id=${targetId}`);
      const freshData = await res.json();
      const finalItem = Array.isArray(freshData) ? freshData[0] : freshData;
      
      if (finalItem) {
        setItem(finalItem);
      } else {
        // Si no hay datos en el servidor, usar al menos lo que vino de la navegación
        setItem(initialItem);
      }
      
      const pastorId = finalItem?.id_pastor || initialItem?.id_pastor;

      // Cargar datos relacionales
      if (path === 'pastores' && pastorId) {
        if (finalItem.id_iglesia) {
          const resChurch = await fetch(`${config.API_URL}/iglesias/?id=${finalItem.id_iglesia}`);
          const dataChurch = await resChurch.json();
          setChurch(Array.isArray(dataChurch) ? dataChurch[0] : dataChurch);
        } else {
          setChurch(null);
        }
        const resChildren = await fetch(`${config.API_URL}/hijos/?id_pastor=${pastorId}`);
        setChildren(await resChildren.json());
      } else if (path === 'hijos' ) {
        if (finalItem.id_pastor) {
          const resParent = await fetch(`${config.API_URL}/pastores/?id=${finalItem.id_pastor}`);
          const dataParent = await resParent.json();
          setParent(Array.isArray(dataParent) ? dataParent[0] : dataParent);
        }
      }
    } catch (error) {
      console.error("Error fetching detail data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryKey = (p) => {
    switch(p) {
      case 'pastores': return 'id_pastor';
      case 'iglesias': return 'id_iglesia';
      case 'hijos': return 'id_hijo';
      default: return 'id';
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive", 
          onPress: async () => {
            try {
              const id = item[getPrimaryKey(path)];
              const res = await fetch(`${config.API_URL}/${path}/?id=${id}`, { method: 'DELETE' });
              if (res.ok) {
                Alert.alert("Éxito", "Eliminado correctamente");
                navigation.goBack();
              }
            } catch (e) {
              Alert.alert("Error", "No se pudo eliminar");
            }
          } 
        }
      ]
    );
  };

  const openMap = (lat, lon) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lon}`;
    const label = item.nombre_iglesia || 'Iglesia';
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });
    Linking.openURL(url);
  };
  
  const getAge = (birthDateStr) => {
    if (!birthDateStr) return null;
    const today = new Date();
    const birthDate = new Date(birthDateStr);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (loading && !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
      {/* HEADER WIKIPEDIA STYLE */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {path === 'pastores' ? `${item.nombre} ${item.apellido}` : 
           path === 'iglesias' ? item.nombre_iglesia : 
           `${item.nombre} ${item.apellido || ''}`}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>
          De {path === 'pastores' ? 'Pastores del Sector' : 
              path === 'iglesias' ? 'Iglesias del Sector' : 
              'Hijos de Pastores'}
        </Text>
      </View>

      <View style={styles.mainContent}>
        {/* INFOBOX (Sidebar card) */}
        <View style={styles.infobox}>
          <View style={styles.infoboxHeader}>
            <Text style={styles.infoboxTitle}>Resumen</Text>
          </View>
          {path === 'pastores' && (
            <>
              <InfoBoxRow label="Cédula" value={item.cedula} />
              <InfoBoxRow label="Edad" value={item.fecha_nacimiento ? `${getAge(item.fecha_nacimiento)} años` : 'N/A'} />
              <InfoBoxRow label="Estado Civil" value={item.estado_civil} />
              <InfoBoxRow label="Teléfono" value={item.telefono} />
              <InfoBoxRow label="Zona" value={item.zona} />
              <InfoBoxRow label="Estatus" value={parseInt(item.estatus_activo) ? 'Activo' : 'Inactivo'} color={parseInt(item.estatus_activo) ? '#2E7D32' : '#C62828'} />
            </>
          )}
          {path === 'iglesias' && (
            <>
              <InfoBoxRow label="Zona" value={item.zona} />
              <InfoBoxRow label="Membresía" value={item.cantidad_miembros} />
              <InfoBoxRow label="Infraestructura" value={item.estatus_infraestructura} />
              <InfoBoxRow label="Casa Pastoral" value={parseInt(item.tiene_casa_pastoral) ? 'Sí' : 'No'} />
            </>
          )}
          {path === 'hijos' && (
            <>
              <InfoBoxRow label="Edad" value={item.fecha_nacimiento ? `${getAge(item.fecha_nacimiento)} años` : 'N/A'} />
              <InfoBoxRow label="Sexo" value={item.sexo === 'M' ? 'Masculino' : 'Femenino'} />
            </>
          )}
        </View>

        {/* TEXTO INTRODUCTORIO */}
        <Text style={styles.introText}>
          {path === 'pastores' && `El Pastor ${item.nombre} ${item.apellido} es un ministro activo del sector, encargado de la iglesia "${item.nombre_iglesia || 'sin asignar'}".`}
          {path === 'iglesias' && `La iglesia "${item.nombre_iglesia}" es una congregación establecida en el sector, actualmente reportando una membresía de ${item.cantidad_miembros} personas.`}
          {path === 'hijos' && `${item.nombre} ${item.apellido || ''} es parte de la familia pastoral del sector, hijo(a) del Pastor ${item.pastor_nombre || 'titular'}.`}
        </Text>

        {/* SECCIONES */}
        {path === 'pastores' && (
          <>
            <Section title="Información Ministerial">
              <DetailRow label="Cargo" value={item.cargo} />
              <DetailRow label="Tipo de Licencia" value={item.tipo_licencia} />
              <DetailRow label="Años de Ministerio" value={item.anos_ministerio} />
              <DetailRow label="Grado Académico" value={item.grado_academico} />
              <DetailRow label="Esposa" value={item.esposa} />
            </Section>

            <Section title="Trayectoria Ministerial">
              <DetailRow label="Iglesias Pastoreadas" value={item.iglesias_pastoreadas} />
              <DetailRow label="Cargos Desempeñados" value={item.cargos_desempenados} />
            </Section>

            <Section title="Información Personal">
              <DetailRow label="Fecha de Nacimiento" value={item.fecha_nacimiento} />
              <DetailRow label="Edad" value={item.fecha_nacimiento ? `${getAge(item.fecha_nacimiento)} años` : 'No calculada'} />
              <DetailRow label="Dirección de Habitación" value={item.direccion_habitacion} />
            </Section>

            <Section title="Iglesia Asignada">
              {church ? (
                <TouchableOpacity 
                  style={styles.linkCard} 
                  onPress={() => navigation.navigate('Detail', { path: 'iglesias', item: church, user_rol })}
                >
                  <MaterialCommunityIcons name="church" size={24} color="#2dabff" />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.linkTitle}>{church.nombre_iglesia}</Text>
                    <Text style={styles.linkSubtitle}>{church.direccion}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" style={{ marginLeft: 'auto' }} />
                </TouchableOpacity>
              ) : (
                <View>
                  <Text style={styles.emptyText}>No tiene iglesia asignada actualmente.</Text>
                  {isAdmin && (
                    <TouchableOpacity 
                      style={styles.btnAddSmall}
                      onPress={() => navigation.navigate('Edit', { path: 'iglesias', item: { id_pastor: item.id_pastor }, user_rol })}
                    >
                      <Text style={styles.btnAddSmallText}>+ Registrar Nueva Iglesia</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Section>

            <Section title="Hijos y Familia">
              {children.length > 0 ? (
                children.map((hijo, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.linkCard} 
                    onPress={() => navigation.navigate('Detail', { path: 'hijos', item: hijo, user_rol })}
                  >
                    <MaterialCommunityIcons name="account-child" size={24} color="#C62828" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.linkTitle}>{hijo.nombre} {hijo.apellido}</Text>
                      <Text style={styles.linkSubtitle}>{hijo.fecha_nacimiento ? `${getAge(hijo.fecha_nacimiento)} años` : 'N/A'} - {hijo.talentos || 'Sin talentos reg.'}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No hay hijos registrados.</Text>
              )}
              {isAdmin && (
                <TouchableOpacity 
                  style={[styles.btnAddSmall, { borderColor: '#C62828' }]}
                  onPress={() => navigation.navigate('Edit', { path: 'hijos', item: { id_pastor: item.id_pastor }, user_rol })}
                >
                  <Text style={[styles.btnAddSmallText, { color: '#C62828' }]}>+ Añadir Hijo(a)</Text>
                </TouchableOpacity>
              )}
            </Section>
          </>
        )}

        {path === 'iglesias' && (
          <>
            <Section title="Membresía Detallada">
              <DetailRow label="Bautizados" value={item.bautizados} />
              <DetailRow label="Por Bautizar" value={item.por_bautizar} />
              <DetailRow label="Niños" value={item.ninos} />
              <DetailRow label="Total" value={`${item.cantidad_miembros} miembros`} />
            </Section>
            
            <Section title="Estatus de Sede">
              <DetailRow label="Dirección" value={item.direccion} />
              <DetailRow label="Infraestructura" value={item.estatus_infraestructura} />
              <DetailRow label="Casa Pastoral" value={parseInt(item.tiene_casa_pastoral) ? 'Sí' : 'No'} />
            </Section>

            {item.latitud && item.longitud && (
              <Section title="Ubicación Geográfica">
                <TouchableOpacity style={styles.mapBtn} onPress={() => openMap(item.latitud, item.longitud)}>
                   <MaterialCommunityIcons name="map-marker-radius" size={24} color="#FFF" />
                   <Text style={styles.mapBtnText}>Ver en Google Maps</Text>
                </TouchableOpacity>
              </Section>
            )}
          </>
        )}

        {path === 'hijos' && (
          <>
            <Section title="Información Personal">
              <DetailRow label="Nombre Completo" value={`${item.nombre} ${item.apellido || ''}`} />
              <DetailRow label="Edad" value={item.fecha_nacimiento ? `${getAge(item.fecha_nacimiento)} años` : 'N/A'} />
              <DetailRow label="Sexo" value={item.sexo === 'M' ? 'Masculino' : 'Femenino'} />
            </Section>
            <Section title="Habilidades y Educación">
              <DetailRow label="Talentos" value={item.talentos} />
              <DetailRow label="Estudios" value={item.estudios} />
            </Section>
            {parent && (
               <Section title="Padre / Pastor">
                 <TouchableOpacity 
                    style={styles.linkCard} 
                    onPress={() => navigation.navigate('Detail', { path: 'pastores', item: parent, user_rol })}
                  >
                    <MaterialCommunityIcons name="account-tie" size={24} color="#2E7D32" />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.linkTitle}>{parent.nombre} {parent.apellido}</Text>
                      <Text style={styles.linkSubtitle}>Pastor Titular - Zona {parent.zona}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" style={{ marginLeft: 'auto' }} />
                  </TouchableOpacity>
               </Section>
            )}
          </>
        )}
      </View>

      {/* ACTION BUTTONS */}
      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.editBtn} 
            onPress={() => navigation.navigate('Edit', { path, item, user_rol })}
          >
            <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
            <Text style={styles.btnText}>EDITAR</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <MaterialCommunityIcons name="trash-can" size={20} color="#FFF" />
            <Text style={styles.btnText}>ELIMINAR</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* BOTON VOLVER TIPO WIKIPEDIA */}
      <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
        <Text style={styles.backLinkText}>← Volver al registro anterior</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'No especificado'}</Text>
  </View>
);

const InfoBoxRow = ({ label, value, color = "#333" }) => (
  <View style={styles.infoboxRow}>
    <Text style={styles.infoboxLabel}>{label}</Text>
    <Text style={[styles.infoboxValue, { color }]}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20, paddingTop: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  divider: { height: 1, backgroundColor: '#A2A9B1', marginVertical: 10 },
  subtitle: { fontSize: 14, color: '#54595D', fontStyle: 'italic' },
  mainContent: { padding: 20 },
  infobox: { 
    backgroundColor: '#F8F9FA', 
    borderWidth: 1, 
    borderColor: '#A2A9B1', 
    borderRadius: 2, 
    padding: 10,
    width: '100%',
    marginBottom: 20
  },
  infoboxHeader: { backgroundColor: '#E8EAF6', padding: 5, marginBottom: 10, alignItems: 'center' },
  infoboxTitle: { fontWeight: 'bold', color: '#2dabff' },
  infoboxRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  infoboxLabel: { fontWeight: 'bold', fontSize: 12, color: '#555', width: '40%' },
  infoboxValue: { fontSize: 12, color: '#333', width: '60%', textAlign: 'right' },
  introText: { fontSize: 16, lineHeight: 24, color: '#202122', marginBottom: 25 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#A2A9B1', paddingBottom: 5, marginBottom: 15, color: '#000' },
  sectionContent: { paddingLeft: 5 },
  detailRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontWeight: 'bold', color: '#54595D', width: 140 },
  detailValue: { color: '#202122', flex: 1 },
  linkCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F8F9FA', 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#EEE',
    marginBottom: 10
  },
  linkTitle: { fontWeight: 'bold', color: '#2dabff', fontSize: 15 },
  linkSubtitle: { fontSize: 12, color: '#666' },
  emptyText: { fontStyle: 'italic', color: '#999', marginBottom: 10 },
  btnAddSmall: { padding: 8, borderWidth: 1, borderColor: '#2dabff', borderRadius: 5, alignSelf: 'flex-start', marginTop: 5 },
  btnAddSmallText: { color: '#2dabff', fontSize: 12, fontWeight: 'bold' },
  mapBtn: { backgroundColor: '#2dabff', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mapBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, borderTopWidth: 1, borderTopColor: '#EEE' },
  editBtn: { backgroundColor: '#2dabff', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10, justifyContent: 'center' },
  deleteBtn: { backgroundColor: '#C62828', paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8 },
  backLink: { padding: 20, alignItems: 'center' },
  backLinkText: { color: '#2dabff', fontWeight: 'bold', textDecorationLine: 'underline' }
});

export default DetailScreen;
