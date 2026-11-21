import { Router } from 'express';
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