import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY,
  googleDrive: {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    oauthCredentialsJson: process.env.OAUTH_CREDENTIALS_JSON,
    oauthTokenJson: process.env.OAUTH_TOKEN_JSON
  }
};

// Validar configuración requerida
const requiredVars = ['API_KEY', 'GOOGLE_DRIVE_FOLDER_ID'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  process.exit(1);
}

// Validar que haya al menos una forma de autenticación con Google Drive
const hasServiceAccount = config.googleDrive.serviceAccountJson || config.googleDrive.credentialsPath;
const hasOAuth = config.googleDrive.oauthTokenJson || config.googleDrive.oauthCredentialsJson;

if (!hasServiceAccount && !hasOAuth) {
  console.error('❌ Debes configurar al menos una forma de autenticación con Google Drive:');
  console.error('   - Service Account: GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_APPLICATION_CREDENTIALS');
  console.error('   - OAuth: OAUTH_TOKEN_JSON o OAUTH_CREDENTIALS_JSON');
  process.exit(1);
}
