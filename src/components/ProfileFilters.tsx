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
  
  maritalStatus: string;
  education: string;
  job: string;
  tattoo: string;
  
  // Bride Specific
  location: string; // Current Address
  children: string;
  monthlyIncome: string;
  destination: string;
  guarantee: string; // 'all', 'yes', 'no'
  
  // Groom Specific
  residence: string;
  annualIncome: string;
  smoking: string;
  drinking: string;
  religion: string;
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
  education: '',
  job: '',
  tattoo: 'all',
  
  location: '',
  children: '',
  monthlyIncome: '',
  destination: 'all',
  guarantee: 'all',
  
  residence: '',
  annualIncome: '',
  smoking: 'all',
  drinking: 'all',
  religion: '',
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
        placeholder="Search by name..." 
        value={filters.search}
        onChange={(e) => handleTextChange('search', e.target.value)}
      />
    </div>
  );

  const StatusSelect = () => (
    <div className="space-y-2">
      <Label>Status</Label>
      <Select 
        value={filters.status} 
        onValueChange={(val) => handleTextChange('status', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="consulting">Consulting</SelectItem>
          <SelectItem value="matched">Matched</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const AgeSlider = () => (
    <div className="space-y-4">
      <Label>Age</Label>
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
      <Label>Weight</Label>
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
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="single">Single (Never Married)</SelectItem>
          <SelectItem value="divorced">Divorced</SelectItem>
          <SelectItem value="widowed">Widowed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const EducationInput = () => (
    <div className="space-y-2">
      <Label>Education</Label>
      <Input 
        placeholder="Search education..." 
        value={filters.education}
        onChange={(e) => handleTextChange('education', e.target.value)}
      />
    </div>
  );

  const JobInput = () => (
    <div className="space-y-2">
      <Label>Job</Label>
      <Input 
        placeholder="Search job..." 
        value={filters.job}
        onChange={(e) => handleTextChange('job', e.target.value)}
      />
    </div>
  );

  const TattooSelect = () => (
    <div className="space-y-2">
      <Label>Tattoo</Label>
      <Select 
        value={filters.tattoo} 
        onValueChange={(val) => handleTextChange('tattoo', val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any</SelectItem>
          <SelectItem value="no">No Tattoo</SelectItem>
          <SelectItem value="yes">Has Tattoo</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // Render based on Type to match Registration Forms
  return (
    <div className={`space-y-6 p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500 h-8 px-2">
          Reset <X className="w-3 h-3 ml-1" />
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
          <EducationInput /> {/* Education */}
          <MaritalStatusSelect /> {/* Marital Status */}
          
          <div className="space-y-2">
            <Label>Children</Label>
            <Input 
              placeholder="Search children info..." 
              value={filters.children}
              onChange={(e) => handleTextChange('children', e.target.value)}
            />
          </div>

          <JobInput /> {/* Job */}

          <div className="space-y-2">
            <Label>Current Address (Location)</Label>
            <Input 
              placeholder="Search address..." 
              value={filters.location}
              onChange={(e) => handleTextChange('location', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Monthly Income</Label>
            <Input 
              placeholder="Search income..." 
              value={filters.monthlyIncome}
              onChange={(e) => handleTextChange('monthlyIncome', e.target.value)}
            />
          </div>

          <TattooSelect /> {/* Tattoo */}

          <div className="space-y-2">
            <Label>{t('bride.destination')}</Label>
            <Select 
              value={filters.destination} 
              onValueChange={(val) => handleTextChange('destination', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any Destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Destination</SelectItem>
                <SelectItem value="korea">Korea</SelectItem>
                <SelectItem value="taiwan">Taiwan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Guarantee</Label>
            <Select 
              value={filters.guarantee} 
              onValueChange={(val) => handleTextChange('guarantee', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any</SelectItem>
                <SelectItem value="yes">Yes (Has Guarantor)</SelectItem>
                <SelectItem value="no">No</SelectItem>
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
            <Label>{t('label.address')} (Residence)</Label>
            <Input 
              placeholder="Search residence..." 
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

          <div className="space-y-2">
            <Label>Annual Income</Label>
            <Input 
              placeholder="Search income..." 
              value={filters.annualIncome}
              onChange={(e) => handleTextChange('annualIncome', e.target.value)}
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Drinking</Label>
              <Select 
                value={filters.drinking} 
                onValueChange={(val) => handleTextChange('drinking', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Smoking</Label>
              <Select 
                value={filters.smoking} 
                onValueChange={(val) => handleTextChange('smoking', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Religion</Label>
            <Input 
              placeholder="Search religion..." 
              value={filters.religion}
              onChange={(e) => handleTextChange('religion', e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}