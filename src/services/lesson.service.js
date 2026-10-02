import Lesson from '../models/Lesson.js';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';

const createLesson = async (
  courseId,
  instructorId,
  lessonData
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to manage lessons for this course',
      403
    );
  }

  const existingLesson = await Lesson.findOne({
    course: courseId,
    order: lessonData.order
  });

  if (existingLesson) {
    throw new AppError(
      'A lesson with this order already exists',
      409
    );
  }

  return Lesson.create({
    ...lessonData,
    course: courseId
  });
};

const getCourseLessons = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  return Lesson.find({
    course: courseId,
    isPublished: true
  }).sort({ order: 1 });
};

const getLessonById = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId)
    .populate('course', 'title slug instructor');

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  return lesson;
};

const updateLesson = async (
  lessonId,
  instructorId,
  updateData
) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to modify this lesson',
      403
    );
  }

  if (updateData.order !== undefined) {
    const duplicateOrder = await Lesson.findOne({
      course: lesson.course,
      order: updateData.order
    });

    if (
      duplicateOrder &&
      duplicateOrder._id.toString() !==
      lessonId.toString()
    ) {
      throw new AppError(
        'A lesson with this order already exists',
        409
      );
    }
  }

  const fields = [
    'title',
    'description',
    'content',
    'videoUrl',
    'duration',
    'order'
  ];

  for (const field of fields) {
    if (updateData[field] !== undefined) {
      lesson[field] = updateData[field];
    }
  }

  await lesson.save();

  return lesson;
};

const publishLesson = async (
  lessonId,
  instructorId
) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to publish this lesson',
      403
    );
  }

  lesson.isPublished = true;

  await lesson.save();

  return lesson;
};

const deleteLesson = async (
  lessonId,
  instructorId
) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  const course = await Course.findById(lesson.course);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to delete this lesson',
      403
    );
  }

  await Lesson.findByIdAndDelete(lessonId);
};

export {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  publishLesson,
  deleteLesson
};