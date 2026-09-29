import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

const createCategory = async (categoryData) => {
  const { name, description } = categoryData;

  const existingCategory = await Category.findOne({
    name: {
      $regex: `^${name}$`,
      $options: 'i'
    }
  });

  if (existingCategory) {
    throw new AppError('Category already exists', 409);
  }

  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const category = await Category.create({
    name: name.trim(),
    slug,
    description
  });

  return category;
};

const getCategories = async ({ includeInactive = false } = {}) => {
  const query = {};

  if (!includeInactive) {
    query.isActive = true;
  }

  return Category.find(query).sort({ name: 1 });
};

const getCategoryById = async (categoryId) => {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  return category;
};

const updateCategory = async (categoryId, updateData) => {
  const category = await getCategoryById(categoryId);

  if (updateData.name) {
    const duplicateCategory = await Category.findOne({
      _id: { $ne: categoryId },
      name: {
        $regex: `^${updateData.name}$`,
        $options: 'i'
      }
    });

    if (duplicateCategory) {
      throw new AppError('Category name already exists', 409);
    }

    category.name = updateData.name.trim();

    category.slug = updateData.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  if (updateData.description !== undefined) {
    category.description = updateData.description;
  }

  if (updateData.isActive !== undefined) {
    category.isActive = updateData.isActive;
  }

  await category.save();

  return category;
};

const deactivateCategory = async (categoryId) => {
  const category = await getCategoryById(categoryId);

  category.isActive = false;

  await category.save();

  return category;
};

export {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deactivateCategory
};