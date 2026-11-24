import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { create, myOrders, restaurantOrders, stats, getOne, updateStatus } from '../controllers/orderController.js';

const router = Router();

// Règle 2 : il faut être connecté pour toutes les routes de commande
router.use(protect);

router.post('/', authorize('client'), create);                                   // passer une commande
router.get('/my-orders', authorize('client'), myOrders);                         // mes commandes
router.get('/restaurant', authorize('restaurateur', 'admin'), restaurantOrders); // commandes reçues
router.get('/stats', authorize('restaurateur', 'admin'), stats);                 // dashboard
// ⚠️ Les routes avec ":id" doivent rester APRÈS les routes fixes ci-dessus
router.get('/:id', getOne);
router.put('/:id/status', updateStatus); // les droits sont vérifiés dans le service

export default router;