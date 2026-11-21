import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';

const router = Router();

// Toutes les routes ci-dessous exigent d'être connecté
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

export default router;