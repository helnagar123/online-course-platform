import { Router } from 'express';

import {
  getDashboard
} from '../controllers/instructorDashboard.controller.js';

import authenticate from '../middleware/auth.middleware.js';
import authorizeRoles from '../middleware/role.middleware.js';

import ROLES from '../constants/roles.js';

const router = Router();

router.get(
  '/',
  authenticate,
  authorizeRoles(ROLES.INSTRUCTOR),
  getDashboard
);

export default router;