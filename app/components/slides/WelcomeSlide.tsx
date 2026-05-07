'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { BOOTH_SECTIONS } from '../../types';
import { 
  LayoutDashboard, 
  MapPin, 
  ArrowRight
} from 'lucide-react';

interface WelcomeSlideProps {
  onStart: () => void;
  onViewDashboard: () => void;
}

export default function WelcomeSlide({ onStart, onViewDashboard }: WelcomeSlideProps) {
  const { updateFormData, formData, currentUser } = useFormStore();
  const [selectedSection, setSelectedSection] = useState(formData.boothSection || '');
  const salespersonValue = currentUser?.salespersonId || formData.salesperson;

  const handleStart = () => {
    if (!selectedSection || !salespersonValue) {
      return;
    }
    updateFormData({ boothSection: selectedSection, salesperson: salespersonValue });
    onStart();
  };

  const canStart = selectedSection && salespersonValue;

  return (
    <SlideWrapper>
      <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-4 sm:px-6 sm:py-6">
        {/* Dashboard Access Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          type="button"
          onClick={onViewDashboard}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
          aria-label="Go to dashboard"
        >
          <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Dashboard</span>
        </motion.button>
        
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:mb-3 text-center"
        >
          Welcome to Our Booth!
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mb-4 sm:mb-6 text-center px-2"
        >
          Let&apos;s capture this lead. Choose the booth section to get started.
        </motion.p>

        {/* Selection Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full max-w-lg space-y-3 sm:space-y-4 mb-4 sm:mb-6 px-2"
        >
          {currentUser && (
            <div className="rounded-2xl border border-indigo-100 bg-white/85 px-4 py-3 text-left shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Logged in salesperson</p>
              <p className="mt-1 text-sm font-medium text-gray-800">{currentUser.displayName}</p>
            </div>
          )}

          {/* Booth Section Selection */}
          <div>
            <label 
              htmlFor="section-select" 
              className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2"
            >
              <MapPin className="w-4 h-4 text-purple-500" aria-hidden="true" />
              Booth Section (Where conversation started)
            </label>
            <select
              id="section-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all appearance-none cursor-pointer"
              aria-required="true"
            >
              <option value="">Select booth section...</option>
              {BOOTH_SECTIONS.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          whileHover={canStart ? { scale: 1.01 } : {}}
          whileTap={canStart ? { scale: 0.99 } : {}}
          type="button"
          onClick={handleStart}
          disabled={!canStart}
          className={`flex items-center gap-2 px-5 py-2.5 sm:px-8 sm:py-4 text-white text-base sm:text-lg font-semibold rounded-2xl shadow-xl transition-all ${
            canStart
              ? 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-2xl'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          aria-disabled={!canStart}
        >
          Get Started
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </motion.button>

        {!canStart && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 mt-3"
            aria-live="polite"
          >
            Please select a booth section
          </motion.p>
        )}
      </div>
    </SlideWrapper>
  );
}
