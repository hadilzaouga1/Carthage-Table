import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/cuisineController.js';

const router = Router();

router.get('/', c.list); // public : types de cuisine disponibles

// Gestion des catégories générales : réservée à l'administrateur
router.post('/', protect, authorize('admin'), c.create);
router.put('/:id', protect, authorize('admin'), c.update);
router.delete('/:id', protect, authorize('admin'), c.remove);

export default router;
