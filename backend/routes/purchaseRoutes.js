import { Router } from 'express';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getPurchases);
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'),
  enforceBaseScope,
  createPurchase
);

export default router;
