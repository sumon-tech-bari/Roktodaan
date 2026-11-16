import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BANGLADESH_DIVISIONS,
  findUnionCoordinates,
  getAllDistrictsCount,
} from './bangladesh-locations';
import {
  BANGLADESH_SMS_ADAPTER,
  EMAIL_ADAPTER,
  createRequestNotifications,
} from './notifications';
import { escapeCsvCell, exportDonorsCsv, exportImpactReportCsv } from './reports';
import type { BloodRequest, DonorProfile, ImpactStats } from '../types/database';

test('Bangladesh hierarchy contains all 8 divisions and all 64 unique districts', () => {
  assert.equal(BANGLADESH_DIVISIONS.length, 8);
  assert.equal(getAllDistrictsCount(), 64);

  const allDistrictNames = BANGLADESH_DIVISIONS.flatMap((div) =>
    div.districts.map((dist) => `${div.nameEn}::${dist.nameEn}`)
  );
  assert.equal(new Set(allDistrictNames).size, 64);

  // Spot check districts across divisions resolve coordinates cleanly
  const bhola = findUnionCoordinates('Barishal', 'Bhola', 'Bhola Sadar', 'Bhola Pourashava');
  assert.ok(bhola.lat > 20 && bhola.lng > 88);
  const coxs = findUnionCoordinates('Chattogram', "Cox's Bazar", "Cox's Bazar Sadar", "Cox's Bazar Pourashava");
  assert.ok(coxs.lat > 20 && coxs.lng > 91);
});

test('Notification dispatcher creates email and deferred Bangladesh SMS gateway records', () => {
  const req: BloodRequest = {
    id: 'req-notify-1',
    seekerId: 'u-seeker',
    seekerName: 'Nusrat Jahan',
    patientName: 'Abdul Karim',
    bloodGroup: 'O-',
    bagsNeeded: 2,
    urgency: 'critical',
    hospitalName: 'Dhaka Medical College Hospital',
    contactPhone: '+8801819334455',
    phoneVerified: true,
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    unionName: 'Ward 15 (Dhanmondi)',
    latitude: 23.7461,
    longitude: 90.3742,
    status: 'open',
    createdAt: '2026-11-16T00:00:00.000Z',
    updatedAt: '2026-11-16T00:00:00.000Z',
  };

  const donor: DonorProfile = {
    id: 'donor-notify-1',
    userId: 'u-donor',
    fullName: 'Tanvir Hossain',
    phone: '+8801913567890',
    phoneVerified: true,
    email: 'tanvir@donors.roktodaan.org',
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
    updatedAt: '2026-11-16T00:00:00.000Z',
  };

  const logs = createRequestNotifications(req, [{ donor, distanceKm: 13.4 }], 'en');
  assert.equal(logs.length, 2);

  const emailLog = logs.find((l) => l.channel === 'email');
  const smsLog = logs.find((l) => l.channel === 'sms');
  assert.equal(EMAIL_ADAPTER.channel, 'email');
  assert.equal(BANGLADESH_SMS_ADAPTER.channel, 'sms');
  assert.equal(emailLog?.status, 'sent');
  assert.equal(emailLog?.recipientEmail, 'tanvir@donors.roktodaan.org');
  assert.equal(smsLog?.status, 'deferred_sms_gateway');
  assert.equal(smsLog?.recipientPhone, '+8801913567890');
  assert.ok(smsLog?.body.includes('ROKTODAAN'));
});

test('Report exporters format RFC4180 CSV cells and aggregate impact metrics', () => {
  assert.equal(escapeCsvCell('Savar, Dhaka'), '"Savar, Dhaka"');
  assert.equal(escapeCsvCell('Line "A"'), '"Line ""A"""');

  const impact: ImpactStats = {
    totalDonors: 100,
    verifiedDonors: 80,
    successfulMatches: 40,
    livesImpacted: 120,
    activeUnionsCovered: 500,
  };
  const csv = exportImpactReportCsv(impact, [], [], []);
  assert.ok(csv.includes('Total Registered Donors (Baseline + Live),100'));
  assert.ok(csv.includes('Estimated Lives Impacted,120'));

  const donorCsv = exportDonorsCsv([]);
  assert.ok(donorCsv.startsWith('Donor ID,Full Name,Blood Group'));
});
