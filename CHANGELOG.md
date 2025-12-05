# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [Unreleased]

### Agregado
- **Autenticación con Email/Password**:
  - Sistema de registro e inicio de sesión con email y contraseña usando Firebase Authentication
  - Formulario de registro con campos para nombre de usuario, foto de perfil, email y contraseña
  - Opción "Recuérdame" para persistencia de sesión (localStorage vs sessionStorage)
  - Validación de formularios con react-hook-form
  - Manejo de errores con mensajes traducidos y específicos
- **Gestión de Perfil de Usuario**:
  - Subida de foto de perfil a Firebase Storage durante el registro
  - Actualización automática del perfil con nombre de usuario y foto
  - Vista previa de foto antes de subir
  - Validación de imagen (tipo y tamaño máximo 5MB)
- **Botón "Compartir Tablero"**:
  - Botón en el encabezado del tablero para copiar la URL al portapapeles
  - Modal de confirmación al copiar el enlace
- **Creación de tableros en dos pasos**: 
  - Paso 1: Formulario para definir columnas con nombre, color y ordenamiento
  - Paso 2: Formulario para definir propiedades de las cards (nombre y tipo de dato)
- **Redimensionamiento de columnas**: Las columnas ahora pueden ser redimensionadas por el usuario, con anchos personalizables que se guardan en Firebase
- **Contador de cards**: Cada columna muestra un contador con el número de items que contiene
- **Botón "Agregar item" en encabezado**: El botón para agregar items ahora está en el encabezado de cada columna, mostrando solo el ícono "+" con tooltip
- **Color de fondo en cards**: Las cards ahora tienen un color de fondo con baja opacidad que coincide con el color de su columna
- **Exportación a CSV**: Funcionalidad para exportar el contenido del tablero a formato CSV con encoding UTF-8 (soporta caracteres especiales y acentos)
- **Importación desde CSV**: 
  - Descarga de plantilla CSV con ejemplos de las columnas disponibles
  - Carga de archivos CSV para importar items al tablero
  - Validación de columnas y manejo de errores
- **Mejoras en drag and drop móvil**: Configuración mejorada de sensores para mejor funcionamiento en dispositivos móviles

### Modificado
- **Navbar**: 
  - Muestra el nombre de usuario en lugar del email
  - Muestra la foto de perfil del usuario autenticado
  - Botones de inicio de sesión y cierre de sesión según el estado de autenticación
- **Modal de creación de tablero**: Ahora es un flujo de dos pasos en lugar de un solo formulario
- **Estructura de datos de tableros**: Se agregó el campo `properties` para almacenar las propiedades de las cards
- **Estructura de datos de columnas**: Se agregó el campo `width` para almacenar el ancho personalizado de cada columna
- **Ancho de columnas**: Cambiado de ancho fijo (1/4) a ancho personalizable con límites (150px - 500px)

### Corregido
- **Encoding CSV**: Agregado BOM UTF-8 para correcta visualización de caracteres especiales y acentos en Excel y otros programas
- **Drag and drop en móviles**: Mejorado el manejo de eventos táctiles para evitar conflictos con el scroll
- **Rutas directas en Vercel**: Agregada configuración `vercel.json` para que todas las rutas redirijan a `index.html`, permitiendo acceso directo a URLs de tableros

