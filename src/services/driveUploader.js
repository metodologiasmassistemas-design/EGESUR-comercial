import { google } from 'googleapis';
import { createReadStream } from 'fs';
import { config } from '../config/index.js';

/**
 * Servicio para subir archivos a Google Drive
 */
class DriveUploaderService {
  constructor() {
    this.drive = null;
    this.initializeDrive();
  }

  /**
   * Inicializa el cliente de Google Drive
   */
  initializeDrive() {
    try {
      let auth;

      // Opción 1: Usar JSON desde variable de entorno
      if (config.googleDrive.serviceAccountJson) {
        const credentials = JSON.parse(config.googleDrive.serviceAccountJson);
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/drive']
        });
      }
      // Opción 2: Usar ruta a archivo de credenciales
      else if (config.googleDrive.credentialsPath) {
        auth = new google.auth.GoogleAuth({
          keyFile: config.googleDrive.credentialsPath,
          scopes: ['https://www.googleapis.com/auth/drive']
        });
      }

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✓ Google Drive API inicializada correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Google Drive API:', error.message);
      throw error;
    }
  }

  /**
   * Sube un archivo a Google Drive
   * @param {string} filePath - Ruta local del archivo
   * @param {string} fileName - Nombre del archivo en Drive
   * @param {Object} metadata - Metadatos adicionales del dispositivo
   * @returns {Promise<Object>} - Información del archivo subido
   */
  async uploadFile(filePath, fileName, metadata = {}) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [config.googleDrive.folderId],
        description: this.generateFileDescription(metadata)
      };

      const media = {
        mimeType: 'application/pdf',
        body: createReadStream(filePath)
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size',
        supportsAllDrives: true
      });

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
        size: response.data.size
      };
    } catch (error) {
      throw new Error(`Error subiendo archivo a Drive: ${error.message}`);
    }
  }

  /**
   * Genera una descripción para el archivo basada en los metadatos
   */
  generateFileDescription(metadata) {
    const { numero, titulo, fecha, entidad } = metadata;
    const parts = [];

    if (numero) parts.push(`Número: ${numero}`);
    if (fecha) parts.push(`Fecha: ${fecha}`);
    if (entidad) parts.push(`Entidad: ${entidad}`);
    if (titulo) parts.push(`Título: ${titulo}`);

    return parts.join(' | ');
  }

  /**
   * Sube múltiples archivos a Google Drive
   * @param {Array} files - Array de objetos con información de archivos descargados
   * @returns {Promise<Object>} - Resultados de las subidas
   */
  async uploadMultipleFiles(files) {
    const results = {
      success: [],
      failed: []
    };

    for (const file of files) {
      try {
        const uploadResult = await this.uploadFile(
          file.filePath,
          file.fileName,
          file.dispositivo
        );

        results.success.push({
          ...uploadResult,
          dispositivo: file.dispositivo
        });

        console.log(`✓ Subido a Drive: ${file.fileName}`);
      } catch (error) {
        results.failed.push({
          file: file.fileName,
          dispositivo: file.dispositivo,
          error: error.message
        });

        console.error(`✗ Error subiendo ${file.fileName}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Verifica que la carpeta de Drive existe y es accesible
   */
  async verifyFolder() {
    try {
      const response = await this.drive.files.get({
        fileId: config.googleDrive.folderId,
        fields: 'id, name, mimeType',
        supportsAllDrives: true
      });

      if (response.data.mimeType !== 'application/vnd.google-apps.folder') {
        throw new Error('El ID proporcionado no corresponde a una carpeta');
      }

      return {
        success: true,
        folderId: response.data.id,
        folderName: response.data.name
      };
    } catch (error) {
      throw new Error(`Error verificando carpeta de Drive: ${error.message}`);
    }
  }

  /**
   * Busca si un archivo ya existe en la carpeta
   * @param {string} fileName - Nombre del archivo a buscar
   * @returns {Promise<Object|null>} - Información del archivo si existe
   */
  async fileExists(fileName) {
    try {
      const response = await this.drive.files.list({
        q: `name='${fileName}' and '${config.googleDrive.folderId}' in parents and trashed=false`,
        fields: 'files(id, name, webViewLink)',
        pageSize: 1,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });

      return response.data.files.length > 0 ? response.data.files[0] : null;
    } catch (error) {
      console.error(`Error buscando archivo: ${error.message}`);
      return null;
    }
  }
}

export default new DriveUploaderService();
