import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/categoryController.js';

const router = Router();

// Public : le client voit les catégories du menu
router.get('/', c.list);

// Privé : seul un restaurateur ou un admin peut créer une catégorie
router.post(
  '/',
  protect, 
  authorize('restaurateur', 'admin'),
  [
    body('nom').trim().notEmpty().withMessage('Le nom de la catégorie est obligatoire.'),
    body('restaurant').isMongoId().withMessage('Restaurant invalide.'),
  ],
  validate,
  c.create
);

router.put('/:id', protect, authorize('restaurateur', 'admin'), c.update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), c.remove);

export default router;