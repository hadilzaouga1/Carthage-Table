import Cuisine from '../models/Cuisine.js';
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import pick from '../utils/pick.js';

const EDITABLE_FIELDS = ['nom', 'description', 'icon'];

async function findOrFail(id) {
  const cuisine = await Cuisine.findById(id);
  if (!cuisine) throw new ApiError(404, 'Cuisine introuvable');
  return cuisine;
}

// LISTE (publique) : chaque cuisine avec le nombre de restaurants validés qui l'utilisent
export async function listCuisines() {
  const [cuisines, counts] = await Promise.all([
    Cuisine.find().collation({ locale: 'fr' }).sort({ nom: 1 }),
    Restaurant.aggregate([{ $match: { status: 'valide' } }, { $group: { _id: '$typeCuisine', total: { $sum: 1 } } }])
  ]);
  const byName = new Map(counts.map((c) => [c._id, c.total]));
  return cuisines.map((c) => ({ ...c.toObject(), restaurants: byName.get(c.nom) || 0 }));
}

// CRÉATION (admin)
export async function createCuisine(body) {
  const data = pick(body, EDITABLE_FIELDS);
  if (!data.nom || !String(data.nom).trim()) throw new ApiError(400, 'Le nom de la cuisine est obligatoire');
  return Cuisine.create(data);
}

// MODIFICATION (admin) : si le nom change, les restaurants concernés suivent
export async function updateCuisine(id, body) {
  const cuisine = await findOrFail(id);
  const ancienNom = cuisine.nom;
  Object.assign(cuisine, pick(body, EDITABLE_FIELDS));
  await cuisine.save();
  if (ancienNom !== cuisine.nom) {
    await Restaurant.updateMany({ typeCuisine: ancienNom }, { typeCuisine: cuisine.nom });
  }
  return cuisine;
}

// SUPPRESSION (admin) : refusée tant qu'un restaurant utilise cette cuisine
export async function deleteCuisine(id) {
  const cuisine = await findOrFail(id);
  const used = await Restaurant.countDocuments({ typeCuisine: cuisine.nom });
  if (used > 0) throw new ApiError(400, `Cette cuisine est utilisée par ${used} restaurant(s)`);
  await cuisine.deleteOne();
}

// Vérifie qu'un restaurant utilise une cuisine connue (seulement si l'admin en a défini)
export async function assertCuisineExists(nom) {
  if (!nom) return;
  if ((await Cuisine.estimatedDocumentCount()) === 0) return;
  const exists = await Cuisine.exists({ nom: String(nom).trim() }).collation({ locale: 'fr', strength: 2 });
  if (!exists) throw new ApiError(400, `Cuisine inconnue : « ${nom} ». Choisissez une cuisine de la liste.`);
}
