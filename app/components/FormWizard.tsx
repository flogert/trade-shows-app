'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useFormStore } from '../store/formStore';
import WelcomeSlide from './slides/WelcomeSlide';
import BusinessTypeSlide from './slides/BusinessTypeSlide';
import ContactInfoSlide from './slides/ContactInfoSlide';
import BrandsSlide from './slides/BrandsSlide';
import CategoriesSlide from './slides/CategoriesSlide';
import ContactPreferencesSlide from './slides/ContactPreferencesSlide';
import NotesSlide from './slides/NotesSlide';
import SuccessSlide from './slides/SuccessSlide';
import { generateAIInsights } from '../utils/ai';

interface FormWizardProps {
  onViewDashboard: () => void;
}

export default function FormWizard({ onViewDashboard }: FormWizardProps) {
  const {
    currentSlide,
    setCurrentSlide,
    formData,
    updateFormData,
    addSubmission,
    resetForm,
    setSubmitting,
    setAiLoading,
    nextSlide,
    startSession,
    getSessionDuration,
  } = useFormStore();

  const [direction, setDirection] = useState(1);

  const handleNext = () => {
    setDirection(1);
    nextSlide();
  };

  const handlePrev = () => {
    setDirection(-1);
  };

  const handleStart = () => {
    setDirection(1);
    startSession();
    setCurrentSlide(1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const dwellTime = getSessionDuration();
    const submissionData = {
      ...formData,
      id: `lead-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dwellTime: dwellTime > 0 ? dwellTime : undefined,
    };

    // Move to success slide immediately
    setDirection(1);
    setCurrentSlide(7);
    updateFormData(submissionData);
    
    // Generate AI insights
    setAiLoading(true);
    try {
      const insights = await generateAIInsights(submissionData);
      updateFormData({ aiInsights: insights });
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      updateFormData({ aiInsights: 'Unable to generate insights at this time.' });
    }
    setAiLoading(false);

    // Save the submission
    addSubmission({ ...submissionData, aiInsights: formData.aiInsights });
    setSubmitting(false);
  };

  const handleNewEntry = () => {
    resetForm();
    setDirection(-1);
    setCurrentSlide(0);
  };

  const slides = [
    <WelcomeSlide key="welcome" onStart={handleStart} onViewDashboard={onViewDashboard} />,
    <BusinessTypeSlide key="business" direction={direction} />,
    <ContactInfoSlide key="contact" direction={direction} />,
    <BrandsSlide key="brands" direction={direction} />,
    <CategoriesSlide key="categories" direction={direction} />,
    <ContactPreferencesSlide key="preferences" direction={direction} />,
    <NotesSlide key="notes" direction={direction} onSubmit={handleSubmit} />,
    <SuccessSlide
      key="success"
      direction={direction}
      onNewEntry={handleNewEntry}
      onViewDashboard={onViewDashboard}
    />,
  ];

  const totalSlides = slides.length - 1; // Exclude welcome and success
  const progress = currentSlide > 0 && currentSlide < 7 
    ? ((currentSlide) / (totalSlides - 1)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Progress Bar */}
      {currentSlide > 0 && currentSlide < 7 && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-linear-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-center py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((step) => (
                <div
                  key={step}
                  className={`w-2 h-2 rounded-full transition-all ${
                    step <= currentSlide
                      ? 'bg-indigo-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slides */}
      <div className={`${currentSlide > 0 && currentSlide < 7 ? 'pt-16' : ''}`}>
        <AnimatePresence mode="wait" custom={direction}>
          {slides[currentSlide]}
        </AnimatePresence>
      </div>
    </div>
  );
}
