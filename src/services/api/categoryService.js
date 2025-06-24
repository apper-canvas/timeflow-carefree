import { ApperSDK } from '@apper/web-sdk';

// Initialize Apper SDK
const apper = new ApperSDK({
  projectId: import.meta.env.VITE_APPER_PROJECT_ID,
  publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
  cdnUrl: import.meta.env.VITE_APPER_SDK_CDN_URL
});

// Table name
const CATEGORIES_TABLE = 'categories';

export const categoryService = {
  async getAll() {
    try {
      const result = await apper.database.query(CATEGORIES_TABLE);
      return result.data || [];
    } catch (error) {
      throw new Error('Failed to fetch categories from database');
    }
  },

  async getById(id) {
    try {
      const result = await apper.database.query(CATEGORIES_TABLE, {
        where: { Id: parseInt(id, 10) }
      });
      return result.data?.[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch category from database');
    }
  },

  async getByName(name) {
    try {
      const result = await apper.database.query(CATEGORIES_TABLE, {
        where: { name: name }
      });
      return result.data?.[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch category by name from database');
    }
  },

  async create(categoryData) {
    try {
      // Get next ID
      const allCategories = await this.getAll();
      const nextId = Math.max(...allCategories.map(c => c.Id), 0) + 1;
      
      const newCategory = {
        Id: nextId,
        ...categoryData
      };

      await apper.database.insert(CATEGORIES_TABLE, newCategory);
      return { ...newCategory };
    } catch (error) {
      throw new Error('Failed to create category in database');
    }
  },

  async update(id, updates) {
    try {
      const categoryId = parseInt(id, 10);
      const existingCategory = await this.getById(categoryId);
      
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      const updatedCategory = {
        ...existingCategory,
        ...updates,
        Id: existingCategory.Id // Prevent ID modification
      };

      await apper.database.update(CATEGORIES_TABLE, {
        where: { Id: categoryId },
        data: updatedCategory
      });

      return { ...updatedCategory };
    } catch (error) {
      throw new Error('Failed to update category in database');
    }
  },

  async delete(id) {
    try {
      const categoryId = parseInt(id, 10);
      const existingCategory = await this.getById(categoryId);
      
      if (!existingCategory) {
        throw new Error('Category not found');
      }

      await apper.database.delete(CATEGORIES_TABLE, {
        where: { Id: categoryId }
      });

      return { ...existingCategory };
    } catch (error) {
      throw new Error('Failed to delete category from database');
    }
  }
};

export default categoryService;