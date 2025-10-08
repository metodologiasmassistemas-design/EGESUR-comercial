import express from 'express';
import pdfDownloader from '../services/pdfDownloader.js';
import driveUploader from '../services/driveUploaderOAuth.js';

const router = express.Router();

/**
 * POST /api/dispositivos/download
 * Descarga PDFs del Diario Oficial y los sube a Google Drive
 */
router.post('/download', async (req, res) => {
  try {
    const { dispositivos } = req.body;

    // Validar que se recibió el array de dispositivos
    if (!dispositivos || !Array.isArray(dispositivos) || dispositivos.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de dispositivos con al menos un elemento.'
      });
    }

    // Validar estructura de cada dispositivo
    const requiredFields = ['url', 'numero', 'titulo', 'fecha'];
    for (const dispositivo of dispositivos) {
      const missingFields = requiredFields.filter(field => !dispositivo[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Dispositivo "${dispositivo.numero || 'sin número'}" tiene campos faltantes: ${missingFields.join(', ')}`
        });
      }
    }

    console.log(`📥 Iniciando descarga de ${dispositivos.length} dispositivos...`);

    // Paso 1: Descargar PDFs
    const downloadResults = await pdfDownloader.downloadMultiplePDFs(dispositivos);

    if (downloadResults.success.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo descargar ningún PDF.',
        details: downloadResults.failed
      });
    }

    console.log(`📤 Subiendo ${downloadResults.success.length} archivos a Google Drive...`);

    // Paso 2: Subir archivos a Google Drive
    const uploadResults = await driveUploader.uploadMultipleFiles(downloadResults.success);

    // Paso 3: Limpiar archivos temporales
    for (const file of downloadResults.success) {
      pdfDownloader.cleanupFile(file.filePath);
    }

    // Preparar respuesta
    const response = {
      success: true,
      summary: {
        total: dispositivos.length,
        downloaded: downloadResults.success.length,
        uploaded: uploadResults.success.length,
        failed: downloadResults.failed.length + uploadResults.failed.length
      },
      uploaded: uploadResults.success.map(item => ({
        numero: item.dispositivo.numero,
        titulo: item.dispositivo.titulo,
        driveFileId: item.fileId,
        driveLink: item.webViewLink,
        downloadLink: item.webContentLink
      })),
      errors: [
        ...downloadResults.failed.map(f => ({
          step: 'download',
          numero: f.dispositivo.numero,
          error: f.error
        })),
        ...uploadResults.failed.map(f => ({
          step: 'upload',
          numero: f.dispositivo.numero,
          error: f.error
        }))
      ]
    };

    console.log(`✅ Proceso completado: ${uploadResults.success.length}/${dispositivos.length} archivos en Drive`);

    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error en el proceso:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

/**
 * GET /api/dispositivos/health
 * Verifica el estado de la API y la conexión con Google Drive
 */
router.get('/health', async (req, res) => {
  try {
    const folderInfo = await driveUploader.verifyFolder();

    return res.status(200).json({
      success: true,
      status: 'operational',
      googleDrive: {
        connected: true,
        folderId: folderInfo.folderId,
        folderName: folderInfo.folderName
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      status: 'error',
      googleDrive: {
        connected: false,
        error: error.message
      }
    });
  }
});

export default router;
