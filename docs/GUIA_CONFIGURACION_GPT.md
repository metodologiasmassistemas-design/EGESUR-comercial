# 📘 Guía de Configuración de GPT Action

Esta guía te ayudará a integrar la API con tu GPT personalizado en ChatGPT.

## 📋 Prerrequisitos

- ✅ API desplegada y funcionando (Railway, Render, Vercel, etc.)
- ✅ URL pública HTTPS de tu API
- ✅ API Key configurada
- ✅ ChatGPT Plus o Team (para crear GPTs personalizados)

## 🚀 Paso a Paso

### 1. Actualizar el Schema OpenAPI

Antes de configurar el GPT, actualiza el archivo `openapi-schema.yaml`:

```yaml
servers:
  - url: https://tu-dominio-real.railway.app
    description: Servidor de producción
```

Reemplaza `https://tu-dominio-real.railway.app` con la URL real de tu deployment.

### 2. Acceder a ChatGPT

1. Ve a [ChatGPT](https://chat.openai.com)
2. Haz clic en tu nombre de usuario (esquina superior derecha)
3. Selecciona "My GPTs"
4. Encuentra tu GPT "Asistente de Monitoreo Normativo - EGESUR" o crea uno nuevo

### 3. Configurar el GPT (Si es nuevo)

#### Información Básica

- **Name**: Asistente de Monitoreo Normativo - EGESUR
- **Description**: Asistente especializado en monitorear dispositivos legales del Diario Oficial El Peruano y almacenarlos en Google Drive
- **Instructions**: Copia las instrucciones de tu prompt actual (del archivo `claude.md`)

#### Logo (Opcional)

Puedes generar un logo usando DALL-E con un prompt como:
```
Un logo profesional para una empresa de energía eléctrica peruana, con elementos de electricidad y documentos legales, colores azul y verde, estilo moderno y corporativo
```

### 4. Configurar Actions

#### A. Agregar nueva Action

1. En la configuración del GPT, ve a la sección "Actions"
2. Haz clic en "Create new action"
3. Se abrirá un editor de schema

#### B. Importar el Schema

**Opción 1: Copiar y pegar**
1. Abre el archivo `openapi-schema.yaml`
2. Copia todo su contenido
3. Pégalo en el editor de ChatGPT
4. Haz clic en "Save"

**Opción 2: Importar desde URL** (Requiere que el schema esté público)
1. Sube `openapi-schema.yaml` a un servicio como GitHub, Gist, etc.
2. En ChatGPT, haz clic en "Import from URL"
3. Pega la URL del schema
4. Haz clic en "Import"

#### C. Verificar el Schema

ChatGPT validará automáticamente el schema. Deberías ver:
- ✅ `POST /api/dispositivos/download` - Descargar dispositivos y subir a Google Drive
- ✅ `GET /api/dispositivos/health` - Verificar estado de la API

### 5. Configurar Autenticación

1. En la sección de "Authentication", haz clic en "Add"
2. Selecciona "**API Key**"
3. Configura los siguientes valores:

   ```
   Authentication Type: API Key
   API Key: [Tu API Key del archivo .env]
   Auth Type: Custom
   Custom Header Name: x-api-key
   ```

4. Haz clic en "Save"

### 6. Configurar Privacy

En la configuración del GPT:
1. **Conversation starters**: Agrega estos ejemplos opcionales:
   ```
   - "Inicia el monitoreo normativo!"
   - "Encontré un dispositivo importante. Evalúa su impacto comercial"
   - "Busca dispositivos de la semana pasada"
   ```

2. **Capabilities**:
   - ✅ Web Browsing (para buscar en El Peruano)
   - ⬜ DALL·E Image Generation (no necesario)
   - ⬜ Code Interpreter (no necesario)

3. **Additional Settings**:
   - Sharing: Decide si será privado, solo para tu organización, o público

### 7. Actualizar las Instrucciones del GPT

Modifica las instrucciones del GPT para incluir el uso de la Action:

```
Eres un **Asistente de Monitoreo Normativo** para EGESUR. Tu objetivo principal es guiar a los usuarios a través del proceso de revisión diaria del Diario Oficial El Peruano para identificar y analizar dispositivos legales que impacten la gestión comercial de la empresa.

**Tus funciones clave son:**
- **Identificación y Análisis:** Ayuda al usuario a identificar dispositivos legales relevantes
- **Evaluación de Impacto:** Asiste en la evaluación del impacto de cada dispositivo
- **Generación de Documentación:** Facilita la creación del cuadro resumen
- **Almacenamiento Automático:** Descarga y almacena PDFs en Google Drive usando la API

**Proceso Caso A: "Inicia el monitoreo normativo!"**

Paso 1. Solicita periodo de búsqueda (día anterior, semana, mes, etc.)

Paso 2. Identifica dispositivos del Diario Oficial El Peruano usando web browsing y muestra tabla con:
- ID secuencial
- Número de dispositivo
- Fecha de publicación
- Título
- Entidad autora
- Resumen
- URL de la fuente

Paso 3. Genera descripción de impacto en EGESUR (alto/medio/bajo/sin impacto) y acciones recomendadas

Paso 4. **IMPORTANTE**: Usa la Action "downloadDispositivos" para:
- Descargar automáticamente todos los PDFs de los dispositivos encontrados
- Almacenarlos en Google Drive
- Obtener los links de Drive

Estructura de llamada a la Action:
{
  "dispositivos": [
    {
      "url": "URL_del_PDF",
      "numero": "NUMERO_DISPOSITIVO",
      "titulo": "TITULO_DISPOSITIVO",
      "fecha": "DD/MM/YYYY",
      "entidad": "ENTIDAD_AUTORA"
    }
  ]
}

Paso 5. Elabora cuadro final incluyendo los links de Google Drive obtenidos de la Action

**Proceso Caso B: "Evalúa impacto comercial"**

Similar al Caso A pero para un dispositivo específico.

**Reglas importantes:**
- Todos los dispositivos deben registrarse, incluso sin impacto directo
- Siempre intenta descargar los PDFs a Drive usando la Action
- Si la descarga falla, indícalo pero continúa con el análisis
- Incluye los links de Drive en el cuadro final
```

### 8. Probar la Integración

#### Test 1: Verificar conexión

En una conversación con tu GPT, prueba:

```
Verifica que la conexión con Google Drive esté funcionando
```

El GPT debería llamar a la Action `/health` y reportar el estado.

#### Test 2: Descargar un dispositivo

```
Descarga este dispositivo a Drive:
- URL: [URL real de un PDF del Peruano]
- Número: DS-001-2024-EM
- Título: Prueba de descarga
- Fecha: 07/10/2025
- Entidad: MINEM
```

El GPT debería:
1. Llamar a la Action `/download`
2. Reportar el éxito/fallo
3. Mostrar el link de Google Drive si tuvo éxito

### 9. Flujo Completo Integrado

Una vez configurado, el flujo completo será:

**Usuario dice**: "Inicia el monitoreo normativo del día anterior"

**GPT hace**:
1. 🔍 Usa web browsing para buscar dispositivos en El Peruano
2. 📊 Genera tabla con dispositivos encontrados
3. 📥 **Llama a la Action** para descargar PDFs a Drive
4. 📋 Genera análisis de impacto
5. ✅ Muestra cuadro final con links de Drive

### 10. Solución de Problemas

#### Error: "Action failed to run"
- Verifica que la URL del servidor en el schema sea correcta y accesible
- Confirma que el servidor esté en funcionamiento
- Revisa los logs del servidor para ver el error específico

#### Error: "Authentication failed"
- Verifica que la API Key sea correcta
- Confirma que el header name sea exactamente `x-api-key`
- Asegúrate de haber guardado la configuración de autenticación

#### El GPT no llama a la Action
- Asegúrate de mencionar explícitamente en las instrucciones cuándo usar la Action
- Prueba con prompts directos como "descarga esto a Drive"
- Verifica que el schema esté correctamente importado

#### Error: "Invalid response from action"
- Verifica que el servidor esté respondiendo en formato JSON
- Confirma que la estructura de respuesta coincida con el schema
- Revisa los logs del servidor

### 11. Mejoras Opcionales

#### A. Agregar validación previa

En las instrucciones del GPT, puedes agregar:

```
Antes de llamar a la Action de descarga, verifica que:
1. Todas las URLs sean del dominio elperuano.pe
2. Cada dispositivo tenga número, título, fecha y URL
3. Las URLs apunten a archivos PDF
```

#### B. Manejo de errores mejorado

```
Si la descarga falla:
1. Informa al usuario del error específico
2. Sugiere verificar la URL manualmente
3. Continúa con los demás dispositivos
4. Al final, muestra resumen de éxitos y fallos
```

#### C. Notificaciones de progreso

```
Para múltiples dispositivos:
1. Informa "Iniciando descarga de X dispositivos..."
2. Llama a la Action
3. Reporta "Descargados exitosamente X de Y dispositivos"
4. Lista los que fallaron si hubo errores
```

### 12. Mantenimiento

#### Actualizar el Schema
Si modificas la API:
1. Actualiza `openapi-schema.yaml`
2. En ChatGPT GPT Editor, ve a Actions
3. Reemplaza el schema existente
4. Guarda los cambios

#### Rotar API Key
Si necesitas cambiar la API Key:
1. Actualiza `.env` en el servidor
2. Reinicia el servidor
3. En ChatGPT GPT Editor, ve a Actions > Authentication
4. Actualiza la API Key
5. Guarda

#### Cambiar URL del servidor
Si cambias de hosting:
1. Actualiza la URL en `openapi-schema.yaml`
2. Re-importa el schema en ChatGPT
3. Guarda los cambios

## ✅ Checklist Final

Antes de dar por terminada la configuración, verifica:

- [ ] Schema OpenAPI importado correctamente
- [ ] URL del servidor actualizada a producción
- [ ] Autenticación configurada con API Key
- [ ] Test de `/health` exitoso
- [ ] Test de `/download` exitoso
- [ ] Instrucciones del GPT actualizadas para usar Actions
- [ ] Links de Drive aparecen en respuestas del GPT
- [ ] Manejo de errores funciona correctamente

## 🎉 ¡Listo!

Tu GPT ahora puede:
- 🔍 Buscar dispositivos en El Peruano
- 📥 Descargarlos automáticamente
- ☁️ Almacenarlos en Google Drive
- 📊 Generar análisis de impacto
- 📋 Crear cuadros con links directos a Drive

**¡Tu asistente normativo está completamente integrado!**
