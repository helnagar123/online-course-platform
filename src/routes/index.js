import { Router } from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import courseRoutes from './course.routes.js';
import lessonRoutes from './lesson.routes.js';
import enrollmentRoutes from './enrollment.routes.js';
import commentRoutes from './comment.routes.js';
import ratingRoutes from './rating.routes.js';
import progressRoutes from './progress.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import instructorDashboardRoutes from './instructorDashboard.routes.js';
import adminDashboardRoutes from './adminDashboard.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/courses', courseRoutes);

router.use(lessonRoutes);
router.use(enrollmentRoutes);
router.use(commentRoutes);
router.use(ratingRoutes);
router.use(progressRoutes);

router.use('/wishlist', wishlistRoutes);

router.use(
  '/instructor-dashboard',
  instructorDashboardRoutes
);

router.use(
  '/admin-dashboard',
  adminDashboardRoutes
);

export default router;