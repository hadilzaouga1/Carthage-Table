import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { stats, todayOrders } from '../controllers/adminController.js';

const router = Router();

// Tout ce dossier est réservé à l'admin
router.use(protect, authorize('admin'));

router.get('/stats', stats);               // GET /api/admin/stats
router.get('/orders/today', todayOrders); // GET /api/admin/orders/today

export default router;