import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  Monitor,
  Calendar,
  Send,
  Atom
} from 'lucide-react';
import type { FeedbackCategory, BrowserInfo } from '../types/feedback';
import type { ElementData } from '../data/elements';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
  activeElement?: ElementData | null;
  onSubmitted?: (message: string) => void;
}

const CATEGORIES: FeedbackCategory[] = [
  'Incorrect Information',
  'Typo / Spelling Mistake',
  'Technical Bug',
  'Missing Information',
  'Broken Link',
  'Suggestion',
  'Other'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  activeElement,
  onSubmitted
}) => {
  // Form fields
  const [category, setCategory] = useState<FeedbackCategory>('Incorrect Information');
  const [elementInfo, setElementInfo] = useState('');
  const [description, setDescription] = useState('');
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ description?: string; email?: string }>({});
  const [showAutoCaptured, setShowAutoCaptured] = useState(false);

  // References
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-captured metadata
  const [capturedInfo, setCapturedInfo] = useState<{
    url: string;
    title: string;
    timestamp: string;
    browser: BrowserInfo;
  }>({
    url: '',
    title: '',
    timestamp: '',
    browser: {}
  });

  // Populate auto-captured info and element when modal opens
  useEffect(() => {
    if (isOpen) {
      if (activeElement) {
        setElementInfo(`${activeElement.name} (#${activeElement.number}, ${activeElement.symbol})`);
      }
      const now = new Date();
      const info = {
        url: window.location.href,
        title: document.title || 'Periodic Table | Elements Lab',
        timestamp: now.toLocaleString(),
        browser: {
          userAgent: navigator.userAgent,
          platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown',
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio || 1
        }
      };
      setCapturedInfo(info);
      setErrorMessage(null);
      setFieldErrors({});

      // Focus description textarea on open
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen, activeElement]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Validate form client-side before submission
  const validateForm = () => {
    const errors: { description?: string; email?: string } = {};

    if (!description.trim() || description.trim().length < 5) {
      errors.description = 'Please provide a mistake description of at least 5 characters.';
    } else if (description.trim().length > 5000) {
      errors.description = 'Description cannot exceed 5000 characters.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Direct email submission handler via FormSubmit (Static-hosting compatible)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Spam honeypot trap
    if (honeypot) {
      onClose();
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const submissionTime = capturedInfo.timestamp || new Date().toLocaleString();
    const targetElement = elementInfo.trim() || 'General / Not specified';
    const cleanDescription = description.trim();
    const cleanCorrection = suggestedCorrection.trim() || 'None provided';
    const reporterEmail = email.trim() || 'Anonymous (No email provided)';
    const pageUrl = capturedInfo.url || window.location.href;

    try {
      // Complete report payload dispatched directly to sagarhiremath025@gmail.com
      const payload = {
        _subject: `[Elements Lab Feedback] ${category}: ${targetElement}`,
        _captcha: 'false',
        _template: 'table',
        'Feedback Category': category,
        'Element (Name & Atomic Number)': targetElement,
        'Reported Mistake Description': cleanDescription,
        'User Suggested Correction': cleanCorrection,
        'Reporter Email': reporterEmail,
        'Page URL': pageUrl,
        'Submission Date & Time': submissionTime,
        'Browser & Platform': `${capturedInfo.browser.platform || 'Unknown'} (${capturedInfo.browser.screenWidth}x${capturedInfo.browser.screenHeight})`
      };

      const response = await fetch('https://formsubmit.co/ajax/sagarhiremath025@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(
          `Delivery server returned status ${response.status}. Please check your internet connection and try again.`
        );
      }

      const data = await response.json();

      // Check FormSubmit response status
      if (
        data.success === 'true' ||
        data.success === true ||
        (typeof data.message === 'string' && data.message.includes('Activation'))
      ) {
        // Also preserve locally in localStorage as a backup log
        try {
          const localRecord = {
            id: 'fb_' + Date.now(),
            created_at: new Date().toISOString(),
            category,
            element: targetElement,
            description: cleanDescription,
            suggested_correction: cleanCorrection,
            email: email.trim() || null,
            page_url: pageUrl,
            status: 'sent_to_email'
          };
          const existing = JSON.parse(localStorage.getItem('elements_lab_local_feedback') || '[]');
          existing.unshift(localRecord);
          localStorage.setItem('elements_lab_local_feedback', JSON.stringify(existing.slice(0, 50)));
        } catch {
          // Ignore localStorage errors
        }

        // Reset form inputs
        setDescription('');
        setSuggestedCorrection('');
        setElementInfo('');
        setEmail('');
        setErrorMessage(null);

        // Automatically close modal and trigger success toast notification
        onClose();
        if (onSubmitted) {
          onSubmitted('Thank you! Your feedback has been sent successfully.');
        }
      } else {
        throw new Error(
          data.message || 'Unable to deliver your feedback at this time. Please click Submit Report to retry.'
        );
      }
    } catch (err: any) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to deliver feedback report. Please check your internet connection and click Submit Report to retry.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all duration-200 animate-in fade-in"
    >
      {/* Background click overlay */}
      <div
        className="fixed inset-0 -z-10"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-[#090d20] border border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(6,182,212,0.18)] overflow-hidden font-sans"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Atom className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
            <div>
              <h2 id="feedback-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                Report a Mistake
              </h2>
              <p className="text-[11px] text-slate-400">
                Direct submission to <span className="text-cyan-300 font-mono">sagarhiremath025@gmail.com</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-40"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-300">Delivery Error</p>
                  <p className="mt-0.5 text-xs text-rose-200 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Anti-spam Honeypot Field (Hidden) */}
            <input
              type="text"
              name="_gotcha"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              style={{ display: 'none' }}
              tabIndex={-1}
              autoComplete="off"
            />

            {/* Field 1: Category Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-category"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Feedback Category <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <select
                  id="feedback-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  disabled={isSubmitting}
                  className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: Element Name & Atomic Number (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-element"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Element Name & Atomic Number <span className="text-slate-500 font-normal normal-case">(Optional)</span>
              </label>
              <input
                id="feedback-element"
                type="text"
                value={elementInfo}
                onChange={(e) => setElementInfo(e.target.value)}
                disabled={isSubmitting}
                placeholder="e.g. Iron (#26, Fe), Carbon (#6), or General"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Field 3: Description Textarea (Required) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="feedback-description"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Description of Reported Mistake <span className="text-cyan-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {description.length} / 5000
                </span>
              </div>
              <textarea
                id="feedback-description"
                ref={textareaRef}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (fieldErrors.description) {
                    setFieldErrors((prev) => ({ ...prev, description: undefined }));
                  }
                }}
                disabled={isSubmitting}
                rows={4}
                placeholder="Describe the incorrect value, scientific error, or bug. Include details such as property name, expected vs actual value, or relevant context..."
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 ${
                  fieldErrors.description
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-cyan-400'
                } disabled:opacity-50 resize-y`}
              />
              {fieldErrors.description && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Field 4: User's Suggested Correction (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-correction"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Suggested Correction <span className="text-slate-500 font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                id="feedback-correction"
                value={suggestedCorrection}
                onChange={(e) => setSuggestedCorrection(e.target.value)}
                disabled={isSubmitting}
                rows={2}
                placeholder="What is the accurate value or IUPAC reference? (e.g. Electronegativity should be 1.83)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors disabled:opacity-50 resize-y"
              />
            </div>

            {/* Field 5: Email Address (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="feedback-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
              >
                Your Email Address <span className="text-slate-500 font-normal normal-case">(Optional, for follow-up or credit)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                disabled={isSubmitting}
                placeholder="name@example.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-xs sm:text-sm placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 ${
                  fieldErrors.email
                    ? 'border-rose-500/70 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-cyan-400'
                } disabled:opacity-50`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Auto-Captured Diagnostic Info Accordion */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAutoCaptured(!showAutoCaptured)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Auto-Attached Diagnostic Data
                </span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  {showAutoCaptured ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </span>
              </button>

              {showAutoCaptured && (
                <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5 font-mono text-slate-400 animate-in fade-in">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">URL: {capturedInfo.url || window.location.href}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Monitor className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>
                      Screen: {capturedInfo.browser.screenWidth}x{capturedInfo.browser.screenHeight} ({capturedInfo.browser.platform || 'Platform'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>Timestamp: {capturedInfo.timestamp || new Date().toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Sending to Sagar...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-slate-950" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
