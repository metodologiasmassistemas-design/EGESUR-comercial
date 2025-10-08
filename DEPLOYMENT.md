# 🚀 Guía de Deployment

Esta guía te ayudará a desplegar la API en Railway (opción recomendada).

## 📋 Pre-requisitos

- ✅ Cuenta de GitHub
- ✅ Cuenta de Railway (https://railway.app)
- ✅ OAuth 2.0 configurado localmente (archivo `config/oauth-credentials.json`)

## 🛤️ Deployment en Railway (Recomendado)

Railway es la opción más simple para este proyecto porque:
- ✅ Soporte nativo para Node.js
- ✅ Variables de entorno fáciles de configurar
- ✅ SSL/HTTPS automático
- ✅ Plan gratuito disponible
- ✅ Deploy automático desde GitHub

### Paso 1: Preparar el repositorio

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .

# Commit
git commit -m "Initial commit: EGESUR Asistente Comercial API"

# Crear repositorio en GitHub y conectar
git remote add origin https://github.com/tu-usuario/egesur-asistente-comercial.git
git branch -M main
git push -u origin main
```

### Paso 2: Configurar Railway

1. **Crear cuenta en Railway:**
   - Ve a https://railway.app
   - Haz clic en "Start a New Project"
   - Conecta tu cuenta de GitHub

2. **Crear nuevo proyecto:**
   - Selecciona "Deploy from GitHub repo"
   - Autoriza Railway para acceder a tus repositorios
   - Selecciona el repositorio `egesur-asistente-comercial`

3. **Configurar variables de entorno:**
   - En el dashboard de Railway, ve a "Variables"
   - Agrega las siguientes variables:

   ```
   PORT=3000
   API_KEY=tu_api_key_aqui
   GOOGLE_DRIVE_FOLDER_ID=1pbCb7XgWw-d2if2ITEr75-p-riLFuPri
   NODE_ENV=production
   ```

4. **Configurar OAuth (IMPORTANTE):**

   Para OAuth en producción necesitas el JSON de credenciales. Tienes 2 opciones:

   **Opción A: Variable de entorno (Recomendado)**
   - Copia el contenido de `config/oauth-credentials.json`
   - Minifícalo en una línea (sin saltos de línea)
   - Agrega la variable:
     ```
     OAUTH_CREDENTIALS_JSON={"installed":{"client_id":"...","client_secret":"...","redirect_uris":["..."]}}
     ```

   **Opción B: Archivo en repositorio privado**
   - Asegúrate que el repo sea PRIVADO
   - El archivo ya está en `.gitignore` por seguridad
   - Crea manualmente en Railway usando Railway CLI

5. **Deploy:**
   - Railway desplegará automáticamente
   - Obtendrás una URL como: `https://tu-proyecto.up.railway.app`

### Paso 3: Verificar el deployment

```bash
# Test health endpoint
curl https://tu-proyecto.up.railway.app/api/dispositivos/health \
  -H "x-api-key: tu_api_key"
```

### Paso 4: Configurar OAuth en producción

⚠️ **IMPORTANTE**: OAuth requiere configuración adicional en producción.

1. **Actualizar redirect URI en Google Cloud:**
   - Ve a Google Cloud Console
   - APIs & Services → Credentials
   - Edita tu OAuth 2.0 Client
   - Agrega redirect URI: `https://tu-proyecto.up.railway.app/oauth2callback`

2. **Primera autenticación en producción:**

   Railway no permite interacción directa para el flujo OAuth. Opciones:

   **Opción A: Autenticar localmente y subir token**
   ```bash
   # 1. Autentica localmente (ya lo hiciste)
   # 2. El token está en config/oauth-token.json
   # 3. En Railway, agrega variable de entorno:
   OAUTH_TOKEN_JSON={"access_token":"...","refresh_token":"...","scope":"...","token_type":"Bearer","expiry_date":1234567890}
   ```

   **Opción B: Usar Service Account para producción**
   - Más estable para producción
   - Ya tienes el Service Account configurado
   - Cambiar a usar `driveUploader.js` en lugar de `driveUploaderOAuth.js`

## 🔧 Configuración adicional

### Variables de entorno en Railway

```bash
# Esenciales
PORT=3000
NODE_ENV=production
API_KEY=tu_api_key_super_secreta

# Google Drive
GOOGLE_DRIVE_FOLDER_ID=tu_folder_id

# Opción 1: OAuth (requiere configuración adicional)
OAUTH_CREDENTIALS_JSON={"installed":{...}}
OAUTH_TOKEN_JSON={"access_token":"...","refresh_token":"..."}

# Opción 2: Service Account (más simple para producción)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

## 🔍 Troubleshooting

### Error: "Module not found"
- Verifica que `package.json` tenga todas las dependencias
- Railway ejecutará `npm install` automáticamente

### Error: "Port already in use"
- Railway asigna el puerto automáticamente
- Asegúrate de usar `process.env.PORT`

### Error: OAuth no funciona
- Verifica que los redirect URIs incluyan la URL de Railway
- Considera usar Service Account para producción

### Error: "Cannot find module 'open'"
- El paquete `open` no funciona en Railway (solo local)
- Para producción, el flujo OAuth debe adaptarse

## 📊 Monitoreo

Railway proporciona:
- Logs en tiempo real
- Métricas de CPU y memoria
- Reinicio automático si falla

## 🔄 Actualizaciones

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción del cambio"
git push

# Railway desplegará automáticamente
```

## 💡 Recomendaciones

1. **Para producción real**: Usa Service Account en lugar de OAuth
2. **Seguridad**: Mantén las API Keys seguras
3. **Monitoreo**: Revisa los logs regularmente
4. **Backups**: Guarda copias de las credenciales
