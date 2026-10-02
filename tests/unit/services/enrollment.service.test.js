import { jest } from '@jest/globals';

const mockEnrollment = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
};

const mockCourse = {
  findOne: jest.fn(),
};

jest.unstable_mockModule(
  '../../../src/models/Enrollment.js',
  () => ({
    default: mockEnrollment,
  })
);

jest.unstable_mockModule(
  '../../../src/models/Course.js',
  () => ({
    default: mockCourse,
  })
);

const {
  enrollInCourse,
  getEnrollmentById,
  getMyEnrollments,
  cancelEnrollment,
} = await import(
  '../../../src/services/enrollment.service.js'
);

describe('Enrollment Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enrollInCourse', () => {
    it('should enroll a student in a published course', async () => {
      mockCourse.findOne.mockResolvedValue({
        _id: 'course-1',
        status: 'published',
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockEnrollment.findOne.mockResolvedValue(
        null
      );

      const enrollment = {
        _id: 'enrollment-1',
        student: 'student-1',
        course: 'course-1',
      };

      mockEnrollment.create.mockResolvedValue(
        enrollment
      );

      const result =
        await enrollInCourse(
          'student-1',
          'course-1'
        );

      expect(
        mockCourse.findOne
      ).toHaveBeenCalledWith({
        _id: 'course-1',
        status: 'published',
      });

      expect(
        mockEnrollment.create
      ).toHaveBeenCalledWith({
        student: 'student-1',
        course: 'course-1',
      });

      expect(result).toBe(enrollment);
    });

    it('should reject enrollment in own course', async () => {
      mockCourse.findOne.mockResolvedValue({
        instructor: {
          toString: () => 'student-1',
        },
      });

      await expect(
        enrollInCourse(
          'student-1',
          'course-1'
        )
      ).rejects.toMatchObject({
        message:
          'You cannot enroll in your own course',
        statusCode: 400,
      });
    });

    it('should reject duplicate enrollment', async () => {
      mockCourse.findOne.mockResolvedValue({
        instructor: {
          toString: () => 'instructor-1',
        },
      });

      mockEnrollment.findOne.mockResolvedValue({
        _id: 'existing-enrollment',
      });

      await expect(
        enrollInCourse(
          'student-1',
          'course-1'
        )
      ).rejects.toMatchObject({
        message:
          'You are already enrolled in this course',
        statusCode: 409,
      });

      expect(
        mockEnrollment.create
      ).not.toHaveBeenCalled();
    });
  });

  describe('getEnrollmentById', () => {
    it('should return the student enrollment', async () => {
      const enrollment = {
        _id: 'enrollment-1',
      };

      const query = {
        populate: jest.fn().mockResolvedValue(
          enrollment
        ),
      };

      mockEnrollment.findOne.mockReturnValue(
        query
      );

      const result =
        await getEnrollmentById(
          'enrollment-1',
          'student-1'
        );

      expect(
        mockEnrollment.findOne
      ).toHaveBeenCalledWith({
        _id: 'enrollment-1',
        student: 'student-1',
      });

      expect(query.populate).toHaveBeenCalledWith(
        'course',
        'title slug thumbnail instructor'
      );

      expect(result).toBe(enrollment);
    });
  });

  describe('getMyEnrollments', () => {
    it('should return enrollments sorted by newest first', async () => {
      const enrollments = [
        {
          _id: 'enrollment-1',
        },
      ];

      const query = {
        populate: jest.fn(),
      };

      query.populate.mockReturnValue({
        sort: jest.fn().mockResolvedValue(
          enrollments
        ),
      });

      mockEnrollment.find.mockReturnValue(
        query
      );

      const result =
        await getMyEnrollments(
          'student-1'
        );

      expect(
        mockEnrollment.find
      ).toHaveBeenCalledWith({
        student: 'student-1',
      });

      expect(
        query.populate
      ).toHaveBeenCalled();

      expect(result).toBe(enrollments);
    });
  });

  describe('cancelEnrollment', () => {
    it('should cancel an active enrollment', async () => {
      const enrollment = {
        _id: 'enrollment-1',
        status: 'active',
        save: jest.fn().mockResolvedValue(),
      };

      mockEnrollment.findOne.mockResolvedValue(
        enrollment
      );

      const result =
        await cancelEnrollment(
          'enrollment-1',
          'student-1'
        );

      expect(
        enrollment.status
      ).toBe('cancelled');

      expect(
        enrollment.save
      ).toHaveBeenCalled();

      expect(result).toBe(enrollment);
    });

    it('should reject cancelling completed enrollment', async () => {
      mockEnrollment.findOne.mockResolvedValue({
        status: 'completed',
      });

      await expect(
        cancelEnrollment(
          'enrollment-1',
          'student-1'
        )
      ).rejects.toMatchObject({
        message:
          'Completed enrollment cannot be cancelled',
        statusCode: 400,
      });
    });
  });
});