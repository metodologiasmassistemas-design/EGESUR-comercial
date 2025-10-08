import { google } from 'googleapis';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { parse } from 'url';
import open from 'open';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = './config/oauth-token.json';
const CREDENTIALS_PATH = './config/oauth-credentials.json';

/**
 * Carga las credenciales OAuth del archivo o variable de entorno
 */
function loadCredentials() {
  // Prioridad 1: Variable de entorno
  if (process.env.OAUTH_CREDENTIALS_JSON) {
    return JSON.parse(process.env.OAUTH_CREDENTIALS_JSON);
  }

  // Prioridad 2: Archivo local
  if (existsSync(CREDENTIALS_PATH)) {
    const content = readFileSync(CREDENTIALS_PATH);
    return JSON.parse(content);
  }

  throw new Error('No se encontraron credenciales OAuth. Configura OAUTH_CREDENTIALS_JSON o crea el archivo oauth-credentials.json');
}

/**
 * Crea un cliente OAuth2
 */
function createOAuth2Client() {
  const credentials = loadCredentials();
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  return new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3001/oauth2callback'
  );
}

/**
 * Obtiene un nuevo token mediante el flujo OAuth
 */
async function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\n🔐 Autoriza esta aplicación visitando esta URL:\n');
  console.log(authUrl);
  console.log('\n📝 La página se abrirá automáticamente en tu navegador...\n');

  // Abrir navegador automáticamente
  await open(authUrl);

  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        if (req.url.indexOf('/oauth2callback') > -1) {
          const qs = new URL(req.url, 'http://localhost:3001').searchParams;
          const code = qs.get('code');

          res.end('✅ Autenticación exitosa! Puedes cerrar esta ventana y volver a la terminal.');
          server.close();

          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);

          // Guardar token
          writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
          console.log('✅ Token guardado en:', TOKEN_PATH);

          resolve(oAuth2Client);
        }
      } catch (err) {
        reject(err);
      }
    }).listen(3001, () => {
      console.log('🌐 Servidor de callback escuchando en http://localhost:3001');
    });
  });
}

/**
 * Autoriza y obtiene un cliente OAuth2 autenticado
 */
export async function authorize() {
  const oAuth2Client = createOAuth2Client();

  // Prioridad 1: Token desde variable de entorno (producción)
  if (process.env.OAUTH_TOKEN_JSON) {
    const token = JSON.parse(process.env.OAUTH_TOKEN_JSON);
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Prioridad 2: Token desde archivo local (desarrollo)
  if (existsSync(TOKEN_PATH)) {
    const token = JSON.parse(readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    // Verificar si el token está expirado
    if (token.expiry_date && token.expiry_date < Date.now()) {
      console.log('🔄 Token expirado, refrescando...');
      try {
        const { credentials } = await oAuth2Client.refreshAccessToken();
        oAuth2Client.setCredentials(credentials);
        writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        console.log('✅ Token refrescado');
      } catch (error) {
        console.log('❌ Error refrescando token, solicitando nueva autorización...');
        return getNewToken(oAuth2Client);
      }
    }

    return oAuth2Client;
  }

  // Si no existe token, obtener uno nuevo
  return getNewToken(oAuth2Client);
}

/**
 * Obtiene un cliente de Drive autenticado
 */
export async function getAuthenticatedDriveClient() {
  const auth = await authorize();
  return google.drive({ version: 'v3', auth });
}
