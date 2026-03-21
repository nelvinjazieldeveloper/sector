export default {
  pastores: [
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "cedula", label: "Cédula", type: "numeric" },
    { key: "edad", label: "Edad", type: "numeric" }, // Agregado
    { key: "esposa", label: "Nombre de la Esposa" }, // Agregado
    { key: "hijos", label: "Cantidad de Hijos", type: "numeric" }, // Agregado
    { key: "anos_ministerio", label: "Años de Ministerio", type: "numeric" }, // Agregado
    {
      key: "tipo_licencia",
      label: "Licencia",
      type: "select",
      options: ["Ordenado", "Distrital", "Local", "Principiante"],
    },
    { key: "cargo", label: "Cargo" },
    {
      key: "id_iglesia",
      type: "select",
      endpoint: "iglesias",
      labelKey: "nombre_iglesia",
      valueKey: "id_iglesia",
      label: "Iglesia",
    },
    {
      key: "zona",
      type: "select",
      options: ["1", "2", "3", "4", "5", "6"],
      label: "Zona",
    }, // Agregado
  ],

  iglesias: [
    { key: "nombre_iglesia", label: "Nombre de la Iglesia" },
    { key: "direccion", label: "Dirección" },
    { key: "cantidad_miembros", label: "Miembros", type: "numeric" },
    { key: "fecha_fundacion", type: "date", label: "Fecha Fundación" },
    {
      key: "zona",
      type: "select",
      options: ["1", "2", "3", "4", "5"],
      label: "Zona",
    },
  ],

  reunion: [
    { key: "titulo", label: "Título" },
    { key: "fecha", type: "date", label: "Fecha" },
    { key: "lugar", label: "Lugar" },
    { key: "descripcion", label: "Descripción", multiline: true },
  ],

  // IMPORTANTE: El endpoint es 'reporte'
  reporte: [
    {
      key: "id_pastor",
      type: "select",
      endpoint: "pastores",
      labelKey: "apellido",
      valueKey: "id_pastor",
      label: "Pastor",
    },
    {
      key: "id_iglesia",
      type: "select",
      endpoint: "iglesias",
      labelKey: "nombre_iglesia",
      valueKey: "id_iglesia",
      label: "Iglesia",
    },
    { key: "mes_reportado", type: "numeric", label: "Mes (1-12)" },
    { key: "anio_reportado", type: "numeric", label: "Año" },
    { key: "diezmos_bs", type: "numeric", label: "Diezmos (Bs)" },
    { key: "diezmos_usd", type: "numeric", label: "Diezmos ($)" },
    { key: "fecha_pago", type: "date", label: "Fecha de Pago" },
    {
      key: "tipo_pago",
      type: "select",
      options: ["Transferencia", "Pago Móvil", "Efectivo", "Zelle"],
      label: "Método",
    },
    { key: "referencia", label: "Referencia" },
  ],

  hijos: [
    {
      key: "id_pastor",
      type: "select",
      endpoint: "pastores",
      labelKey: "apellido",
      valueKey: "id_pastor",
      label: "Padre (Pastor)",
    },
    { key: "nombre", label: "Nombre" },
    { key: "apellido", label: "Apellido" },
    { key: "sexo", type: "select", options: ["M", "F"], label: "Sexo" },
    { key: "edad", type: "numeric", label: "Edad" },
  ],
  usuarios: [
    { key: "username", label: "Usuario" },
    { key: "password", label: "Contraseña (Nueva)", type: "password" },
    { 
      key: "rol", 
      label: "Rol", 
      type: "select", 
      options: ["Admin", "Presbitero", "Secretario", "Tesorero", "Pastor"] 
    },
    {
      key: "id_pastor",
      type: "select",
      endpoint: "pastores",
      labelKey: "apellido",
      valueKey: "id_pastor",
      label: "Pastor Vinculado",
    },
  ],
};
