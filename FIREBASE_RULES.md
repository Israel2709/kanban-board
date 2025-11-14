# Reglas de Seguridad de Firebase Realtime Database

Para que la aplicación funcione correctamente, necesitas configurar las reglas de seguridad en Firebase Realtime Database.

## Configuración de Reglas

Ve a Firebase Console → Realtime Database → Rules y configura las siguientes reglas:

### Para Desarrollo (Permisivo - Solo para desarrollo)

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **ADVERTENCIA**: Estas reglas permiten lectura y escritura a cualquier usuario. Solo úsalas durante el desarrollo.

### Para Producción (Recomendado)

```json
{
  "rules": {
    "boards": {
      ".read": true,
      ".write": true,
      "$boardId": {
        ".validate": "newData.hasChildren(['name', 'columns', 'groupBy', 'createdAt', 'updatedAt'])",
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 100"
        },
        "columns": {
          ".validate": "newData.isArray() && newData.val().length > 0"
        }
      }
    },
    "cards": {
      ".read": true,
      ".write": true,
      "$boardId": {
        "$cardId": {
          ".validate": "newData.hasChildren(['title', 'properties', 'order', 'createdAt', 'updatedAt'])",
          "title": {
            ".validate": "newData.isString() && newData.val().length <= 200"
          },
          "properties": {
            ".validate": "newData.hasChildren()"
          }
        }
      }
    }
  }
}
```

## Pasos para Configurar

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: `kanban-board-62b21`
3. Ve a **Realtime Database** en el menú lateral
4. Haz clic en la pestaña **Rules**
5. Copia y pega las reglas (usa las de desarrollo primero para probar)
6. Haz clic en **Publish**

## Verificar Configuración

Después de configurar las reglas, intenta crear un tablero nuevamente. Si aún hay errores:

1. Verifica la consola del navegador para ver el error específico
2. Verifica que las reglas se hayan publicado correctamente
3. Asegúrate de que la base de datos esté en modo "Realtime Database" y no "Cloud Firestore"

## Errores Comunes

### Error: "Permission denied"
- Las reglas de seguridad no permiten la operación
- Verifica que las reglas estén publicadas
- Usa las reglas de desarrollo temporalmente para probar

### Error: "Database not found"
- Verifica que la URL de la base de datos sea correcta
- Asegúrate de que Realtime Database esté habilitado en tu proyecto

