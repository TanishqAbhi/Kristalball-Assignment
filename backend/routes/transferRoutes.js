import { Router } from 'express';
import { getTransfers, createTransfer } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getTransfers);
router.post(
  '/',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER'),
  enforceBaseScope,
  createTransfer
);

export default router;
