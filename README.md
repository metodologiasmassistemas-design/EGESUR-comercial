# EGESUR - Asistente Comercial API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

API REST para descargar dispositivos legales del Diario Oficial El Peruano y almacenarlos automáticamente en Google Drive. Diseñada para integrarse como **GPT Action** en ChatGPT.

---

## 🚀 Características

- ✅ Descarga automática de PDFs del Diario Oficial El Peruano
- ✅ Validación de URLs y archivos
- ✅ Almacenamiento en Google Drive con metadatos
- ✅ Manejo de errores robusto
- ✅ API REST con autenticación por API Key
- ✅ Schema OpenAPI para integración con GPT Actions
- ✅ Limpieza automática de archivos temporales

## 📋 Requisitos Previos

- Node.js 18 o superior
- Cuenta de Google Cloud con Drive API habilitada
- Service Account de Google con permisos en Drive

## 🛠️ Instalación

### 1. Clonar o crear el proyecto

```bash
cd "C:\Dev\Consultora\EGESUR-Asistente Comercial"
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Google Cloud

#### A. Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Google Drive API**:
   - Ve a "APIs & Services" > "Library"
   - Busca "Google Drive API"
   - Haz clic en "Enable"

#### B. Crear Service Account

1. Ve a "IAM & Admin" > "Service Accounts"
2. Haz clic en "Create Service Account"
3. Configura:
   - **Name**: `egesur-drive-uploader`
   - **Description**: Service account para subir archivos a Drive
4. Haz clic en "Create and Continue"
5. En "Grant this service account access to project":
   - No necesitas asignar roles específicos del proyecto
   - Haz clic en "Continue"
6. Haz clic en "Done"

#### C. Generar credenciales JSON

1. En la lista de Service Accounts, haz clic en el que acabas de crear
2. Ve a la pestaña "Keys"
3. Haz clic en "Add Key" > "Create new key"
4. Selecciona "JSON" y haz clic en "Create"
5. Se descargará un archivo JSON - **guárdalo de forma segura**

#### D. Configurar carpeta de Google Drive

1. Crea una carpeta en Google Drive para almacenar los PDFs
   - Ejemplo: "EGESUR - Dispositivos Legales"
2. Comparte la carpeta con el email del Service Account:
   - Email del Service Account: `egesur-drive-uploader@tu-proyecto.iam.gserviceaccount.com`
   - Permiso: **Editor**
3. Obtén el ID de la carpeta desde la URL:
   - URL ejemplo: `https://drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
   - Folder ID: `1a2b3c4d5e6f7g8h9i0j`

### 4. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` con tus datos:

```env
# Puerto del servidor
PORT=3000

# API Key (genera una segura)
API_KEY=tu_api_key_super_secreta_aqui_12345

# ID de la carpeta de Google Drive
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j

# Opción 1: JSON del Service Account en una línea (recomendado para deployment)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"..."}

# Opción 2: Ruta al archivo JSON (para desarrollo local)
# GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
```

**💡 Tip**: Para producción, usa `GOOGLE_SERVICE_ACCOUNT_JSON`. Para desarrollo, puedes usar `GOOGLE_APPLICATION_CREDENTIALS`.

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

## 🧪 Probar la API

### 1. Verificar salud del sistema

```bash
curl -X GET http://localhost:3000/api/dispositivos/health \
  -H "x-api-key: tu_api_key_super_secreta_aqui_12345"
```

### 2. Descargar dispositivos

```bash
curl -X POST http://localhost:3000/api/dispositivos/download \
  -H "Content-Type: application/json" \
  -H "x-api-key: tu_api_key_super_secreta_aqui_12345" \
  -d '{
    "dispositivos": [
      {
        "url": "https://busquedas.elperuano.pe/download/url/aprueban-reglamento.pdf",
        "numero": "DS-001-2024-EM",
        "titulo": "Aprueban Reglamento de Generación Eléctrica",
        "fecha": "07/10/2025",
        "entidad": "Ministerio de Energía y Minas"
      }
    ]
  }'
```

## 🌐 Deployment

### Opciones recomendadas:

#### **Opción A: Railway** (Recomendado - Fácil y gratis para empezar)

1. Crea cuenta en [Railway.app](https://railway.app)
2. Haz clic en "New Project" > "Deploy from GitHub repo"
3. Conecta tu repositorio
4. Agrega las variables de entorno en Settings > Variables
5. Railway generará automáticamente una URL HTTPS

#### **Opción B: Render**

1. Crea cuenta en [Render.com](https://render.com)
2. New > Web Service
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Agrega las variables de entorno
6. Deploy

#### **Opción C: Vercel**

1. Crea cuenta en [Vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Agrega un archivo `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ]
}
```

4. Agrega las variables de entorno
5. Deploy

## 🤖 Integrar con GPT Action

### 1. Subir a producción

Primero despliega tu API usando una de las opciones anteriores. Obtendrás una URL como:
- `https://tu-app.railway.app`
- `https://tu-app.onrender.com`
- `https://tu-app.vercel.app`

### 2. Configurar GPT Action

1. Ve a ChatGPT y abre tu GPT personalizado
2. En "Actions", haz clic en "Create new action"
3. Importa el schema:
   - **Opción A**: Copia el contenido de `openapi-schema.yaml`
   - **Opción B**: Sube el archivo directamente
4. Actualiza la URL del servidor:
   ```yaml
   servers:
     - url: https://tu-app.railway.app
   ```

### 3. Configurar autenticación

1. En Authentication, selecciona "API Key"
2. Configura:
   - **Auth Type**: API Key
   - **API Key**: `tu_api_key_super_secreta_aqui_12345`
   - **Header Name**: `x-api-key`

### 4. Probar la integración

En tu GPT, prueba con un prompt como:

```
Descarga estos dispositivos a Google Drive:
- URL: https://busquedas.elperuano.pe/download/url/ds-001-2024.pdf
- Número: DS-001-2024-EM
- Título: Reglamento de Generación
- Fecha: 07/10/2025
- Entidad: MINEM
```

## 📁 Estructura del Proyecto

```
EGESUR-Asistente Comercial/
├── src/
│   ├── auth/
│   │   └── oauth.js               # Flujo de autenticación OAuth 2.0
│   ├── config/
│   │   └── index.js               # Configuración y variables de entorno
│   ├── middleware/
│   │   └── auth.js                # Autenticación por API Key
│   ├── routes/
│   │   └── dispositivos.js        # Rutas de la API
│   ├── services/
│   │   ├── pdfDownloader.js       # Servicio de descarga de PDFs
│   │   ├── driveUploader.js       # Servicio de subida (Service Account)
│   │   └── driveUploaderOAuth.js  # Servicio de subida (OAuth 2.0)
│   └── server.js                  # Servidor Express
├── config/                        # Credenciales (no commitear)
│   ├── google-credentials.json    # Service Account (gitignored)
│   ├── oauth-credentials.json     # OAuth credentials (gitignored)
│   └── oauth-token.json           # OAuth token (gitignored)
├── docs/                          # Documentación
│   ├── claude.md                  # Prompt original del GPT
│   └── GUIA_CONFIGURACION_GPT.md  # Guía de configuración del GPT
├── .env                           # Variables de entorno (no commitear)
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore                     # Archivos ignorados por git
├── DEPLOYMENT.md                  # Guía de deployment
├── openapi-schema.yaml            # Schema OpenAPI para GPT Action
├── package.json                   # Dependencias del proyecto
├── railway.json                   # Configuración de Railway
├── vercel.json                    # Configuración de Vercel
└── README.md                      # Este archivo
```

## 🔒 Seguridad

- ✅ Autenticación por API Key en todos los endpoints
- ✅ Validación de URLs del Diario Oficial
- ✅ Headers de seguridad con Helmet
- ✅ CORS configurado
- ✅ Credenciales de Google en variables de entorno
- ✅ `.gitignore` protege archivos sensibles

**⚠️ IMPORTANTE**:
- Nunca commitees el archivo `.env`
- Nunca commitees `google-credentials.json`
- Usa API Keys fuertes y únicas
- En producción, usa HTTPS siempre

## 🐛 Solución de Problemas

### Error: "API Key requerida"
- Verifica que incluyes el header `x-api-key` en tus peticiones
- Confirma que el valor coincide con `API_KEY` en `.env`

### Error: "Error verificando carpeta de Drive"
- Verifica que el `GOOGLE_DRIVE_FOLDER_ID` es correcto
- Confirma que compartiste la carpeta con el Service Account
- Revisa que el Service Account tiene permisos de Editor

### Error: "URL no válida del Diario Oficial"
- Asegúrate que la URL es de `elperuano.pe`
- Verifica que la URL apunta directamente a un PDF

### Error al descargar PDFs
- Verifica tu conexión a internet
- Confirma que la URL del PDF es accesible
- Algunos PDFs pueden tener restricciones

## 📝 Ejemplo de Respuesta Exitosa

```json
{
  "success": true,
  "summary": {
    "total": 2,
    "downloaded": 2,
    "uploaded": 2,
    "failed": 0
  },
  "uploaded": [
    {
      "numero": "DS-001-2024-EM",
      "titulo": "Aprueban Reglamento de Generación Eléctrica",
      "driveFileId": "1a2b3c4d5e6f7g8h9i0j",
      "driveLink": "https://drive.google.com/file/d/1a2b3c4d5e6f7g8h9i0j/view",
      "downloadLink": "https://drive.google.com/uc?id=1a2b3c4d5e6f7g8h9i0j&export=download"
    }
  ],
  "errors": []
}
```

## 🤝 Soporte

Para problemas o preguntas:
1. Revisa la sección de Solución de Problemas
2. Verifica los logs del servidor
3. Prueba el endpoint `/health` para diagnosticar

## 📄 Licencia

MIT
