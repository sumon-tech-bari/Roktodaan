import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Download,
  FilePlus2,
  GitCompareArrows,
  LayoutGrid,
  Megaphone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { t } from '../lib/i18n';
import { bloodBankSchema, type BloodBankFormValues } from '../lib/validations';
import {
  downloadTextFile,
  exportDonorsCsv,
  exportImpactReportCsv,
  exportRequestsCsv,
} from '../lib/reports';
import { cn, formatRelativeTime } from '../lib/utils';
import { useRoktodaanStore } from '../store/useRoktodaanStore';
import type { UserRole } from '../types/database';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { LocationCascadeSelector } from '../components/shared/LocationCascadeSelector';
import { AdminMatchingTab } from '../components/admin/AdminMatchingTab';
import { AdminPagesTab } from '../components/admin/AdminPagesTab';
import { AdminNoticesTab } from '../components/admin/AdminNoticesTab';
import { AdminAdsTab } from '../components/admin/AdminAdsTab';

type AdminTab =
  | 'overview'
  | 'matching'
  | 'requests'
  | 'donors'
  | 'pages'
  | 'notices'
  | 'ads'
  | 'banks';

export const AdminPanelPage: React.FC = () => {
  const {
    language,
    currentUser,
    users,
    donors,
    requests,
    matches,
    bloodBanks,
    customPages,
    emergencyNotices,
    adCampaigns,
    notificationLogs,
    userReports,
    blockedUserIds,
    partnershipInquiries,
    impactBaseline,
    verifyDonor,
    updateUserRole,
    toggleUserActive,
    updateRequestStatus,
    addBloodBank,
    toggleBloodBankVerification,
    resolveUserReport,
    unblockUser,
    switchDemoRole,
  } = useRoktodaanStore();
  const copy = t(language);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [donorSearch, setDonorSearch] = useState('');

  const bankForm = useForm<BloodBankFormValues>({
    resolver: zodResolver(bloodBankSchema),
    defaultValues: {
      name: '',
      nameBn: '',
      phone: '',
      address: '',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Savar',
      unionName: 'Savar Pourashava',
      is24Hours: true,
    },
  });

  if (currentUser?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <ShieldAlert className="mx-auto h-10 w-10 text-rose-800" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Admin Authorization Required
        </h1>
        <p className="text-sm text-slate-600">
          Switch to the National Operations Admin role to run smart donor matching, publish custom pages, broadcast emergency notices, and manage campaigns.
        </p>
        <Button onClick={() => switchDemoRole('admin')}>Switch to Admin Session</Button>
      </div>
    );
  }

  const handleCreateBank = (data: BloodBankFormValues) => {
    addBloodBank({
      ...data,
      availableGroups: ['A+', 'B+', 'O+', 'AB+'],
    });
    bankForm.reset();
    toast.success('Blood bank added to national registry.');
  };

  const filteredDonors = donors.filter((d) => {
    const q = donorSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      d.fullName.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q) ||
      d.unionName.toLowerCase().includes(q) ||
      d.district.toLowerCase().includes(q)
    );
  });

  const handleExportDonorsCsv = () => {
    downloadTextFile('roktodaan-donors.csv', exportDonorsCsv(donors));
    toast.success('Exported Donors CSV report.');
  };

  const handleExportRequestsCsv = () => {
    downloadTextFile('roktodaan-requests.csv', exportRequestsCsv(requests));
    toast.success('Exported Blood Requests CSV report.');
  };

  const handleExportImpactCsv = () => {
    downloadTextFile(
      'roktodaan-impact-report.csv',
      exportImpactReportCsv(impactBaseline, donors, requests, matches)
    );
    toast.success('Exported Impact Summary CSV report.');
  };

  const handleExportJsonBackup = () => {
    const snapshot = {
      exportedAt: new Date().toISOString(),
      impactBaseline,
      donors,
      requests,
      matches,
      bloodBanks,
      customPages,
      emergencyNotices,
      adCampaigns,
      notificationLogs,
      userReports,
      partnershipInquiries,
    };
    downloadTextFile(
      'roktodaan-backup.json',
      JSON.stringify(snapshot, null, 2),
      'application/json;charset=utf-8;'
    );
    toast.success('Full JSON data backup downloaded.');
  };

  const navItems: {
    id: AdminTab;
    label: string;
    count?: number;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'overview', label: copy.admin.tabOverview, icon: LayoutGrid },
    { id: 'matching', label: copy.admin.tabMatching, count: matches.length, icon: GitCompareArrows },
    { id: 'requests', label: copy.admin.tabRequests, count: requests.length, icon: Activity },
    {
      id: 'donors',
      label: copy.admin.tabDonors,
      count: donors.length + userReports.filter((r) => r.status === 'open').length,
      icon: Users,
    },
    { id: 'pages', label: copy.admin.tabPages, count: customPages.length, icon: FilePlus2 },
    {
      id: 'notices',
      label: copy.admin.tabNotices,
      count: emergencyNotices.filter((n) => n.isActive).length,
      icon: AlertTriangle,
    },
    {
      id: 'ads',
      label: copy.admin.tabAds,
      count: adCampaigns.filter((a) => a.isActive).length,
      icon: Megaphone,
    },
    {
      id: 'banks',
      label: copy.admin.tabBanks,
      count: bloodBanks.length + partnershipInquiries.length,
      icon: Building2,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-800">
            Admin Console · No-Code Operations
          </p>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {copy.admin.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{copy.admin.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={handleExportImpactCsv}>
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export Impact CSV
          </Button>
          <Button size="sm" variant="outline" onClick={() => setActiveTab('notices')}>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-800" aria-hidden="true" />
            New Notice
          </Button>
          <Button size="sm" onClick={() => setActiveTab('pages')}>
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
            Add Page
          </Button>
        </div>
      </div>

      {/* SaaS Layout: 240px Sidebar on Desktop + Scrollable Tab Bar on Mobile */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <nav
          aria-label="Admin sections"
          className="flex gap-1.5 overflow-x-auto pb-2 lg:w-60 lg:shrink-0 lg:flex-col lg:pb-0"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex min-h-[42px] items-center justify-between gap-3 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer',
                  active
                    ? 'border-rose-800 bg-rose-800 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span
                    className={cn(
                      'font-mono text-[11px] tabular-nums',
                      active ? 'text-rose-100' : 'text-slate-500'
                    )}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Total Registered Donors</p>
                  <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
                    {(impactBaseline.totalDonors + donors.length).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700 tabular-nums">
                    {donors.filter((d) => d.isVerified).length} verified in active pool
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Active Match Dispatches</p>
                  <p className="mt-2 font-display text-3xl font-bold text-rose-800 tabular-nums">
                    {matches.filter((m) => m.status === 'pending' || m.status === 'accepted').length}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {requests.filter((r) => r.status === 'open' || r.status === 'matched').length} open requests
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">CMS Pages & Notices</p>
                  <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
                    {customPages.filter((p) => p.isPublished).length}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {emergencyNotices.filter((n) => n.isActive).length} active emergency notice(s)
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Partner Campaigns (Ads)</p>
                  <p className="mt-2 font-display text-3xl font-bold text-slate-900 tabular-nums">
                    {adCampaigns.filter((a) => a.isActive).length}
                  </p>
                  <p className="mt-1 text-xs text-slate-600 tabular-nums">
                    {adCampaigns.reduce((sum, a) => sum + a.clicks, 0)} total campaign clicks
                  </p>
                </div>
              </div>

              {/* Quick No-Code Shortcuts */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  No-Code Site Management Shortcuts
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('matching')}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-slate-900">Run Smart Matching</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Auto-match top donors by Union & 90-day eligibility.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('pages')}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-slate-900">Add / Expand Pages</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Publish custom pages directly to Header or Footer.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notices')}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-slate-900">Broadcast Notice</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Display live emergency blood shortage banners.
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ads')}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer"
                  >
                    <p className="text-sm font-semibold text-slate-900">Manage Ads & Sponsors</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Launch NGO drives and sponsor banners across pages.
                    </p>
                  </button>
                </div>
              </div>

              {/* Partner Reports & Data Export Desk */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold text-slate-900">
                      International Partner Reports & Data Backup
                    </h2>
                    <p className="text-xs text-slate-600">
                      Download live CSV reports for Red Cross / Rotary audits or full JSON platform backups.
                    </p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums">
                    {notificationLogs.length} notifications · {userReports.length} safety reports
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Button size="sm" variant="outline" onClick={handleExportDonorsCsv}>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Export Donors CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportRequestsCsv}>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Export Requests CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportImpactCsv}>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Export Impact CSV
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleExportJsonBackup}>
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    Export JSON Backup
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Blood Group Supply Breakdown (Active Available Pool)
                </h2>
                <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const).map((group) => {
                    const count = donors.filter(
                      (d) => d.bloodGroup === group && d.isAvailable
                    ).length;
                    return (
                      <div
                        key={group}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center"
                      >
                        <p className="font-display text-sm font-bold text-rose-900">{group}</p>
                        <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                          {count}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matching' && <AdminMatchingTab />}

          {activeTab === 'requests' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Patient / Hospital</th>
                    <th className="px-4 py-3">Group</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Urgency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{req.patientName}</p>
                        <p className="text-xs text-slate-500">
                          {req.hospitalName || 'Direct request'} · {formatRelativeTime(req.createdAt, language)}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-rose-900">
                        {req.bloodGroup} ({req.bagsNeeded})
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {req.unionName}, {req.upazila}, {req.district}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase">{req.urgency}</td>
                      <td className="px-4 py-3 text-xs font-semibold uppercase text-slate-700">
                        {req.status}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('matching')}
                          >
                            Match
                          </Button>
                          {req.status !== 'fulfilled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateRequestStatus(req.id, 'fulfilled');
                                toast.success('Marked request fulfilled');
                              }}
                            >
                              Fulfill
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'donors' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <Input
                    aria-label="Search donors"
                    placeholder="Filter donors by name, group, Union, or District..."
                    value={donorSearch}
                    onChange={(e) => setDonorSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <span className="text-xs text-slate-500 tabular-nums">
                  {filteredDonors.length} donor(s) shown · {users.length} total accounts
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">Donor Name</th>
                      <th className="px-4 py-3">Group</th>
                      <th className="px-4 py-3">Union Hierarchy</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Verification</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredDonors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{donor.fullName}</p>
                          <p className="font-mono text-xs text-slate-500">{donor.phone}</p>
                        </td>
                        <td className="px-4 py-3 font-display font-bold text-rose-900">
                          {donor.bloodGroup}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {donor.unionName}, {donor.upazila}, {donor.district}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {donor.isAvailable ? 'Available' : 'Paused'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {donor.isVerified ? (
                            <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              Verified
                            </span>
                          ) : (
                            <span className="text-amber-700">Unverified</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant={donor.isVerified ? 'outline' : 'default'}
                            onClick={() => {
                              verifyDonor(donor.id, !donor.isVerified);
                              toast.success(
                                donor.isVerified ? 'Verification revoked' : 'Donor verified'
                              );
                            }}
                          >
                            {donor.isVerified ? 'Revoke' : 'Verify Donor'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Platform Accounts & Role Permissions */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h2 className="font-display text-sm font-semibold text-slate-900">
                    Registered User Accounts & Role Governance
                  </h2>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 text-right">Account State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {u.phone} · {u.email}
                        </td>
                        <td className="px-4 py-3">
                          <Select
                            aria-label={`Role for ${u.fullName}`}
                            value={u.role}
                            onChange={(e) => {
                              updateUserRole(u.id, e.target.value as UserRole);
                              toast.success(`Updated role for ${u.fullName}`);
                            }}
                            className="h-8 text-xs max-w-[130px]"
                          >
                            <option value="donor">donor</option>
                            <option value="seeker">seeker</option>
                            <option value="hospital">hospital</option>
                            <option value="admin">admin</option>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleUserActive(u.id)}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Safety Reports & Blocked Users Moderation */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold text-slate-900">
                      Safety Reports Moderation Queue ({userReports.length})
                    </h2>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {userReports.filter((r) => r.status === 'open').length} open
                    </span>
                  </div>
                  {userReports.length === 0 ? (
                    <div className="p-6 text-xs text-slate-500">
                      No abuse, payment demand, or fake profile reports filed yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {userReports.map((rep) => (
                        <div key={rep.id} className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {rep.targetName}{' '}
                              <span className="font-mono text-xs text-rose-800 uppercase">
                                [{rep.reason}]
                              </span>
                            </p>
                            <p className="text-xs text-slate-600">{rep.details}</p>
                            <p className="text-[11px] text-slate-500">
                              Reported by {rep.reporterName} · {formatRelativeTime(rep.createdAt, language)}
                            </p>
                          </div>
                          {rep.status === 'open' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                resolveUserReport(rep.id);
                                toast.success('Safety report marked resolved.');
                              }}
                            >
                              Resolve Report
                            </Button>
                          ) : (
                            <span className="text-xs font-semibold uppercase text-emerald-700">
                              Resolved
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white overflow-hidden h-fit">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h2 className="font-display text-sm font-semibold text-slate-900">
                      Blocked Accounts ({blockedUserIds.length})
                    </h2>
                  </div>
                  {blockedUserIds.length === 0 ? (
                    <div className="p-5 text-xs text-slate-500">No blocked accounts in current session.</div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {blockedUserIds.map((uid) => (
                        <div key={uid} className="p-3.5 flex items-center justify-between gap-2">
                          <span className="font-mono text-xs text-slate-700 truncate">{uid}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              unblockUser(uid);
                              toast.success('Account unblocked.');
                            }}
                          >
                            Unblock
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pages' && <AdminPagesTab />}
          {activeTab === 'notices' && <AdminNoticesTab />}
          {activeTab === 'ads' && <AdminAdsTab />}

          {activeTab === 'banks' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7 space-y-3">
                {bloodBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-rose-800 shrink-0" aria-hidden="true" />
                        <h3 className="font-display text-base font-semibold text-slate-900">
                          {bank.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600">{bank.address}</p>
                      <p className="text-xs text-slate-500 font-mono">
                        {bank.phone} · {bank.is24Hours ? '24/7 Operations' : 'Daytime'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleBloodBankVerification(bank.id)}
                    >
                      <CheckCircle2
                        className={cn(
                          'h-3.5 w-3.5',
                          bank.isVerified ? 'text-emerald-600' : 'text-slate-400'
                        )}
                        aria-hidden="true"
                      />
                      {bank.isVerified ? 'Verified' : 'Pending'}
                    </Button>
                  </div>
                ))}
              </div>

              <form
                onSubmit={bankForm.handleSubmit(handleCreateBank)}
                noValidate
                className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 space-y-4 h-fit"
              >
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Register Partner Hospital / Blood Bank
                </h2>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name">Facility Name (English)</Label>
                  <Input id="bank-name" {...bankForm.register('name')} />
                  {bankForm.formState.errors.name && (
                    <p className="text-xs text-red-600">{bankForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-name-bn">Facility Name (Bengali)</Label>
                  <Input id="bank-name-bn" {...bankForm.register('nameBn')} />
                  {bankForm.formState.errors.nameBn && (
                    <p className="text-xs text-red-600">{bankForm.formState.errors.nameBn.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-phone">Emergency Phone</Label>
                  <Input id="bank-phone" placeholder="+8801712345678" {...bankForm.register('phone')} />
                  {bankForm.formState.errors.phone && (
                    <p className="text-xs text-red-600">{bankForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-address">Full Street Address</Label>
                  <Input id="bank-address" {...bankForm.register('address')} />
                  {bankForm.formState.errors.address && (
                    <p className="text-xs text-red-600">{bankForm.formState.errors.address.message}</p>
                  )}
                </div>
                <LocationCascadeSelector
                  language={language}
                  division={bankForm.watch('division')}
                  district={bankForm.watch('district')}
                  upazila={bankForm.watch('upazila')}
                  unionName={bankForm.watch('unionName')}
                  onChange={(next) => {
                    bankForm.setValue('division', next.division);
                    bankForm.setValue('district', next.district);
                    bankForm.setValue('upazila', next.upazila);
                    bankForm.setValue('unionName', next.unionName);
                  }}
                />
                <Button type="submit" className="w-full">
                  Add Blood Bank
                </Button>
              </form>

              <div className="lg:col-span-12 rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    Organization & Charity Partnership Inquiries ({partnershipInquiries.length})
                  </h2>
                </div>
                {partnershipInquiries.length === 0 ? (
                  <div className="p-6 text-xs text-slate-500">
                    Partnership inquiries submitted from the Contact & Partnership page will appear here.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {partnershipInquiries.map((inq) => (
                      <div key={inq.id} className="p-5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-display text-sm font-bold text-slate-900">
                            {inq.organizationName}{' '}
                            <span className="font-mono text-xs font-semibold uppercase text-rose-800">
                              [{inq.organizationType}]
                            </span>
                          </p>
                          <p className="text-xs text-slate-700">{inq.message}</p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {inq.contactPerson} · {inq.email} · {inq.phone}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatRelativeTime(inq.createdAt, language)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
