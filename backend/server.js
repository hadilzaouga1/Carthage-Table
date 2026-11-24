// Charge le fichier .env : doit rester la PREMIÈRE ligne
import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/database.js';

// On lit le port dans .env (5000 par défaut)
const PORT = process.env.PORT || 5000;

// On connecte d'abord la base, puis on démarre le serveur
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  });
});