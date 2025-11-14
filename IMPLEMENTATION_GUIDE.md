# Guía de Implementación - Tableros estilo Notion

## Resumen

Para emular la funcionalidad de tableros de Notion, necesitamos implementar:

### 1. ✅ Servicios de Firebase (Creados)
- `boardService.js`: CRUD de tableros
- `cardService.js`: CRUD de tarjetas

### 2. ⏳ Componentes Necesarios

#### A. Lista de Tableros (Boards.jsx - Actualizar)
- Mostrar grid de tableros existentes
- Integrar creación con Firebase
- Navegar a vista de tablero individual

#### B. Vista de Tablero (BoardView.jsx - Crear)
- Mostrar columnas dinámicamente basadas en `groupBy`
- Agrupar tarjetas por valor de la propiedad `groupBy`
- Implementar drag and drop con @dnd-kit
- Botón para crear nueva tarjeta

#### C. Tarjeta (Card.jsx - Crear)
- Componente de tarjeta individual
- Mostrar título y propiedades principales
- Click para abrir modal de detalles

#### D. Modal de Tarjeta (CardModal.jsx - Crear)
- Formulario dinámico según columnas del tablero
- Campos según tipo de columna:
  - Texto: input text
  - Número: input number
  - Email: input email
  - Fecha: input date
  - Prioridad: select con opciones
  - Estado: select (usado para groupBy)
  - etc.
- Guardar/actualizar tarjeta

### 3. Flujo de Datos

```
1. Usuario crea tablero → createBoard() → Firebase
2. Usuario abre tablero → getBoard() + subscribeToCards() → Renderizar columnas
3. Usuario crea tarjeta → createCard() → Firebase → Actualizar vista
4. Usuario mueve tarjeta → moveCard() → Actualizar propiedad groupBy → Firebase
5. Usuario edita tarjeta → updateCard() → Firebase → Actualizar vista
```

### 4. Estructura de Columnas

Las columnas se generan dinámicamente:
- Si `groupBy = "Estado"` y hay valores: "Pendiente", "En progreso", "Completado"
- Se crean 3 columnas automáticamente
- Las tarjetas se agrupan según su propiedad "Estado"

### 5. Drag and Drop

Usar @dnd-kit para:
- Arrastrar tarjetas entre columnas
- Al soltar, actualizar la propiedad `groupBy` de la tarjeta
- Reordenar tarjetas dentro de la misma columna

## Próximos Pasos

1. Actualizar `Boards.jsx` para mostrar lista de tableros
2. Crear `BoardView.jsx` con vista de tablero
3. Crear `Card.jsx` y `CardModal.jsx`
4. Integrar drag and drop
5. Conectar todo con Firebase

