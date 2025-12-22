import React from 'react';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X, Plus, Minus } from 'lucide-react';
import { useLanguage } from './LanguageContext';

export interface FilterState {
  search: string; // Name
  status: string; // Profile Status
  
  // Common Ranges
  ageRange: [number, number];
  heightRange: [number, number];
  weightRange: [number, number];
  
  maritalStatus: string; // 'all', '초혼', '재혼'
  education: string; // Groom only (text search)
  educationRange: [number, number]; // Bride only (0-12)
  job: string;
  tattoo: string; // 'all', '없음', '있음'
  
  // Bride Specific
  location: string; // Current Address
  children: string;
  religion: string; // Religion filter (used by both bride and groom)
  
  // Groom Specific
  residence: string;
  annualIncomeRange: [number, number]; // Annual Income Range (e.g., 0-100000000)
  smoking: string; // 'all', '비흡연', '흡연'
  drinking: string; // Text search (e.g., "소주 1병", "안 함")
}

interface ProfileFiltersProps {
  type: 'bride' | 'groom';
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  className?: string;
}

export const INITIAL_FILTERS: FilterState = {
  search: '',
  status: 'all',
  ageRange: [18, 70],
  heightRange: [140, 190],
  weightRange: [40, 120],
  maritalStatus: 'all',
  education: '', // Groom only
  educationRange: [0, 12], // Bride only
  job: '',
  tattoo: 'all',
  
  location: '',
  children: '',
  religion: '', // Religion (used by both bride and groom)
  
  residence: '',
  annualIncomeRange: [0, 100000000], // Annual Income Range (0원 ~ 1억원)
  smoking: 'all',
  drinking: 'all',
};

export function ProfileFilters({ type, filters, setFilters, className }: ProfileFiltersProps) {
  const { t } = useLanguage();

  const handleRangeChange = (key: keyof FilterState, value: number[]) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleTextChange = (key: keyof FilterState, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
  };

  // Common Components to reduce duplication
  const SearchInput = () => (
    <div className="space-y-2">
      <Label>{t('label.name')}</Label>
      <Input 
        placeholder={t('form.placeholders.searchName')} 
        value={filters.search}
        onChange={(e) => handleTextChange('search', e.target.value)}
      />
    </div>
  );

  const StatusSelect = () => (
    <div className="space-y-2">
      <Label>{t('common.status')}</Label>
      <Select 
        value={filters.status} 
        onValueChange={(val) => handleTextChange('status', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('profile.filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('profile.filters.allStatuses')}</SelectItem>
          <SelectItem value="active">{t('dashboard.status.active')}</SelectItem>
          <SelectItem value="consulting">{t('profile.filters.consulting')}</SelectItem>
          <SelectItem value="matched">{t('profile.filters.matched')}</SelectItem>
          <SelectItem value="inactive">{t('profile.filters.inactive')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const AgeSlider = () => (
    <div className="space-y-4">
      <Label>{t('common.age')}</Label>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.ageRange;
              if (min > 18) handleRangeChange('ageRange', [min - 1, max]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.ageRange[0]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.ageRange;
              if (min < filters.ageRange[1]) handleRangeChange('ageRange', [min + 1, max]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.ageRange;
              if (max > filters.ageRange[0]) handleRangeChange('ageRange', [min, max - 1]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.ageRange[1]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.ageRange;
              if (max < 80) handleRangeChange('ageRange', [min, max + 1]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Slider
        defaultValue={[18, 70]}
        value={[filters.ageRange[0], filters.ageRange[1]]}
        min={18}
        max={80}
        step={1}
        onValueChange={(val) => handleRangeChange('ageRange', val)}
      />
    </div>
  );

  const HeightSlider = () => (
    <div className="space-y-4">
      <Label>{t('label.height')}</Label>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.heightRange;
              if (min > 140) handleRangeChange('heightRange', [min - 1, max]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.heightRange[0]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.heightRange;
              if (min < filters.heightRange[1]) handleRangeChange('heightRange', [min + 1, max]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.heightRange;
              if (max > filters.heightRange[0]) handleRangeChange('heightRange', [min, max - 1]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.heightRange[1]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.heightRange;
              if (max < 200) handleRangeChange('heightRange', [min, max + 1]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Slider
        defaultValue={[140, 190]}
        value={[filters.heightRange[0], filters.heightRange[1]]}
        min={140}
        max={200}
        step={1}
        onValueChange={(val) => handleRangeChange('heightRange', val)}
      />
    </div>
  );

  const WeightSlider = () => (
    <div className="space-y-4">
      <Label>{t('common.weight')}</Label>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.weightRange;
              if (min > 40) handleRangeChange('weightRange', [min - 1, max]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.weightRange[0]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.weightRange;
              if (min < filters.weightRange[1]) handleRangeChange('weightRange', [min + 1, max]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.weightRange;
              if (max > filters.weightRange[0]) handleRangeChange('weightRange', [min, max - 1]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.weightRange[1]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.weightRange;
              if (max < 150) handleRangeChange('weightRange', [min, max + 1]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Slider
        defaultValue={[40, 120]}
        value={[filters.weightRange[0], filters.weightRange[1]]}
        min={40}
        max={150}
        step={1}
        onValueChange={(val) => handleRangeChange('weightRange', val)}
      />
    </div>
  );

  const MaritalStatusSelect = () => (
    <div className="space-y-2">
      <Label>{t('label.maritalStatus')}</Label>
      <Select 
        value={filters.maritalStatus} 
        onValueChange={(val) => handleTextChange('maritalStatus', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('profile.filters.allStatuses')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('profile.filters.allStatuses')}</SelectItem>
          <SelectItem value="초혼">{t('profile.filters.firstMarriage')}</SelectItem>
          <SelectItem value="재혼">{t('profile.filters.remarriage')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const EducationInput = () => (
    <div className="space-y-2">
      <Label>{t('profile.education')}</Label>
      <Input 
        placeholder={t('form.placeholders.searchEducation')} 
        value={filters.education}
        onChange={(e) => handleTextChange('education', e.target.value)}
      />
    </div>
  );

  const EducationRangeSlider = () => (
    <div className="space-y-4">
      <Label>{t('profile.education')}</Label>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.educationRange;
              if (min > 0) handleRangeChange('educationRange', [min - 1, max]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.educationRange[0]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.educationRange;
              if (min < filters.educationRange[1]) handleRangeChange('educationRange', [min + 1, max]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.educationRange;
              if (max > filters.educationRange[0]) handleRangeChange('educationRange', [min, max - 1]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-6 text-center font-medium">{filters.educationRange[1]}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.educationRange;
              if (max < 12) handleRangeChange('educationRange', [min, max + 1]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Slider
        defaultValue={[0, 12]}
        value={[filters.educationRange[0], filters.educationRange[1]]}
        min={0}
        max={12}
        step={1}
        onValueChange={(val) => handleRangeChange('educationRange', val)}
      />
    </div>
  );

  const AnnualIncomeRangeSlider = () => (
    <div className="space-y-4">
      <Label>{t('profile.income')}</Label>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.annualIncomeRange;
              if (min > 0) handleRangeChange('annualIncomeRange', [min - 1000000, max]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-12 text-center font-medium">
            {Math.floor(filters.annualIncomeRange[0] / 10000)}만
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.annualIncomeRange;
              if (min < filters.annualIncomeRange[1]) handleRangeChange('annualIncomeRange', [min + 1000000, max]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 rounded-md p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.annualIncomeRange;
              if (max > filters.annualIncomeRange[0]) handleRangeChange('annualIncomeRange', [min, max - 1000000]);
            }}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-xs w-12 text-center font-medium">
            {Math.floor(filters.annualIncomeRange[1] / 10000)}만
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-sm hover:bg-white hover:shadow-sm"
            onClick={() => {
              const [min, max] = filters.annualIncomeRange;
              if (max < 100000000) handleRangeChange('annualIncomeRange', [min, max + 1000000]);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <Slider
        defaultValue={[0, 100000000]}
        value={[filters.annualIncomeRange[0], filters.annualIncomeRange[1]]}
        min={0}
        max={100000000}
        step={1000000}
        onValueChange={(val) => handleRangeChange('annualIncomeRange', val)}
      />
    </div>
  );

  const JobInput = () => (
    <div className="space-y-2">
      <Label>{t('profile.job')}</Label>
      <Input 
        placeholder={t('form.placeholders.searchJob')} 
        value={filters.job}
        onChange={(e) => handleTextChange('job', e.target.value)}
      />
    </div>
  );

  const TattooSelect = () => (
    <div className="space-y-2">
      <Label>{t('form.labels.tattoo')}</Label>
      <Select 
        value={filters.tattoo} 
        onValueChange={(val) => handleTextChange('tattoo', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('profile.filters.any')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('profile.filters.any')}</SelectItem>
          <SelectItem value="없음">{t('profile.filters.noTattoo')}</SelectItem>
          <SelectItem value="있음">{t('profile.filters.hasTattoo')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Render based on Type to match Registration Forms
  return (
    <div className={`space-y-6 p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{t('profile.filters.title')}</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500 h-8 px-2">
          {t('common.reset')} <X className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {type === 'bride' ? (
        // BRIDE FILTERS (Matches Bride Registration Form)
        <>
          <SearchInput /> {/* Name */}
          <StatusSelect /> {/* Profile Status */}
          <AgeSlider /> {/* Birth Date -> Age */}
          <HeightSlider /> {/* Height */}
          <WeightSlider /> {/* Weight */}
          <EducationRangeSlider /> {/* Education Range (0-12) */}
          <MaritalStatusSelect /> {/* Marital Status */}
          
          <div className="space-y-2">
            <Label>{t('profile.children')}</Label>
            <Input 
              placeholder={t('form.placeholders.searchChildren')} 
              value={filters.children}
              onChange={(e) => handleTextChange('children', e.target.value)}
            />
          </div>

          <JobInput /> {/* Job */}

          <div className="space-y-2">
            <Label>{t('profile.currentAddress')}</Label>
            <Input 
              placeholder={t('form.placeholders.searchAddress')} 
              value={filters.location}
              onChange={(e) => handleTextChange('location', e.target.value)}
            />
          </div>

          <TattooSelect /> {/* Tattoo */}

          <div className="space-y-2">
            <Label>{t('profile.religion')}</Label>
            <Select 
              value={filters.religion || 'all'} 
              onValueChange={(val) => handleTextChange('religion', val === 'all' ? '' : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('profile.filters.any')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('profile.filters.any')}</SelectItem>
                <SelectItem value="무교">{t('profile.filters.noReligion')}</SelectItem>
                <SelectItem value="불교">{t('profile.filters.buddhism')}</SelectItem>
                <SelectItem value="기독교">{t('profile.filters.christianity')}</SelectItem>
                <SelectItem value="천주교">{t('profile.filters.catholicism')}</SelectItem>
                <SelectItem value="기타">{t('profile.filters.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      ) : (
        // GROOM FILTERS (Matches Groom Registration Form)
        <>
          <SearchInput /> {/* Name */}
          <StatusSelect /> {/* Profile Status */}
          
          <div className="space-y-2">
            <Label>{t('profile.residence')}</Label>
            <Input 
              placeholder={t('form.placeholders.searchResidence')} 
              value={filters.residence}
              onChange={(e) => handleTextChange('residence', e.target.value)}
            />
          </div>

          <AgeSlider /> {/* Age */}
          <EducationInput /> {/* Education */}
          <HeightSlider /> {/* Height */}
          <WeightSlider /> {/* Weight */}
          <MaritalStatusSelect /> {/* Marital Status */}
          <JobInput /> {/* Job */}
          <AnnualIncomeRangeSlider /> {/* Annual Income Range */}


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('profile.drinking')}</Label>
              <Input 
                placeholder={t('form.placeholders.searchDrinking')} 
                value={filters.drinking === 'all' ? '' : filters.drinking}
                onChange={(e) => handleTextChange('drinking', e.target.value || 'all')}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('profile.smoking')}</Label>
              <Select 
                value={filters.smoking} 
                onValueChange={(val) => handleTextChange('smoking', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('profile.filters.any')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('profile.filters.any')}</SelectItem>
                  <SelectItem value="비흡연">{t('profile.filters.nonSmoker')}</SelectItem>
                  <SelectItem value="흡연">{t('profile.filters.smoker')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('profile.religion')}</Label>
            <Select 
              value={filters.religion || 'all'} 
              onValueChange={(val) => handleTextChange('religion', val === 'all' ? '' : val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('profile.filters.any')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('profile.filters.any')}</SelectItem>
                <SelectItem value="무교">{t('profile.filters.noReligion')}</SelectItem>
                <SelectItem value="불교">{t('profile.filters.buddhism')}</SelectItem>
                <SelectItem value="기독교">{t('profile.filters.christianity')}</SelectItem>
                <SelectItem value="천주교">{t('profile.filters.catholicism')}</SelectItem>
                <SelectItem value="기타">{t('profile.filters.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}