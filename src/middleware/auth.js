import { config } from '../config/index.js';

/**
 * Middleware de autenticación por API Key
 */
export const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API Key requerida. Incluye el header x-api-key en tu petición.'
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({
      success: false,
      error: 'API Key inválida.'
    });
  }

  next();
};
