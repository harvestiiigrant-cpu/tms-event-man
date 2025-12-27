import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import geoService, { type Province, type District } from '@/services/geoService';

interface CascadingLocationSelectorProps {
  selectedProvinceName?: string;
  selectedDistrictName?: string;
  onProvinceChange: (provinceId: number | null, provinceName: string) => void;
  onDistrictChange: (districtId: number | null, districtName: string) => void;
  provinceLabel?: string;
  districtLabel?: string;
  required?: boolean;
}

export function CascadingLocationSelector({
  selectedProvinceName,
  selectedDistrictName,
  onProvinceChange,
  onDistrictChange,
  provinceLabel = 'ខេត្ត/ក្រុង',
  districtLabel = 'ស្រុក/ខណ្ឌ',
  required = false,
}: CascadingLocationSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      const data = await geoService.getProvinces();
      setProvinces(data);
      setIsLoadingProvinces(false);

      // If there's a pre-selected province name, find and set it
      if (selectedProvinceName) {
        const province = data.find(
          (p) => p.province_name_kh === selectedProvinceName || p.province_name_en === selectedProvinceName
        );
        if (province) {
          setSelectedProvinceId(province.id);
          loadDistricts(province.id);
        }
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  const loadDistricts = async (provinceId: number) => {
    setIsLoadingDistricts(true);
    const data = await geoService.getDistricts(provinceId);
    setDistricts(data);
    setIsLoadingDistricts(false);

    // If there's a pre-selected district name, find and set it
    if (selectedDistrictName) {
      const district = data.find(
        (d) => d.district_name_kh === selectedDistrictName || d.district_name_en === selectedDistrictName
      );
      if (district) {
        setSelectedDistrictId(district.id);
      }
    }
  };

  const handleProvinceChange = (value: string) => {
    const provinceId = parseInt(value);
    const province = provinces.find((p) => p.id === provinceId);

    if (province) {
      setSelectedProvinceId(provinceId);
      setSelectedDistrictId(null);
      setDistricts([]);
      onProvinceChange(provinceId, province.province_name_kh);
      onDistrictChange(null, '');
      loadDistricts(provinceId);
    }
  };

  const handleDistrictChange = (value: string) => {
    const districtId = parseInt(value);
    const district = districts.find((d) => d.id === districtId);

    if (district) {
      setSelectedDistrictId(districtId);
      onDistrictChange(districtId, district.district_name_kh);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Province Selector */}
      <div className="space-y-2">
        <Label htmlFor="province">
          {provinceLabel} {required && '*'}
        </Label>
        <Select
          value={selectedProvinceId?.toString() || undefined}
          onValueChange={handleProvinceChange}
          disabled={isLoadingProvinces}
        >
          <SelectTrigger id="province">
            <SelectValue placeholder={isLoadingProvinces ? 'កំពុងផ្ទុក...' : 'ជ្រើសរើសខេត្ត/ក្រុង'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((province) => (
              <SelectItem key={province.id} value={province.id.toString()}>
                {province.province_name_kh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* District Selector */}
      <div className="space-y-2">
        <Label htmlFor="district">
          {districtLabel} {required && '*'}
        </Label>
        <Select
          value={selectedDistrictId?.toString() || undefined}
          onValueChange={handleDistrictChange}
          disabled={!selectedProvinceId || isLoadingDistricts}
        >
          <SelectTrigger id="district">
            <SelectValue
              placeholder={
                !selectedProvinceId
                  ? 'ជ្រើសរើសខេត្តមុនសិន'
                  : isLoadingDistricts
                  ? 'កំពុងផ្ទុក...'
                  : 'ជ្រើសរើសស្រុក/ខណ្ឌ'
              }
            />
          </SelectTrigger>
          <SelectContent>
            {districts.map((district) => (
              <SelectItem key={district.id} value={district.id.toString()}>
                {district.district_name_kh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
