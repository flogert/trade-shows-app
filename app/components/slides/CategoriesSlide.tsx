'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { CATEGORIES } from '../../types';
import { Grid3X3, Cigarette, Cpu, Droplet, Battery, Pipette, Sparkles } from 'lucide-react';

interface CategoriesSlideProps {
  direction: number;
}

// Map category IDs to icons
const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'vapes': return <Cigarette className="w-6 h-6 text-white" aria-hidden="true" />;
    case 'devices': return <Cpu className="w-6 h-6 text-white" aria-hidden="true" />;
    case 'e-liquids': return <Droplet className="w-6 h-6 text-white" aria-hidden="true" />;
    case 'pods': return <Battery className="w-6 h-6 text-white" aria-hidden="true" />;
    case 'nic-salts': return <Pipette className="w-6 h-6 text-white" aria-hidden="true" />;
    case 'accessories': return <Sparkles className="w-6 h-6 text-white" aria-hidden="true" />;
    default: return <Grid3X3 className="w-6 h-6 text-white" aria-hidden="true" />;
  }
};

export default function CategoriesSlide({ direction }: CategoriesSlideProps) {
  const { formData, updateFormData, nextSlide, prevSlide } = useFormStore();

  const toggleCategory = (categoryId: string) => {
    const currentCategories = formData.selectedCategories;
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((c) => c !== categoryId)
      : [...currentCategories, categoryId];
    updateFormData({ selectedCategories: newCategories });
  };

  const selectAll = () => {
    updateFormData({ selectedCategories: CATEGORIES.map((c) => c.id) });
  };

  const clearAll = () => {
    updateFormData({ selectedCategories: [] });
  };

  const getCategoryGradient = (index: number) => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-indigo-500',
      'from-pink-500 to-rose-500',
      'from-orange-500 to-amber-500',
      'from-green-500 to-emerald-500',
      'from-teal-500 to-cyan-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <SlideWrapper direction={direction}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-4 sm:mb-6"
        >
          <div className="flex justify-center mb-2 sm:mb-4">
            <Grid3X3 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            What categories are you interested in?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Select the product categories that fit your business</p>
        </motion.div>

        <div className="flex gap-3 mb-4 sm:mb-6">
          <button
            onClick={selectAll}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Select All
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl mb-6 sm:mb-8">
          {CATEGORIES.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleCategory(category.id)}
              className={`relative p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition-all ${
                formData.selectedCategories.includes(category.id)
                  ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-2 sm:gap-4">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-linear-to-br ${getCategoryGradient(index)} shadow-md shrink-0`}
                >
                  {getCategoryIcon(category.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 mb-0.5 sm:mb-1 text-sm sm:text-base">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">{category.description}</p>
                </div>
              </div>
              {formData.selectedCategories.includes(category.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={prevSlide}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            ← Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={nextSlide}
            disabled={formData.selectedCategories.length === 0}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              formData.selectedCategories.length > 0
                ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continue →
          </motion.button>
        </div>
      </div>
    </SlideWrapper>
  );
}
