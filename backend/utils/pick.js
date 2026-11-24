// Garde seulement certains champs d'un objet.
// Sécurité : on ne copie JAMAIS tout req.body, seulement les champs autorisés.
export default function pick(object, fields) {
  const result = {};
  for (const field of fields) {
    // On copie le champ seulement s'il a été envoyé
    if (object[field] !== undefined) result[field] = object[field];
  }
  return result;
}