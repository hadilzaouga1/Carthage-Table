import { validationResult } from 'express-validator';

// Si une règle express-validator échoue, on renvoie un message lisible (le premier),
// au même format que les autres erreurs de l'API : { success: false, message }
export default function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  return res.status(400).json({ success: false, message: errors[0].message, errors });
}
