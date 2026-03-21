-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 19-03-2026 a las 20:52:18
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `sector`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `hijos_pastores`
--

CREATE TABLE `hijos_pastores` (
  `id_hijo` int(11) NOT NULL,
  `id_pastor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `sexo` enum('M','F') NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `hijos_pastores`
--

INSERT INTO `hijos_pastores` (`id_hijo`, `id_pastor`, `nombre`, `apellido`, `sexo`, `edad`, `fecha_registro`) VALUES
(1, 1, 'Rubi', 'Martinez', 'F', 20, '2026-01-21 02:19:19'),
(2, 3, 'Santiago Josue', 'Molina Ojeda', 'M', 11, '2026-03-10 14:42:58'),
(3, 2, 'Luisangel Roman', 'Suarez Suarez', 'M', 8, '2026-03-10 14:43:27'),
(4, 2, 'Zirel De Yeshua', 'Suarez Suarez', 'F', 10, '2026-03-10 14:44:11'),
(5, 4, 'Nelvin Jaziel', 'Marquez Molina', 'M', 20, '2026-03-10 14:44:37'),
(6, 4, 'Gabriel Isain', 'Marquez Molina', 'M', 18, '2026-03-10 14:45:04');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `iglesias`
--

CREATE TABLE `iglesias` (
  `id_iglesia` int(11) NOT NULL,
  `nombre_iglesia` varchar(150) NOT NULL,
  `direccion` text DEFAULT NULL,
  `cantidad_miembros` int(11) DEFAULT 0,
  `zona` int(11) DEFAULT NULL,
  `fecha_fundacion` date DEFAULT NULL,
  `estatus_activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `tiene_terreno` tinyint(1) DEFAULT 0,
  `tiene_casa_pastoral` tinyint(1) DEFAULT 0
) ;

--
-- Volcado de datos para la tabla `iglesias`
--

INSERT INTO `iglesias` (`id_iglesia`, `nombre_iglesia`, `direccion`, `cantidad_miembros`, `zona`, `fecha_fundacion`, `estatus_activo`, `fecha_registro`, `tiene_terreno`, `tiene_casa_pastoral`) VALUES
(1, 'Valera Centra', 'Avenida 2, Valera, Trujillo', 80, 2, NULL, 1, '2026-01-21 02:08:44', 1, 1),
(2, 'Timotes', 'Calle Vargas, Av Motatan', 50, 5, NULL, 1, '2026-03-10 14:37:10', 0, 0),
(3, 'Cumbe', 'Via principal La Quebrada Sector el Cumbe', 41, 2, NULL, 1, '2026-03-10 14:38:01', 1, 0),
(4, 'Cucharito', 'Av Transandina, Detras del Chef Luis', 40, 5, NULL, 1, '2026-03-10 14:38:29', 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id_asistencia` int(11) NOT NULL,
  `id_reunion` int(11) NOT NULL,
  `id_pastor` int(11) NOT NULL,
  `motivo` text DEFAULT NULL,
  `justificada` tinyint(1) DEFAULT 0,
  `registrado_el` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pastores`
--

CREATE TABLE `pastores` (
  `id_pastor` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `edad` int(11) DEFAULT NULL,
  `esposa` varchar(100) DEFAULT NULL,
  `hijos` int(11) DEFAULT 0,
  `anos_ministerio` int(11) DEFAULT NULL,
  `tipo_licencia` varchar(50) DEFAULT NULL,
  `cargo` varchar(50) DEFAULT NULL,
  `id_iglesia` int(11) DEFAULT NULL,
  `zona` int(11) DEFAULT NULL,
  `estatus_activo` tinyint(1) DEFAULT 1,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pastores`
--

INSERT INTO `pastores` (`id_pastor`, `nombre`, `apellido`, `cedula`, `edad`, `esposa`, `hijos`, `anos_ministerio`, `tipo_licencia`, `cargo`, `id_iglesia`, `zona`, `estatus_activo`, `fecha_registro`) VALUES
(1, 'David Jose', 'Martinez Gil', 'V-12.345.678', 56, 'Marisela de Martinez', 5, 23, 'Ordenado', 'Pastor Titular', 1, 1, 1, '2026-01-21 02:16:44'),
(2, 'Jhohao Jose', 'Suarez Lopez', '18880463', NULL, NULL, NULL, NULL, 'Ordenado', 'Secretario Nacional de jovenes', 2, NULL, 1, '2026-03-10 14:39:39'),
(3, 'Leandro Josue', 'Molina Gil', '17598615', NULL, NULL, NULL, NULL, 'Ordenado', 'Presbiter Nor Occidente 1', 3, NULL, 1, '2026-03-10 14:40:12'),
(4, 'Nelvin Jose', 'Marquez Diaz', '16533189', NULL, 'Carolina De Marquez', 0, NULL, 'Ordenado', 'Secretario Nor occidente 1', 4, NULL, 1, '2026-03-10 14:40:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reportes_mensuales`
--

CREATE TABLE `reportes_mensuales` (
  `id_reporte` int(11) NOT NULL,
  `id_pastor` int(11) NOT NULL,
  `id_iglesia` int(11) NOT NULL,
  `mes_reportado` varchar(20) NOT NULL,
  `anio_reportado` int(11) NOT NULL,
  `diezmos_bs` decimal(15,2) DEFAULT 0.00,
  `poder_del_uno_bs` decimal(15,2) DEFAULT 0.00,
  `unica_sectorial_bs` decimal(15,2) DEFAULT 0.00,
  `campamento_bs` decimal(15,2) DEFAULT 0.00,
  `convencion_bs` decimal(15,2) DEFAULT 0.00,
  `ofrenda_1_nombre` varchar(50) DEFAULT NULL,
  `ofrenda_1_bs` decimal(15,2) DEFAULT 0.00,
  `ofrenda_2_nombre` varchar(50) DEFAULT NULL,
  `ofrenda_2_bs` decimal(15,2) DEFAULT 0.00,
  `diezmos_usd` decimal(15,2) DEFAULT 0.00,
  `poder_del_uno_usd` decimal(15,2) DEFAULT 0.00,
  `unica_sectorial_usd` decimal(15,2) DEFAULT 0.00,
  `campamento_usd` decimal(15,2) DEFAULT 0.00,
  `convencion_usd` decimal(15,2) DEFAULT 0.00,
  `ofrenda_1_usd` decimal(15,2) DEFAULT 0.00,
  `ofrenda_2_usd` decimal(15,2) DEFAULT 0.00,
  `diezmos_cop` decimal(15,2) DEFAULT 0.00,
  `poder_del_uno_cop` decimal(15,2) DEFAULT 0.00,
  `unica_sectorial_cop` decimal(15,2) DEFAULT 0.00,
  `campamento_cop` decimal(15,2) DEFAULT 0.00,
  `convencion_cop` decimal(15,2) DEFAULT 0.00,
  `ofrenda_1_cop` decimal(15,2) DEFAULT 0.00,
  `ofrenda_2_cop` decimal(15,2) DEFAULT 0.00,
  `tipo_pago` enum('Efectivo','Pago Movil','Transferencia') NOT NULL,
  `banco_destino` varchar(50) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `referencia` varchar(100) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reportes_mensuales`
--

INSERT INTO `reportes_mensuales` (`id_reporte`, `id_pastor`, `id_iglesia`, `mes_reportado`, `anio_reportado`, `diezmos_bs`, `poder_del_uno_bs`, `unica_sectorial_bs`, `campamento_bs`, `convencion_bs`, `ofrenda_1_nombre`, `ofrenda_1_bs`, `ofrenda_2_nombre`, `ofrenda_2_bs`, `diezmos_usd`, `poder_del_uno_usd`, `unica_sectorial_usd`, `campamento_usd`, `convencion_usd`, `ofrenda_1_usd`, `ofrenda_2_usd`, `diezmos_cop`, `poder_del_uno_cop`, `unica_sectorial_cop`, `campamento_cop`, `convencion_cop`, `ofrenda_1_cop`, `ofrenda_2_cop`, `tipo_pago`, `banco_destino`, `fecha_pago`, `referencia`, `observaciones`, `creado_el`) VALUES
(1, 1, 1, 'Enero', 2026, 2500.50, 500.00, 300.00, 0.00, 1200.00, NULL, 0.00, NULL, 0.00, 45.00, 10.00, 5.00, 0.00, 20.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'Transferencia', 'Bancamiga', '2026-01-27', 'TRF-992837462', NULL, '2026-01-28 01:38:57');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reuniones`
--

CREATE TABLE `reuniones` (
  `id_reunion` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `fecha` datetime NOT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `creado_el` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reuniones`
--

INSERT INTO `reuniones` (`id_reunion`, `titulo`, `fecha`, `lugar`, `descripcion`, `creado_el`) VALUES
(1, 'Reunión General', '2026-03-28 00:00:00', 'Valera Central', '', '2026-02-28 02:21:38');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `hijos_pastores`
--
ALTER TABLE `hijos_pastores`
  ADD PRIMARY KEY (`id_hijo`),
  ADD KEY `id_pastor` (`id_pastor`);

--
-- Indices de la tabla `iglesias`
--
ALTER TABLE `iglesias`
  ADD PRIMARY KEY (`id_iglesia`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id_asistencia`),
  ADD KEY `id_reunion` (`id_reunion`),
  ADD KEY `id_pastor` (`id_pastor`);

--
-- Indices de la tabla `pastores`
--
ALTER TABLE `pastores`
  ADD PRIMARY KEY (`id_pastor`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `reportes_mensuales`
--
ALTER TABLE `reportes_mensuales`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `id_pastor` (`id_pastor`),
  ADD KEY `id_iglesia` (`id_iglesia`);

--
-- Indices de la tabla `reuniones`
--
ALTER TABLE `reuniones`
  ADD PRIMARY KEY (`id_reunion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `id_pastor` (`id_pastor`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `hijos_pastores`
--
ALTER TABLE `hijos_pastores`
  MODIFY `id_hijo` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `iglesias`
--
ALTER TABLE `iglesias`
  MODIFY `id_iglesia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id_asistencia` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pastores`
--
ALTER TABLE `pastores`
  MODIFY `id_pastor` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `reportes_mensuales`
--
ALTER TABLE `reportes_mensuales`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `reuniones`
--
ALTER TABLE `reuniones`
  MODIFY `id_reunion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `hijos_pastores`
--
ALTER TABLE `hijos_pastores`
  ADD CONSTRAINT `hijos_pastores_ibfk_1` FOREIGN KEY (`id_pastor`) REFERENCES `pastores` (`id_pastor`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`id_reunion`) REFERENCES `reuniones` (`id_reunion`) ON DELETE CASCADE,
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`id_pastor`) REFERENCES `pastores` (`id_pastor`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reportes_mensuales`
--
ALTER TABLE `reportes_mensuales`
  ADD CONSTRAINT `reportes_mensuales_ibfk_1` FOREIGN KEY (`id_pastor`) REFERENCES `pastores` (`id_pastor`) ON DELETE CASCADE,
  ADD CONSTRAINT `reportes_mensuales_ibfk_2` FOREIGN KEY (`id_iglesia`) REFERENCES `iglesias` (`id_iglesia`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_pastor`) REFERENCES `pastores` (`id_pastor`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
