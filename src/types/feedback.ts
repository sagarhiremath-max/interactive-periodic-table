export type FeedbackCategory =
  | 'Incorrect Information'
  | 'Typo / Spelling Mistake'
  | 'Technical Bug'
  | 'Missing Information'
  | 'Broken Link'
  | 'Suggestion'
  | 'Other';

export type FeedbackStatus = 'Pending' | 'Reviewed' | 'Resolved';

export interface BrowserInfo {
  userAgent?: string;
  platform?: string;
  language?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  devicePixelRatio?: number;
}

export interface FeedbackSubmission {
  id?: string;
  category: FeedbackCategory;
  description: string;
  email?: string;
  page_url?: string;
  page_title?: string;
  browser_info?: BrowserInfo;
  screenshot_data?: string;
  status?: FeedbackStatus;
  created_at?: string;
  has_screenshot?: boolean;
  admin_notes?: string;
  email_status?: 'pending' | 'sent' | 'delivered' | 'accepted_by_resend' | 'failed';
  email_sent_at?: string;
  email_error?: string;
  email_recipient?: string;
}

export interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  byCategory: Array<{ category: string; count: number }>;
}
