import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, TransactionController.list);
router.get('/stats/dashboard', requireAuth, TransactionController.getDashboardStats);
router.get('/:id', requireAuth, TransactionController.getById);
router.get('/:id/history', requireAuth, TransactionController.getHistory);
router.post('/:id/simulate-status', requireAuth, TransactionController.simulateStatus);

export default router;
