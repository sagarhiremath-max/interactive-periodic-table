import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  AlertCircle,
  CheckCircle2,
  Upload,
  Trash2,
  Loader2,
  Info,
  ChevronDown,
  ChevronUp,
  Globe,
  Monitor,
  Calendar,
  Mail,
  Copy
} from 'lucide-react';
import type { FeedbackCategory, BrowserInfo } from '../types/feedback';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
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
  onClose
}) => {
  // Form fields
  const [category, setCategory] = useState<FeedbackCategory>('Incorrect Information');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [honeypot, setHoneypot] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [offlineSaved, setOfflineSaved] = useState<{
    saved: boolean;
    mailtoUrl: string;
    mailBody: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ description?: string; email?: string; screenshot?: string }>({});
  const [showAutoCaptured, setShowAutoCaptured] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
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

  // Populate auto-captured info when modal opens
  useEffect(() => {
    if (isOpen) {
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
      setSuccessMessage(null);
      setOfflineSaved(null);
      setCopied(false);
      setFieldErrors({});

      // Focus textarea on open
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

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

  // Process image file to base64
  const handleImageFile = (file: File) => {
    setFieldErrors((prev) => ({ ...prev, screenshot: undefined }));

    if (!file.type.startsWith('image/')) {
      setFieldErrors((prev) => ({ ...prev, screenshot: 'Please upload a valid image file (PNG, JPG, WEBP).' }));
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, screenshot: 'Screenshot size must be under 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setScreenshotData(result);
      setScreenshotName(file.name || 'Pasted screenshot');
    };
    reader.onerror = () => {
      setFieldErrors((prev) => ({ ...prev, screenshot: 'Failed to read image file.' }));
    };
    reader.readAsDataURL(file);
  };

  // Support pasting screenshot directly with Ctrl+V
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || isSubmitting) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  // Validate form client-side before submission
  const validateForm = () => {
    const errors: { description?: string; email?: string } = {};

    if (!description.trim() || description.trim().length < 5) {
      errors.description = 'Please provide a description of at least 5 characters.';
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

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        category,
        description: description.trim(),
        email: email.trim() || undefined,
        screenshot_data: screenshotData || undefined,
        page_url: capturedInfo.url || window.location.href,
        page_title: capturedInfo.title || document.title,
        browser_info: capturedInfo.browser,
        honeypot: honeypot || undefined // anti-spam
      };

      // 1. Attempt API submission to backend if running
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          setSuccessMessage(
            data.message ||
              'Thank you for your feedback! Your report has been submitted successfully. We appreciate your help.'
          );
          setDescription('');
          setEmail('');
          setScreenshotData(null);
          setScreenshotName('');
          setTimeout(() => {
            onClose();
          }, 3200);
          return;
        }
      } catch (_apiErr) {
        // Backend not available (e.g. GitHub Pages static hosting or offline)
      }

      // 2. Client-side resilient fallback (GitHub Pages static deployment):
      // Safely preserve in localStorage so user feedback is NEVER lost
      const localRecord = {
        id: 'fb_' + Date.now(),
        created_at: new Date().toISOString(),
        category,
        description: description.trim(),
        email: email.trim() || null,
        page_url: capturedInfo.url || window.location.href,
        browser_info: capturedInfo.browser,
        status: 'saved_locally'
      };

      try {
        const existing = JSON.parse(localStorage.getItem('elements_lab_local_feedback') || '[]');
        existing.unshift(localRecord);
        localStorage.setItem('elements_lab_local_feedback', JSON.stringify(existing.slice(0, 50)));
      } catch (e) {
        console.warn('LocalStorage save notice:', e);
      }

      // 3. Compose mailto link so the user can easily dispatch it to the developer
      const targetEmail = 'hiremathsagar025@gmail.com';
      const subject = `[Elements Lab Feedback] ${category}`;
      const mailBody = `Feedback Report - Elements Lab\n-----------------------------\nCategory: ${category}\nReporter Email: ${email.trim() || 'Not provided'}\nPage: ${capturedInfo.url || window.location.href}\nTimestamp: ${new Date().toLocaleString()}\n\nDescription:\n${description.trim()}\n\nBrowser: ${capturedInfo.browser.userAgent || 'Unknown'}\nScreen: ${capturedInfo.browser.screenWidth}x${capturedInfo.browser.screenHeight}`;
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

      setOfflineSaved({
        saved: true,
        mailtoUrl,
        mailBody
      });

      setDescription('');
      setEmail('');
      setScreenshotData(null);
      setScreenshotName('');
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-xl rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_24px_rgba(6,182,212,0.15)] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 bg-slate-900/90 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="feedback-modal-title"
                className="text-lg sm:text-xl font-bold text-white tracking-tight"
              >
                Found a Mistake?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Help us improve by reporting incorrect information or issues.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/60 hover:border-rose-500/40 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto space-y-5">
          {/* Static / Client-side Saved Notification */}
          {offlineSaved ? (
            <div className="py-6 px-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Feedback Recorded!</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  Your feedback has been safely saved in your browser storage.
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  To notify Sagar directly, click below to open your email client with this report pre-filled:
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <a
                  href={offlineSaved.mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  Send to hiremathsagar025@gmail.com
                </a>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(offlineSaved.mailBody);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2500);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied to Clipboard!' : 'Copy Report'}
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setOfflineSaved(null);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : successMessage ? (
            <div className="py-6 px-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Thank You!</h3>
              <p className="text-sm text-emerald-200 max-w-md mx-auto leading-relaxed">
                {successMessage}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-rose-300">Submission Error</p>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Honeypot field (hidden from real users to catch bot scrapers) */}
              <input
                type="text"
                name="company_website"
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
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-sm transition-colors cursor-pointer disabled:opacity-50"
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

              {/* Field 2: Description Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="feedback-description"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                  >
                    Description <span className="text-cyan-400">*</span>
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
                  placeholder="Describe the issue, incorrect value, or suggestion. Please include relevant details such as element symbol, row, or section..."
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-slate-100 text-sm placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 ${
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

              {/* Field 3: Email Address (Optional) */}
              <div className="space-y-1.5">
                <label
                  htmlFor="feedback-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Email Address <span className="text-slate-500 font-normal normal-case">(Optional)</span>
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
                  className={`w-full px-3.5 py-2 rounded-xl bg-slate-900 border text-slate-100 text-sm placeholder:text-slate-500 transition-colors focus:outline-none focus:ring-1 ${
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
                <p className="text-[11px] text-slate-400">
                  Provide your email if you would like us to follow up regarding your report.
                </p>
              </div>

              {/* Field 4: Screenshot Upload (Optional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Screenshot <span className="text-slate-500 font-normal normal-case">(Optional, max 5MB)</span>
                </label>

                {screenshotData ? (
                  <div className="relative rounded-xl border border-cyan-500/40 bg-slate-900/90 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={screenshotData}
                        alt="Screenshot preview"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">
                          {screenshotName || 'Attached Screenshot'}
                        </p>
                        <p className="text-[10px] text-cyan-400 mt-0.5">Image ready to upload</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotData(null);
                        setScreenshotName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-cyan-400 bg-cyan-950/30'
                        : 'border-slate-800 hover:border-cyan-500/40 bg-slate-900/50 hover:bg-slate-900/80'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400">
                      <Upload className="w-5 h-5 text-cyan-400" />
                      <p className="text-xs font-medium text-slate-200">
                        Click to browse, drag & drop, or paste screenshot (<span className="text-cyan-400 font-mono">Ctrl+V</span>)
                      </p>
                      <p className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</p>
                    </div>
                  </div>
                )}
                {fieldErrors.screenshot && (
                  <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {fieldErrors.screenshot}
                  </p>
                )}
              </div>

              {/* Automatically Captured Information Accordion */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAutoCaptured(!showAutoCaptured)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 text-xs text-slate-400 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    Auto-Captured Diagnostic Info
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                    {showAutoCaptured ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {showAutoCaptured && (
                  <div className="mt-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5 font-mono text-slate-400">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">URL: {capturedInfo.url || 'Current view'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Monitor className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>
                        Screen: {capturedInfo.browser.screenWidth}x{capturedInfo.browser.screenHeight} | Viewport: {capturedInfo.browser.viewportWidth}x{capturedInfo.browser.viewportHeight}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>Timestamp: {capturedInfo.timestamp}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons: Submit & Cancel */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
