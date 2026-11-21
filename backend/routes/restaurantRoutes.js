import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as c from '../controllers/restaurantController.js';

const router = Router();

const rules = [
  body('nom').trim().notEmpty().withMessage('Le nom du restaurant est obligatoire.'),
  body('adresse').trim().notEmpty().withMessage("L'adresse est obligatoire."),
  body('typeCuisine').trim().notEmpty().withMessage('Le type de cuisine est obligatoire.'),
  body('fraisLivraison').isFloat({ min: 0 }).withMessage('Les frais de livraison doivent être un nombre positif.'),
];

router.get('/', c.list); // public
router.get('/mine', protect, authorize('restaurateur', 'admin'), c.mine);
router.get('/all', protect, authorize('admin'), c.listAll);

router.get('/:id', c.getOne); // public

router.post('/', protect, authorize('restaurateur', 'admin'), rules, validate, c.create);
router.put('/:id', protect, authorize('restaurateur', 'admin'), c.update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), c.remove);

export default router;