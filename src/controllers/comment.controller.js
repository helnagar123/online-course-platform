import asyncHandler from '../utils/asyncHandler.js';
import sendSuccess from '../utils/apiResponse.js';

import {
  createComment,
  getLessonComments,
  getCommentById,
  updateComment,
  deleteComment
} from '../services/comment.service.js';

const create = asyncHandler(
  async (req, res) => {
    const comment =
      await createComment(
        req.user.id,
        req.params.lessonId,
        req.body.content
      );

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Comment created successfully',
      data: comment
    });
  }
);

const list = asyncHandler(
  async (req, res) => {
    const comments =
      await getLessonComments(
        req.params.lessonId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Comments retrieved successfully',
      data: comments
    });
  }
);

const getById = asyncHandler(
  async (req, res) => {
    const comment =
      await getCommentById(
        req.params.commentId
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Comment retrieved successfully',
      data: comment
    });
  }
);

const update = asyncHandler(
  async (req, res) => {
    const comment =
      await updateComment(
        req.params.commentId,
        req.user.id,
        req.body.content
      );

    return sendSuccess(res, {
      statusCode: 200,
      message: 'Comment updated successfully',
      data: comment
    });
  }
);

const remove = asyncHandler(
  async (req, res) => {
    await deleteComment(
      req.params.commentId,
      req.user.id
    );

    return res.status(204).send();
  }
);

export {
  create,
  list,
  getById,
  update,
  remove
};