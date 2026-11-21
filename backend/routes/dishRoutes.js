import { Router } from 'express';
<<<<<<< HEAD
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/dishController.js';

const router = Router();

router.get('/', c.list);
router.post(
  '/',
  protect, authorize('restaurateur', 'admin'),
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
=======
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { list, create, update, remove } from '../controllers/dishController.js';

const router = Router();

router.get('/', list); // public
router.post('/', protect, authorize('restaurateur', 'admin'), create);
router.put('/:id', protect, authorize('restaurateur', 'admin'), update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), remove);

export default router;
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
