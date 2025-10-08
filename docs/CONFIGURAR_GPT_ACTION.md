# 🤖 Guía: Configurar GPT Action

## Paso 1: Abrir tu GPT en ChatGPT

1. Ve a: https://chat.openai.com
2. Click en tu perfil (esquina superior derecha)
3. Selecciona **"My GPTs"**
4. Encuentra tu GPT: **"Asistente de Monitoreo Normativo - EGESUR"**
5. Click en **"Edit"** (botón de lápiz)

---

## Paso 2: Actualizar las Instrucciones (Prompt)

1. En la pestaña **"Configure"**
2. En el campo **"Instructions"**, reemplaza todo el contenido con el prompt de: `docs/PROMPT_GPT_ACTUALIZADO.md`
3. Copia desde "Eres un **Asistente..." hasta el final

---

## Paso 3: Agregar la Action

1. Baja hasta la sección **"Actions"**
2. Click en **"Create new action"**
3. Se abrirá el editor de schema

### 3.1 Importar el Schema OpenAPI

**Opción A: Copiar y pegar (Recomendado)**

1. Abre el archivo: `openapi-schema.yaml`
2. Copia TODO el contenido
3. Pégalo en el editor de ChatGPT
4. Click en **"Save"** (arriba a la derecha)

**Opción B: Desde URL (si tienes el schema en un servidor)**

1. Click en **"Import from URL"**
2. Pega la URL del schema
3. Click en **"Import"**

### 3.2 Verificar el Schema

Deberías ver dos endpoints:

✅ `POST /api/dispositivos/download` - Descargar dispositivos y subir a Google Drive
✅ `GET /api/dispositivos/health` - Verificar estado de la API

---

## Paso 4: Configurar Autenticación

1. En la sección **"Authentication"**, click en el dropdown
2. Selecciona **"API Key"**
3. Configura:

**API Key:**
```
2ca10c4ecd7ae7000b8f9a2f4e31740495719b66c5c19e34f471b8ba44427c2a
```

**Auth Type:**
```
Custom
```

**Custom Header Name:**
```
x-api-key
```

4. Click en **"Save"**

---

## Paso 5: Configurar Privacy Level (Opcional)

En **"Additional Settings"**:

**Available to:**
```
🔒 Only me (para pruebas)
🏢 Only people with a link (para tu equipo)
🌐 Public (para todos)
```

Selecciona según tus necesidades.

---

## Paso 6: Probar la Action

### 6.1 Test Simple

1. Click en **"Test"** (esquina superior derecha del editor de GPT)
2. En el chat de prueba, escribe:

```
Verifica que la conexión con Google Drive funcione correctamente
```

3. El GPT debería llamar a `/health` y responder algo como:

```
✅ La conexión con Google Drive está funcionando correctamente.
La carpeta "EGESUR-Peruano-normativa" está accesible.
```

### 6.2 Test Completo

1. En el chat de prueba, escribe:

```
Descarga este dispositivo de prueba:
- URL: [una URL real de PDF del Peruano]
- Número: DS-TEST-2024
- Título: Dispositivo de prueba
- Fecha: 08/10/2024
- Entidad: MINEM
```

2. El GPT debería:
   - Llamar a la action `downloadDispositivos`
   - Reportar el éxito o fallo
   - Mostrar el link de Google Drive

---

## Paso 7: Guardar y Publicar

1. Una vez que las pruebas funcionen correctamente
2. Click en **"Save"** (esquina superior derecha)
3. Si todo está bien, click en **"Publish"** o **"Update"**

---

## ✅ Verificación Final

Tu GPT ahora debería tener estas capacidades:

- ✅ **Funcionalidad original:** Identificar, analizar y documentar dispositivos (SIN CAMBIOS)
- ✅ **Nueva funcionalidad:** Almacenar PDFs en Google Drive automáticamente
- ✅ **Manejo de errores:** Continúa funcionando aunque la API falle
- ✅ **Reportes:** Informa qué dispositivos se almacenaron exitosamente

---

## 🔧 Troubleshooting

### Error: "Action not working"

**Causa:** API Key incorrecta o mal configurada

**Solución:**
1. Ve a Actions → Authentication
2. Verifica que el header sea exactamente: `x-api-key`
3. Verifica que la API Key sea correcta
4. Guarda cambios

### Error: "Timeout"

**Causa:** Demasiados dispositivos en una llamada

**Solución:**
- El GPT automáticamente dividirá en grupos de 7
- Si persiste, reduce a grupos de 5 en el prompt

### Error: "URL inválida"

**Causa:** La URL no apunta directamente a un PDF

**Solución:**
- Es normal, algunas URLs del Peruano requieren navegación
- El GPT reportará el error y continuará
- El usuario puede descargar manualmente si es necesario

### GPT no llama a la Action

**Causa:** El prompt no es claro sobre cuándo usar la action

**Solución:**
- Verifica que copiaste el prompt actualizado completo
- Menciona explícitamente en el chat: "almacena esto en Drive"

---

## 📊 Ejemplo de Flujo Completo

**Usuario:** "Inicia el monitoreo normativo del día anterior"

**GPT:**
1. ✅ Solicita confirmar periodo (comportamiento original)
2. ✅ Busca dispositivos en El Peruano (comportamiento original)
3. ✅ Muestra tabla con dispositivos encontrados (comportamiento original)
4. ✅ Genera análisis de impacto (comportamiento original)
5. ✅ **[NUEVO]** Llama a la API para almacenar PDFs en Drive
6. ✅ **[NUEVO]** Reporta: "Se almacenaron exitosamente 4 de 5 dispositivos"
7. ✅ Muestra cuadro final con links de Drive (comportamiento mejorado)

---

## 🎉 ¡Listo!

Tu GPT ahora tiene integración completa con Google Drive manteniendo toda su funcionalidad original.

Para cualquier problema, revisa:
- Logs de Render: https://dashboard.render.com
- Test del endpoint: https://egesur-asistente-comercial.onrender.com/api/dispositivos/health
