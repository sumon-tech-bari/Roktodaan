import React from 'react';
import {
  BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUnionsForUpazila,
  getUpazilasForDistrict,
} from '../../lib/bangladesh-locations';
import type { Language } from '../../types/database';
import { Label } from '../ui/label';
import { Select } from '../ui/select';

interface LocationCascadeSelectorProps {
  language: Language;
  division: string;
  district: string;
  upazila: string;
  unionName: string;
  allowAll?: boolean;
  onChange: (next: {
    division: string;
    district: string;
    upazila: string;
    unionName: string;
  }) => void;
  errors?: {
    division?: string;
    district?: string;
    upazila?: string;
    unionName?: string;
  };
}

export const LocationCascadeSelector: React.FC<LocationCascadeSelectorProps> = ({
  language,
  division,
  district,
  upazila,
  unionName,
  allowAll = false,
  onChange,
  errors,
}) => {
  const districts = division ? getDistrictsForDivision(division) : [];
  const upazilas = division && district ? getUpazilasForDistrict(division, district) : [];
  const unions =
    division && district && upazila ? getUnionsForUpazila(division, district, upazila) : [];

  const handleDivisionChange = (val: string) => {
    if (!val) {
      onChange({ division: '', district: '', upazila: '', unionName: '' });
      return;
    }
    const nextDistricts = getDistrictsForDivision(val);
    const firstDist = allowAll ? '' : nextDistricts[0]?.nameEn ?? '';
    const nextUpazilas = firstDist ? getUpazilasForDistrict(val, firstDist) : [];
    const firstUpa = allowAll ? '' : nextUpazilas[0]?.nameEn ?? '';
    const nextUnions = firstUpa ? getUnionsForUpazila(val, firstDist, firstUpa) : [];
    const firstUnion = allowAll ? '' : nextUnions[0]?.nameEn ?? '';
    onChange({
      division: val,
      district: firstDist,
      upazila: firstUpa,
      unionName: firstUnion,
    });
  };

  const handleDistrictChange = (val: string) => {
    if (!val) {
      onChange({ division, district: '', upazila: '', unionName: '' });
      return;
    }
    const nextUpazilas = getUpazilasForDistrict(division, val);
    const firstUpa = allowAll ? '' : nextUpazilas[0]?.nameEn ?? '';
    const nextUnions = firstUpa ? getUnionsForUpazila(division, val, firstUpa) : [];
    const firstUnion = allowAll ? '' : nextUnions[0]?.nameEn ?? '';
    onChange({
      division,
      district: val,
      upazila: firstUpa,
      unionName: firstUnion,
    });
  };

  const handleUpazilaChange = (val: string) => {
    if (!val) {
      onChange({ division, district, upazila: '', unionName: '' });
      return;
    }
    const nextUnions = getUnionsForUpazila(division, district, val);
    const firstUnion = allowAll ? '' : nextUnions[0]?.nameEn ?? '';
    onChange({
      division,
      district,
      upazila: val,
      unionName: firstUnion,
    });
  };

  const labels =
    language === 'bn'
      ? {
          division: 'বিভাগ',
          district: 'জেলা',
          upazila: 'উপজেলা / থানা',
          union: 'ইউনিয়ন / ওয়ার্ড',
          selectDiv: 'বিভাগ নির্বাচন করুন',
          selectDist: 'জেলা নির্বাচন করুন',
          selectUpa: 'উপজেলা নির্বাচন করুন',
          selectUnion: 'ইউনিয়ন নির্বাচন করুন',
          allDivs: 'সকল বিভাগ',
          allDists: 'সকল জেলা',
          allUpas: 'সকল উপজেলা',
          allUnions: 'সকল ইউনিয়ন',
        }
      : {
          division: 'Division',
          district: 'District',
          upazila: 'Upazila / Thana',
          union: 'Union / Ward',
          selectDiv: 'Select Division',
          selectDist: 'Select District',
          selectUpa: 'Select Upazila',
          selectUnion: 'Select Union / Ward',
          allDivs: 'All Divisions',
          allDists: 'All Districts',
          allUpas: 'All Upazilas',
          allUnions: 'All Unions / Wards',
        };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="loc-division">{labels.division}</Label>
        <Select
          id="loc-division"
          value={division}
          onChange={(e) => handleDivisionChange(e.target.value)}
        >
          <option value="">{allowAll ? labels.allDivs : labels.selectDiv}</option>
          {BANGLADESH_DIVISIONS.map((d) => (
            <option key={d.nameEn} value={d.nameEn}>
              {language === 'bn' ? `${d.nameBn} (${d.nameEn})` : d.nameEn}
            </option>
          ))}
        </Select>
        {errors?.division && <p className="text-xs text-red-600">{errors.division}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="loc-district">{labels.district}</Label>
        <Select
          id="loc-district"
          value={district}
          disabled={!division}
          onChange={(e) => handleDistrictChange(e.target.value)}
        >
          <option value="">{allowAll ? labels.allDists : labels.selectDist}</option>
          {districts.map((d) => (
            <option key={d.nameEn} value={d.nameEn}>
              {language === 'bn' ? `${d.nameBn} (${d.nameEn})` : d.nameEn}
            </option>
          ))}
        </Select>
        {errors?.district && <p className="text-xs text-red-600">{errors.district}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="loc-upazila">{labels.upazila}</Label>
        <Select
          id="loc-upazila"
          value={upazila}
          disabled={!district}
          onChange={(e) => handleUpazilaChange(e.target.value)}
        >
          <option value="">{allowAll ? labels.allUpas : labels.selectUpa}</option>
          {upazilas.map((u) => (
            <option key={u.nameEn} value={u.nameEn}>
              {language === 'bn' ? `${u.nameBn} (${u.nameEn})` : u.nameEn}
            </option>
          ))}
        </Select>
        {errors?.upazila && <p className="text-xs text-red-600">{errors.upazila}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="loc-union">{labels.union}</Label>
        <Select
          id="loc-union"
          value={unionName}
          disabled={!upazila}
          onChange={(e) =>
            onChange({ division, district, upazila, unionName: e.target.value })
          }
        >
          <option value="">{allowAll ? labels.allUnions : labels.selectUnion}</option>
          {unions.map((u) => (
            <option key={u.nameEn} value={u.nameEn}>
              {language === 'bn' ? `${u.nameBn} (${u.nameEn})` : u.nameEn}
            </option>
          ))}
        </Select>
        {errors?.unionName && <p className="text-xs text-red-600">{errors.unionName}</p>}
      </div>
    </div>
  );
};
