import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AdCampaign,
  AppUser,
  BloodBank,
  BloodGroup,
  BloodMatch,
  BloodRequest,
  CustomPage,
  DonorProfile,
  EmergencyNotice,
  ImpactStats,
  Language,
  MatchStatus,
  NotificationLog,
  PartnershipInquiry,
  ReportReason,
  RequestStatus,
  UserReport,
  UserRole,
} from '../types/database';
import { findUnionCoordinates } from '../lib/bangladesh-locations';
import { checkDonationEligibility, selectAutoMatchCandidates } from '../lib/matching';
import { createRequestNotifications } from '../lib/notifications';

export type AppRoute =
  | '/'
  | '/find-donors'
  | '/request-blood'
  | '/register-donor'
  | '/matching'
  | '/auth'
  | '/dashboard/donor'
  | '/dashboard/seeker'
  | '/profile'
  | '/admin'
  | '/about'
  | '/how-it-works'
  | '/safety'
  | '/stories'
  | '/contact'
  | '/legal/privacy'
  | '/legal/terms'
  | `/p/${string}`;

const SEED_USERS: AppUser[] = [
  {
    id: 'user-donor-1',
    fullName: 'Ariful Islam',
    email: 'arif.donor@roktodaan.org',
    phone: '+8801711245890',
    phoneVerified: true,
    role: 'donor',
    preferredLanguage: 'en',
    isActive: true,
    createdAt: '2026-01-12T08:30:00.000Z',
  },
  {
    id: 'user-seeker-1',
    fullName: 'Nusrat Jahan',
    email: 'nusrat.seeker@roktodaan.org',
    phone: '+8801819334455',
    phoneVerified: true,
    role: 'seeker',
    preferredLanguage: 'en',
    isActive: true,
    createdAt: '2026-03-04T11:15:00.000Z',
  },
  {
    id: 'user-hospital-1',
    fullName: 'Dhaka Red Crescent Blood Center',
    email: 'bloodbank@bdrcs-demo.org',
    phone: '+8801911887766',
    phoneVerified: true,
    role: 'hospital',
    preferredLanguage: 'en',
    isActive: true,
    createdAt: '2025-11-20T06:00:00.000Z',
  },
  {
    id: 'user-admin-1',
    fullName: 'Dr. Mahmudul Hasan',
    email: 'admin@roktodaan.org',
    phone: '+8801715000001',
    phoneVerified: true,
    role: 'admin',
    preferredLanguage: 'en',
    isActive: true,
    createdAt: '2025-10-01T00:00:00.000Z',
  },
];

const RAW_SEED_DONORS: Omit<DonorProfile, 'phoneVerified'>[] = [
  {
    id: 'donor-1',
    userId: 'user-donor-1',
    fullName: 'Ariful Islam',
    phone: '+8801711245890',
    bloodGroup: 'O+',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Ashulia',
    latitude: 23.8975,
    longitude: 90.3239,
    isAvailable: true,
    lastDonationDate: '2026-06-14',
    totalDonations: 7,
    contactPreference: 'phone',
    isVerified: true,
    updatedAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'donor-2',
    userId: 'user-donor-2',
    fullName: 'Farhana Yasmin',
    phone: '+8801812456789',
    bloodGroup: 'A+',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    latitude: 23.7461,
    longitude: 90.3742,
    isAvailable: true,
    lastDonationDate: '2026-05-20',
    totalDonations: 4,
    contactPreference: 'whatsapp',
    isVerified: true,
    updatedAt: '2026-11-11T10:15:00.000Z',
  },
  {
    id: 'donor-3',
    userId: 'user-donor-3',
    fullName: 'Tanvir Hossain',
    phone: '+8801913567890',
    bloodGroup: 'O-',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Birulia',
    latitude: 23.8479,
    longitude: 90.3081,
    isAvailable: true,
    lastDonationDate: null,
    totalDonations: 3,
    contactPreference: 'phone',
    isVerified: true,
    updatedAt: '2026-11-12T12:00:00.000Z',
  },
  {
    id: 'donor-4',
    userId: 'user-donor-4',
    fullName: 'Mehedi Hasan',
    phone: '+8801614678901',
    bloodGroup: 'B+',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila: 'Panchlaish',
    unionName: 'Ward 08 (Sholashahar)',
    latitude: 22.3646,
    longitude: 91.8257,
    isAvailable: true,
    lastDonationDate: '2026-07-02',
    totalDonations: 9,
    contactPreference: 'phone',
    isVerified: true,
    updatedAt: '2026-11-13T08:00:00.000Z',
  },
  {
    id: 'donor-5',
    userId: 'user-donor-5',
    fullName: 'Sadia Afrin',
    phone: '+8801715789012',
    bloodGroup: 'AB+',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    unionName: 'Akhalia (SUST)',
    latitude: 24.9172,
    longitude: 91.8319,
    isAvailable: true,
    lastDonationDate: '2026-09-25', // Inside 90-day cooldown window relative to 2026-11-16
    totalDonations: 2,
    contactPreference: 'sms',
    isVerified: false,
    updatedAt: '2026-11-01T14:20:00.000Z',
  },
  {
    id: 'donor-6',
    userId: 'user-donor-6',
    fullName: 'Rashedul Karim',
    phone: '+8801716890123',
    bloodGroup: 'A-',
    division: 'Rajshahi',
    district: 'Rajshahi',
    upazila: 'Boalia',
    unionName: 'Motihar (RU Campus)',
    latitude: 24.3702,
    longitude: 88.6368,
    isAvailable: true,
    lastDonationDate: '2026-04-11',
    totalDonations: 11,
    contactPreference: 'phone',
    isVerified: true,
    updatedAt: '2026-11-14T16:40:00.000Z',
  },
  {
    id: 'donor-7',
    userId: 'user-donor-7',
    fullName: 'Tasnim Sultana',
    phone: '+8801817901234',
    bloodGroup: 'B-',
    division: 'Khulna',
    district: 'Khulna',
    upazila: 'Sonadanga',
    unionName: 'Gollamari (KU)',
    latitude: 22.8022,
    longitude: 89.5339,
    isAvailable: true,
    lastDonationDate: '2026-06-30',
    totalDonations: 5,
    contactPreference: 'whatsapp',
    isVerified: true,
    updatedAt: '2026-11-15T07:10:00.000Z',
  },
  {
    id: 'donor-8',
    userId: 'user-donor-8',
    fullName: 'Kamrul Islam',
    phone: '+8801918012345',
    bloodGroup: 'O+',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Mirpur',
    unionName: 'Ward 10 (Mirpur 10)',
    latitude: 23.8069,
    longitude: 90.3687,
    isAvailable: true,
    lastDonationDate: '2026-03-19',
    totalDonations: 6,
    contactPreference: 'phone',
    isVerified: true,
    updatedAt: '2026-11-15T11:30:00.000Z',
  },
  {
    id: 'donor-9',
    userId: 'user-donor-9',
    fullName: 'Nayeem Chowdhury',
    phone: '+8801719123456',
    bloodGroup: 'AB-',
    division: 'Rangpur',
    district: 'Rangpur',
    upazila: 'Rangpur Sadar',
    unionName: 'Lalbag (Begum Rokeya Univ)',
    latitude: 25.7166,
    longitude: 89.2612,
    isAvailable: true,
    lastDonationDate: '2026-05-05',
    totalDonations: 4,
    contactPreference: 'phone',
    isVerified: false,
    updatedAt: '2026-11-15T15:00:00.000Z',
  },
  {
    id: 'donor-10',
    userId: 'user-donor-10',
    fullName: 'Sumaiya Akter',
    phone: '+8801820234567',
    bloodGroup: 'A+',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Ashulia',
    latitude: 23.8992,
    longitude: 90.3261,
    isAvailable: true,
    lastDonationDate: '2026-06-02',
    totalDonations: 3,
    contactPreference: 'whatsapp',
    isVerified: true,
    updatedAt: '2026-11-15T18:20:00.000Z',
  },
];

const SEED_DONORS: DonorProfile[] = RAW_SEED_DONORS.map((d) => ({
  ...d,
  phoneVerified: true,
  email: `${d.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@donors.roktodaan.org`,
}));

const RAW_SEED_REQUESTS: Omit<BloodRequest, 'phoneVerified'>[] = [
  {
    id: 'req-101',
    seekerId: 'user-seeker-1',
    seekerName: 'Nusrat Jahan',
    patientName: 'Abdul Karim (ICU Bed 4)',
    bloodGroup: 'A+',
    bagsNeeded: 2,
    urgency: 'critical',
    hospitalName: 'Enam Medical College & Hospital, Savar',
    contactPhone: '+8801819334455',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Savar Pourashava',
    latitude: 23.8583,
    longitude: 90.2667,
    notes: 'Scheduled emergency cardiac surgery today at 4:00 PM. Cross-match lab is open.',
    status: 'open',
    createdAt: '2026-11-16T06:45:00.000Z',
    updatedAt: '2026-11-16T06:45:00.000Z',
  },
  {
    id: 'req-102',
    seekerId: 'user-seeker-2',
    seekerName: 'Mahfuzur Rahman',
    patientName: 'Rehana Begum',
    bloodGroup: 'O+',
    bagsNeeded: 1,
    urgency: 'urgent',
    hospitalName: 'Dhaka Medical College Hospital',
    contactPhone: '+8801712998877',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 16 (Kalabagan)',
    latitude: 23.7495,
    longitude: 90.3827,
    notes: 'Thalassemia transfusion support required before evening.',
    status: 'matched',
    createdAt: '2026-11-16T03:20:00.000Z',
    updatedAt: '2026-11-16T05:10:00.000Z',
  },
  {
    id: 'req-103',
    seekerId: 'user-seeker-3',
    seekerName: 'Faisal Ahmed',
    patientName: 'Mizanur Chowdhury',
    bloodGroup: 'B+',
    bagsNeeded: 2,
    urgency: 'normal',
    hospitalName: 'Chattogram Medical College Hospital',
    contactPhone: '+8801815667788',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila: 'Panchlaish',
    unionName: 'Ward 16 (Chawkbazar)',
    latitude: 22.3569,
    longitude: 91.8364,
    notes: 'Planned orthopedic procedure tomorrow morning.',
    status: 'open',
    createdAt: '2026-11-15T19:00:00.000Z',
    updatedAt: '2026-11-15T19:00:00.000Z',
  },
];

const SEED_REQUESTS: BloodRequest[] = RAW_SEED_REQUESTS.map((r) => ({
  ...r,
  phoneVerified: true,
}));

const SEED_MATCHES: BloodMatch[] = [
  {
    id: 'match-1',
    requestId: 'req-102',
    donorId: 'donor-1',
    donorUserId: 'user-donor-1',
    donorName: 'Ariful Islam',
    donorBloodGroup: 'O+',
    donorPhone: '+8801711245890',
    donorLocationLabel: 'Ashulia, Savar, Dhaka',
    status: 'accepted',
    distanceKm: 17.5,
    donorNote: 'On the way via Mirpur road, arriving in 45 minutes.',
    respondedAt: '2026-11-16T05:10:00.000Z',
    createdAt: '2026-11-16T04:55:00.000Z',
  },
];

const SEED_BANKS: BloodBank[] = [
  {
    id: 'bank-1',
    name: 'Bangladesh Red Crescent Blood Center (Mohammadpur)',
    nameBn: 'বাংলাদেশ রেড ক্রিসেন্ট রক্ত কেন্দ্র (মোহাম্মদপুর)',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    latitude: 23.7565,
    longitude: 90.3665,
    address: '7/5 Aurongzeb Road, Mohammadpur, Dhaka 1207',
    phone: '+880248112233',
    is24Hours: true,
    isVerified: true,
    availableGroups: ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'],
  },
  {
    id: 'bank-2',
    name: 'Sandhani Central Blood Bank (DMCH)',
    nameBn: 'সন্ধানী কেন্দ্রীয় ব্লাড ব্যাংক (ঢামেক)',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 16 (Kalabagan)',
    latitude: 23.7259,
    longitude: 90.3976,
    address: 'Dhaka Medical College Campus, Secretariat Rd, Dhaka 1000',
    phone: '+88029668690',
    is24Hours: true,
    isVerified: true,
    availableGroups: ['A+', 'B+', 'AB+', 'O+', 'O-'],
  },
  {
    id: 'bank-3',
    name: 'Chattogram Red Crescent Blood Transfusion Center',
    nameBn: 'চট্টগ্রাম রেড ক্রিসেন্ট রক্ত পরিসঞ্চালন কেন্দ্র',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila: 'Panchlaish',
    unionName: 'Ward 08 (Sholashahar)',
    latitude: 22.3591,
    longitude: 91.8305,
    address: '395 Andarkilla / Panchlaish Medical Link, Chattogram',
    phone: '+88031618824',
    is24Hours: true,
    isVerified: true,
    availableGroups: ['A+', 'B+', 'O+', 'AB+'],
  },
  {
    id: 'bank-4',
    name: 'Sylhet MAG Osmani Rotary Blood Wing',
    nameBn: 'সিলেট এমএজি ওসমানী রোটারি ব্লাড উইং',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    unionName: 'Akhalia (SUST)',
    latitude: 24.9001,
    longitude: 91.8533,
    address: 'Osmani Medical Road, Sylhet 3100',
    phone: '+880821713667',
    is24Hours: true,
    isVerified: true,
    availableGroups: ['A+', 'B+', 'O+', 'A-'],
  },
];

const SEED_CUSTOM_PAGES: CustomPage[] = [
  {
    id: 'page-thalassemia-care',
    slug: 'thalassemia-care',
    titleEn: 'Thalassemia Donor Support',
    titleBn: 'থ্যালাসেমিয়া রক্তদাতা সহায়তা',
    subtitleEn:
      'Monthly recurring blood coordination for pediatric thalassemia wards across Dhaka, Chattogram, and Sylhet.',
    subtitleBn:
      'ঢাকা, চট্টগ্রাম ও সিলেটের থ্যালাসেমিয়া শিশু ওয়ার্ডগুলোর জন্য নিয়মিত মাসিক রক্তদান সমন্বয়।',
    template: 'camp',
    placement: 'footer',
    coverImageUrl: '/src/assets/images/community_donor_drive_1794820532640.jpg',
    isPublished: true,
    createdAt: '2026-11-10T08:00:00.000Z',
    updatedAt: '2026-11-10T08:00:00.000Z',
    blocks: [
      {
        id: 'blk-1',
        headingEn: 'Why Regular Voluntary Donors Matter',
        headingBn: 'নিয়মিত স্বেচ্ছাসেবী রক্তদাতা কেন জরুরি',
        bodyEn:
          'Children living with beta-thalassemia require screened, compatible whole blood or packed red cells every 3–4 weeks. Roktodaan matches verified donors strictly outside their 90-day WHO recovery window.',
        bodyBn:
          'বিটা-থ্যালাসেমিয়ায় আক্রান্ত শিশুদের প্রতি ৩–৪ সপ্তাহে নিরাপদ ও স্ক্রিনকৃত রক্তের প্রয়োজন হয়। রক্তদান ৯০ দিনের ডব্লিউএইচও বিরতি মেনেই যোগ্য দাতাদের যুক্ত করে।',
        ctaLabelEn: 'Register as a Regular Donor',
        ctaLabelBn: 'নিয়মিত রক্তদাতা হিসেবে নিবন্ধন করুন',
        ctaRoute: '/register-donor',
      },
      {
        id: 'blk-2',
        headingEn: 'Partner Hospital Transfusion Desks',
        headingBn: 'সহযোগী হাসপাতাল ট্রান্সফিউশন ডেস্ক',
        bodyEn:
          'Coordinate directly with Bangladesh Red Crescent Society, Sandhani Central Blood Bank, and district general hospital blood centers.',
        bodyBn:
          'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি, সন্ধানী কেন্দ্রীয় ব্লাড ব্যাংক এবং জেলা সদর হাসপাতালের সাথে সরাসরি সমন্বয় করুন।',
        ctaLabelEn: 'Find Compatible Donors',
        ctaLabelBn: 'রক্তদাতা খুঁজুন',
        ctaRoute: '/find-donors',
      },
    ],
  },
];

const SEED_NOTICES: EmergencyNotice[] = [
  {
    id: 'notice-1',
    titleEn: 'Urgent A+ & O- Support Needed in Savar & Dhaka Medical ICU',
    titleBn: 'সাভার ও ঢাকা মেডিকেল আইসিইউ-তে জরুরি A+ ও O- রক্ত প্রয়োজন',
    messageEn:
      'Eligible donors in Savar, Dhanmondi, and Mirpur who cleared the 90-day interval can respond immediately.',
    messageBn:
      'সাভার, ধানমন্ডি ও মিরপুরের ৯০ দিনের বিরতি পূর্ণ করা যোগ্য দাতারা অনুগ্রহ করে দ্রুত সাড়া দিন।',
    severity: 'critical',
    targetBloodGroup: 'O-',
    targetDivision: 'Dhaka',
    ctaLabelEn: 'View Active Requests',
    ctaLabelBn: 'সক্রিয় অনুরোধ দেখুন',
    ctaRoute: '/dashboard/donor',
    isActive: true,
    createdAt: '2026-11-16T01:00:00.000Z',
  },
];

const SEED_ADS: AdCampaign[] = [
  {
    id: 'ad-1',
    sponsorName: 'Bangladesh Red Crescent Youth Wing',
    titleEn: 'Safe Cold-Chain Blood Screening & Donor Verification Drive',
    titleBn: 'নিরাপদ কোল্ড-চেইন রক্ত পরীক্ষা ও দাতা যাচাইকরণ ক্যাম্পেইন',
    descriptionEn:
      'Free hemoglobin, blood group typing, and donor verification badges available at Red Crescent Dhaka & Chattogram centers.',
    descriptionBn:
      'রেড ক্রিসেন্ট ঢাকা ও চট্টগ্রাম কেন্দ্রে বিনামূল্যে হিমোগ্লোবিন পরীক্ষা, গ্রুপ নির্ণয় ও যাচাইকৃত দাতা ব্যাজ প্রদান করা হচ্ছে।',
    ctaLabelEn: 'Register as Verified Donor',
    ctaLabelBn: 'যাচাইকৃত দাতা হোন',
    targetRoute: '/register-donor',
    imageUrl: '/src/assets/images/medical_cold_chain_logistics_1794820531599.jpg',
    placement: 'landing',
    isActive: true,
    clicks: 42,
    createdAt: '2026-11-14T10:00:00.000Z',
  },
  {
    id: 'ad-2',
    sponsorName: 'Rotary Blood Coordination Bangladesh',
    titleEn: 'Campus & Union Volunteer Blood Camp Partnership',
    titleBn: 'ক্যাম্পাস ও ইউনিয়ন স্বেচ্ছাসেবী রক্তদান ক্যাম্প অংশীদারিত্ব',
    descriptionEn:
      'Organize a verified blood donation camp in your Union or university campus with instant Roktodaan donor onboarding.',
    descriptionBn:
      'আপনার ইউনিয়ন বা বিশ্ববিদ্যালয় ক্যাম্পাসে রক্তদান ক্যাম্প আয়োজন করে তাৎক্ষণিক দাতা নিবন্ধন যুক্ত করুন।',
    ctaLabelEn: 'Explore Humanitarian Partnerships',
    ctaLabelBn: 'অংশীদারিত্ব সম্পর্কে জানুন',
    targetRoute: '/about',
    imageUrl: '/src/assets/images/community_donor_drive_1794820532640.jpg',
    placement: 'find_donors',
    isActive: true,
    clicks: 19,
    createdAt: '2026-11-12T09:00:00.000Z',
  },
];

interface RoktodaanState {
  language: Language;
  currentRoute: AppRoute;
  currentUser: AppUser | null;
  users: AppUser[];
  donors: DonorProfile[];
  requests: BloodRequest[];
  matches: BloodMatch[];
  bloodBanks: BloodBank[];
  customPages: CustomPage[];
  emergencyNotices: EmergencyNotice[];
  adCampaigns: AdCampaign[];
  notificationLogs: NotificationLog[];
  userReports: UserReport[];
  blockedUserIds: string[];
  partnershipInquiries: PartnershipInquiry[];
  impactBaseline: ImpactStats;
  preselectedArea: {
    division?: string;
    district?: string;
    upazila?: string;
    unionName?: string;
    bloodGroup?: BloodGroup;
  } | null;

  setLanguage: (lang: Language) => void;
  navigate: (route: AppRoute) => void;
  setPreselectedArea: (area: RoktodaanState['preselectedArea']) => void;
  signInWithOtp: (payload: {
    identifier: string;
    fullName?: string;
    role: UserRole;
  }) => AppUser;
  switchDemoRole: (role: UserRole) => void;
  signOut: () => void;

  upsertDonorProfile: (
    userId: string,
    profile: Omit<
      DonorProfile,
      'id' | 'userId' | 'latitude' | 'longitude' | 'updatedAt' | 'totalDonations' | 'isVerified' | 'phoneVerified'
    > & {
      totalDonations?: number;
      isVerified?: boolean;
      phoneVerified?: boolean;
    }
  ) => DonorProfile;
  registerDonor: (payload: {
    fullName: string;
    phone: string;
    phoneVerified?: boolean;
    email?: string;
    bloodGroup: BloodGroup;
    division: string;
    district: string;
    upazila: string;
    unionName: string;
    isAvailable: boolean;
    lastDonationDate: string | null;
    contactPreference: DonorProfile['contactPreference'];
    avatarUrl?: string;
  }) => { user: AppUser; donor: DonorProfile };
  toggleDonorAvailability: (userId: string) => {
    ok: boolean;
    isAvailable: boolean;
    daysRemaining: number;
    nextEligibleDate: string | null;
  };
  verifyDonor: (donorId: string, verified: boolean) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  toggleUserActive: (userId: string) => void;

  createBloodRequest: (input: {
    patientName: string;
    bloodGroup: BloodGroup;
    bagsNeeded: number;
    urgency: BloodRequest['urgency'];
    hospitalName?: string;
    contactPhone: string;
    phoneVerified?: boolean;
    division: string;
    district: string;
    upazila: string;
    unionName: string;
    notes?: string;
  }) => BloodRequest;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;

  respondToRequest: (
    requestId: string,
    donor: DonorProfile,
    status: MatchStatus,
    distanceKm: number,
    donorNote?: string
  ) => void;
  dispatchMatchToDonor: (
    requestId: string,
    donor: DonorProfile,
    distanceKm: number,
    donorNote?: string
  ) => BloodMatch;
  autoMatchRequest: (
    requestId: string,
    options?: { limit?: number; maxDistanceKm?: number }
  ) => { matches: BloodMatch[]; notificationsSent: number };
  completeDonationMatch: (matchId: string) => void;

  addBloodBank: (bank: Omit<BloodBank, 'id' | 'latitude' | 'longitude' | 'isVerified'>) => void;
  toggleBloodBankVerification: (bankId: string) => void;

  saveCustomPage: (
    page: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => CustomPage;
  toggleCustomPagePublished: (pageId: string) => void;
  deleteCustomPage: (pageId: string) => void;

  saveEmergencyNotice: (
    notice: Omit<EmergencyNotice, 'id' | 'createdAt'> & { id?: string }
  ) => EmergencyNotice;
  toggleEmergencyNotice: (noticeId: string) => void;
  deleteEmergencyNotice: (noticeId: string) => void;

  saveAdCampaign: (
    ad: Omit<AdCampaign, 'id' | 'clicks' | 'createdAt'> & { id?: string }
  ) => AdCampaign;
  toggleAdCampaign: (adId: string) => void;
  deleteAdCampaign: (adId: string) => void;
  recordAdClick: (adId: string) => void;

  reportUser: (input: {
    targetUserId: string;
    targetName: string;
    reason: ReportReason;
    details: string;
    blockUser: boolean;
  }) => UserReport;
  unblockUser: (targetUserId: string) => void;
  resolveUserReport: (reportId: string) => void;
  submitPartnershipInquiry: (
    input: Omit<PartnershipInquiry, 'id' | 'createdAt'>
  ) => PartnershipInquiry;
}

const syncChannel =
  typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('roktodaan_realtime') : null;

export const useRoktodaanStore = create<RoktodaanState>()(
  persist(
    (set, get) => ({
      language: 'en',
      currentRoute: '/',
      currentUser: SEED_USERS[0],
      users: SEED_USERS,
      donors: SEED_DONORS,
      requests: SEED_REQUESTS,
      matches: SEED_MATCHES,
      bloodBanks: SEED_BANKS,
      customPages: SEED_CUSTOM_PAGES,
      emergencyNotices: SEED_NOTICES,
      adCampaigns: SEED_ADS,
      notificationLogs: [],
      userReports: [],
      blockedUserIds: [],
      partnershipInquiries: [],
      impactBaseline: {
        totalDonors: 14820,
        verifiedDonors: 9410,
        successfulMatches: 6340,
        livesImpacted: 18450,
        activeUnionsCovered: 2840,
      },
      preselectedArea: null,

      setLanguage: (language) => set({ language }),
      navigate: (currentRoute) => {
        set({ currentRoute });
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      setPreselectedArea: (preselectedArea) => set({ preselectedArea }),

      signInWithOtp: ({ identifier, fullName, role }) => {
        const isEmail = identifier.includes('@');
        const existing = get().users.find(
          (u) =>
            (isEmail && u.email.toLowerCase() === identifier.toLowerCase()) ||
            (!isEmail && u.phone === identifier)
        );
        if (existing) {
          const updated: AppUser = {
            ...existing,
            role,
            phoneVerified: !isEmail ? true : existing.phoneVerified,
          };
          set((s) => ({
            currentUser: updated,
            users: s.users.map((u) => (u.id === updated.id ? updated : u)),
          }));
          return updated;
        }

        const newUser: AppUser = {
          id: `user-${Date.now()}`,
          fullName: fullName?.trim() || (isEmail ? identifier.split('@')[0] : 'Roktodaan Member'),
          email: isEmail ? identifier : `${identifier.replace(/\D/g, '')}@roktodaan.org`,
          phone: isEmail ? '+8801700000000' : identifier,
          phoneVerified: !isEmail,
          role,
          preferredLanguage: get().language,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          currentUser: newUser,
          users: [newUser, ...s.users],
        }));
        return newUser;
      },

      switchDemoRole: (role) => {
        const found = get().users.find((u) => u.role === role);
        if (found) {
          set({ currentUser: found });
        }
      },

      signOut: () => set({ currentUser: null, currentRoute: '/' }),

      upsertDonorProfile: (userId, profile) => {
        const coords = findUnionCoordinates(
          profile.division,
          profile.district,
          profile.upazila,
          profile.unionName
        );
        const eligibility = checkDonationEligibility(profile.lastDonationDate || null);
        const enforcedAvailability = eligibility.eligible ? profile.isAvailable : false;
        const existing = get().donors.find((d) => d.userId === userId);
        const next: DonorProfile = existing
          ? {
              ...existing,
              ...profile,
              isAvailable: enforcedAvailability,
              phoneVerified: profile.phoneVerified ?? existing.phoneVerified ?? true,
              latitude: coords.lat,
              longitude: coords.lng,
              updatedAt: new Date().toISOString(),
            }
          : {
              id: `donor-${Date.now()}`,
              userId,
              ...profile,
              isAvailable: enforcedAvailability,
              phoneVerified: profile.phoneVerified ?? true,
              latitude: coords.lat,
              longitude: coords.lng,
              totalDonations: profile.totalDonations ?? 0,
              isVerified: profile.isVerified ?? false,
              updatedAt: new Date().toISOString(),
            };

        set((s) => ({
          donors: existing
            ? s.donors.map((d) => (d.userId === userId ? next : d))
            : [next, ...s.donors],
          users: s.users.map((u) =>
            u.id === userId ? { ...u, fullName: profile.fullName, phone: profile.phone } : u
          ),
          currentUser:
            s.currentUser?.id === userId
              ? { ...s.currentUser, fullName: profile.fullName, phone: profile.phone }
              : s.currentUser,
        }));
        syncChannel?.postMessage({ type: 'SYNC_DONORS' });
        return next;
      },

      registerDonor: (payload) => {
        const now = new Date().toISOString();
        const coords = findUnionCoordinates(
          payload.division,
          payload.district,
          payload.upazila,
          payload.unionName
        );
        const eligibility = checkDonationEligibility(payload.lastDonationDate || null);
        const enforcedAvailability = eligibility.eligible ? payload.isAvailable : false;
        const normalizedPhone = payload.phone.trim();
        const existingUser = get().users.find(
          (u) =>
            u.phone === normalizedPhone ||
            (payload.email && u.email.toLowerCase() === payload.email.toLowerCase())
        );

        const userId = existingUser?.id ?? `user-${Date.now()}`;
        const user: AppUser = existingUser
          ? {
              ...existingUser,
              fullName: payload.fullName.trim(),
              phone: normalizedPhone,
              phoneVerified: payload.phoneVerified ?? true,
              email: payload.email?.trim() || existingUser.email,
              avatarUrl: payload.avatarUrl || existingUser.avatarUrl,
            }
          : {
              id: userId,
              fullName: payload.fullName.trim(),
              email: payload.email?.trim() || `${normalizedPhone.replace(/\D/g, '')}@roktodaan.org`,
              phone: normalizedPhone,
              phoneVerified: payload.phoneVerified ?? true,
              role: 'donor',
              preferredLanguage: get().language,
              avatarUrl: payload.avatarUrl,
              isActive: true,
              createdAt: now,
            };

        const existingDonor = get().donors.find((d) => d.userId === userId);
        const donor: DonorProfile = existingDonor
          ? {
              ...existingDonor,
              fullName: user.fullName,
              phone: normalizedPhone,
              phoneVerified: payload.phoneVerified ?? true,
              email: user.email,
              bloodGroup: payload.bloodGroup,
              division: payload.division,
              district: payload.district,
              upazila: payload.upazila,
              unionName: payload.unionName,
              latitude: coords.lat,
              longitude: coords.lng,
              isAvailable: enforcedAvailability,
              lastDonationDate: payload.lastDonationDate,
              contactPreference: payload.contactPreference,
              avatarUrl: payload.avatarUrl || existingDonor.avatarUrl,
              updatedAt: now,
            }
          : {
              id: `donor-${Date.now()}`,
              userId,
              fullName: user.fullName,
              phone: normalizedPhone,
              phoneVerified: payload.phoneVerified ?? true,
              email: user.email,
              bloodGroup: payload.bloodGroup,
              division: payload.division,
              district: payload.district,
              upazila: payload.upazila,
              unionName: payload.unionName,
              latitude: coords.lat,
              longitude: coords.lng,
              isAvailable: enforcedAvailability,
              lastDonationDate: payload.lastDonationDate,
              totalDonations: 0,
              contactPreference: payload.contactPreference,
              isVerified: false,
              avatarUrl: payload.avatarUrl,
              updatedAt: now,
            };

        set((s) => ({
          currentUser: user,
          users: existingUser
            ? s.users.map((u) => (u.id === userId ? user : u))
            : [user, ...s.users],
          donors: existingDonor
            ? s.donors.map((d) => (d.userId === userId ? donor : d))
            : [donor, ...s.donors],
          impactBaseline: existingDonor
            ? s.impactBaseline
            : {
                ...s.impactBaseline,
                totalDonors: s.impactBaseline.totalDonors + 1,
              },
        }));

        syncChannel?.postMessage({ type: 'SYNC_DONORS' });
        return { user, donor };
      },

      toggleDonorAvailability: (userId) => {
        const donor = get().donors.find((d) => d.userId === userId);
        if (!donor) {
          return { ok: false, isAvailable: false, daysRemaining: 0, nextEligibleDate: null };
        }
        const eligibility = checkDonationEligibility(donor.lastDonationDate);
        const targetNext = !donor.isAvailable;

        // Enforce 90-day medical cooldown: donor cannot re-enable availability before 90 days pass
        if (targetNext && !eligibility.eligible) {
          return {
            ok: false,
            isAvailable: false,
            daysRemaining: eligibility.daysRemaining,
            nextEligibleDate: eligibility.nextEligibleDate,
          };
        }

        set((s) => ({
          donors: s.donors.map((d) =>
            d.userId === userId
              ? { ...d, isAvailable: targetNext, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
        return {
          ok: true,
          isAvailable: targetNext,
          daysRemaining: eligibility.daysRemaining,
          nextEligibleDate: eligibility.nextEligibleDate,
        };
      },

      verifyDonor: (donorId, verified) => {
        set((s) => ({
          donors: s.donors.map((d) =>
            d.id === donorId ? { ...d, isVerified: verified, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      updateUserRole: (userId, role) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)),
          currentUser:
            s.currentUser?.id === userId ? { ...s.currentUser, role } : s.currentUser,
        }));
      },

      toggleUserActive: (userId) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, isActive: !u.isActive } : u)),
        }));
      },

      createBloodRequest: (input) => {
        const user = get().currentUser;
        const coords = findUnionCoordinates(
          input.division,
          input.district,
          input.upazila,
          input.unionName
        );
        const now = new Date().toISOString();
        const newReq: BloodRequest = {
          id: `req-${Date.now()}`,
          seekerId: user?.id ?? 'guest-seeker',
          seekerName: user?.fullName ?? 'Emergency Seeker',
          patientName: input.patientName,
          bloodGroup: input.bloodGroup,
          bagsNeeded: input.bagsNeeded,
          urgency: input.urgency,
          hospitalName: input.hospitalName || undefined,
          contactPhone: input.contactPhone,
          phoneVerified: input.phoneVerified ?? true,
          division: input.division,
          district: input.district,
          upazila: input.upazila,
          unionName: input.unionName,
          latitude: coords.lat,
          longitude: coords.lng,
          notes: input.notes || undefined,
          status: 'open',
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          requests: [newReq, ...s.requests],
        }));
        syncChannel?.postMessage({ type: 'NEW_REQUEST', id: newReq.id });
        return newReq;
      },

      updateRequestStatus: (requestId, status) => {
        set((s) => ({
          requests: s.requests.map((r) =>
            r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r
          ),
          impactBaseline:
            status === 'fulfilled'
              ? {
                  ...s.impactBaseline,
                  successfulMatches: s.impactBaseline.successfulMatches + 1,
                  livesImpacted: s.impactBaseline.livesImpacted + 3,
                }
              : s.impactBaseline,
        }));
      },

      respondToRequest: (requestId, donor, status, distanceKm, donorNote) => {
        const existing = get().matches.find(
          (m) => m.requestId === requestId && m.donorId === donor.id
        );
        const now = new Date().toISOString();
        const nextMatch: BloodMatch = existing
          ? { ...existing, status, donorNote, respondedAt: now }
          : {
              id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              requestId,
              donorId: donor.id,
              donorUserId: donor.userId,
              donorName: donor.fullName,
              donorBloodGroup: donor.bloodGroup,
              donorPhone: donor.phone,
              donorLocationLabel: `${donor.unionName}, ${donor.upazila}, ${donor.district}`,
              status,
              distanceKm,
              donorNote,
              respondedAt: now,
              createdAt: now,
            };

        set((s) => ({
          matches: existing
            ? s.matches.map((m) => (m.id === existing.id ? nextMatch : m))
            : [nextMatch, ...s.matches],
          requests:
            status === 'accepted'
              ? s.requests.map((r) =>
                  r.id === requestId && r.status === 'open'
                    ? { ...r, status: 'matched', updatedAt: now }
                    : r
                )
              : s.requests,
        }));
      },

      dispatchMatchToDonor: (requestId, donor, distanceKm, donorNote) => {
        const existing = get().matches.find(
          (m) => m.requestId === requestId && m.donorId === donor.id
        );
        if (existing) {
          return existing;
        }
        const now = new Date().toISOString();
        const created: BloodMatch = {
          id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          requestId,
          donorId: donor.id,
          donorUserId: donor.userId,
          donorName: donor.fullName,
          donorBloodGroup: donor.bloodGroup,
          donorPhone: donor.phone,
          donorLocationLabel: `${donor.unionName}, ${donor.upazila}, ${donor.district}`,
          status: 'pending',
          distanceKm,
          donorNote: donorNote || 'Dispatched by smart matching coordinator',
          respondedAt: null,
          createdAt: now,
        };
        const req = get().requests.find((r) => r.id === requestId);
        const notifLogs = req
          ? createRequestNotifications(
              req,
              [{ donor, distanceKm, recipientEmail: donor.email }],
              get().language,
              now
            )
          : [];
        set((s) => ({
          matches: [created, ...s.matches],
          notificationLogs: [...notifLogs, ...s.notificationLogs],
        }));
        syncChannel?.postMessage({ type: 'MATCH_DISPATCHED', requestId, donorId: donor.id });
        return created;
      },

      autoMatchRequest: (requestId, options) => {
        const req = get().requests.find((r) => r.id === requestId);
        if (!req) return { matches: [], notificationsSent: 0 };
        const blockedSet = new Set(get().blockedUserIds);
        const eligiblePool = get().donors.filter((d) => !blockedSet.has(d.userId));
        const candidates = selectAutoMatchCandidates(
          req,
          eligiblePool,
          get().matches,
          options
        );
        const now = new Date().toISOString();
        const createdMatches: BloodMatch[] = candidates.map((entry, idx) => ({
          id: `match-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
          requestId: req.id,
          donorId: entry.donor.id,
          donorUserId: entry.donor.userId,
          donorName: entry.donor.fullName,
          donorBloodGroup: entry.donor.bloodGroup,
          donorPhone: entry.donor.phone,
          donorLocationLabel: `${entry.donor.unionName}, ${entry.donor.upazila}, ${entry.donor.district}`,
          status: 'pending',
          distanceKm: entry.distanceKm,
          donorNote: `Auto-matched (${entry.exactBloodMatch ? 'Exact' : 'Compatible'} · ${entry.distanceKm} km)`,
          respondedAt: null,
          createdAt: now,
        }));

        const usersMap = new Map(get().users.map((u) => [u.id, u.email]));
        const notifLogs = createRequestNotifications(
          req,
          candidates.map((c) => ({
            donor: c.donor,
            distanceKm: c.distanceKm,
            recipientEmail: usersMap.get(c.donor.userId) ?? c.donor.email,
          })),
          get().language,
          now
        );

        if (createdMatches.length > 0) {
          set((s) => ({
            matches: [...createdMatches, ...s.matches],
            notificationLogs: [...notifLogs, ...s.notificationLogs],
          }));
          syncChannel?.postMessage({ type: 'AUTO_MATCH', requestId });
        }
        return {
          matches: createdMatches,
          notificationsSent: notifLogs.filter((l) => l.channel === 'email').length,
        };
      },

      completeDonationMatch: (matchId) => {
        const match = get().matches.find((m) => m.id === matchId);
        if (!match || match.status === 'completed') return;
        const now = new Date().toISOString();
        const todayDate = now.split('T')[0];

        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, status: 'completed', respondedAt: now } : m
          ),
          donors: s.donors.map((d) =>
            d.id === match.donorId
              ? {
                  ...d,
                  isAvailable: false, // Automatically enforce 90-day cooldown unavailability
                  totalDonations: d.totalDonations + 1,
                  lastDonationDate: todayDate,
                  updatedAt: now,
                }
              : d
          ),
          requests: s.requests.map((r) =>
            r.id === match.requestId ? { ...r, status: 'fulfilled', updatedAt: now } : r
          ),
          impactBaseline: {
            ...s.impactBaseline,
            successfulMatches: s.impactBaseline.successfulMatches + 1,
            livesImpacted: s.impactBaseline.livesImpacted + 3,
          },
        }));
      },

      addBloodBank: (bank) => {
        const coords = findUnionCoordinates(
          bank.division,
          bank.district,
          bank.upazila,
          bank.unionName
        );
        const newBank: BloodBank = {
          ...bank,
          id: `bank-${Date.now()}`,
          latitude: coords.lat,
          longitude: coords.lng,
          isVerified: true,
        };
        set((s) => ({ bloodBanks: [newBank, ...s.bloodBanks] }));
      },

      toggleBloodBankVerification: (bankId) => {
        set((s) => ({
          bloodBanks: s.bloodBanks.map((b) =>
            b.id === bankId ? { ...b, isVerified: !b.isVerified } : b
          ),
        }));
      },

      saveCustomPage: (pageInput) => {
        const now = new Date().toISOString();
        const existing = pageInput.id
          ? get().customPages.find((p) => p.id === pageInput.id)
          : get().customPages.find((p) => p.slug === pageInput.slug);

        const nextPage: CustomPage = existing
          ? {
              ...existing,
              ...pageInput,
              id: existing.id,
              updatedAt: now,
            }
          : {
              ...pageInput,
              id: `page-${Date.now()}`,
              createdAt: now,
              updatedAt: now,
            };

        set((s) => ({
          customPages: existing
            ? s.customPages.map((p) => (p.id === existing.id ? nextPage : p))
            : [nextPage, ...s.customPages],
        }));
        return nextPage;
      },

      toggleCustomPagePublished: (pageId) => {
        set((s) => ({
          customPages: s.customPages.map((p) =>
            p.id === pageId
              ? { ...p, isPublished: !p.isPublished, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteCustomPage: (pageId) => {
        set((s) => {
          const target = s.customPages.find((p) => p.id === pageId);
          const onDeletedPage = target && s.currentRoute === `/p/${target.slug}`;
          return {
            customPages: s.customPages.filter((p) => p.id !== pageId),
            currentRoute: onDeletedPage ? '/' : s.currentRoute,
          };
        });
      },

      saveEmergencyNotice: (noticeInput) => {
        const now = new Date().toISOString();
        const existing = noticeInput.id
          ? get().emergencyNotices.find((n) => n.id === noticeInput.id)
          : undefined;
        const nextNotice: EmergencyNotice = existing
          ? { ...existing, ...noticeInput, id: existing.id }
          : { ...noticeInput, id: `notice-${Date.now()}`, createdAt: now };

        set((s) => ({
          emergencyNotices: existing
            ? s.emergencyNotices.map((n) => (n.id === existing.id ? nextNotice : n))
            : [nextNotice, ...s.emergencyNotices],
        }));
        return nextNotice;
      },

      toggleEmergencyNotice: (noticeId) => {
        set((s) => ({
          emergencyNotices: s.emergencyNotices.map((n) =>
            n.id === noticeId ? { ...n, isActive: !n.isActive } : n
          ),
        }));
      },

      deleteEmergencyNotice: (noticeId) => {
        set((s) => ({
          emergencyNotices: s.emergencyNotices.filter((n) => n.id !== noticeId),
        }));
      },

      saveAdCampaign: (adInput) => {
        const now = new Date().toISOString();
        const existing = adInput.id
          ? get().adCampaigns.find((a) => a.id === adInput.id)
          : undefined;
        const nextAd: AdCampaign = existing
          ? { ...existing, ...adInput, id: existing.id }
          : { ...adInput, id: `ad-${Date.now()}`, clicks: 0, createdAt: now };

        set((s) => ({
          adCampaigns: existing
            ? s.adCampaigns.map((a) => (a.id === existing.id ? nextAd : a))
            : [nextAd, ...s.adCampaigns],
        }));
        return nextAd;
      },

      toggleAdCampaign: (adId) => {
        set((s) => ({
          adCampaigns: s.adCampaigns.map((a) =>
            a.id === adId ? { ...a, isActive: !a.isActive } : a
          ),
        }));
      },

      deleteAdCampaign: (adId) => {
        set((s) => ({
          adCampaigns: s.adCampaigns.filter((a) => a.id !== adId),
        }));
      },

      recordAdClick: (adId) => {
        set((s) => ({
          adCampaigns: s.adCampaigns.map((a) =>
            a.id === adId ? { ...a, clicks: a.clicks + 1 } : a
          ),
        }));
      },

      reportUser: (input) => {
        const current = get().currentUser;
        const report: UserReport = {
          id: `rep-${Date.now()}`,
          reporterUserId: current?.id ?? 'anonymous',
          reporterName: current?.fullName ?? 'Platform Visitor',
          targetUserId: input.targetUserId,
          targetName: input.targetName,
          reason: input.reason,
          details: input.details,
          blockUser: input.blockUser,
          status: 'open',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          userReports: [report, ...s.userReports],
          blockedUserIds:
            input.blockUser && !s.blockedUserIds.includes(input.targetUserId)
              ? [...s.blockedUserIds, input.targetUserId]
              : s.blockedUserIds,
        }));
        return report;
      },

      unblockUser: (targetUserId) => {
        set((s) => ({
          blockedUserIds: s.blockedUserIds.filter((id) => id !== targetUserId),
        }));
      },

      resolveUserReport: (reportId) => {
        set((s) => ({
          userReports: s.userReports.map((r) =>
            r.id === reportId ? { ...r, status: 'resolved' } : r
          ),
        }));
      },

      submitPartnershipInquiry: (input) => {
        const inquiry: PartnershipInquiry = {
          ...input,
          id: `inq-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          partnershipInquiries: [inquiry, ...s.partnershipInquiries],
        }));
        return inquiry;
      },
    }),
    {
      name: 'roktodaan-store-v1',
    }
  )
);

