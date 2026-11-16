import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adCampaignSchema,
  authStepOneSchema,
  bloodRequestSchema,
  customPageSchema,
  donorProfileSchema,
  donorRegistrationSchema,
  emergencyNoticeSchema,
  otpVerifySchema,
  partnershipInquirySchema,
  slugifyText,
  userReportSchema,
} from './validations';

test('bloodRequestSchema rejects missing fields and invalid Bangladesh phone numbers', () => {
  const invalid = bloodRequestSchema.safeParse({
    patientName: '',
    bloodGroup: 'A+',
    bagsNeeded: 0,
    urgency: 'critical',
    contactPhone: '12345',
    division: '',
    district: '',
    upazila: '',
    unionName: '',
  });
  assert.equal(invalid.success, false);

  const valid = bloodRequestSchema.safeParse({
    patientName: 'Sadia Rahman',
    bloodGroup: 'B+',
    bagsNeeded: 2,
    urgency: 'urgent',
    hospitalName: 'Dhaka Medical College Hospital',
    contactPhone: '+8801712345678',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    notes: 'Needed before 6 PM surgery',
  });
  assert.equal(valid.success, true);
});

test('donorProfileSchema validates Bangladeshi phone numbers and hierarchy', () => {
  const result = donorProfileSchema.safeParse({
    fullName: 'Tanvir Ahmed',
    phone: '01812345678',
    bloodGroup: 'O-',
    division: 'Chattogram',
    district: 'Chattogram',
    upazila: 'Panchlaish',
    unionName: 'Ward 08 (Sholashahar)',
    isAvailable: true,
    lastDonationDate: '2026-06-01',
    contactPreference: 'whatsapp',
  });
  assert.equal(result.success, true);
});

test('donorRegistrationSchema enforces medical consent, BD phone, and Union hierarchy', () => {
  const missingConsent = donorRegistrationSchema.safeParse({
    fullName: 'Nafisa Tabassum',
    phone: '+8801711889900',
    email: '',
    bloodGroup: 'AB-',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    isAvailable: true,
    lastDonationDate: null,
    contactPreference: 'phone',
    medicalConsent: false,
  });
  assert.equal(missingConsent.success, false);

  const valid = donorRegistrationSchema.safeParse({
    fullName: 'Nafisa Tabassum',
    phone: '+8801711889900',
    email: 'nafisa@example.com',
    bloodGroup: 'AB-',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    isAvailable: true,
    lastDonationDate: '2026-06-01',
    contactPreference: 'whatsapp',
    medicalConsent: true,
  });
  assert.equal(valid.success, true);
});

test('authStepOneSchema and otpVerifySchema validate email/phone and 6-digit OTP', () => {
  assert.equal(
    authStepOneSchema.safeParse({ identifier: 'donor@roktodaan.org', role: 'donor' }).success,
    true
  );
  assert.equal(
    authStepOneSchema.safeParse({ identifier: '+8801911223344', role: 'seeker' }).success,
    true
  );
  assert.equal(otpVerifySchema.safeParse({ otp: '123456' }).success, true);
  assert.equal(otpVerifySchema.safeParse({ otp: '12ab' }).success, false);
});

test('CMS schemas validate custom pages, emergency notices, ads, and slugs', () => {
  assert.equal(slugifyText('Dhaka Winter Camp 2026!'), 'dhaka-winter-camp-2026');

  assert.equal(
    customPageSchema.safeParse({
      slug: 'invalid slug!',
      titleEn: 'Camp',
      titleBn: 'ক্যাম্প',
      subtitleEn: 'Summary text',
      subtitleBn: 'সংক্ষিপ্ত বিবরণ',
      template: 'camp',
      placement: 'both',
      isPublished: true,
    }).success,
    false
  );

  assert.equal(
    customPageSchema.safeParse({
      slug: 'winter-camp-2026',
      titleEn: 'Winter Camp 2026',
      titleBn: 'শীতকালীন ক্যাম্প ২০২৬',
      subtitleEn: 'Nationwide voluntary camp schedule',
      subtitleBn: 'সারা দেশের স্বেচ্ছাসেবী রক্তদান ক্যাম্প',
      template: 'camp',
      placement: 'both',
      isPublished: true,
    }).success,
    true
  );

  assert.equal(
    emergencyNoticeSchema.safeParse({
      titleEn: 'Urgent O- Shortage',
      titleBn: 'জরুরি O- রক্তের সংকট',
      messageEn: 'Savar and DMCH ICU units need O- donors today.',
      messageBn: 'সাভার ও ঢাকা মেডিকেলে আজ O- দাতা প্রয়োজন।',
      severity: 'critical',
      targetBloodGroup: 'O-',
      isActive: true,
    }).success,
    true
  );

  assert.equal(
    adCampaignSchema.safeParse({
      sponsorName: 'Red Crescent',
      titleEn: 'Mobile Blood Drive',
      titleBn: 'ভ্রাম্যমাণ রক্তদান',
      descriptionEn: 'Join our weekend donor collection camp in Dhanmondi.',
      descriptionBn: 'ধানমন্ডিতে আমাদের সাপ্তাহিক রক্তদান ক্যাম্পে যোগ দিন।',
      ctaLabelEn: 'Register Now',
      ctaLabelBn: 'নিবন্ধন করুন',
      targetRoute: '/register-donor',
      placement: 'landing',
      isActive: true,
    }).success,
    true
  );
});

test('userReportSchema and partnershipInquirySchema validate safety & partner inputs', () => {
  assert.equal(
    userReportSchema.safeParse({
      reason: 'payment_demand',
      details: 'Asked for BDT 1500 before arriving at the hospital.',
      blockUser: true,
    }).success,
    true
  );

  assert.equal(
    userReportSchema.safeParse({
      reason: 'other',
      details: 'too',
      blockUser: false,
    }).success,
    false
  );

  assert.equal(
    partnershipInquirySchema.safeParse({
      organizationName: 'Bangladesh Red Crescent Society',
      organizationType: 'ngo',
      contactPerson: 'Coordinator Tariq',
      email: 'tariq@bdrcs.org',
      phone: '+8801711000001',
      message: 'District blood bank coordination and donor verification campaign.',
    }).success,
    true
  );
});


