# Arquitectura para Tableros estilo Notion

## Estructura de Datos en Firebase

```
/boards
  /{boardId}
    name: "Nombre del tablero"
    columns: [
      {
        id: "col1",
        name: "Estado",
        type: "estado",
        order: 0
      }
    ]
    groupBy: "col1" // Columna por la que se agrupa
    createdAt: timestamp
    updatedAt: timestamp

/cards
  /{boardId}
    /{cardId}
      title: "Título de la tarjeta"
      properties: {
        col1: "En progreso", // Valor según el tipo de columna
        col2: "Alta",
        col3: "usuario@email.com"
      }
      order: 0 // Orden dentro de la columna
      createdAt: timestamp
      updatedAt: timestamp
```

## Características Principales

### 1. Columnas Dinámicas

- Las columnas se definen al crear el tablero
- Cada columna tiene un tipo (texto, número, fecha, prioridad, etc.)
- Una columna se usa para agrupar (groupBy)

### 2. Tarjetas (Cards)

- Cada tarjeta tiene un título
- Propiedades dinámicas según las columnas del tablero
- Se pueden arrastrar entre columnas (si groupBy es de tipo "estado")

### 3. Vista de Tablero

- Columnas generadas dinámicamente basadas en groupBy
- Tarjetas agrupadas por el valor de la propiedad groupBy
- Drag and drop para mover tarjetas entre columnas

### 4. Modal de Tarjeta

- Vista detallada de la tarjeta
- Edición de todas las propiedades
- Campos según el tipo de columna

## Flujo de Trabajo

1. **Crear Tablero**: Define columnas y selecciona groupBy
2. **Ver Tablero**: Muestra columnas basadas en groupBy
3. **Crear Tarjeta**: Modal con campos según las columnas
4. **Editar Tarjeta**: Modal para modificar propiedades
5. **Mover Tarjeta**: Drag and drop actualiza la propiedad groupBy
