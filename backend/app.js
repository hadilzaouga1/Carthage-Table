import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// On crée l'application Express
const app = express();

// CORS : autorise Angular (localhost:4200) à appeler cette API
app.use(cors({ origin: process.env.CLIENT_URL }));

// Permet de lire le JSON envoyé dans le corps des requêtes (req.body)
app.use(express.json());

// Toutes nos routes commencent par /api
app.use('/api', routes);

// Si aucune route ne correspond : erreur 404
app.use(notFound);

// Gestionnaire d'erreurs (toujours en DERNIER)
app.use(errorHandler);

export default app;