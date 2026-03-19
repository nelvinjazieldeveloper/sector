import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Componente interno para filas de datos
  const InfoRow = ({ label, value, color = "#333", bold = false }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={[styles.infoValue, { color, fontWeight: bold ? 'bold' : 'normal' }]}>
        {value || '0.00'}
      </Text>
    </View>
  );

  return (
    <LinearGradient colors={['#1A237E', '#3949AB']} style={{ flex: 1 }}>
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={[{ flexGrow: 1 }, styles.scroll]}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
      {/* ENCABEZADO PRINCIPAL */}
        <View style={styles.headerCard}>
          <Text style={styles.churchTitle}>⛪ {item.iglesia_nombre}</Text>
          <Text style={styles.pastorSub}>Pastor: {item.pastor_nombre}</Text>
          <View style={styles.periodBadge}>
            <Text style={styles.periodText}>Periodo: {item.mes_reportado} / {item.anio_reportado}</Text>
          </View>
        </View>

        {/* SECCIÓN BOLÍVARES (BS) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#003893' }]}>🇻🇪 Finanzas en Bolívares</Text>
          <InfoRow label="Diezmos" value={`Bs. ${item.diezmos_bs}`} bold />
          <InfoRow label="Poder del Uno" value={`Bs. ${item.poder_del_uno_bs}`} />
          <InfoRow label="Única Sectorial" value={`Bs. ${item.unica_sectorial_bs}`} />
          <InfoRow label="Campamento" value={`Bs. ${item.campamento_bs}`} />
          <InfoRow label="Convención" value={`Bs. ${item.convencion_bs}`} />
          {item.ofrenda_1_nombre && <InfoRow label={item.ofrenda_1_nombre} value={`Bs. ${item.ofrenda_1_bs}`} />}
          {item.ofrenda_2_nombre && <InfoRow label={item.ofrenda_2_nombre} value={`Bs. ${item.ofrenda_2_bs}`} />}
        </View>

        {/* SECCIÓN DÓLARES (USD) */}
        <View style={[styles.section, { borderLeftColor: '#2E7D32', borderLeftWidth: 4 }]}>
          <Text style={[styles.sectionTitle, { color: '#2E7D32' }]}>🇺🇸 Finanzas en Dólares</Text>
          <InfoRow label="Diezmos" value={`$ ${item.diezmos_usd}`} bold color="#2E7D32" />
          <InfoRow label="Poder del Uno" value={`$ ${item.poder_del_uno_usd}`} />
          <InfoRow label="Única Sectorial" value={`$ ${item.unica_sectorial_usd}`} />
          <InfoRow label="Campamento" value={`$ ${item.campamento_usd}`} />
          <InfoRow label="Convención" value={`$ ${item.convencion_usd}`} />
          {parseFloat(item.ofrenda_1_usd) > 0 && <InfoRow label="Ofrenda 1" value={`$ ${item.ofrenda_1_usd}`} />}
        </View>

        {(parseFloat(item.diezmos_cop) > 0 || parseFloat(item.poder_del_uno_cop) > 0) && (
          <View style={[styles.section, { borderLeftColor: '#FFD700', borderLeftWidth: 4 }]}>
            <Text style={[styles.sectionTitle, { color: '#8B7500' }]}>🇨🇴 Finanzas en Pesos</Text>
            <InfoRow label="Diezmos" value={`${item.diezmos_cop} COP`} />
            <InfoRow label="Poder del Uno" value={`${item.poder_del_uno_cop} COP`} />
            <InfoRow label="Única Sectorial" value={`${item.unica_sectorial_cop} COP`} />
          </View>
        )}

        {/* DETALLES DE PAGO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Información de Pago</Text>
          <InfoRow label="Método" value={item.tipo_pago} />
          <InfoRow label="Banco" value={item.banco_destino} />
          <InfoRow label="Referencia" value={item.referencia} bold />
          <InfoRow label="Fecha de Pago" value={item.fecha_pago} />
        </View>

        {/* OBSERVACIONES */}
        {item.observaciones && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Observaciones</Text>
            <Text style={styles.obsText}>{item.observaciones}</Text>
          </View>
        )}

        {/* BOTÓN PARA EDITAR */}
        <TouchableOpacity 
          style={styles.editBtn}
          onPress={() => navigation.navigate('Edit', { path: 'reporte', item, origin: 'ReportDetail' })}
        >
          <Text style={styles.editBtnText}>MODIFICAR REPORTE</Text>
        </TouchableOpacity>
      </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  scroll: { padding: 15 },
  headerCard: { backgroundColor: '#1A237E', padding: 20, borderRadius: 15, marginBottom: 15, elevation: 4 },
  churchTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  pastorSub: { color: '#BBDEFB', fontSize: 16, marginTop: 5 },
  periodBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', padding: 5, borderRadius: 5, marginTop: 10 },
  periodText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  section: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, marginBottom: 15, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 5, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#F9F9F9' },
  infoLabel: { color: '#666', fontSize: 14 },
  infoValue: { fontSize: 15, color: '#333' },
  obsText: { fontStyle: 'italic', color: '#555' },
  editBtn: { backgroundColor: '#1A237E', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 10, marginBottom: 40 },
  editBtnText: { color: '#FFF', fontWeight: 'bold' }
});