import { z } from 'zod';

const bdPhoneRegex = /^(\+?880|0)?1[3-9]\d{8}$/;

export const bloodGroupEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']);

export const authStepOneSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(5, 'Enter a valid email address or Bangladesh mobile number')
    .refine(
      (val) => val.includes('@') ? z.string().email().safeParse(val).success : bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Must be a valid email or Bangladesh phone number (e.g. +8801712345678)'
    ),
  fullName: z.string().trim().min(2, 'Full name is required (at least 2 characters)').optional().or(z.literal('')),
  role: z.enum(['donor', 'seeker', 'hospital']),
});

export const otpVerifySchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Enter the 6-digit verification code'),
});

export const donorProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Enter a valid Bangladesh phone number (01XXXXXXXXX or +8801XXXXXXXXX)'
    ),
  bloodGroup: bloodGroupEnum,
  division: z.string().min(1, 'Select a Division'),
  district: z.string().min(1, 'Select a District'),
  upazila: z.string().min(1, 'Select an Upazila'),
  unionName: z.string().min(1, 'Select a Union / Ward'),
  isAvailable: z.boolean(),
  lastDonationDate: z.string().nullable().optional(),
  contactPreference: z.enum(['phone', 'sms', 'whatsapp', 'in_app']),
  avatarUrl: z.string().optional(),
});

export const bloodRequestSchema = z.object({
  patientName: z.string().trim().min(2, 'Patient name or reference is required'),
  bloodGroup: bloodGroupEnum,
  bagsNeeded: z.coerce.number().int().min(1, 'At least 1 bag required').max(10, 'Maximum 10 bags per request'),
  urgency: z.enum(['normal', 'urgent', 'critical']),
  hospitalName: z.string().trim().max(120).optional().or(z.literal('')),
  contactPhone: z
    .string()
    .trim()
    .refine(
      (val) => bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Enter a valid Bangladesh contact number (e.g. 01712345678)'
    ),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().min(1, 'Upazila is required'),
  unionName: z.string().min(1, 'Union / Ward is required'),
  notes: z.string().trim().max(400).optional().or(z.literal('')),
});

export const bloodBankSchema = z.object({
  name: z.string().trim().min(3, 'Facility name in English is required'),
  nameBn: z.string().trim().min(2, 'Facility name in Bengali is required'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Valid contact number required'
    ),
  address: z.string().trim().min(5, 'Street address is required'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().min(1, 'Upazila is required'),
  unionName: z.string().min(1, 'Union / Ward is required'),
  is24Hours: z.boolean(),
});

export const donorRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Enter a valid Bangladesh mobile number (e.g. +8801712345678)'
    ),
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  bloodGroup: bloodGroupEnum,
  division: z.string().min(1, 'Select a Division'),
  district: z.string().min(1, 'Select a District'),
  upazila: z.string().min(1, 'Select an Upazila'),
  unionName: z.string().min(1, 'Select a Union / Ward'),
  isAvailable: z.boolean(),
  lastDonationDate: z.string().nullable().optional(),
  contactPreference: z.enum(['phone', 'sms', 'whatsapp', 'in_app']),
  avatarUrl: z.string().optional(),
  medicalConsent: z.boolean().refine((v) => v === true, {
    message: 'Please confirm age (18–65), weight (50kg+), and voluntary donation terms',
  }),
});

export const customPageBlockSchema = z.object({
  id: z.string().min(1),
  headingEn: z.string().trim().min(2, 'Block heading (EN) is required'),
  headingBn: z.string().trim().min(2, 'Block heading (BN) is required'),
  bodyEn: z.string().trim().min(5, 'Block content (EN) is required'),
  bodyBn: z.string().trim().min(5, 'Block content (BN) is required'),
  ctaLabelEn: z.string().trim().optional().or(z.literal('')),
  ctaLabelBn: z.string().trim().optional().or(z.literal('')),
  ctaRoute: z.string().trim().optional().or(z.literal('')),
});

export const customPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Page URL slug is required')
    .max(60, 'Slug must be under 60 characters')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only (e.g. winter-camp-2026)'),
  titleEn: z.string().trim().min(2, 'Page title in English is required'),
  titleBn: z.string().trim().min(2, 'Page title in Bengali is required'),
  subtitleEn: z.string().trim().min(4, 'Short summary in English is required'),
  subtitleBn: z.string().trim().min(4, 'Short summary in Bengali is required'),
  template: z.enum(['article', 'camp', 'faq', 'partner']),
  placement: z.enum(['header', 'footer', 'both', 'hidden']),
  coverImageUrl: z.string().trim().optional().or(z.literal('')),
  isPublished: z.boolean(),
});

export const emergencyNoticeSchema = z.object({
  titleEn: z.string().trim().min(3, 'Notice headline (EN) is required'),
  titleBn: z.string().trim().min(2, 'Notice headline (BN) is required'),
  messageEn: z.string().trim().min(5, 'Notice message (EN) is required'),
  messageBn: z.string().trim().min(5, 'Notice message (BN) is required'),
  severity: z.enum(['critical', 'urgent', 'info']),
  targetBloodGroup: z.enum(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  targetDivision: z.string().trim().optional().or(z.literal('')),
  ctaLabelEn: z.string().trim().optional().or(z.literal('')),
  ctaLabelBn: z.string().trim().optional().or(z.literal('')),
  ctaRoute: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean(),
});

export const adCampaignSchema = z.object({
  sponsorName: z.string().trim().min(2, 'Sponsor / organization name is required'),
  titleEn: z.string().trim().min(3, 'Campaign title (EN) is required'),
  titleBn: z.string().trim().min(2, 'Campaign title (BN) is required'),
  descriptionEn: z.string().trim().min(5, 'Campaign description (EN) is required'),
  descriptionBn: z.string().trim().min(5, 'Campaign description (BN) is required'),
  ctaLabelEn: z.string().trim().min(2, 'CTA button label (EN) is required'),
  ctaLabelBn: z.string().trim().min(2, 'CTA button label (BN) is required'),
  targetRoute: z.string().trim().min(1, 'Target route or URL is required'),
  imageUrl: z.string().trim().optional().or(z.literal('')),
  placement: z.enum(['landing', 'find_donors', 'request_blood', 'custom_pages']),
  isActive: z.boolean(),
});

export function slugifyText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export const userReportSchema = z.object({
  reason: z.enum(['fake_profile', 'payment_demand', 'harassment', 'unreachable', 'other']),
  details: z.string().trim().min(6, 'Please describe what happened (at least 6 characters)').max(500),
  blockUser: z.boolean(),
});

export const partnershipInquirySchema = z.object({
  organizationName: z.string().trim().min(2, 'Organization name is required'),
  organizationType: z.enum(['ngo', 'hospital', 'university', 'corporate', 'other']),
  contactPerson: z.string().trim().min(2, 'Contact person name is required'),
  email: z.string().trim().email('Enter a valid organizational email'),
  phone: z
    .string()
    .trim()
    .refine(
      (val) => bdPhoneRegex.test(val.replace(/[\s-]/g, '')),
      'Enter a valid contact phone number (e.g. +8801712345678)'
    ),
  message: z.string().trim().min(10, 'Tell us briefly how you wish to partner (10+ characters)').max(1000),
});

export type DonorProfileFormValues = z.infer<typeof donorProfileSchema>;
export type DonorRegistrationFormValues = z.infer<typeof donorRegistrationSchema>;
export type BloodRequestFormValues = z.infer<typeof bloodRequestSchema>;
export type BloodBankFormValues = z.infer<typeof bloodBankSchema>;
export type CustomPageFormValues = z.infer<typeof customPageSchema>;
export type EmergencyNoticeFormValues = z.infer<typeof emergencyNoticeSchema>;
export type AdCampaignFormValues = z.infer<typeof adCampaignSchema>;
export type UserReportFormValues = z.infer<typeof userReportSchema>;
export type PartnershipInquiryFormValues = z.infer<typeof partnershipInquirySchema>;

