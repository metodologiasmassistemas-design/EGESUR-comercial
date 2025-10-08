import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import { authenticate } from './middleware/auth.js';
import dispositivosRoutes from './routes/dispositivos.js';

const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    name: 'EGESUR - Asistente Comercial API',
    version: '1.0.0',
    description: 'API para descargar dispositivos legales del Diario Oficial El Peruano y almacenarlos en Google Drive',
    endpoints: {
      health: 'GET /api/dispositivos/health',
      download: 'POST /api/dispositivos/download'
    },
    documentation: 'Ver openapi-schema.yaml para detalles completos'
  });
});

// Endpoint ligero para health checks externos (cron jobs, monitoring)
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas protegidas con autenticación
app.use('/api/dispositivos', authenticate, dispositivosRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   EGESUR - Asistente Comercial API                        ║
║   Servidor ejecutándose en http://localhost:${config.port}      ║
╚═══════════════════════════════════════════════════════════╝
  `);
  console.log('✓ Endpoints disponibles:');
  console.log(`  • GET  /api/dispositivos/health`);
  console.log(`  • POST /api/dispositivos/download`);
  console.log('');
});

export default app;
