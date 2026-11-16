import type { BloodMatch, BloodRequest, DonorProfile, ImpactStats } from '../types/database';

export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(',');
  const bodyLines = rows.map((row) => row.map(escapeCsvCell).join(','));
  return [headerLine, ...bodyLines].join('\n');
}

export function exportDonorsCsv(donors: DonorProfile[]): string {
  return buildCsv(
    [
      'Donor ID',
      'Full Name',
      'Blood Group',
      'Phone',
      'Phone Verified',
      'Division',
      'District',
      'Upazila',
      'Union/Ward',
      'Available',
      'Verified Badge',
      'Total Donations',
      'Last Donation Date',
      'Updated At',
    ],
    donors.map((d) => [
      d.id,
      d.fullName,
      d.bloodGroup,
      d.phone,
      d.phoneVerified ? 'Yes' : 'No',
      d.division,
      d.district,
      d.upazila,
      d.unionName,
      d.isAvailable ? 'Available' : 'Unavailable',
      d.isVerified ? 'Verified' : 'Pending',
      d.totalDonations,
      d.lastDonationDate || 'Never',
      d.updatedAt,
    ])
  );
}

export function exportRequestsCsv(requests: BloodRequest[]): string {
  return buildCsv(
    [
      'Request ID',
      'Patient Reference',
      'Blood Group',
      'Bags Needed',
      'Urgency',
      'Hospital',
      'Division',
      'District',
      'Upazila',
      'Union/Ward',
      'Contact Phone',
      'Status',
      'Created At',
    ],
    requests.map((r) => [
      r.id,
      r.patientName,
      r.bloodGroup,
      r.bagsNeeded,
      r.urgency,
      r.hospitalName || 'Direct Request',
      r.division,
      r.district,
      r.upazila,
      r.unionName,
      r.contactPhone,
      r.status,
      r.createdAt,
    ])
  );
}

export function exportImpactReportCsv(
  impact: ImpactStats,
  donors: DonorProfile[],
  requests: BloodRequest[],
  matches: BloodMatch[]
): string {
  return buildCsv(
    ['Metric', 'Value'],
    [
      ['Report Generated At', new Date().toISOString()],
      ['Total Registered Donors (Baseline + Live)', impact.totalDonors + donors.length],
      ['Live Pool Donors', donors.length],
      ['Verified Live Donors', donors.filter((d) => d.isVerified).length],
      ['Total Successful Matches', impact.successfulMatches],
      ['Estimated Lives Impacted', impact.livesImpacted],
      ['Active Unions Covered', impact.activeUnionsCovered],
      ['Open Requests', requests.filter((r) => r.status === 'open').length],
      ['Matched Requests', requests.filter((r) => r.status === 'matched').length],
      ['Fulfilled Requests', requests.filter((r) => r.status === 'fulfilled').length],
      ['Completed Donations Logged', matches.filter((m) => m.status === 'completed').length],
    ]
  );
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
