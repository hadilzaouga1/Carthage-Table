import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { list, create, update, remove } from '../controllers/dishController.js';

const router = Router();

router.get('/', list); // public
router.post('/', protect, authorize('restaurateur', 'admin'), create);
router.put('/:id', protect, authorize('restaurateur', 'admin'), update);
router.delete('/:id', protect, authorize('restaurateur', 'admin'), remove);

export default router;