'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { CONTACT_METHODS } from '../../types';
import { MessageCircle, Mail, Phone, Users } from 'lucide-react';

interface ContactPreferencesSlideProps {
  direction: number;
}

const getMethodIcon = (id: string) => {
  switch (id) {
    case 'email': return <Mail className="w-8 h-8 text-blue-500" aria-hidden="true" />;
    case 'phone': return <Phone className="w-8 h-8 text-green-500" aria-hidden="true" />;
    case 'text': return <MessageCircle className="w-8 h-8 text-purple-500" aria-hidden="true" />;
    case 'all': return <Users className="w-8 h-8 text-indigo-500" aria-hidden="true" />;
    default: return <Mail className="w-8 h-8 text-gray-500" aria-hidden="true" />;
  }
};

export default function ContactPreferencesSlide({ direction }: ContactPreferencesSlideProps) {
  const { formData, updateFormData, nextSlide, prevSlide } = useFormStore();

  const handleSelect = (method: string) => {
    updateFormData({ preferredContact: method as 'email' | 'phone' | 'text' | 'all' });
  };

  const timeOptions = [
    'Morning (8am - 12pm)',
    'Afternoon (12pm - 5pm)',
    'Evening (5pm - 8pm)',
    'Anytime',
  ];

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
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
            How would you like us to reach you?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">Select your preferred contact method</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl mb-4 sm:mb-6">
          {CONTACT_METHODS.map((method, index) => (
            <motion.button
              key={method.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelect(method.id)}
              className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all ${
                formData.preferredContact === method.id
                  ? 'border-indigo-500 bg-linear-to-br from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
              }`}
              aria-pressed={formData.preferredContact === method.id}
            >
              <div className="flex justify-center mb-3">{getMethodIcon(method.id)}</div>
              <h3 className="font-bold text-gray-800 text-sm">{method.name}</h3>
              {formData.preferredContact === method.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-2 text-indigo-600"
                >
                  <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="w-full max-w-md mb-6 sm:mb-8"
        >
          <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3 text-center">
            Best time to contact you?
          </label>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {timeOptions.map((time, index) => (
              <motion.button
                key={time}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => updateFormData({ bestTimeToContact: time })}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm transition-all ${
                  formData.bestTimeToContact === time
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {time}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={prevSlide}
            className="px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            ← Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={nextSlide}
            disabled={!formData.preferredContact}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              formData.preferredContact
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
