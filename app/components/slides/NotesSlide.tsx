'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { FileText, Check, ShoppingBag } from 'lucide-react';

interface NotesSlideProps {
  direction: number;
  onSubmit: () => void;
}

export default function NotesSlide({ direction, onSubmit }: NotesSlideProps) {
  const { formData, updateFormData, prevSlide, isSubmitting } = useFormStore();

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
            <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            Any additional notes?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Share any specific requirements or questions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="w-full max-w-2xl mb-4 sm:mb-6"
        >
          <textarea
            value={formData.notes}
            onChange={(e) => updateFormData({ notes: e.target.value })}
            placeholder="Tell us more about your business needs, specific products you're looking for, volume expectations, or any questions you have..."
            rows={4}
            className="w-full px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800 resize-none text-sm sm:text-base"
            aria-label="Additional notes"
          />
          <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 text-right">
            {formData.notes.length} characters
          </p>

          {/* Order Tracking Section */}
          <div className="mt-4 p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => updateFormData({ placedOrder: !formData.placedOrder })}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  formData.placedOrder ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    formData.placedOrder ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <div className="flex items-center gap-2">
                <ShoppingBag className={`w-5 h-5 ${formData.placedOrder ? 'text-emerald-500' : 'text-gray-400'}`} />
                <span className={`font-medium ${formData.placedOrder ? 'text-emerald-700' : 'text-gray-600'}`}>
                  Customer placed an order at the show
                </span>
              </div>
            </div>
            
            {formData.placedOrder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <input
                  type="text"
                  value={formData.orderNotes || ''}
                  onChange={(e) => updateFormData({ orderNotes: e.target.value })}
                  placeholder="Order details (e.g., products, quantity, order #)..."
                  className="w-full px-3 py-2 rounded-lg border-2 border-emerald-200 focus:border-emerald-500 focus:ring-0 outline-none transition-colors text-gray-800 text-sm"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={prevSlide}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            ← Back
          </motion.button>
          <motion.button
            whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.99 }}
            onClick={onSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-medium bg-linear-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex items-center gap-2"
            aria-label="Submit form"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Processing...
              </>
            ) : (
              <>
                Submit <Check className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </SlideWrapper>
  );
}
