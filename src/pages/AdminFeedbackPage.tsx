import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  Clock,
  CheckCheck,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  KeyRound,
  LogOut,
  AlertTriangle,
  Monitor,
  Calendar,
  Mail,
  FileText,
  X,
  Loader2,
  Save
} from 'lucide-react';
import type { FeedbackCategory, FeedbackStatus, FeedbackSubmission, FeedbackStats } from '../types/feedback';

const CATEGORIES: FeedbackCategory[] = [
  'Incorrect Information',
  'Typo / Spelling Mistake',
  'Technical Bug',
  'Missing Information',
  'Broken Link',
  'Suggestion',
  'Other'
];

export const AdminFeedbackPage: React.FC = () => {
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('elements_admin_token');
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Data state
  const [feedbackList, setFeedbackList] = useState<FeedbackSubmission[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<FeedbackSubmission | null>(null);
  const [detailNotes, setDetailNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Confirmation modal for delete
  const [itemToDelete, setItemToDelete] = useState<FeedbackSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Email test & retry state
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailFeedback, setTestEmailFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [isRetryingEmail, setIsRetryingEmail] = useState(false);

  // Fetch feedback and statistics
  const loadData = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Stats
      const statsRes = await fetch('/api/feedback/stats', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (statsRes.status === 401) {
        sessionStorage.removeItem('elements_admin_token');
        setAuthToken(null);
        setAuthError('Session expired. Please sign in again.');
        return;
      }
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setStats(statsData.stats);
      }

      // 2. Fetch Feedback List
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const listRes = await fetch(`/api/feedback?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const listData = await listRes.json();
      if (listRes.ok) {
        setFeedbackList(listData.feedback || []);
      } else {
        throw new Error(listData.error || 'Failed to load feedback');
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setIsLoading(false);
    }
  }, [authToken, categoryFilter, statusFilter, searchQuery]);

  useEffect(() => {
    if (authToken) {
      loadData();
    }
  }, [authToken, loadData]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || isAuthenticating) return;

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/feedback/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid admin credentials');
      }

      sessionStorage.setItem('elements_admin_token', data.token);
      setAuthToken(data.token);
      setPasswordInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('elements_admin_token');
    setAuthToken(null);
    setFeedbackList([]);
    setStats(null);
    setSelectedItem(null);
  };

  // Open item detail
  const handleOpenDetail = async (item: FeedbackSubmission) => {
    if (!item.id || !authToken) return;
    try {
      const res = await fetch(`/api/feedback/${item.id}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        setSelectedItem(data.feedback);
        setDetailNotes(data.feedback.admin_notes || '');
      } else {
        setSelectedItem(item);
        setDetailNotes(item.admin_notes || '');
      }
    } catch {
      setSelectedItem(item);
      setDetailNotes(item.admin_notes || '');
    }
  };

  // Update Status
  const handleStatusChange = async (newStatus: FeedbackStatus) => {
    if (!selectedItem?.id || !authToken || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/feedback/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (res.ok && data.feedback) {
        setSelectedItem(data.feedback);
        setFeedbackList((prev) =>
          prev.map((fb) => (fb.id === selectedItem.id ? { ...fb, status: newStatus } : fb))
        );
        // Refresh stats
        const statsRes = await fetch('/api/feedback/stats', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.stats);
        }
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Save Admin Notes
  const handleSaveNotes = async () => {
    if (!selectedItem?.id || !authToken || isSavingNotes) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/feedback/${selectedItem.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ admin_notes: detailNotes })
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        setSelectedItem(data.feedback);
        setFeedbackList((prev) =>
          prev.map((fb) => (fb.id === selectedItem.id ? { ...fb, admin_notes: detailNotes } : fb))
        );
      }
    } catch (err) {
      console.error('Failed to save notes', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Feedback
  const handleDeleteConfirm = async () => {
    if (!itemToDelete?.id || !authToken || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/feedback/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        setFeedbackList((prev) => prev.filter((fb) => fb.id !== itemToDelete.id));
        if (selectedItem?.id === itemToDelete.id) {
          setSelectedItem(null);
        }
        setItemToDelete(null);
        // Refresh stats
        const statsRes = await fetch('/api/feedback/stats', {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (statsRes.ok) {
          const s = await statsRes.json();
          setStats(s.stats);
        }
      }
    } catch (err) {
      console.error('Failed to delete item', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export submissions to CSV
  const exportToCSV = () => {
    if (feedbackList.length === 0) return;
    const headers = ['ID', 'Category', 'Status', 'Date', 'Email', 'Page URL', 'Page Title', 'Description', 'Admin Notes'];
    const rows = feedbackList.map((fb) => [
      `"${fb.id || ''}"`,
      `"${fb.category}"`,
      `"${fb.status || 'Pending'}"`,
      `"${fb.created_at || ''}"`,
      `"${fb.email || ''}"`,
      `"${(fb.page_url || '').replace(/"/g, '""')}"`,
      `"${(fb.page_title || '').replace(/"/g, '""')}"`,
      `"${(fb.description || '').replace(/"/g, '""')}"`,
      `"${(fb.admin_notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger test email to verify delivery
  const handleSendTestEmail = async () => {
    if (!authToken || isSendingTestEmail) return;
    setIsSendingTestEmail(true);
    setTestEmailFeedback(null);
    try {
      const res = await fetch('/api/feedback/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({ recipient: 'sagarhiremath025@gmail.com' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailFeedback({
          message: `✓ Test email notification dispatched to sagarhiremath025@gmail.com (${data.result?.provider || 'Success'})!`,
          isError: false
        });
      } else {
        setTestEmailFeedback({
          message: `✗ Email delivery failed: ${data.result?.error || data.error || 'Check server logs'}`,
          isError: true
        });
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setTestEmailFeedback({
        message: `✗ Network error sending test email: ${errorMsg}`,
        isError: true
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Retry sending email notification for a specific feedback submission
  const handleRetryEmail = async (id: string) => {
    if (!authToken || isRetryingEmail) return;
    setIsRetryingEmail(true);
    try {
      const res = await fetch(`/api/feedback/${id}/retry-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok && data.feedback) {
        setSelectedItem(data.feedback);
        setFeedbackList((prev) =>
          prev.map((fb) => (fb.id === id ? data.feedback : fb))
        );
      }
    } catch (err) {
      console.error('Failed to retry email', err);
    } finally {
      setIsRetryingEmail(false);
    }
  };

  // Helper for email delivery status badge
  const getEmailStatusBadge = (status?: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCheck className="w-3 h-3" />
            Delivered
          </span>
        );
      case 'sent':
      case 'accepted_by_resend':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Sent
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  // Helper for category badge styling
  const getCategoryBadgeClass = (cat: FeedbackCategory | string) => {
    switch (cat) {
      case 'Incorrect Information':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'Typo / Spelling Mistake':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Technical Bug':
        return 'bg-red-500/15 text-red-300 border-red-500/30';
      case 'Missing Information':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'Broken Link':
        return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
      case 'Suggestion':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Helper for status badge styling
  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Reviewed':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Pending':
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    }
  };

  // If not logged in, render the login card
  if (!authToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050814] text-slate-100 font-sans">
        <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-cyan-500/30 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_24px_rgba(6,182,212,0.15)] space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Admin Management</h1>
            <p className="text-xs text-slate-400">
              Sign in with your admin passkey to inspect and manage user feedback & reported mistakes.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Admin Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password (default: admin123)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 text-sm placeholder:text-slate-500 transition-colors"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-400">
                Default development secret: <code className="text-cyan-400 font-mono">admin123</code> (configurable via <code className="font-mono">ADMIN_SECRET</code>).
              </p>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating || !passwordInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-[0_4px_16px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Unlock Admin Dashboard'
              )}
            </button>
          </form>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed">
            <span className="font-bold text-cyan-300 block mb-1">Deployment Notice</span>
            The live feedback database API runs in local development mode (<code className="font-mono text-cyan-400">npm run dev</code>). On GitHub Pages static hosting, feedback submissions are safely preserved in browser LocalStorage and dispatched directly via email.
          </div>

          <div className="pt-2 text-center border-t border-slate-800">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Periodic Table
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 font-sans pb-16">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Return to Periodic Table"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Periodic Table</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Feedback & Mistake Management
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Review, triage, and resolve user-submitted issue reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={isSendingTestEmail}
            className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title="Send test email notification to sagarhiremath025@gmail.com"
          >
            <Mail className={`w-3.5 h-3.5 text-cyan-400 ${isSendingTestEmail ? 'animate-pulse' : ''}`} />
            <span className="hidden md:inline">{isSendingTestEmail ? 'Sending...' : 'Test Email'}</span>
          </button>

          <button
            type="button"
            onClick={exportToCSV}
            disabled={feedbackList.length === 0}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            title="Export feedback records as CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
            title="Refresh submissions"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Sign out of admin session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Test Email Notification Banner */}
        {testEmailFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-md animate-in fade-in duration-200 ${
              testEmailFeedback.isError
                ? 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0 text-cyan-400" />
              <span>{testEmailFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setTestEmailFeedback(null)}
              className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 sm:p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Total Reports</p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {stats?.total ?? feedbackList.length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-amber-500/20 p-4 sm:p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-amber-400/80 font-mono uppercase tracking-wider">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {stats?.pending ?? feedbackList.filter((f) => f.status === 'Pending').length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/20 p-4 sm:p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-cyan-400/80 font-mono uppercase tracking-wider">Reviewed</p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {stats?.reviewed ?? feedbackList.filter((f) => f.status === 'Reviewed').length}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/80 border border-emerald-500/20 p-4 sm:p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-400/80 font-mono uppercase tracking-wider">Resolved</p>
              <p className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                {stats?.resolved ?? feedbackList.filter((f) => f.status === 'Resolved').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3">
          {/* Status filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            {(['all', 'Pending', 'Reviewed', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_2px_10px_rgba(6,182,212,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            ))}
          </div>

          {/* Category Dropdown & Search Input */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative min-w-[180px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search descriptions, URL, email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Feedback Records Table / Cards */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs font-mono">Loading feedback records...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="py-20 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No Feedback Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              There are no feedback submissions matching your current filters.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Category</th>
                    <th className="px-4 py-3.5">Description</th>
                    <th className="px-4 py-3.5">Reported Page</th>
                    <th className="px-4 py-3.5">User / Contact</th>
                    <th className="px-4 py-3.5">Date & Time</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                  {feedbackList.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(item)}
                    >
                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeClass(
                            item.status
                          )}`}
                        >
                          {item.status || 'Pending'}
                        </span>
                      </td>

                      {/* Email Notification Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getEmailStatusBadge(item.email_status)}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      {/* Description Preview */}
                      <td className="px-4 py-3.5 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-2 text-slate-200 text-xs font-normal">
                            {item.description}
                          </p>
                          {item.has_screenshot && (
                            <span className="shrink-0 text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">
                              Image
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reported Page */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.page_url ? (
                          <a
                            href={item.page_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline max-w-[200px] truncate"
                          >
                            <span className="truncate">{item.page_url.replace(/^https?:\/\/[^/]+/, '') || '/'}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      {/* Submitter */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-400">
                        {item.email ? (
                          <span className="text-slate-300 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-cyan-400/80" />
                            {item.email}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">Anonymous</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors cursor-pointer"
                            title="Inspect details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer"
                            title="Delete submission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Detail Inspection Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto font-sans"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedItem(null);
          }}
        >
          <div className="w-full max-w-2xl rounded-2xl bg-slate-950 border border-cyan-500/30 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                    selectedItem.status
                  )}`}
                >
                  {selectedItem.status || 'Pending'}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
                    selectedItem.category
                  )}`}
                >
                  {selectedItem.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* Full Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Description</h4>
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm leading-relaxed text-slate-200 whitespace-pre-wrap select-text">
                  {selectedItem.description}
                </div>
              </div>

              {/* Reported Page & Submitter info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-mono">Reported Page</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={selectedItem.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 truncate"
                    >
                      <span className="truncate">{selectedItem.page_url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-400 font-mono">Submitter Contact</span>
                  <p className="text-xs text-slate-200 font-medium">
                    {selectedItem.email ? (
                      <a href={`mailto:${selectedItem.email}`} className="text-cyan-400 hover:underline">
                        {selectedItem.email}
                      </a>
                    ) : (
                      'Anonymous'
                    )}
                  </p>
                </div>
              </div>

              {/* Date & Diagnostic Info */}
              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Submitted: {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : '—'}</span>
                </div>
                {selectedItem.browser_info && typeof selectedItem.browser_info === 'object' && (
                  <div className="flex items-start gap-2 text-slate-300">
                    <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span>Platform: {selectedItem.browser_info.platform || 'Unknown'} | Screen: {selectedItem.browser_info.screenWidth}x{selectedItem.browser_info.screenHeight}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5 break-all">
                        UA: {selectedItem.browser_info.userAgent}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Owner Email Notification Details */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">Owner Notification</span>
                    {getEmailStatusBadge(selectedItem.email_status)}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Recipient: <span className="text-cyan-300">{selectedItem.email_recipient || 'sagarhiremath025@gmail.com'}</span>
                    {selectedItem.email_sent_at && ` • Sent ${new Date(selectedItem.email_sent_at).toLocaleTimeString()}`}
                  </p>
                  {selectedItem.email_error && (
                    <p className="text-[11px] text-rose-400 font-mono">
                      Error: {selectedItem.email_error}
                    </p>
                  )}
                </div>

                {selectedItem.id && (
                  <button
                    type="button"
                    onClick={() => handleRetryEmail(selectedItem.id!)}
                    disabled={isRetryingEmail}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                    title="Retry sending email notification for this feedback"
                  >
                    <RefreshCw className={`w-3 h-3 text-cyan-400 ${isRetryingEmail ? 'animate-spin' : ''}`} />
                    <span>{isRetryingEmail ? 'Sending...' : 'Retry Email'}</span>
                  </button>
                )}
              </div>

              {/* Uploaded Screenshot if available */}
              {selectedItem.screenshot_data && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Uploaded Screenshot</h4>
                  <div className="relative rounded-xl border border-cyan-500/30 overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center">
                    <img
                      src={selectedItem.screenshot_data}
                      alt="Submitted screenshot"
                      className="max-h-72 object-contain w-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setPreviewImage(selectedItem.screenshot_data || null)}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Click image to enlarge full screen.</p>
                </div>
              )}

              {/* Status Selector Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Update Triage Status
                </label>
                <div className="flex items-center gap-2">
                  {(['Pending', 'Reviewed', 'Resolved'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      disabled={isUpdatingStatus}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedItem.status === st
                          ? getStatusBadgeClass(st) + ' ring-2 ring-cyan-400/50'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      Mark as {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Admin Internal Notes */}
              <div className="space-y-2">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400">
                  Internal Admin Notes
                </label>
                <textarea
                  value={detailNotes}
                  onChange={(e) => setDetailNotes(e.target.value)}
                  rows={3}
                  placeholder="Add internal resolution notes, verification steps, or references..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={isSavingNotes}
                  onClick={handleSaveNotes}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingNotes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Notes
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setItemToDelete(selectedItem)}
                className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Submission
              </button>

              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen Image Lightbox */}
      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img src={previewImage} alt="Full screenshot preview" className="max-h-[85vh] max-w-full rounded-xl shadow-2xl" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) setItemToDelete(null);
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-slate-950 border border-rose-500/40 p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Feedback?</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800 line-clamp-3">
              "{itemToDelete.description}"
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
