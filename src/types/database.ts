export type UserRole = 'donor' | 'seeker' | 'admin' | 'hospital';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'normal' | 'urgent' | 'critical';

export type RequestStatus = 'open' | 'matched' | 'fulfilled' | 'cancelled';

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'completed';

export type ContactPreference = 'phone' | 'sms' | 'whatsapp' | 'in_app';

export type Language = 'en' | 'bn';

export interface GeoLocationRef {
  division: string;
  district: string;
  upazila: string;
  unionName: string;
  latitude: number;
  longitude: number;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  phoneVerified: boolean;
  role: UserRole;
  preferredLanguage: Language;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DonorProfile extends GeoLocationRef {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  phoneVerified: boolean;
  email?: string;
  bloodGroup: BloodGroup;
  isAvailable: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  contactPreference: ContactPreference;
  isVerified: boolean;
  avatarUrl?: string;
  updatedAt: string;
}

export interface BloodRequest extends GeoLocationRef {
  id: string;
  seekerId: string;
  seekerName: string;
  patientName: string;
  bloodGroup: BloodGroup;
  bagsNeeded: number;
  urgency: UrgencyLevel;
  hospitalName?: string;
  contactPhone: string;
  phoneVerified: boolean;
  notes?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BloodMatch {
  id: string;
  requestId: string;
  donorId: string;
  donorUserId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  donorPhone: string;
  donorLocationLabel: string;
  status: MatchStatus;
  distanceKm: number;
  donorNote?: string;
  respondedAt: string | null;
  createdAt: string;
}

export interface BloodBank extends GeoLocationRef {
  id: string;
  name: string;
  nameBn: string;
  address: string;
  phone: string;
  is24Hours: boolean;
  isVerified: boolean;
  availableGroups: BloodGroup[];
}

export interface ImpactStats {
  totalDonors: number;
  verifiedDonors: number;
  successfulMatches: number;
  livesImpacted: number;
  activeUnionsCovered: number;
}

export type NotificationChannel = 'email' | 'sms' | 'in_app';
export type NotificationDeliveryStatus = 'sent' | 'queued' | 'deferred_sms_gateway' | 'failed';

export interface NotificationLog {
  id: string;
  requestId: string;
  donorId: string;
  donorName: string;
  recipientEmail?: string;
  recipientPhone: string;
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
  subject: string;
  body: string;
  provider: string;
  createdAt: string;
}

export type ReportReason =
  | 'fake_profile'
  | 'payment_demand'
  | 'harassment'
  | 'unreachable'
  | 'other';

export interface UserReport {
  id: string;
  reporterUserId: string;
  reporterName: string;
  targetUserId: string;
  targetName: string;
  reason: ReportReason;
  details: string;
  blockUser: boolean;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface PartnershipInquiry {
  id: string;
  organizationName: string;
  organizationType: 'ngo' | 'hospital' | 'university' | 'corporate' | 'other';
  contactPerson: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

export type CustomPagePlacement = 'header' | 'footer' | 'both' | 'hidden';
export type CustomPageTemplate = 'article' | 'camp' | 'faq' | 'partner';

export interface CustomPageBlock {
  id: string;
  headingEn: string;
  headingBn: string;
  bodyEn: string;
  bodyBn: string;
  ctaLabelEn?: string;
  ctaLabelBn?: string;
  ctaRoute?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  subtitleEn: string;
  subtitleBn: string;
  template: CustomPageTemplate;
  placement: CustomPagePlacement;
  coverImageUrl?: string;
  blocks: CustomPageBlock[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmergencyNoticeSeverity = 'critical' | 'urgent' | 'info';

export interface EmergencyNotice {
  id: string;
  titleEn: string;
  titleBn: string;
  messageEn: string;
  messageBn: string;
  severity: EmergencyNoticeSeverity;
  targetBloodGroup?: BloodGroup | '';
  targetDivision?: string;
  ctaLabelEn?: string;
  ctaLabelBn?: string;
  ctaRoute?: string;
  isActive: boolean;
  createdAt: string;
}

export type AdPlacement = 'landing' | 'find_donors' | 'request_blood' | 'custom_pages';

export interface AdCampaign {
  id: string;
  sponsorName: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  ctaLabelEn: string;
  ctaLabelBn: string;
  targetRoute: string;
  imageUrl?: string;
  placement: AdPlacement;
  isActive: boolean;
  clicks: number;
  createdAt: string;
}
