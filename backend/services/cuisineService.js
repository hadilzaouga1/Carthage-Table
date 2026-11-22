import Cuisine from '../models/Cuisine.js';
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import pick from '../utils/pick.js';

const EDITABLE = ['nom', 'description', 'icon'];

// Protège les caractères spéciaux utilisés dans une expression régulière
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findOrFail(id) {
  const cuisine = await Cuisine.findById(id);
  if (!cuisine) throw new ApiError(404, 'Catégorie de cuisine introuvable');
  return cuisine;
}

// Une cuisine du même nom existe-t-elle déjà (sans tenir compte de la casse) ?
async function assertNameFree(nom, exceptId) {
  const filter = { nom: { $regex: `^${escapeRegex(nom)}$`, $options: 'i' } };
  if (exceptId) filter._id = { $ne: exceptId };
  if (await Cuisine.exists(filter)) throw new ApiError(409, 'Cette catégorie de cuisine existe déjà');
}

// LISTE (publique) : alimente les filtres de l'accueil et la liste des restaurants
export function listCuisines() {
  return Cuisine.find().collation({ locale: 'fr' }).sort({ nom: 1 });
}

// CRÉATION (admin)
export async function createCuisine(body) {
  const data = pick(body, EDITABLE);
  if (!data.nom || !data.nom.trim()) throw new ApiError(400, 'Le nom de la cuisine est obligatoire');
  data.nom = data.nom.trim();
  await assertNameFree(data.nom);
  return Cuisine.create(data);
}

// MODIFICATION (admin) : si on renomme, les restaurants concernés suivent
export async function updateCuisine(id, body) {
  const cuisine = await findOrFail(id);
  const data = pick(body, EDITABLE);
  if (data.nom !== undefined) {
    data.nom = String(data.nom).trim();
    if (!data.nom) throw new ApiError(400, 'Le nom de la cuisine est obligatoire');
    await assertNameFree(data.nom, cuisine._id);
  }
  const ancienNom = cuisine.nom;
  Object.assign(cuisine, data);
  await cuisine.save();
  if (data.nom && data.nom !== ancienNom) {
    await Restaurant.updateMany({ typeCuisine: ancienNom }, { typeCuisine: data.nom });
  }
  return cuisine;
}

// SUPPRESSION (admin) : refusée tant que des restaurants utilisent cette cuisine
export async function deleteCuisine(id) {
  const cuisine = await findOrFail(id);
  const used = await Restaurant.countDocuments({ typeCuisine: cuisine.nom });
  if (used > 0) {
    throw new ApiError(400, `Impossible de supprimer : ${used} restaurant(s) utilisent la cuisine « ${cuisine.nom} »`);
  }
  await cuisine.deleteOne();
}

// Vérifie qu'un type de cuisine est connu.
// Tant que l'admin n'a créé aucune cuisine, on accepte tout (compatibilité avec les données existantes).
export async function assertKnownCuisine(typeCuisine) {
  if (typeCuisine === undefined) return;
  if ((await Cuisine.estimatedDocumentCount()) === 0) return;
  const known = await Cuisine.exists({ nom: { $regex: `^${escapeRegex(String(typeCuisine).trim())}$`, $options: 'i' } });
  if (!known) throw new ApiError(400, `Type de cuisine inconnu : ${typeCuisine}`);
}
