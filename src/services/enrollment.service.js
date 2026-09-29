import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';

const enrollInCourse = async (studentId, courseId) => {
  const course = await Course.findOne({
    _id: courseId,
    status: 'published'
  });

  if (!course) {
    throw new AppError(
      'Course not found or not available for enrollment',
      404
    );
  }

  if (
    course.instructor.toString() === studentId.toString()
  ) {
    throw new AppError(
      'You cannot enroll in your own course',
      400
    );
  }

  const existingEnrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId
  });

  if (existingEnrollment) {
    throw new AppError(
      'You are already enrolled in this course',
      409
    );
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId
  });

  return enrollment;
};

const getEnrollmentById = async (
  enrollmentId,
  studentId
) => {
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    student: studentId
  }).populate(
    'course',
    'title slug thumbnail instructor'
  );

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  return enrollment;
};

const getMyEnrollments = async (studentId) => {
  return Enrollment.find({
    student: studentId
  })
    .populate(
      'course',
      'title slug thumbnail instructor status'
    )
    .sort({ createdAt: -1 });
};

const cancelEnrollment = async (
  enrollmentId,
  studentId
) => {
  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    student: studentId
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404);
  }

  if (enrollment.status === 'completed') {
    throw new AppError(
      'Completed enrollment cannot be cancelled',
      400
    );
  }

  enrollment.status = 'cancelled';

  await enrollment.save();

  return enrollment;
};

export {
  enrollInCourse,
  getEnrollmentById,
  getMyEnrollments,
  cancelEnrollment
};