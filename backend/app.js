import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// On crée l'application Express
const app = express();

// Helmet : ajoute des en-têtes HTTP de sécurité
app.use(helmet());

// CORS : autorise Angular (localhost:4200) à appeler cette API
app.use(cors({ origin: process.env.CLIENT_URL }));

// Permet de lire le JSON envoyé dans le corps des requêtes (req.body)
app.use(express.json());

// Anti force-brute : 30 tentatives de connexion/inscription par IP toutes les 15 minutes
// (désactivé pendant les tests automatisés)
if (process.env.NODE_ENV !== 'test') {
  app.use(
    '/api/auth',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 30,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Trop de tentatives, réessayez dans quelques minutes.' }
    })
  );
}

// Toutes nos routes commencent par /api
app.use('/api', routes);

// Si aucune route ne correspond : erreur 404
app.use(notFound);

// Gestionnaire d'erreurs (toujours en DERNIER)
app.use(errorHandler);

export default app;