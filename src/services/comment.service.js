import Comment from '../models/Comment.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import AppError from '../utils/AppError.js';

const createComment = async (
  studentId,
  lessonId,
  content
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
      'You must be enrolled in this course to comment',
      403
    );
  }

  const comment = await Comment.create({
    user: studentId,
    lesson: lessonId,
    content
  });

  return comment.populate(
    'user',
    'firstName lastName avatar'
  );
};

const getLessonComments = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  return Comment.find({
    lesson: lessonId
  })
    .populate(
      'user',
      'firstName lastName avatar'
    )
    .sort({ createdAt: -1 });
};

const getCommentById = async (commentId) => {
  const comment = await Comment.findById(commentId)
    .populate(
      'user',
      'firstName lastName avatar'
    )
    .populate(
      'lesson',
      'title course'
    );

  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  return comment;
};

const updateComment = async (
  commentId,
  userId,
  content
) => {
  const comment = await Comment.findOne({
    _id: commentId,
    user: userId
  });

  if (!comment) {
    throw new AppError(
      'Comment not found or you are not allowed to modify it',
      404
    );
  }

  comment.content = content;

  await comment.save();

  return comment.populate(
    'user',
    'firstName lastName avatar'
  );
};

const deleteComment = async (
  commentId,
  userId
) => {
  const comment = await Comment.findOneAndDelete({
    _id: commentId,
    user: userId
  });

  if (!comment) {
    throw new AppError(
      'Comment not found or you are not allowed to delete it',
      404
    );
  }
};

export {
  createComment,
  getLessonComments,
  getCommentById,
  updateComment,
  deleteComment
};