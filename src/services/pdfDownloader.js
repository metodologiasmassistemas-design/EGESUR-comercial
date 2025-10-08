import axios from 'axios';
import { createWriteStream, mkdirSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';

/**
 * Servicio para descargar PDFs del Diario Oficial El Peruano
 */
class PDFDownloaderService {
  constructor() {
    this.tempDir = './temp';
    this.ensureTempDir();
  }

  /**
   * Asegura que el directorio temporal exista
   */
  ensureTempDir() {
    try {
      mkdirSync(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creando directorio temporal:', error);
    }
  }

  /**
   * Valida si la URL es del Diario Oficial El Peruano
   */
  isValidPeruanoUrl(url) {
    const validDomains = [
      'elperuano.pe',
      'busquedas.elperuano.pe',
      'www.elperuano.pe'
    ];

    try {
      const urlObj = new URL(url);
      return validDomains.some(domain => urlObj.hostname.includes(domain));
    } catch {
      return false;
    }
  }

  /**
   * Genera un nombre de archivo seguro
   */
  generateSafeFileName(dispositivo) {
    const { numero, fecha, titulo } = dispositivo;
    const safeTitulo = titulo
      ? titulo.substring(0, 50).replace(/[^a-z0-9]/gi, '_')
      : 'dispositivo';

    const safeNumero = numero ? numero.replace(/[^a-z0-9-]/gi, '_') : 'sin_numero';
    const safeFecha = fecha ? fecha.replace(/\//g, '-') : '';

    return `${safeFecha}_${safeNumero}_${safeTitulo}.pdf`;
  }

  /**
   * Descarga un PDF desde una URL
   * @param {Object} dispositivo - Objeto con información del dispositivo
   * @returns {Promise<Object>} - Información del archivo descargado
   */
  async downloadPDF(dispositivo) {
    const { url, numero, titulo } = dispositivo;

    // Validar URL
    if (!this.isValidPeruanoUrl(url)) {
      throw new Error(`URL no válida del Diario Oficial: ${url}`);
    }

    const fileName = this.generateSafeFileName(dispositivo);
    const filePath = path.join(this.tempDir, fileName);

    try {
      // Realizar petición con configuración específica
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        timeout: 60000, // 60 segundos
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Verificar que es un PDF
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.includes('pdf')) {
        throw new Error(`La URL no apunta a un PDF: ${contentType}`);
      }

      // Descargar el archivo
      const writer = createWriteStream(filePath);
      await pipeline(response.data, writer);

      return {
        success: true,
        fileName,
        filePath,
        size: response.headers['content-length'],
        dispositivo: {
          numero,
          titulo
        }
      };
    } catch (error) {
      // Limpiar archivo parcial si existe
      try {
        unlinkSync(filePath);
      } catch {}

      throw new Error(`Error descargando PDF de "${numero}": ${error.message}`);
    }
  }

  /**
   * Descarga múltiples PDFs
   * @param {Array} dispositivos - Array de objetos con información de dispositivos
   * @returns {Promise<Object>} - Resultados de las descargas
   */
  async downloadMultiplePDFs(dispositivos) {
    const results = {
      success: [],
      failed: []
    };

    for (const dispositivo of dispositivos) {
      try {
        const result = await this.downloadPDF(dispositivo);
        results.success.push(result);
        console.log(`✓ Descargado: ${result.fileName}`);
      } catch (error) {
        const failedResult = {
          dispositivo,
          error: error.message
        };
        results.failed.push(failedResult);
        console.error(`✗ Error: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Limpia un archivo temporal
   */
  cleanupFile(filePath) {
    try {
      unlinkSync(filePath);
    } catch (error) {
      console.error(`Error limpiando archivo ${filePath}:`, error.message);
    }
  }
}

export default new PDFDownloaderService();
