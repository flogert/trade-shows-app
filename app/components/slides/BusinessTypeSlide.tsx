'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { BUSINESS_TYPES } from '../../types';
import { Building2, Package, ShoppingBag } from 'lucide-react';

interface BusinessTypeSlideProps {
  direction: number;
}

export default function BusinessTypeSlide({ direction }: BusinessTypeSlideProps) {
  const { formData, updateFormData, nextSlide, prevSlide } = useFormStore();

  const handleSelect = (type: 'wholesale' | 'retail') => {
    updateFormData({ businessType: type });
  };

  return (
    <SlideWrapper direction={direction}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex justify-center mb-3 sm:mb-4">
            <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            What type of business are you?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Select the option that best describes your business</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-2xl mb-6 sm:mb-8">
          {BUSINESS_TYPES.map((type, index) => (
            <motion.button
              key={type.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(type.id as 'wholesale' | 'retail')}
              className={`p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all ${
                formData.businessType === type.id
                  ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
              aria-pressed={formData.businessType === type.id}
            >
              <div className="flex justify-center mb-3 sm:mb-4">
                {type.id === 'wholesale' 
                  ? <Package className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-500" aria-hidden="true" />
                  : <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500" aria-hidden="true" />
                }
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{type.name}</h3>
              <p className="text-gray-500 text-xs sm:text-sm">{type.description}</p>
              {formData.businessType === type.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 inline-flex items-center text-indigo-600 font-medium"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Selected
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
            disabled={!formData.businessType}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              formData.businessType
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
