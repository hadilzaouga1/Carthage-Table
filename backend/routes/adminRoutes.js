import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { stats } from '../controllers/adminController.js';

const router = Router();

// Tout ce dossier est réservé à l'admin
router.use(protect, authorize('admin'));

router.get('/stats', stats); // GET /api/admin/stats

export default router;