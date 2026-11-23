import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { latest, byRestaurant, createOrUpdate, remove } from '../controllers/reviewController.js';

const router = Router();

router.get('/latest', latest);
router.get('/restaurant/:restaurantId', byRestaurant);

router.post('/', protect, createOrUpdate);
router.delete('/:id', protect, remove);

export default router;