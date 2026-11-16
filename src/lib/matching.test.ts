import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  checkDonationEligibility,
  getCompatibleRecipientGroups,
  getMatchReasons,
  isBloodCompatible,
  matchDonorsForRequest,
  matchRequestsForDonor,
  selectAutoMatchCandidates,
} from './matching';
import type { BloodRequest, DonorProfile } from '../types/database';

const makeDonor = (overrides: Partial<DonorProfile>): DonorProfile => ({
  id: 'd1',
  userId: 'u1',
  fullName: 'Test Donor',
  phone: '+8801711000001',
  phoneVerified: true,
  bloodGroup: 'O+',
  division: 'Dhaka',
  district: 'Dhaka',
  upazila: 'Savar',
  unionName: 'Ashulia',
  latitude: 23.8975,
  longitude: 90.3239,
  isAvailable: true,
  lastDonationDate: null,
  totalDonations: 2,
  contactPreference: 'phone',
  isVerified: true,
  updatedAt: '2026-10-01T00:00:00.000Z',
  ...overrides,
});

test('ABO/Rh blood group compatibility rules are medically accurate', () => {
  assert.equal(isBloodCompatible('O-', 'AB+'), true);
  assert.equal(isBloodCompatible('O-', 'A-'), true);
  assert.equal(isBloodCompatible('A+', 'O+'), false);
  assert.equal(isBloodCompatible('AB+', 'A+'), false);
  assert.equal(isBloodCompatible('B-', 'B+'), true);
  assert.equal(isBloodCompatible('B+', 'B-'), false);
  assert.equal(getCompatibleRecipientGroups('O-').length, 8);
  assert.deepEqual(getCompatibleRecipientGroups('AB+'), ['AB+']);
});

test('Haversine distance calculates Savar to Dhanmondi accurately', () => {
  const km = calculateDistanceKm(23.8975, 90.3239, 23.7461, 90.3742);
  assert.ok(km > 15 && km < 20, `Expected ~17.6km, got ${km}`);
});

test('90-day (3-month) donation interval blocks recent donors and permits eligible donors', () => {
  const ref = new Date('2026-11-16T00:00:00.000Z');
  const recent = checkDonationEligibility('2026-10-15', ref);
  assert.equal(recent.eligible, false);
  assert.ok(recent.daysRemaining > 50);

  const eligible = checkDonationEligibility('2026-07-01', ref);
  assert.equal(eligible.eligible, true);
  assert.equal(eligible.daysRemaining, 0);

  const neverDonated = checkDonationEligibility(null, ref);
  assert.equal(neverDonated.eligible, true);
});

test('matchDonorsForRequest excludes unavailable and 90-day cooldown donors and prioritizes exact match & same union', () => {
  const ref = new Date('2026-11-16T00:00:00.000Z');
  const donors: DonorProfile[] = [
    makeDonor({
      id: 'd-unavailable',
      bloodGroup: 'A+',
      isAvailable: false,
    }),
    makeDonor({
      id: 'd-cooldown',
      bloodGroup: 'A+',
      lastDonationDate: '2026-10-20',
    }),
    makeDonor({
      id: 'd-o-neg-far',
      bloodGroup: 'O-',
      upazila: 'Dhanmondi',
      unionName: 'Ward 15 (Dhanmondi)',
      latitude: 23.7461,
      longitude: 90.3742,
    }),
    makeDonor({
      id: 'd-a-pos-same-union',
      bloodGroup: 'A+',
      lastDonationDate: '2026-06-01',
    }),
  ];

  const results = matchDonorsForRequest(
    {
      bloodGroup: 'A+',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      unionName: 'Ashulia',
      latitude: 23.8975,
      longitude: 90.3239,
      urgency: 'critical',
    },
    donors,
    { referenceDate: ref }
  );

  assert.equal(results.length, 2);
  assert.equal(results[0].donor.id, 'd-a-pos-same-union');
  assert.equal(results[1].donor.id, 'd-o-neg-far');
});

test('matchRequestsForDonor prioritizes critical compatible requests nearby', () => {
  const donor = makeDonor({ bloodGroup: 'O-' });
  const requests: BloodRequest[] = [
    {
      id: 'r-normal',
      seekerId: 's1',
      seekerName: 'Karim',
      patientName: 'Patient A',
      bloodGroup: 'A+',
      bagsNeeded: 1,
      urgency: 'normal',
      contactPhone: '+8801711111111',
      phoneVerified: true,
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      unionName: 'Ashulia',
      latitude: 23.8975,
      longitude: 90.3239,
      status: 'open',
      createdAt: '2026-11-16T00:00:00.000Z',
      updatedAt: '2026-11-16T00:00:00.000Z',
    },
    {
      id: 'r-critical',
      seekerId: 's2',
      seekerName: 'Rahim',
      patientName: 'Patient B',
      bloodGroup: 'AB+',
      bagsNeeded: 2,
      urgency: 'critical',
      contactPhone: '+8801722222222',
      phoneVerified: true,
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      unionName: 'Birulia',
      latitude: 23.8479,
      longitude: 90.3081,
      status: 'open',
      createdAt: '2026-11-16T00:00:00.000Z',
      updatedAt: '2026-11-16T00:00:00.000Z',
    },
  ];

  const matched = matchRequestsForDonor(donor, requests);
  assert.equal(matched.length, 2);
  assert.equal(matched[0].request.id, 'r-critical');
});

test('selectAutoMatchCandidates skips already dispatched donors and enforces radius & limit', () => {
  const ref = new Date('2026-11-16T00:00:00.000Z');
  const req: BloodRequest = {
    id: 'req-auto',
    seekerId: 's1',
    seekerName: 'Nusrat',
    patientName: 'Abdul',
    bloodGroup: 'A+',
    bagsNeeded: 2,
    urgency: 'critical',
    contactPhone: '+8801711111111',
    phoneVerified: true,
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Ashulia',
    latitude: 23.8975,
    longitude: 90.3239,
    status: 'open',
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
  };

  const donors: DonorProfile[] = [
    makeDonor({ id: 'd-already', bloodGroup: 'A+' }),
    makeDonor({ id: 'd-savar-1', bloodGroup: 'A+', upazila: 'Savar', unionName: 'Birulia', latitude: 23.8479, longitude: 90.3081 }),
    makeDonor({ id: 'd-dhanmondi', bloodGroup: 'O-', upazila: 'Dhanmondi', unionName: 'Ward 15 (Dhanmondi)', latitude: 23.7461, longitude: 90.3742 }),
    makeDonor({ id: 'd-far-ctg', bloodGroup: 'A+', division: 'Chattogram', district: 'Chattogram', upazila: 'Panchlaish', unionName: 'Ward 08 (Sholashahar)', latitude: 22.3646, longitude: 91.8257 }),
  ];

  const picked = selectAutoMatchCandidates(
    req,
    donors,
    [{ requestId: 'req-auto', donorId: 'd-already' }],
    { limit: 2, maxDistanceKm: 30, referenceDate: ref }
  );

  assert.equal(picked.length, 2);
  assert.equal(picked[0].donor.id, 'd-savar-1');
  assert.equal(picked[1].donor.id, 'd-dhanmondi');

  const reasons = getMatchReasons(picked[0], 'en');
  assert.ok(reasons.includes('Exact group'));
  assert.ok(reasons.includes('Same Upazila'));
});

