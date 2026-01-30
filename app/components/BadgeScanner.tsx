'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, QrCode, ScanLine, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface BadgeScannerProps {
  onScanComplete: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    businessName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  }) => void;
}

export default function BadgeScanner({ onScanComplete }: BadgeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'qr' | 'photo'>('qr');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Scanner might already be stopped
      }
      scannerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    stopScanner();
    setIsOpen(false);
    setIsScanning(false);
    setCapturedImage(null);
    setError(null);
  }, [stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  const parseQRData = (data: string) => {
    // Try to parse as vCard format
    if (data.includes('BEGIN:VCARD')) {
      const result: Record<string, string> = {};
      
      const fnMatch = data.match(/FN:(.+)/);
      if (fnMatch) {
        const nameParts = fnMatch[1].trim().split(' ');
        result.firstName = nameParts[0] || '';
        result.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      const nMatch = data.match(/N:([^;]*);([^;]*)/);
      if (nMatch) {
        result.lastName = nMatch[1].trim() || result.lastName || '';
        result.firstName = nMatch[2].trim() || result.firstName || '';
      }
      
      const emailMatch = data.match(/EMAIL[^:]*:(.+)/);
      if (emailMatch) result.email = emailMatch[1].trim();
      
      const telMatch = data.match(/TEL[^:]*:(.+)/);
      if (telMatch) result.phone = telMatch[1].trim().replace(/[^\d+()-\s]/g, '');
      
      const orgMatch = data.match(/ORG:(.+)/);
      if (orgMatch) result.businessName = orgMatch[1].trim();
      
      const adrMatch = data.match(/ADR[^:]*:([^;]*);([^;]*);([^;]*);([^;]*);([^;]*);([^;]*);([^;]*)/);
      if (adrMatch) {
        result.address = adrMatch[3].trim();
        result.city = adrMatch[4].trim();
        result.state = adrMatch[5].trim();
        result.zipCode = adrMatch[6].trim();
      }
      
      return result;
    }
    
    // Try to parse as JSON
    try {
      const jsonData = JSON.parse(data);
      return {
        firstName: jsonData.firstName || jsonData.first_name || jsonData.fname || '',
        lastName: jsonData.lastName || jsonData.last_name || jsonData.lname || '',
        email: jsonData.email || jsonData.e || '',
        phone: jsonData.phone || jsonData.tel || jsonData.mobile || '',
        businessName: jsonData.company || jsonData.business || jsonData.org || '',
        address: jsonData.address || jsonData.street || '',
        city: jsonData.city || '',
        state: jsonData.state || '',
        zipCode: jsonData.zip || jsonData.zipCode || jsonData.postal || '',
      };
    } catch {
      // Not JSON
    }
    
    // Try to parse as URL params
    if (data.includes('=')) {
      const params = new URLSearchParams(data.includes('?') ? data.split('?')[1] : data);
      return {
        firstName: params.get('firstName') || params.get('first_name') || params.get('fname') || '',
        lastName: params.get('lastName') || params.get('last_name') || params.get('lname') || '',
        email: params.get('email') || '',
        phone: params.get('phone') || params.get('tel') || '',
        businessName: params.get('company') || params.get('business') || '',
        address: params.get('address') || '',
        city: params.get('city') || '',
        state: params.get('state') || '',
        zipCode: params.get('zip') || params.get('zipCode') || '',
      };
    }
    
    // If nothing parsed, return the raw data as a note
    return { businessName: data };
  };

  const startQRScanner = async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const parsedData = parseQRData(decodedText);
          onScanComplete(parsedData);
          closeModal();
        },
        () => {
          // QR code not found - this is called frequently, ignore
        }
      );
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
      console.error(err);
    }
  };

  const startPhotoCapture = async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
      console.error(err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      
      // Stop the video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // For now, just close the modal - in a real app, you'd send this to an OCR service
      // Since OCR requires backend services, we'll just inform the user
      setError('Badge photo captured! Manual entry required for badge text (OCR coming soon).');
    }
  };

  const openScanner = async (scanMode: 'qr' | 'photo') => {
    setMode(scanMode);
    setIsOpen(true);
    setCapturedImage(null);
    setError(null);
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      if (scanMode === 'qr') {
        startQRScanner();
      } else {
        startPhotoCapture();
      }
    }, 100);
  };

  return (
    <>
      {/* Scan Buttons */}
      <div className="flex gap-2">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openScanner('qr')}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm"
        >
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Scan QR</span>
          <span className="sm:hidden">QR</span>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => openScanner('photo')}
          className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-medium shadow-md hover:shadow-lg transition-all text-sm"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Scan Badge</span>
          <span className="sm:hidden">Badge</span>
        </motion.button>
      </div>

      {/* Scanner Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  {mode === 'qr' ? (
                    <QrCode className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Camera className="w-5 h-5 text-emerald-500" />
                  )}
                  <h3 className="font-semibold text-gray-800">
                    {mode === 'qr' ? 'Scan QR Code' : 'Capture Badge'}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Scanner Area */}
              <div className="p-4">
                {mode === 'qr' ? (
                  <div className="relative">
                    <div 
                      id="qr-reader" 
                      className="w-full aspect-square rounded-xl overflow-hidden bg-gray-900"
                    />
                    {isScanning && !error && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          animate={{ y: ['-40%', '40%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <ScanLine className="w-64 h-1 text-indigo-400" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {!capturedImage ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-4/3 rounded-xl object-cover bg-gray-900"
                      />
                    ) : (
                      <img
                        src={capturedImage}
                        alt="Captured badge"
                        className="w-full aspect-4/3 rounded-xl object-cover"
                      />
                    )}
                    {isScanning && !capturedImage && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-emerald-500"
                        >
                          <div className="w-12 h-12 rounded-full bg-emerald-500" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}

                {/* Loading/Error States */}
                {!isScanning && !error && (
                  <div className="flex items-center justify-center h-64 bg-gray-100 rounded-xl">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                )}
                
                {error && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Instructions */}
                <p className="mt-3 text-center text-sm text-gray-500">
                  {mode === 'qr' 
                    ? 'Point your camera at a QR code on a badge or business card'
                    : 'Take a photo of the badge to capture contact info'}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="p-4 pt-0 flex gap-2">
                <button
                  onClick={() => {
                    stopScanner();
                    openScanner('qr');
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    mode === 'qr' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <QrCode className="w-4 h-4 inline mr-2" />
                  QR Code
                </button>
                <button
                  onClick={() => {
                    stopScanner();
                    openScanner('photo');
                  }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    mode === 'photo' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Photo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
