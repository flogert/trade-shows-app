'use client';

import { motion } from 'framer-motion';
import SlideWrapper from '../SlideWrapper';
import { useFormStore } from '../../store/formStore';
import { US_STATES } from '../../types';
import { User } from 'lucide-react';
import BadgeScanner from '../BadgeScanner';

interface ContactInfoSlideProps {
  direction: number;
}

export default function ContactInfoSlide({ direction }: ContactInfoSlideProps) {
  const { formData, updateFormData, nextSlide, prevSlide } = useFormStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const isValid = formData.firstName && formData.email && formData.phone;

  const handleScanComplete = (scannedData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => {
    // Only update fields that have values from the scan
    const updates: Record<string, string> = {};
    if (scannedData.firstName) updates.firstName = scannedData.firstName;
    if (scannedData.lastName) updates.lastName = scannedData.lastName;
    if (scannedData.email) updates.email = scannedData.email;
    if (scannedData.phone) updates.phone = scannedData.phone;
    if (scannedData.businessName) updates.businessName = scannedData.businessName;
    if (scannedData.address) updates.address = scannedData.address;
    if (scannedData.city) updates.city = scannedData.city;
    if (scannedData.state) updates.state = scannedData.state;
    if (scannedData.zipCode) updates.zipCode = scannedData.zipCode;
    
    if (Object.keys(updates).length > 0) {
      updateFormData(updates);
    }
  };

  return (
    <SlideWrapper direction={direction}>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-2 sm:px-6 sm:py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="text-center mb-3 sm:mb-5"
        >
          <div className="flex justify-center mb-2 sm:mb-3">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500" aria-hidden="true" />
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
            Tell us about yourself
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">We&apos;d love to get to know you better</p>
          <div className="mt-3 flex justify-center">
            <BadgeScanner onScanComplete={handleScanComplete} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="w-full max-w-2xl space-y-3 sm:space-y-4"
        >
          {/* Row 1: First Name, Last Name, Business Name */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Company Inc."
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
          </div>

          {/* Row 2: Email, Phone */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@company.com"
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
          </div>

          {/* Row 3: Address (full width) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main Street"
              className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
            />
          </div>

          {/* Row 4: City, State, ZIP */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
                className="w-full px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800 bg-white"
              >
                <option value="">Select</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="10001"
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border-2 border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none transition-colors text-gray-800"
              />
            </div>
          </div>
        </motion.div>

        <div className="flex gap-4 mt-4">
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
            disabled={!isValid}
            className={`px-8 py-3 rounded-xl font-medium transition-all ${
              isValid
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
