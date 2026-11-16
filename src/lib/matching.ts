import type { BloodGroup, BloodRequest, DonorProfile, UrgencyLevel } from '../types/database';

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * Red blood cell compatibility:
 * Key = Recipient blood group -> Value = Array of compatible donor blood groups
 */
export const COMPATIBLE_DONOR_GROUPS: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

export const DONATION_COOLDOWN_DAYS = 90;

export function isBloodCompatible(donorGroup: BloodGroup, recipientGroup: BloodGroup): boolean {
  return COMPATIBLE_DONOR_GROUPS[recipientGroup].includes(donorGroup);
}

export function getCompatibleRecipientGroups(donorGroup: BloodGroup): BloodGroup[] {
  return BLOOD_GROUPS.filter((recipient) => isBloodCompatible(donorGroup, recipient));
}

/**
 * Haversine formula returning distance in kilometers between two GPS coordinates.
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export interface DonationEligibilityResult {
  eligible: boolean;
  daysSinceLastDonation: number | null;
  daysRemaining: number;
  nextEligibleDate: string | null;
}

/**
 * Checks the Bangladesh / WHO 3-month (90-day) minimum interval rule between whole-blood donations.
 */
export function checkDonationEligibility(
  lastDonationDate: string | null,
  referenceDate: Date = new Date()
): DonationEligibilityResult {
  if (!lastDonationDate) {
    return {
      eligible: true,
      daysSinceLastDonation: null,
      daysRemaining: 0,
      nextEligibleDate: null,
    };
  }

  const last = new Date(lastDonationDate);
  if (Number.isNaN(last.getTime())) {
    return {
      eligible: true,
      daysSinceLastDonation: null,
      daysRemaining: 0,
      nextEligibleDate: null,
    };
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysSince = Math.floor((referenceDate.getTime() - last.getTime()) / msPerDay);

  if (daysSince >= DONATION_COOLDOWN_DAYS) {
    return {
      eligible: true,
      daysSinceLastDonation: daysSince,
      daysRemaining: 0,
      nextEligibleDate: null,
    };
  }

  const daysRemaining = Math.max(1, DONATION_COOLDOWN_DAYS - daysSince);
  const nextDate = new Date(last.getTime() + DONATION_COOLDOWN_DAYS * msPerDay);

  return {
    eligible: false,
    daysSinceLastDonation: daysSince,
    daysRemaining,
    nextEligibleDate: nextDate.toISOString().split('T')[0],
  };
}

export interface MatchedDonor {
  donor: DonorProfile;
  distanceKm: number;
  exactBloodMatch: boolean;
  sameUnion: boolean;
  sameUpazila: boolean;
  sameDistrict: boolean;
  eligibility: DonationEligibilityResult;
  matchScore: number;
}

const URGENCY_WEIGHT: Record<UrgencyLevel, number> = {
  critical: 1.5,
  urgent: 1.2,
  normal: 1.0,
};

/**
 * Smart Matching Engine:
 * Filters donors by ABO/Rh compatibility, availability, and 90-day cooldown rule,
 * then ranks by exact blood group priority, administrative hierarchy proximity,
 * verified status, and Haversine distance weighted by urgency.
 */
export function matchDonorsForRequest(
  request: Pick<
    BloodRequest,
    'bloodGroup' | 'division' | 'district' | 'upazila' | 'unionName' | 'latitude' | 'longitude' | 'urgency'
  >,
  donors: DonorProfile[],
  options: { includeUnavailable?: boolean; includeCooldown?: boolean; referenceDate?: Date } = {}
): MatchedDonor[] {
  const { includeUnavailable = false, includeCooldown = false, referenceDate = new Date() } = options;

  const urgencyFactor = URGENCY_WEIGHT[request.urgency];

  return donors
    .filter((donor) => isBloodCompatible(donor.bloodGroup, request.bloodGroup))
    .map((donor) => {
      const distanceKm = calculateDistanceKm(
        request.latitude,
        request.longitude,
        donor.latitude,
        donor.longitude
      );
      const eligibility = checkDonationEligibility(donor.lastDonationDate, referenceDate);
      const exactBloodMatch = donor.bloodGroup === request.bloodGroup;
      const sameUnion =
        donor.unionName === request.unionName && donor.upazila === request.upazila;
      const sameUpazila = donor.upazila === request.upazila && donor.district === request.district;
      const sameDistrict = donor.district === request.district;

      // Higher score = better match
      let score = 100;
      if (exactBloodMatch) score += 25;
      if (sameUnion) score += 35;
      else if (sameUpazila) score += 20;
      else if (sameDistrict) score += 10;
      if (donor.isVerified) score += 15;
      if (donor.isAvailable && eligibility.eligible) score += 30;
      score -= Math.min(80, distanceKm * 0.6 * urgencyFactor);

      return {
        donor,
        distanceKm,
        exactBloodMatch,
        sameUnion,
        sameUpazila,
        sameDistrict,
        eligibility,
        matchScore: Math.round(score * 10) / 10,
      };
    })
    .filter((entry) => {
      if (!includeUnavailable && !entry.donor.isAvailable) return false;
      if (!includeCooldown && !entry.eligibility.eligible) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.sameUnion !== b.sameUnion) return a.sameUnion ? -1 : 1;
      if (a.exactBloodMatch !== b.exactBloodMatch) return a.exactBloodMatch ? -1 : 1;
      return a.distanceKm - b.distanceKm;
    });
}

export interface MatchedRequestForDonor {
  request: BloodRequest;
  distanceKm: number;
  exactBloodMatch: boolean;
  priorityScore: number;
}

/**
 * Matches open blood requests to a given donor based on blood compatibility,
 * request urgency, and proximity.
 */
export function matchRequestsForDonor(
  donor: DonorProfile,
  requests: BloodRequest[]
): MatchedRequestForDonor[] {
  return requests
    .filter((req) => req.status === 'open' || req.status === 'matched')
    .filter((req) => isBloodCompatible(donor.bloodGroup, req.bloodGroup))
    .map((request) => {
      const distanceKm = calculateDistanceKm(
        donor.latitude,
        donor.longitude,
        request.latitude,
        request.longitude
      );
      const exactBloodMatch = donor.bloodGroup === request.bloodGroup;
      const urgencyBonus =
        request.urgency === 'critical' ? 60 : request.urgency === 'urgent' ? 30 : 10;
      const priorityScore = Math.round((urgencyBonus - Math.min(50, distanceKm * 0.4)) * 10) / 10;

      return {
        request,
        distanceKm,
        exactBloodMatch,
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore || a.distanceKm - b.distanceKm);
}

/**
 * Selects top N eligible, compatible donors for a blood request who have not already been
 * dispatched a match alert for that request, optionally bounded by a maximum radius in km.
 */
export function selectAutoMatchCandidates(
  request: BloodRequest,
  donors: DonorProfile[],
  existingMatches: { requestId: string; donorId: string }[],
  options: { limit?: number; maxDistanceKm?: number; referenceDate?: Date } = {}
): MatchedDonor[] {
  const { limit = 3, maxDistanceKm, referenceDate } = options;
  const alreadyDispatched = new Set(
    existingMatches.filter((m) => m.requestId === request.id).map((m) => m.donorId)
  );

  const ranked = matchDonorsForRequest(request, donors, {
    includeUnavailable: false,
    includeCooldown: false,
    referenceDate,
  }).filter((candidate) => {
    if (alreadyDispatched.has(candidate.donor.id)) return false;
    if (typeof maxDistanceKm === 'number' && candidate.distanceKm > maxDistanceKm) return false;
    return true;
  });

  return ranked.slice(0, Math.max(0, limit));
}

export function getMatchReasons(match: MatchedDonor, language: 'en' | 'bn' = 'en'): string[] {
  const reasons: string[] = [];
  if (match.exactBloodMatch) {
    reasons.push(language === 'bn' ? 'অভিন্ন গ্রুপ' : 'Exact group');
  } else {
    reasons.push(language === 'bn' ? 'সামঞ্জস্যপূর্ণ ABO/Rh' : 'Compatible ABO/Rh');
  }
  if (match.sameUnion) {
    reasons.push(language === 'bn' ? 'একই ইউনিয়ন' : 'Same Union');
  } else if (match.sameUpazila) {
    reasons.push(language === 'bn' ? 'একই উপজেলা' : 'Same Upazila');
  } else if (match.sameDistrict) {
    reasons.push(language === 'bn' ? 'একই জেলা' : 'Same District');
  }
  if (match.donor.isVerified) {
    reasons.push(language === 'bn' ? 'যাচাইকৃত' : 'Verified');
  }
  return reasons;
}

