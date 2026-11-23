import { Router } from 'express';
import {
  getDashboardMetrics,
  getReferenceData,
  getAssignmentsAndExpenditures,
  createAssignmentOrExpenditure,
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.get('/dashboard-metrics', authenticateToken, getDashboardMetrics);
router.get('/reference', authenticateToken, getReferenceData);
router.get('/assignments-expenditures', authenticateToken, getAssignmentsAndExpenditures);
router.post(
  '/assignments-expenditures',
  authenticateToken,
  authorizeRoles('ADMIN', 'BASE_COMMANDER'),
  enforceBaseScope,
  createAssignmentOrExpenditure
);

export default router;
