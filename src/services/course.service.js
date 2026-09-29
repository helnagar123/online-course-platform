import Course from '../models/Course.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

const createCourse = async (instructorId, courseData) => {
  const category = await Category.findOne({
    _id: courseData.category,
    isActive: true
  });

  if (!category) {
    throw new AppError('Category not found or inactive', 404);
  }

  const slug = courseData.title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existingCourse = await Course.findOne({ slug });

  if (existingCourse) {
    throw new AppError('A course with this title already exists', 409);
  }

  const course = await Course.create({
    ...courseData,
    instructor: instructorId,
    slug
  });

  return course;
};

const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('instructor', 'firstName lastName avatar')
    .populate('category', 'name slug');

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  return course;
};

const getCourses = async ({
  search = '',
  category,
  level,
  status = 'published',
  instructor,
  page = 1,
  limit = 10,
  sortBy = 'createdAt',
  sortOrder = 'desc'
} = {}) => {
  const query = {};

  if (search) {
    query.$text = {
      $search: search
    };
  }

  if (category) {
    query.category = category;
  }

  if (level) {
    query.level = level;
  }

  if (status) {
    query.status = status;
  }

  if (instructor) {
    query.instructor = instructor;
  }

  const skip = (page - 1) * limit;

  const allowedSortFields = [
    'createdAt',
    'title',
    'price'
  ];

  const safeSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : 'createdAt';

  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const [courses, totalCourses] = await Promise.all([
    Course.find(query)
      .populate('instructor', 'firstName lastName avatar')
      .populate('category', 'name slug')
      .sort({ [safeSortBy]: sortDirection })
      .skip(skip)
      .limit(limit),

    Course.countDocuments(query)
  ]);

  const totalPages = Math.ceil(totalCourses / limit);

  return {
    courses,
    pagination: {
      page,
      limit,
      totalCourses,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

const getInstructorCourses = async (instructorId, options = {}) => {
  return getCourses({
    ...options,
    instructor: instructorId,
    status: options.status
  });
};

const updateCourse = async (
  courseId,
  instructorId,
  updateData
) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to modify this course',
      403
    );
  }

  if (updateData.category) {
    const category = await Category.findOne({
      _id: updateData.category,
      isActive: true
    });

    if (!category) {
      throw new AppError(
        'Category not found or inactive',
        404
      );
    }
  }

  if (updateData.title) {
    const slug = updateData.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const duplicateCourse = await Course.findOne({
      _id: { $ne: courseId },
      slug
    });

    if (duplicateCourse) {
      throw new AppError(
        'A course with this title already exists',
        409
      );
    }

    course.title = updateData.title.trim();
    course.slug = slug;
  }

  const fields = [
    'description',
    'category',
    'thumbnail',
    'level',
    'price'
  ];

  for (const field of fields) {
    if (updateData[field] !== undefined) {
      course[field] = updateData[field];
    }
  }

  await course.save();

  return course;
};

const publishCourse = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to publish this course',
      403
    );
  }

  if (course.status === 'published') {
    throw new AppError('Course is already published', 400);
  }

  course.status = 'published';
  course.publishedAt = new Date();

  await course.save();

  return course;
};

const archiveCourse = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to archive this course',
      403
    );
  }

  course.status = 'archived';

  await course.save();

  return course;
};

const deleteCourse = async (courseId, instructorId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (course.instructor.toString() !== instructorId.toString()) {
    throw new AppError(
      'You are not allowed to delete this course',
      403
    );
  }

  await Course.findByIdAndDelete(courseId);
};

export {
  createCourse,
  getCourseById,
  getCourses,
  getInstructorCourses,
  updateCourse,
  publishCourse,
  archiveCourse,
  deleteCourse
};