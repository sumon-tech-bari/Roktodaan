import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { ExternalLink, FilePlus2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  customPageSchema,
  slugifyText,
  type CustomPageFormValues,
} from '../../lib/validations';
import { cn } from '../../lib/utils';
import { useRoktodaanStore } from '../../store/useRoktodaanStore';
import type { CustomPage, CustomPageBlock } from '../../types/database';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';

const PRESET_COVERS = [
  {
    label: 'Community Blood Drive',
    url: '/src/assets/images/community_donor_drive_1794820532640.jpg',
  },
  {
    label: 'Roktodaan Clinic',
    url: '/src/assets/images/hero_roktodaan_clinic_1794820531516.jpg',
  },
  {
    label: 'Cold-Chain Medical Lab',
    url: '/src/assets/images/medical_cold_chain_logistics_1794820531599.jpg',
  },
];

const emptyBlock = (): CustomPageBlock => ({
  id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
  headingEn: 'Section Overview',
  headingBn: 'মূল তথ্য',
  bodyEn: 'Add detailed instructions, schedule, or coordination guidelines here.',
  bodyBn: 'এখানে বিস্তারিত নির্দেশনা, সময়সূচি বা সমন্বয় তথ্য লিখুন।',
  ctaLabelEn: 'Register as Donor',
  ctaLabelBn: 'রক্তদাতা হিসেবে নিবন্ধন করুন',
  ctaRoute: '/register-donor',
});

export const AdminPagesTab: React.FC = () => {
  const {
    customPages,
    saveCustomPage,
    toggleCustomPagePublished,
    deleteCustomPage,
    navigate,
  } = useRoktodaanStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<CustomPageBlock[]>([emptyBlock()]);

  const form = useForm<CustomPageFormValues>({
    resolver: zodResolver(customPageSchema),
    defaultValues: {
      slug: '',
      titleEn: '',
      titleBn: '',
      subtitleEn: '',
      subtitleBn: '',
      template: 'camp',
      placement: 'both',
      coverImageUrl: PRESET_COVERS[0].url,
      isPublished: true,
    },
  });

  const loadPageForEdit = (page: CustomPage) => {
    setEditingId(page.id);
    form.reset({
      slug: page.slug,
      titleEn: page.titleEn,
      titleBn: page.titleBn,
      subtitleEn: page.subtitleEn,
      subtitleBn: page.subtitleBn,
      template: page.template,
      placement: page.placement,
      coverImageUrl: page.coverImageUrl ?? '',
      isPublished: page.isPublished,
    });
    setBlocks(page.blocks.length > 0 ? page.blocks : [emptyBlock()]);
  };

  const resetForm = () => {
    setEditingId(null);
    form.reset({
      slug: '',
      titleEn: '',
      titleBn: '',
      subtitleEn: '',
      subtitleBn: '',
      template: 'camp',
      placement: 'both',
      coverImageUrl: PRESET_COVERS[0].url,
      isPublished: true,
    });
    setBlocks([emptyBlock()]);
  };

  const handleSave = (data: CustomPageFormValues) => {
    const cleanBlocks = blocks.filter(
      (b) => b.headingEn.trim().length > 0 && b.bodyEn.trim().length > 0
    );
    if (cleanBlocks.length === 0) {
      toast.error('Please add at least one content section block.');
      return;
    }

    const saved = saveCustomPage({
      id: editingId ?? undefined,
      slug: data.slug,
      titleEn: data.titleEn,
      titleBn: data.titleBn,
      subtitleEn: data.subtitleEn,
      subtitleBn: data.subtitleBn,
      template: data.template,
      placement: data.placement,
      coverImageUrl: data.coverImageUrl || undefined,
      blocks: cleanBlocks,
      isPublished: data.isPublished,
    });
    toast.success(`Page "/p/${saved.slug}" saved and live without code changes.`);
    resetForm();
  };

  const updateBlock = (id: string, patch: Partial<CustomPageBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Existing Pages List */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-slate-900">
            CMS Pages ({customPages.length})
          </h2>
          <Button size="sm" variant="outline" onClick={resetForm}>
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
            New Page
          </Button>
        </div>

        {customPages.map((page) => (
          <div
            key={page.id}
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-sm font-semibold text-slate-900 truncate">
                  {page.titleEn}
                </p>
                <p className="text-xs text-slate-600 truncate">{page.titleBn}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  /p/{page.slug} · {page.placement} · {page.blocks.length} section(s)
                </p>
              </div>
              <span
                className={cn(
                  'text-xs font-semibold uppercase shrink-0',
                  page.isPublished ? 'text-emerald-700' : 'text-amber-700'
                )}
              >
                {page.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate(`/p/${page.slug}`)}>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Open
                </Button>
                <Button size="sm" variant="outline" onClick={() => loadPageForEdit(page)}>
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCustomPagePublished(page.id)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {page.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  type="button"
                  aria-label={`Delete page ${page.titleEn}`}
                  onClick={() => {
                    deleteCustomPage(page.id);
                    if (editingId === page.id) resetForm();
                    toast.success('Page deleted');
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No-Code Page Builder Form */}
      <form
        onSubmit={form.handleSubmit(handleSave)}
        noValidate
        className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            {editingId ? 'Edit Dynamic Page' : 'Create New Page (No Code Required)'}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-medium text-rose-800 hover:underline cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cms-page-title-en">Page Title (English)</Label>
            <Input
              id="cms-page-title-en"
              placeholder="e.g. Dhaka Winter Blood Camp"
              {...form.register('titleEn', {
                onChange: (e) => {
                  if (!editingId && !form.getFieldState('slug').isDirty) {
                    form.setValue('slug', slugifyText(e.target.value));
                  }
                },
              })}
            />
            {form.formState.errors.titleEn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleEn.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cms-page-title-bn">Page Title (Bengali)</Label>
            <Input
              id="cms-page-title-bn"
              placeholder="যেমন: ঢাকা শীতকালীন রক্তদান ক্যাম্প"
              {...form.register('titleBn')}
            />
            {form.formState.errors.titleBn && (
              <p className="text-xs text-red-600">{form.formState.errors.titleBn.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="cms-page-slug">URL Slug (/p/...)</Label>
            <Input
              id="cms-page-slug"
              placeholder="dhaka-winter-camp"
              className="font-mono text-xs"
              {...form.register('slug')}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-red-600">{form.formState.errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cms-page-template">Template</Label>
            <Select id="cms-page-template" {...form.register('template')}>
              <option value="camp">Blood Camp / Event</option>
              <option value="article">Article / Guide</option>
              <option value="faq">Guidelines & FAQ</option>
              <option value="partner">Partner Spotlight</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cms-page-placement">Navigation Placement</Label>
            <Select id="cms-page-placement" {...form.register('placement')}>
              <option value="both">Header & Footer</option>
              <option value="header">Top Header Nav</option>
              <option value="footer">Footer Links</option>
              <option value="hidden">Direct Link Only</option>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cms-page-sub-en">Summary (English)</Label>
            <Textarea id="cms-page-sub-en" rows={2} {...form.register('subtitleEn')} />
            {form.formState.errors.subtitleEn && (
              <p className="text-xs text-red-600">{form.formState.errors.subtitleEn.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cms-page-sub-bn">Summary (Bengali)</Label>
            <Textarea id="cms-page-sub-bn" rows={2} {...form.register('subtitleBn')} />
            {form.formState.errors.subtitleBn && (
              <p className="text-xs text-red-600">{form.formState.errors.subtitleBn.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cms-page-cover">Cover Image Preset or URL</Label>
          <Select id="cms-page-cover" {...form.register('coverImageUrl')}>
            <option value="">No cover image</option>
            {PRESET_COVERS.map((c) => (
              <option key={c.url} value={c.url}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Dynamic Sections */}
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">
              Page Content Sections ({blocks.length})
            </h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setBlocks((prev) => [...prev, emptyBlock()])}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Add Section
            </Button>
          </div>

          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    Section {index + 1}
                  </span>
                  {blocks.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setBlocks((prev) => prev.filter((item) => item.id !== block.id))
                      }
                      className="text-xs text-red-700 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    aria-label={`Section ${index + 1} heading English`}
                    placeholder="Section heading (EN)"
                    value={block.headingEn}
                    onChange={(e) => updateBlock(block.id, { headingEn: e.target.value })}
                  />
                  <Input
                    aria-label={`Section ${index + 1} heading Bengali`}
                    placeholder="সেকশন শিরোনাম (BN)"
                    value={block.headingBn}
                    onChange={(e) => updateBlock(block.id, { headingBn: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Textarea
                    rows={2}
                    aria-label={`Section ${index + 1} body English`}
                    placeholder="Body text (EN)"
                    value={block.bodyEn}
                    onChange={(e) => updateBlock(block.id, { bodyEn: e.target.value })}
                  />
                  <Textarea
                    rows={2}
                    aria-label={`Section ${index + 1} body Bengali`}
                    placeholder="বিস্তারিত লেখা (BN)"
                    value={block.bodyBn}
                    onChange={(e) => updateBlock(block.id, { bodyBn: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input
                    placeholder="Button Label (EN, optional)"
                    value={block.ctaLabelEn ?? ''}
                    onChange={(e) => updateBlock(block.id, { ctaLabelEn: e.target.value })}
                  />
                  <Input
                    placeholder="বাটন টেক্সট (BN, optional)"
                    value={block.ctaLabelBn ?? ''}
                    onChange={(e) => updateBlock(block.id, { ctaLabelBn: e.target.value })}
                  />
                  <Select
                    value={block.ctaRoute ?? ''}
                    onChange={(e) => updateBlock(block.id, { ctaRoute: e.target.value })}
                  >
                    <option value="">No CTA button</option>
                    <option value="/register-donor">Donor Registration</option>
                    <option value="/request-blood">Request Blood</option>
                    <option value="/find-donors">Find Donors</option>
                    <option value="/about">Partners & Impact</option>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <Switch
              ariaLabel="Publish page immediately"
              checked={form.watch('isPublished')}
              onCheckedChange={(val) => form.setValue('isPublished', val)}
            />
            <span className="text-sm font-medium text-slate-700">
              Publish immediately
            </span>
          </div>
          <Button type="submit">
            {editingId ? 'Update Page' : 'Create & Publish Page'}
          </Button>
        </div>
      </form>
    </div>
  );
};
