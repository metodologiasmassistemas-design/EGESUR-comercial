import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  apiKey: process.env.API_KEY,
  googleDrive: {
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    serviceAccountJson: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS
  }
};

// Validar configuración requerida
const requiredVars = ['API_KEY', 'GOOGLE_DRIVE_FOLDER_ID'];
const missing = requiredVars.filter(varName => !process.env[varName]);

if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno requeridas: ${missing.join(', ')}`);
  process.exit(1);
}

if (!config.googleDrive.serviceAccountJson && !config.googleDrive.credentialsPath) {
  console.error('❌ Debes configurar GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_APPLICATION_CREDENTIALS');
  process.exit(1);
}
