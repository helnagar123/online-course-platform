import { jest } from '@jest/globals';

const mockLesson = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndDelete: jest.fn(),
};

const mockCourse = {
  findById: jest.fn(),
};

jest.unstable_mockModule(
  '../../../src/models/Lesson.js',
  () => ({
    default: mockLesson,
  })
);

jest.unstable_mockModule(
  '../../../src/models/Course.js',
  () => ({
    default: mockCourse,
  })
);

const {
  createLesson,
  getCourseLessons,
  getLessonById,
  updateLesson,
  publishLesson,
  deleteLesson,
} = await import(
  '../../../src/services/lesson.service.js'
);

describe('Lesson Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLesson', () => {
    it('should create a lesson for the course instructor', async () => {
      mockCourse.findById.mockResolvedValue({
        _id: 'course-1',
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockLesson.findOne.mockResolvedValue(
        null
      );

      const lesson = {
        _id: 'lesson-1',
        title: 'Introduction',
        order: 1,
      };

      mockLesson.create.mockResolvedValue(
        lesson
      );

      const result = await createLesson(
        'course-1',
        'instructor-1',
        {
          title: 'Introduction',
          order: 1,
          description:
            'Course introduction',
        }
      );

      expect(mockLesson.findOne).toHaveBeenCalledWith({
        course: 'course-1',
        order: 1,
      });

      expect(mockLesson.create).toHaveBeenCalledWith({
        title: 'Introduction',
        order: 1,
        description:
          'Course introduction',
        course: 'course-1',
      });

      expect(result).toBe(lesson);
    });

    it('should reject duplicate lesson order', async () => {
      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockLesson.findOne.mockResolvedValue({
        _id: 'existing-lesson',
      });

      await expect(
        createLesson(
          'course-1',
          'instructor-1',
          {
            title: 'Introduction',
            order: 1,
          }
        )
      ).rejects.toMatchObject({
        message:
          'A lesson with this order already exists',
        statusCode: 409,
      });

      expect(
        mockLesson.create
      ).not.toHaveBeenCalled();
    });

    it('should reject non-owner instructors', async () => {
      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'owner-1',
        },
      });

      await expect(
        createLesson(
          'course-1',
          'other-instructor',
          {
            title: 'Lesson',
            order: 1,
          }
        )
      ).rejects.toMatchObject({
        message:
          'You are not allowed to manage lessons for this course',
        statusCode: 403,
      });
    });
  });

  describe('getCourseLessons', () => {
    it('should return published lessons sorted by order', async () => {
      const lessons = [
        {
          _id: 'lesson-1',
          order: 1,
          isPublished: true,
        },
      ];

      mockCourse.findById.mockResolvedValue({
        _id: 'course-1',
      });

      const query = {
        sort: jest.fn().mockResolvedValue(
          lessons
        ),
      };

      mockLesson.find.mockReturnValue(query);

      const result =
        await getCourseLessons(
          'course-1'
        );

      expect(mockLesson.find).toHaveBeenCalledWith({
        course: 'course-1',
        isPublished: true,
      });

      expect(query.sort).toHaveBeenCalledWith({
        order: 1,
      });

      expect(result).toBe(lessons);
    });
  });

  describe('getLessonById', () => {
    it('should return the lesson', async () => {
      const lesson = {
        _id: 'lesson-1',
      };

      const query = {
        populate: jest.fn().mockResolvedValue(
          lesson
        ),
      };

      mockLesson.findById.mockReturnValue(query);

      const result =
        await getLessonById('lesson-1');

      expect(
        mockLesson.findById
      ).toHaveBeenCalledWith('lesson-1');

      expect(query.populate).toHaveBeenCalledWith(
        'course',
        'title slug instructor'
      );

      expect(result).toBe(lesson);
    });
  });

  describe('updateLesson', () => {
    it('should update the lesson when instructor owns the course', async () => {
      const lesson = {
        _id: 'lesson-1',
        course: 'course-1',
        title: 'Old Lesson',
        order: 1,
        save: jest.fn().mockResolvedValue(),
      };

      mockLesson.findById.mockResolvedValue(
        lesson
      );

      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockLesson.findOne.mockResolvedValue(
        null
      );

      const result = await updateLesson(
        'lesson-1',
        'instructor-1',
        {
          title: 'Updated Lesson',
          order: 2,
        }
      );

      expect(lesson.title).toBe(
        'Updated Lesson'
      );

      expect(lesson.order).toBe(2);

      expect(lesson.save).toHaveBeenCalled();

      expect(result).toBe(lesson);
    });

    it('should reject duplicate lesson order', async () => {
      const lesson = {
        _id: 'lesson-1',
        course: 'course-1',
      };

      mockLesson.findById.mockResolvedValue(
        lesson
      );

      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockLesson.findOne.mockResolvedValue({
        _id: 'lesson-2',
        toString: () => 'lesson-2',
      });

      await expect(
        updateLesson(
          'lesson-1',
          'instructor-1',
          {
            order: 2,
          }
        )
      ).rejects.toMatchObject({
        message:
          'A lesson with this order already exists',
        statusCode: 409,
      });
    });
  });

  describe('publishLesson', () => {
    it('should publish a lesson', async () => {
      const lesson = {
        _id: 'lesson-1',
        course: 'course-1',
        isPublished: false,
        save: jest.fn().mockResolvedValue(),
      };

      mockLesson.findById.mockResolvedValue(
        lesson
      );

      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      await publishLesson(
        'lesson-1',
        'instructor-1'
      );

      expect(
        lesson.isPublished
      ).toBe(true);

      expect(
        lesson.save
      ).toHaveBeenCalled();
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson owned by the instructor', async () => {
      mockLesson.findById.mockResolvedValue({
        course: 'course-1',
      });

      mockCourse.findById.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      await deleteLesson(
        'lesson-1',
        'instructor-1'
      );

      expect(
        mockLesson.findByIdAndDelete
      ).toHaveBeenCalledWith(
        'lesson-1'
      );
    });
  });
});