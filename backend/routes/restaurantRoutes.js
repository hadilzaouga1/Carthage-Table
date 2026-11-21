import { Router } from 'express';
<<<<<<< HEAD
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

router.get('/', c.list);
router.get('/mine', protect, authorize('restaurateur', 'admin'), c.mine); // avant "/:id"
router.get('/:id', c.getOne);
router.post('/', protect, authorize('restaurateur', 'admin'), rules, validate, c.create);
router.put('/:id', protect, authorize('restaurateur', 'admin'), c.update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), c.remove);

export default router;
=======
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { list, getOne, mine, create, update, remove, listAll } from '../controllers/restaurantController.js';
const router = Router();

router.get('/', list);                                                  // public
// ⚠️ "/mine" doit être AVANT "/:id", sinon Express prendrait "mine" pour un id
router.get('/mine', protect, authorize('restaurateur', 'admin'), mine);
router.get('/all', protect, authorize('admin'), listAll);
router.get('/:id', getOne);                                             // public
router.post('/', protect, authorize('restaurateur', 'admin'), create);
router.put('/:id', protect, authorize('restaurateur', 'admin'), update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), remove);


export default router;
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
