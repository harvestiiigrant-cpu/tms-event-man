// Geographic data service for Cambodia locations
// Connects to MoEYS PLP API for provinces, districts, communes, villages, schools

const BASE_URL = 'https://plp-api.moeys.gov.kh/api/v1';

export interface Province {
  id: number;
  province_code: string;
  province_name_kh: string;
  province_name_en: string;
}

export interface District {
  id: number;
  district_code: string;
  district_name_kh: string;
  district_name_en: string;
  province_code: number;
}

export interface Commune {
  id: number;
  commune_code: string;
  commune_name_kh: string;
  commune_name_en: string;
  district_code: number;
  province_code: number;
}

export interface Village {
  id: number;
  village_code: string;
  village_name_kh: string;
  village_name_en: string;
  commune_code: number;
  district_code: number;
  province_code: number;
}

export interface School {
  schoolId: number;
  name: string;
  code: string;
  profile: string | null;
  schoolType: string;
  status: string;
  place: {
    id: number;
    provinceId: number;
    province_name_kh: string;
    province_name_en: string;
    districtId: number;
    district_name_kh: string;
    district_name_en: string;
    communeId: number | null;
    commune_name_kh: string | null;
  };
}

class GeoService {
  private cache: {
    provinces?: Province[];
    districts: Map<number, District[]>;
    communes: Map<number, Commune[]>;
    villages: Map<number, Village[]>;
    schools: Map<number, School[]>;
  };

  constructor() {
    this.cache = {
      districts: new Map(),
      communes: new Map(),
      villages: new Map(),
      schools: new Map(),
    };
  }

  async getProvinces(): Promise<Province[]> {
    if (this.cache.provinces) {
      return this.cache.provinces;
    }

    try {
      const response = await fetch(`${BASE_URL}/locations/provinces`);
      const data = await response.json();
      this.cache.provinces = data;
      return data;
    } catch (error) {
      console.error('Error fetching provinces:', error);
      return [];
    }
  }

  async getDistricts(provinceId: number): Promise<District[]> {
    if (this.cache.districts.has(provinceId)) {
      return this.cache.districts.get(provinceId)!;
    }

    try {
      const response = await fetch(`${BASE_URL}/locations/districts?province_id=${provinceId}`);
      const data = await response.json();
      this.cache.districts.set(provinceId, data);
      return data;
    } catch (error) {
      console.error('Error fetching districts:', error);
      return [];
    }
  }

  async getCommunes(districtId: number): Promise<Commune[]> {
    if (this.cache.communes.has(districtId)) {
      return this.cache.communes.get(districtId)!;
    }

    try {
      const response = await fetch(`${BASE_URL}/locations/communes?district_id=${districtId}`);
      const data = await response.json();
      this.cache.communes.set(districtId, data);
      return data;
    } catch (error) {
      console.error('Error fetching communes:', error);
      return [];
    }
  }

  async getVillages(communeId: number): Promise<Village[]> {
    if (this.cache.villages.has(communeId)) {
      return this.cache.villages.get(communeId)!;
    }

    try {
      const response = await fetch(`${BASE_URL}/locations/villages?commune_id=${communeId}`);
      const data = await response.json();
      this.cache.villages.set(communeId, data);
      return data;
    } catch (error) {
      console.error('Error fetching villages:', error);
      return [];
    }
  }

  async getSchoolsByDistrict(districtId: number): Promise<School[]> {
    if (this.cache.schools.has(districtId)) {
      return this.cache.schools.get(districtId)!;
    }

    try {
      const response = await fetch(`${BASE_URL}/schools/district/${districtId}`);
      const data = await response.json();
      this.cache.schools.set(districtId, data);
      return data;
    } catch (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
  }

  // Helper: Find location IDs by names (for loading existing data)
  async findLocationByName(
    provinceName?: string,
    districtName?: string,
    communeName?: string,
    villageName?: string
  ): Promise<{
    provinceId?: number;
    districtId?: number;
    communeId?: number;
    villageId?: number;
  }> {
    const result: any = {};

    if (!provinceName) return result;

    const provinces = await this.getProvinces();
    const province = provinces.find(
      (p) => p.province_name_kh === provinceName || p.province_name_en === provinceName
    );

    if (!province) return result;
    result.provinceId = province.id;

    if (!districtName) return result;

    const districts = await this.getDistricts(province.id);
    const district = districts.find(
      (d) => d.district_name_kh === districtName || d.district_name_en === districtName
    );

    if (!district) return result;
    result.districtId = district.id;

    if (!communeName) return result;

    const communes = await this.getCommunes(district.id);
    const commune = communes.find(
      (c) => c.commune_name_kh === communeName || c.commune_name_en === communeName
    );

    if (!commune) return result;
    result.communeId = commune.id;

    if (!villageName) return result;

    const villages = await this.getVillages(commune.id);
    const village = villages.find(
      (v) => v.village_name_kh === villageName || v.village_name_en === villageName
    );

    if (village) {
      result.villageId = village.id;
    }

    return result;
  }
}

// Export singleton instance
const geoService = new GeoService();
export default geoService;
