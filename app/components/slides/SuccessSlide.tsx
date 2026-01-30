'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { BRANDS, CATEGORIES } from '../../types';
import { ClipboardList } from 'lucide-react';

interface SuccessSlideProps {
  direction: number;
  onNewEntry: () => void;
  onViewDashboard: () => void;
}

export default function SuccessSlide({ direction, onNewEntry, onViewDashboard }: SuccessSlideProps) {
  const { formData } = useFormStore();

  const selectedBrandNames = BRANDS
    .filter((b) => formData.selectedBrands.includes(b.id))
    .map((b) => b.name);

  const selectedCategoryNames = CATEGORIES
    .filter((c) => formData.selectedCategories.includes(c.id))
    .map((c) => c.name);

  return (
    <SlideWrapper direction={direction}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-24 h-24 mb-6 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl"
        >
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center"
        >
          Thank you, {formData.firstName}!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="text-gray-500 text-center mb-8"
        >
          Your information has been recorded. We&apos;ll be in touch soon!
        </motion.p>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.25 }}
          className="w-full max-w-2xl bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100"
        >
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" aria-hidden="true" /> Submission Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Business Type</p>
              <p className="font-medium text-gray-800 capitalize">{formData.businessType}</p>
            </div>
            <div>
              <p className="text-gray-500">Business Name</p>
              <p className="font-medium text-gray-800">{formData.businessName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500">Contact</p>
              <p className="font-medium text-gray-800">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Preferred Contact</p>
              <p className="font-medium text-gray-800 capitalize">{formData.preferredContact}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 mb-1">Interested Brands</p>
              <div className="flex flex-wrap gap-2">
                {selectedBrandNames.map((brand) => (
                  <span
                    key={brand}
                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-500 mb-1">Interested Categories</p>
              <div className="flex flex-wrap gap-2">
                {selectedCategoryNames.map((category) => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNewEntry}
            className="px-8 py-3 rounded-xl font-medium bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all"
          >
            + New Entry
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDashboard}
            className="px-8 py-3 rounded-xl font-medium border-2 border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Dashboard
          </motion.button>
        </div>
      </div>
    </SlideWrapper>
  );
}
