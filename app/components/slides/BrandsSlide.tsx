'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { BRANDS } from '../../types';
import { Tags } from 'lucide-react';

interface BrandsSlideProps {
  direction: number;
}

export default function BrandsSlide({ direction }: BrandsSlideProps) {
  const { formData, updateFormData, nextSlide, prevSlide } = useFormStore();

  const toggleBrand = (brandId: string) => {
    const currentBrands = formData.selectedBrands;
    const newBrands = currentBrands.includes(brandId)
      ? currentBrands.filter((b) => b !== brandId)
      : [...currentBrands, brandId];
    updateFormData({ selectedBrands: newBrands });
  };

  const selectAll = () => {
    updateFormData({ selectedBrands: BRANDS.map((b) => b.id) });
  };

  const clearAll = () => {
    updateFormData({ selectedBrands: [] });
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
            <Tags className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Which brands interest you?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Select all the brands you&apos;d like to learn more about</p>
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 w-full max-w-2xl mb-6 sm:mb-8">
          {BRANDS.map((brand, index) => (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleBrand(brand.id)}
              className={`relative p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all overflow-hidden ${
                formData.selectedBrands.includes(brand.id)
                  ? 'border-transparent shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={{
                background: formData.selectedBrands.includes(brand.id)
                  ? `linear-gradient(135deg, ${brand.color}15, ${brand.color}30)`
                  : undefined,
                borderColor: formData.selectedBrands.includes(brand.id) ? brand.color : undefined,
              }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl mb-2 sm:mb-3 mx-auto flex items-center justify-center text-white font-bold text-base sm:text-lg"
                style={{ backgroundColor: brand.color }}
              >
                {brand.name.charAt(0)}
              </div>
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">{brand.name}</h3>
              {formData.selectedBrands.includes(brand.id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: brand.color }}
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
            disabled={formData.selectedBrands.length === 0}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              formData.selectedBrands.length > 0
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
