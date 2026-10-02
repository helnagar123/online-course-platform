import { jest } from '@jest/globals';

const mockCategory = {
  findOne: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

jest.unstable_mockModule(
  '../../../src/models/Category.js',
  () => ({
    default: mockCategory,
  })
);

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory,
} = await import(
  '../../../src/services/category.service.js'
);

describe('Category Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category with a generated slug', async () => {
      mockCategory.findOne.mockResolvedValue(null);

      const createdCategory = {
        _id: 'category-1',
        name: 'Web Development',
        slug: 'web-development',
      };

      mockCategory.create.mockResolvedValue(
        createdCategory
      );

      const result = await createCategory({
        name: ' Web Development ',
        description: 'Learning web development',
      });

      expect(mockCategory.findOne).toHaveBeenCalledWith({
        name: /^Web Development$/i,
      });

      expect(mockCategory.create).toHaveBeenCalledWith({
        name: 'Web Development',
        slug: 'web-development',
        description: 'Learning web development',
      });

      expect(result).toBe(createdCategory);
    });

    it('should reject duplicate category names', async () => {
      mockCategory.findOne.mockResolvedValue({
        _id: 'existing-category',
        name: 'Web Development',
      });

      await expect(
        createCategory({
          name: 'Web Development',
        })
      ).rejects.toMatchObject({
        message: 'Category already exists',
        statusCode: 409,
      });

      expect(mockCategory.create).not.toHaveBeenCalled();
    });
  });

  describe('getCategories', () => {
    it('should return active categories by default', async () => {
      const categories = [
        {
          _id: '1',
          name: 'Backend',
          isActive: true,
        },
      ];

      const query = {
        sort: jest.fn().mockResolvedValue(categories),
      };

      mockCategory.find.mockReturnValue(query);

      const result = await getCategories();

      expect(mockCategory.find).toHaveBeenCalledWith({
        isActive: true,
      });

      expect(query.sort).toHaveBeenCalledWith({
        name: 1,
      });

      expect(result).toBe(categories);
    });

    it('should include inactive categories when requested', async () => {
      const query = {
        sort: jest.fn().mockResolvedValue([]),
      };

      mockCategory.find.mockReturnValue(query);

      await getCategories({
        includeInactive: true,
      });

      expect(mockCategory.find).toHaveBeenCalledWith({});
    });
  });

  describe('getCategoryById', () => {
    it('should return the category when found', async () => {
      const category = {
        _id: 'category-1',
        name: 'Backend',
      };

      mockCategory.findById.mockResolvedValue(
        category
      );

      const result = await getCategoryById(
        'category-1'
      );

      expect(mockCategory.findById).toHaveBeenCalledWith(
        'category-1'
      );

      expect(result).toBe(category);
    });

    it('should throw when category does not exist', async () => {
      mockCategory.findById.mockResolvedValue(null);

      await expect(
        getCategoryById('missing-id')
      ).rejects.toMatchObject({
        message: 'Category not found',
        statusCode: 404,
      });
    });
  });

  describe('updateCategory', () => {
    it('should update category name and regenerate slug', async () => {
      const category = {
        _id: 'category-1',
        name: 'Backend',
        slug: 'backend',
        description: 'Old description',
        isActive: true,
        save: jest.fn().mockResolvedValue(),
      };

      mockCategory.findById.mockResolvedValue(
        category
      );

      mockCategory.findOne.mockResolvedValue(null);

      const result = await updateCategory(
        'category-1',
        {
          name: 'Advanced Backend',
        }
      );

      expect(category.name).toBe(
        'Advanced Backend'
      );

      expect(category.slug).toBe(
        'advanced-backend'
      );

      expect(category.save).toHaveBeenCalled();

      expect(result).toBe(category);
    });

    it('should reject duplicate category names', async () => {
      const category = {
        _id: 'category-1',
        name: 'Backend',
        save: jest.fn(),
      };

      mockCategory.findById.mockResolvedValue(
        category
      );

      mockCategory.findOne.mockResolvedValue({
        _id: 'category-2',
        name: 'Frontend',
      });

      await expect(
        updateCategory('category-1', {
          name: 'Frontend',
        })
      ).rejects.toMatchObject({
        message: 'Category name already exists',
        statusCode: 409,
      });

      expect(category.save).not.toHaveBeenCalled();
    });
  });

  describe('deactivateCategory', () => {
    it('should deactivate the category', async () => {
      const category = {
        _id: 'category-1',
        name: 'Backend',
        isActive: true,
        save: jest.fn().mockResolvedValue(),
      };

      mockCategory.findById.mockResolvedValue(
        category
      );

      const result =
        await deactivateCategory(
          'category-1'
        );

      expect(category.isActive).toBe(false);
      expect(category.save).toHaveBeenCalled();
      expect(result).toBe(category);
    });
  });
});