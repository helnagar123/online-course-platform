import LessonProgress from '../models/LessonProgress.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import AppError from '../utils/AppError.js';

const updateLessonProgress = async (
  studentId,
  lessonId,
  completed
) => {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    isPublished: true
  });

  if (!lesson) {
    throw new AppError(
      'Lesson not found or unavailable',
      404
    );
  }

  const enrollment =
    await Enrollment.findOne({
      student: studentId,
      course: lesson.course
    });

  if (
    !enrollment ||
    !['active', 'completed'].includes(
      enrollment.status
    )
  ) {
    throw new AppError(
      'You are not enrolled in this course',
      403
    );
  }

  const progress =
    await LessonProgress.findOneAndUpdate(
      {
        enrollment: enrollment._id,
        lesson: lessonId
      },
      {
        completed,
        completedAt: completed
          ? new Date()
          : null,
        lastViewedAt: new Date()
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

  const publishedLessons =
    await Lesson.find({
      course: lesson.course,
      isPublished: true
    }).select('_id');

  const publishedLessonIds =
    new Set(
      publishedLessons.map(
        (publishedLesson) =>
          publishedLesson._id.toString()
      )
    );

  const progressRecords =
    await LessonProgress.find({
      enrollment: enrollment._id
    });

  const completedLessons =
    progressRecords.filter(
      (progressRecord) =>
        progressRecord.completed &&
        progressRecord.lesson &&
        publishedLessonIds.has(
          progressRecord.lesson.toString()
        )
    ).length;

  const totalLessons =
    publishedLessons.length;

  const progressPercentage =
    totalLessons === 0
      ? 0
      : Math.round(
        (completedLessons /
          totalLessons) *
        100
      );

  if (progressPercentage === 100) {
    enrollment.status =
      'completed';

    enrollment.completedAt =
      new Date();
  } else if (
    enrollment.status ===
    'completed'
  ) {
    enrollment.status = 'active';

    enrollment.completedAt = null;
  }

  await enrollment.save();

  return {
    progress,
    summary: {
      totalLessons,
      completedLessons,
      progressPercentage
    }
  };
};

const getEnrollmentProgress = async (
  studentId,
  enrollmentId
) => {
  const enrollment =
    await Enrollment.findOne({
      _id: enrollmentId,
      student: studentId
    });

  if (!enrollment) {
    throw new AppError(
      'Enrollment not found',
      404
    );
  }

  const lessons = await Lesson.find({
    course: enrollment.course,
    isPublished: true
  })
    .select('_id title order')
    .sort({ order: 1 });

  const publishedLessonIds =
    new Set(
      lessons.map(
        (lesson) => lesson._id.toString()
      )
    );

  const progressRecords =
    await LessonProgress.find({
      enrollment: enrollment._id
    }).populate(
      'lesson',
      'title order'
    );

  const publishedProgressRecords =
    progressRecords.filter(
      (progressRecord) =>
        progressRecord.lesson &&
        publishedLessonIds.has(
          progressRecord.lesson._id.toString()
        )
    );

  const completedLessons =
    publishedProgressRecords.filter(
      (item) => item.completed
    ).length;

  const totalLessons =
    lessons.length;

  return {
    enrollment,
    lessons,
    progress:
      publishedProgressRecords,
    summary: {
      totalLessons,
      completedLessons,
      progressPercentage:
        totalLessons === 0
          ? 0
          : Math.round(
            (completedLessons /
              totalLessons) *
            100
          )
    }
  };
};

export {
  updateLessonProgress,
  getEnrollmentProgress
};