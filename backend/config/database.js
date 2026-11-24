// On importe mongoose : la librairie qui parle à MongoDB
import mongoose from 'mongoose';

// Fonction qui connecte l'application à la base de données
export const connectDB = async () => {
  try {
    // On se connecte avec l'adresse écrite dans le fichier .env
    const connection = await mongoose.connect(process.env.MONGO_URI);
    // Si ça marche, on affiche le nom de la base
    console.log(`✅ MongoDB connecté : ${connection.connection.name}`);
  } catch (error) {
    // Si ça échoue (MongoDB éteint par exemple), on affiche l'erreur
    console.error('❌ Erreur de connexion MongoDB :', error.message);
    // On arrête le programme : inutile de continuer sans base de données
    process.exit(1);
  }
};