import React from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Agency {
  id: number;
  name: string;
  role: 'groom' | 'bride';
  contact: string;
  phone: string;
  address: string;
  registrationDate: string;
  status: string;
  memo?: string;
}

interface AgencySelectorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  agencies: Agency[];
  role?: 'groom' | 'bride'; // optional: 없으면 모든 활성 소속사 표시
  placeholder?: string;
}

export function AgencySelector({
  id,
  label,
  value,
  onChange,
  agencies,
  role,
  placeholder = '소속사를 선택하세요 (선택사항)'
}: AgencySelectorProps) {
  // role이 있으면 해당 role만 필터링, 없으면 모든 활성 소속사 표시
  const filteredAgencies = role 
    ? agencies.filter(a => a.role === role && a.status === '활성')
    : agencies.filter(a => a.status === '활성');

  const handleChange = (val: string) => {
    // "none"을 빈 문자열로 변환
    onChange(val === 'none' ? '' : val);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value || 'none'} onValueChange={handleChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">선택 안 함</SelectItem>
          {filteredAgencies.map(agency => (
            <SelectItem key={agency.id} value={agency.id.toString()}>
              {agency.name} - {agency.contact}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}