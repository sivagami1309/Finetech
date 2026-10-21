import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', requireAuth, PaymentController.createRequest);
router.get('/', requireAuth, PaymentController.listRequests);
router.post('/quote', requireAuth, PaymentController.getQuote);
router.get('/:id', requireAuth, PaymentController.getRequestById);
router.post('/:id/quote', requireAuth, PaymentController.getQuote);
router.post('/:id/confirm', requireAuth, PaymentController.confirmRequest);

export default router;
