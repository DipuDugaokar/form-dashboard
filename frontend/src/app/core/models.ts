export type UserRole = 'Admin' | 'Editor';
export type FormStatus = 'draft' | 'published' | 'archived';
export type FieldType = 'text' | 'email' | 'mobile' | 'dropdown' | 'radio' | 'checkbox' | 'date' | 'textarea' | 'consent checkbox';

export interface SessionUser {
  id: string;
  displayName: string;
  role: UserRole;
}
export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
  consentText?: string;
}
export interface FormDefinition {
  heading: string;
  body: string;
  ctaText: string;
  thankYouMessage: string;
  fields: FormField[];
}
export interface FormSummary {
  id: string;
  name: string;
  brand: string;
  market: string;
  campaignSlug: string;
  status: FormStatus;
  updatedAt: string;
  draftVersion?: number;
  publishedVersion?: number;
  definition?: FormDefinition;
}
export interface ApiError {
  code?: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
