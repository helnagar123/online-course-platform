import { jest } from '@jest/globals';

const mockCourse = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

const mockCategory = {
    findOne: jest.fn(),
};

jest.unstable_mockModule(
    '../../../src/models/Course.js',
    () => ({
        default: mockCourse,
    })
);

jest.unstable_mockModule(
    '../../../src/models/Category.js',
    () => ({
        default: mockCategory,
    })
);

const {
    createCourse,
    getCourseById,
    getCourses,
    updateCourse,
    publishCourse,
    archiveCourse,
    deleteCourse,
} = await import(
    '../../../src/services/course.service.js'
);

describe('Course Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCourse', () => {
        it('should create a course with a generated slug', async () => {
            mockCategory.findOne.mockResolvedValue({
                _id: 'category-1',
                isActive: true,
            });

            mockCourse.findOne.mockResolvedValue(null);

            const course = {
                _id: 'course-1',
                title: 'Node JS Fundamentals',
                slug: 'node-js-fundamentals',
            };

            mockCourse.create.mockResolvedValue(
                course
            );

            const result = await createCourse(
                'instructor-1',
                {
                    title: 'Node JS Fundamentals',
                    description:
                        'A complete course for Node JS fundamentals',
                    category: 'category-1',
                    level: 'beginner',
                    price: 100,
                }
            );

            expect(mockCategory.findOne).toHaveBeenCalledWith(
                {
                    _id: 'category-1',
                    isActive: true,
                }
            );

            expect(mockCourse.findOne).toHaveBeenCalledWith(
                {
                    slug: 'node-js-fundamentals',
                }
            );

            expect(mockCourse.create).toHaveBeenCalledWith({
                title: 'Node JS Fundamentals',
                description:
                    'A complete course for Node JS fundamentals',
                category: 'category-1',
                level: 'beginner',
                price: 100,
                instructor: 'instructor-1',
                slug: 'node-js-fundamentals',
            });

            expect(result).toBe(course);
        });

        it('should reject inactive or missing category', async () => {
            mockCategory.findOne.mockResolvedValue(
                null
            );

            await expect(
                createCourse('instructor-1', {
                    title: 'Node JS Fundamentals',
                    category: 'category-1',
                })
            ).rejects.toMatchObject({
                message:
                    'Category not found or inactive',
                statusCode: 404,
            });

            expect(mockCourse.create).not.toHaveBeenCalled();
        });

        it('should reject duplicate course titles', async () => {
            mockCategory.findOne.mockResolvedValue({
                _id: 'category-1',
            });

            mockCourse.findOne.mockResolvedValue({
                _id: 'existing-course',
            });

            await expect(
                createCourse('instructor-1', {
                    title: 'Node JS Fundamentals',
                    category: 'category-1',
                })
            ).rejects.toMatchObject({
                message:
                    'A course with this title already exists',
                statusCode: 409,
            });
        });
    });

    describe('getCourseById', () => {
        it('should return the course with populated fields', async () => {
            const course = {
                _id: 'course-1',
            };

            const populateCategory = jest.fn().mockResolvedValue(
                course
            );

            const populateInstructor = jest.fn()
                .mockReturnValue({
                    populate: populateCategory,
                });

            mockCourse.findById.mockReturnValue({
                populate: populateInstructor,
            });

            const result =
                await getCourseById('course-1');

            expect(mockCourse.findById).toHaveBeenCalledWith(
                'course-1'
            );

            expect(result).toBe(course);
        });

        it('should throw when course does not exist', async () => {
            const populate = jest.fn()
                .mockReturnThis();

            mockCourse.findById.mockReturnValue({
                populate,
            });

            populate.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null),
            });

            await expect(
                getCourseById('missing-course')
            ).rejects.toMatchObject({
                message: 'Course not found',
                statusCode: 404,
            });
        });
    });
    describe('getCourses', () => {
        it('should return paginated and sorted courses', async () => {
            const courses = [
                {
                    _id: 'course-1',
                    title: 'Node JS',
                },
            ];

            const query = {
                populate: jest.fn(),
                sort: jest.fn(),
                skip: jest.fn(),
                limit: jest.fn(),
            };

            query.populate.mockReturnValue(query);
            query.sort.mockReturnValue(query);
            query.skip.mockReturnValue(query);
            query.limit.mockResolvedValue(courses);

            mockCourse.find.mockReturnValue(query);
            mockCourse.countDocuments.mockResolvedValue(15);

            const result = await getCourses({
                search: 'Node',
                category: 'category-1',
                level: 'beginner',
                status: 'published',
                page: 2,
                limit: 10,
                sortBy: 'title',
                sortOrder: 'asc',
            });

            expect(mockCourse.find).toHaveBeenCalledWith({
                $text: {
                    $search: 'Node',
                },
                category: 'category-1',
                level: 'beginner',
                status: 'published',
            });

            expect(query.populate).toHaveBeenNthCalledWith(
                1,
                'instructor',
                'firstName lastName avatar'
            );

            expect(query.populate).toHaveBeenNthCalledWith(
                2,
                'category',
                'name slug'
            );

            expect(query.sort).toHaveBeenCalledWith({
                title: 1,
            });

            expect(query.skip).toHaveBeenCalledWith(10);

            expect(query.limit).toHaveBeenCalledWith(10);

            expect(
                mockCourse.countDocuments
            ).toHaveBeenCalledWith({
                $text: {
                    $search: 'Node',
                },
                category: 'category-1',
                level: 'beginner',
                status: 'published',
            });

            expect(result).toEqual({
                courses,
                pagination: {
                    page: 2,
                    limit: 10,
                    totalCourses: 15,
                    totalPages: 2,
                    hasNextPage: false,
                    hasPreviousPage: true,
                },
            });
        });
    });

    describe('updateCourse', () => {
        it('should update course fields when instructor owns it', async () => {
            const course = {
                _id: 'course-1',
                instructor: {
                    toString: () => 'instructor-1',
                },
                title: 'Old Course',
                slug: 'old-course',
                category: 'category-1',
                save: jest.fn().mockResolvedValue(),
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            mockCourse.findOne.mockResolvedValue(null);

            const result = await updateCourse(
                'course-1',
                'instructor-1',
                {
                    title: 'New Course',
                    description: 'Updated description',
                    price: 200,
                }
            );

            expect(course.title).toBe('New Course');
            expect(course.slug).toBe('new-course');
            expect(course.description).toBe(
                'Updated description'
            );
            expect(course.price).toBe(200);
            expect(course.save).toHaveBeenCalled();

            expect(result).toBe(course);
        });

        it('should reject updates from another instructor', async () => {
            const course = {
                _id: 'course-1',
                instructor: {
                    toString: () => 'owner-1',
                },
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            await expect(
                updateCourse(
                    'course-1',
                    'another-instructor',
                    {
                        title: 'New Course',
                    }
                )
            ).rejects.toMatchObject({
                message:
                    'You are not allowed to modify this course',
                statusCode: 403,
            });
        });
    });

    describe('publishCourse', () => {
        it('should publish a draft course', async () => {
            const course = {
                _id: 'course-1',
                instructor: {
                    toString: () => 'instructor-1',
                },
                status: 'draft',
                save: jest.fn().mockResolvedValue(),
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            const result =
                await publishCourse(
                    'course-1',
                    'instructor-1'
                );

            expect(course.status).toBe(
                'published'
            );

            expect(course.publishedAt).toBeInstanceOf(
                Date
            );

            expect(course.save).toHaveBeenCalled();

            expect(result).toBe(course);
        });

        it('should reject already published courses', async () => {
            const course = {
                instructor: {
                    toString: () => 'instructor-1',
                },
                status: 'published',
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            await expect(
                publishCourse(
                    'course-1',
                    'instructor-1'
                )
            ).rejects.toMatchObject({
                message: 'Course is already published',
                statusCode: 400,
            });
        });
    });

    describe('archiveCourse', () => {
        it('should archive a course', async () => {
            const course = {
                instructor: {
                    toString: () => 'instructor-1',
                },
                status: 'published',
                save: jest.fn().mockResolvedValue(),
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            await archiveCourse(
                'course-1',
                'instructor-1'
            );

            expect(course.status).toBe(
                'archived'
            );

            expect(course.save).toHaveBeenCalled();
        });
    });

    describe('deleteCourse', () => {
        it('should delete an owned course', async () => {
            const course = {
                instructor: {
                    toString: () => 'instructor-1',
                },
            };

            mockCourse.findById.mockResolvedValue(
                course
            );

            await deleteCourse(
                'course-1',
                'instructor-1'
            );

            expect(
                mockCourse.findByIdAndDelete
            ).toHaveBeenCalledWith('course-1');
        });
    });
});