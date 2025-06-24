import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Text from '@/components/atoms/Text';
import CategoryPill from '@/components/molecules/CategoryPill';
import ApperIcon from '@/components/ApperIcon';
import { timeEntryService } from '@/services/api/timeEntryService';
import { categoryService } from '@/services/api/categoryService';

const ManualEntryModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  editingEntry = null 
}) => {
  const [formData, setFormData] = useState({
    activityName: '',
    category: '',
    startTime: '',
    endTime: ''
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      initializeForm();
    }
  }, [isOpen, editingEntry]);

  const loadCategories = async () => {
    try {
      const result = await categoryService.getAll();
      setCategories(result);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const initializeForm = () => {
    if (editingEntry) {
      const startTime = new Date(editingEntry.startTime);
      const endTime = editingEntry.endTime ? new Date(editingEntry.endTime) : new Date();
      
      setFormData({
        activityName: editingEntry.activityName,
        category: editingEntry.category,
        startTime: format(startTime, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(endTime, "yyyy-MM-dd'T'HH:mm")
      });
      
      // Set selected category
      const category = categories.find(cat => cat.name === editingEntry.category);
      setSelectedCategory(category);
    } else {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      setFormData({
        activityName: '',
        category: '',
        startTime: format(oneHourAgo, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(now, "yyyy-MM-dd'T'HH:mm")
      });
      
      setSelectedCategory(null);
    }
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.activityName.trim()) {
      newErrors.activityName = 'Activity name is required';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end <= start) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        activityName: formData.activityName.trim(),
        category: selectedCategory.name,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };

      let result;
      if (editingEntry) {
        result = await timeEntryService.update(editingEntry.Id, entryData);
        toast.success('Time entry updated!');
      } else {
        result = await timeEntryService.create(entryData);
        toast.success('Time entry added!');
      }

      onSave(result);
      onClose();
    } catch (error) {
      toast.error(editingEntry ? 'Failed to update entry' : 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Text size="lg" weight="semibold">
                {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                icon="X"
                onClick={handleClose}
                disabled={loading}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Activity Name"
                value={formData.activityName}
                onChange={(e) => setFormData(prev => ({ ...prev, activityName: e.target.value }))}
                placeholder="What did you work on?"
                error={errors.activityName}
                required
              />

              <div className="space-y-3">
                <Text size="sm" weight="medium">
                  Category {errors.category && <span className="text-red-500 ml-1">*</span>}
                </Text>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <CategoryPill
                      key={category.Id}
                      category={category}
                      isSelected={selectedCategory?.Id === category.Id}
                      onClick={() => setSelectedCategory(category)}
                      size="sm"
                    />
                  ))}
                </div>
                {errors.category && (
                  <Text size="sm" color="error">{errors.category}</Text>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Start Time"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  error={errors.startTime}
                  required
                />

                <Input
                  label="End Time"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  error={errors.endTime}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingEntry ? 'Update' : 'Add Entry')}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ManualEntryModal;