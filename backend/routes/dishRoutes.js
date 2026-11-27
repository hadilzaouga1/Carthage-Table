import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/dishController.js';

const router = Router();

// Public : le client voit les plats du menu (optionalProtect permet au restaurateur/admin d'accéder à leurs restaurants en attente)
router.get('/', optionalProtect, c.list);

// Privé : seul un restaurateur ou un admin peut créer un plat
router.post(
  '/',
  protect, 
  authorize('restaurateur', 'admin'),
  [
    body('nom').trim().notEmpty().withMessage('Le nom du plat est obligatoire.'),
    body('prix').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif.'),
    body('restaurant').isMongoId().withMessage('Restaurant invalide.'),
    body('categorie').isMongoId().withMessage('Catégorie invalide.'),
  ],
  validate,
  c.create
);

router.put('/:id', protect, authorize('restaurateur', 'admin'), c.update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), c.remove);

export default router;