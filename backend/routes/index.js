import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import restaurantRoutes from './restaurantRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import dishRoutes from './dishRoutes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API FoodExpress opérationnelle 🍕' });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/categories', categoryRoutes);
router.use('/dishes', dishRoutes);

export default router;