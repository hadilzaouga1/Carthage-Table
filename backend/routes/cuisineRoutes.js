import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/cuisineController.js';

const router = Router();

// Public : les clients et les formulaires ont besoin de la liste
router.get('/', c.list);

// Réservé à l'administrateur (cahier des charges, module 7 : gestion des catégories de cuisine)
router.post('/', protect, authorize('admin'), [body('nom').trim().notEmpty().withMessage('Le nom de la cuisine est obligatoire.')], validate, c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

export default router;
