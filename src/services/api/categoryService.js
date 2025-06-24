// Apper SDK will be loaded via CDN
let apper = null;

// Initialize Apper SDK when available
const initializeApperSDK = async () => {
  if (apper) return apper;
  
  try {
    if (!window.ApperSDK && window.loadApperSDK) {
      await window.loadApperSDK();
    }
    
    if (window.ApperSDK) {
      apper = new window.ApperSDK({
        projectId: import.meta.env.VITE_APPER_PROJECT_ID,
        publicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
      return apper;
    } else {
      throw new Error('ApperSDK not available');
    }
  } catch (error) {
    console.error('Failed to initialize Apper SDK:', error);
    throw error;
  }
};

// Table name
const CATEGORIES_TABLE = 'categories';

const categoryService = {
  // Get all categories
  async getCategories() {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      const response = await apper.table(CATEGORIES_TABLE).select('*');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get category by ID
  async getById(id) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      if (!id) throw new Error('Category ID is required');
      
      const response = await apper.table(CATEGORIES_TABLE)
        .select('*')
        .eq('id', id)
        .single();
      return response.data || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      return null;
    }
  },

  // Create a new category
  async createCategory(category) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      if (!category || !category.name) throw new Error('Category name is required');
      
      const response = await apper.table(CATEGORIES_TABLE).insert([{
        ...category,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update a category
  async updateCategory(id, updates) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      if (!id) throw new Error('Category ID is required');
      if (!updates) throw new Error('Update data is required');
      
      const response = await apper.table(CATEGORIES_TABLE)
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        })
        .eq('id', id);
      return response.data?.[0] || null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete a category
  async deleteCategory(id) {
    await initializeApperSDK();
    try {
      if (!apper) throw new Error('Apper SDK not initialized');
      if (!id) throw new Error('Category ID is required');
      
      const response = await apper.table(CATEGORIES_TABLE)
        .delete()
        .eq('id', id);
      return response.error ? false : true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }
};

export default categoryService;