import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Route de test
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API FoodExpress opérationnelle 🍕' });
});

router.use('/auth', authRoutes);   // /api/auth/...
router.use('/users', userRoutes);  // /api/users/...

export default router;