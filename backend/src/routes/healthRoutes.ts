import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

router.get('/', HealthController.getSystemHealth);
router.get('/database', HealthController.getDatabaseHealth);
router.get('/blockchain', HealthController.getBlockchainHealth);

export default router;
