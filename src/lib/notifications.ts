import type {
  BloodRequest,
  DonorProfile,
  Language,
  NotificationChannel,
  NotificationLog,
} from '../types/database';

export interface NotificationProviderAdapter {
  channel: NotificationChannel;
  providerName: string;
  isConfigured: () => boolean;
}

/**
 * Email delivery adapter (active via in-app mailer queue / ready for SMTP or Resend webhook).
 */
export const EMAIL_ADAPTER: NotificationProviderAdapter = {
  channel: 'email',
  providerName: 'roktodaan-email-dispatcher',
  isConfigured: () => true,
};

/**
 * Bangladesh SMS Gateway adapter placeholder.
 * Designed so SSL Wireless / BulkSMSBD / Twilio can be enabled via env credentials
 * without refactoring request creation or donor matching logic.
 */
export const BANGLADESH_SMS_ADAPTER: NotificationProviderAdapter = {
  channel: 'sms',
  providerName: 'bd-sms-gateway-adapter',
  isConfigured: () => false,
};

export function buildDonorAlertEmail(
  request: BloodRequest,
  donor: DonorProfile,
  distanceKm: number,
  language: Language = 'en'
): { subject: string; body: string } {
  const urgencyUpper = request.urgency.toUpperCase();
  if (language === 'bn') {
    return {
      subject: `[রক্তদান ${urgencyUpper}] ${request.unionName}, ${request.district}-এ ${request.bloodGroup} রক্ত প্রয়োজন`,
      body: `প্রিয় ${donor.fullName}, আপনার এলাকা থেকে ${distanceKm} কি.মি. দূরে (${request.hospitalName || request.unionName}) ${request.bloodGroup} গ্রুপের ${request.bagsNeeded} ব্যাগ রক্তের জরুরি প্রয়োজন। যোগাযোগ: ${request.contactPhone}`,
    };
  }
  return {
    subject: `[Roktodaan ${urgencyUpper}] ${request.bloodGroup} needed in ${request.unionName}, ${request.district}`,
    body: `Dear ${donor.fullName}, a patient ${distanceKm} km from your Union (${request.hospitalName || request.unionName}) urgently needs ${request.bagsNeeded} bag(s) of ${request.bloodGroup} blood. Attendant contact: ${request.contactPhone}.`,
  };
}

export function buildDonorAlertSms(
  request: BloodRequest,
  donor: DonorProfile,
  distanceKm: number
): string {
  const hospital = request.hospitalName ? ` @ ${request.hospitalName}` : '';
  return `ROKTODAAN ${request.urgency.toUpperCase()}: ${request.bloodGroup} (${request.bagsNeeded} bag) needed ${distanceKm}km away in ${request.unionName}, ${request.district}${hospital}. Call ${request.contactPhone}. Reply STOP to pause.`;
}

export function createRequestNotifications(
  request: BloodRequest,
  matchedCandidates: { donor: DonorProfile; distanceKm: number; recipientEmail?: string }[],
  language: Language = 'en',
  nowIso: string = new Date().toISOString()
): NotificationLog[] {
  const logs: NotificationLog[] = [];

  matchedCandidates.forEach(({ donor, distanceKm, recipientEmail }, idx) => {
    const emailPayload = buildDonorAlertEmail(request, donor, distanceKm, language);
    const resolvedEmail =
      recipientEmail ||
      donor.email ||
      `${donor.phone.replace(/\D/g, '')}@donors.roktodaan.org`;

    logs.push({
      id: `notif-email-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
      requestId: request.id,
      donorId: donor.id,
      donorName: donor.fullName,
      recipientEmail: resolvedEmail,
      recipientPhone: donor.phone,
      channel: 'email',
      status: EMAIL_ADAPTER.isConfigured() ? 'sent' : 'queued',
      subject: emailPayload.subject,
      body: emailPayload.body,
      provider: EMAIL_ADAPTER.providerName,
      createdAt: nowIso,
    });

    const smsBody = buildDonorAlertSms(request, donor, distanceKm);
    logs.push({
      id: `notif-sms-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
      requestId: request.id,
      donorId: donor.id,
      donorName: donor.fullName,
      recipientPhone: donor.phone,
      channel: 'sms',
      status: BANGLADESH_SMS_ADAPTER.isConfigured() ? 'sent' : 'deferred_sms_gateway',
      subject: `BD SMS Dispatch (${request.bloodGroup})`,
      body: smsBody,
      provider: BANGLADESH_SMS_ADAPTER.providerName,
      createdAt: nowIso,
    });
  });

  return logs;
}
