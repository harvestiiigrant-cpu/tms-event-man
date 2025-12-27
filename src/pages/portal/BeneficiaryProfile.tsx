import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import geoService, { type Province, type District, type Commune, type Village, type School } from '@/services/geoService';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Save, User, School, MapPin, Phone, Mail, Loader2, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadProfileImage, uploadSignatureImage } from '@/lib/uploadUtils';

export default function BeneficiaryProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>({
    name: '',
    name_english: '',
    phone: '',
    email: '',
    sex: '',
    position: '',
    subject: '',
    school: '',
    school_id: '',
    province_name: '',
    district_name: '',
    commune_name: '',
    village_name: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  // Geography cascading state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedCommuneId, setSelectedCommuneId] = useState<number | null>(null);
  const [selectedVillageId, setSelectedVillageId] = useState<number | null>(null);
  const [schoolSearch, setSchoolSearch] = useState('');

  // Fetch beneficiary data
  const { data: beneficiary, isLoading } = useQuery({
    queryKey: ['beneficiary', user?.teacher_id],
    queryFn: () => api.beneficiaries.getById(user?.teacher_id!),
    enabled: !!user?.teacher_id,
  });

  // Update beneficiary mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => api.beneficiaries.update(profileData.teacher_id, data),
    onSuccess: () => {
      toast({ title: 'ជោគជ័យ', description: 'បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានផ្ទាល់ខ្លួន' });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['beneficiary', user?.teacher_id] });
    },
    onError: (error: any) => {
      toast({ title: 'កំហុស', description: error.message, variant: 'destructive' });
    },
  });

  // Load provinces on mount
  useEffect(() => {
    geoService.getProvinces().then(setProvinces);
  }, []);

  // Initialize profile data and geography from fetched beneficiary
  useEffect(() => {
    if (beneficiary) {
      setProfileData({
        name: beneficiary.name || '',
        name_english: beneficiary.name_english || '',
        phone: beneficiary.phone || '',
        email: beneficiary.email || '',
        sex: beneficiary.sex || '',
        position: beneficiary.position || '',
        subject: beneficiary.subject || '',
        school: beneficiary.school || '',
        school_id: beneficiary.school_id || '',
        province_name: beneficiary.province_name || '',
        district_name: beneficiary.district_name || '',
        commune_name: beneficiary.commune_name || '',
        village_name: beneficiary.village_name || '',
        teacher_id: beneficiary.teacher_id || '',
        grade: beneficiary.grade || '',
        role: beneficiary.role || '',
      });
      setProfileImage(beneficiary.profile_image_url || null);
      setSignatureImage(beneficiary.signature_url || null);

      // Load existing geography data
      if (beneficiary.province_name || beneficiary.district_name) {
        geoService.findLocationByName(
          beneficiary.province_name,
          beneficiary.district_name,
          beneficiary.commune_name,
          beneficiary.village_name
        ).then(async (ids) => {
          if (ids.provinceId) {
            setSelectedProvinceId(ids.provinceId);
            const dists = await geoService.getDistricts(ids.provinceId);
            setDistricts(dists);
          }
          if (ids.districtId) {
            setSelectedDistrictId(ids.districtId);
            const [comms, schs] = await Promise.all([
              geoService.getCommunes(ids.districtId),
              geoService.getSchoolsByDistrict(ids.districtId),
            ]);
            setCommunes(comms);
            setSchools(schs);
          }
          if (ids.communeId) {
            setSelectedCommuneId(ids.communeId);
            const vills = await geoService.getVillages(ids.communeId);
            setVillages(vills);
          }
          if (ids.villageId) {
            setSelectedVillageId(ids.villageId);
          }
        });
      }
    }
  }, [beneficiary]);

  // Cascading handlers
  const handleProvinceChange = async (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    const province = provinces.find((p) => p.id === provinceId);
    setProfileData({ ...profileData, province_name: province?.province_name_kh || '' });

    // Clear dependent selections
    setSelectedDistrictId(null);
    setSelectedCommuneId(null);
    setSelectedVillageId(null);
    setDistricts([]);
    setCommunes([]);
    setVillages([]);
    setSchools([]);
    setProfileData({
      ...profileData,
      province_name: province?.province_name_kh || '',
      district_name: '',
      commune_name: '',
      village_name: '',
      school: '',
    });

    // Load districts
    if (provinceId) {
      const dists = await geoService.getDistricts(provinceId);
      setDistricts(dists);
    }
  };

  const handleDistrictChange = async (districtId: number) => {
    setSelectedDistrictId(districtId);
    const district = districts.find((d) => d.id === districtId);
    setProfileData({ ...profileData, district_name: district?.district_name_kh || '' });

    // Clear dependent selections
    setSelectedCommuneId(null);
    setSelectedVillageId(null);
    setCommunes([]);
    setVillages([]);
    setProfileData({
      ...profileData,
      district_name: district?.district_name_kh || '',
      commune_name: '',
      village_name: '',
      school: '',
    });

    // CRITICAL: Load BOTH communes AND schools
    if (districtId) {
      const [comms, schs] = await Promise.all([
        geoService.getCommunes(districtId),
        geoService.getSchoolsByDistrict(districtId),
      ]);
      setCommunes(comms);
      setSchools(schs);
    }
  };

  const handleCommuneChange = async (communeId: number) => {
    setSelectedCommuneId(communeId);
    const commune = communes.find((c) => c.id === communeId);
    setProfileData({ ...profileData, commune_name: commune?.commune_name_kh || '' });

    // Clear dependent selections
    setSelectedVillageId(null);
    setVillages([]);
    setProfileData({
      ...profileData,
      commune_name: commune?.commune_name_kh || '',
      village_name: '',
    });

    // Load villages
    if (communeId) {
      const vills = await geoService.getVillages(communeId);
      setVillages(vills);
    }
  };

  const handleVillageChange = (villageId: number) => {
    setSelectedVillageId(villageId);
    const village = villages.find((v) => v.id === villageId);
    setProfileData({ ...profileData, village_name: village?.village_name_kh || '' });
  };

  const handleSchoolChange = (schoolId: number) => {
    const school = schools.find((s) => s.schoolId === schoolId);
    if (school) {
      setProfileData((prev) => ({
        ...prev,
        school: school.name,
        school_id: school.code,
      }));
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfile(true);

    try {
      // Upload using utility function
      const result = await uploadProfileImage(file, profileData.teacher_id);

      if (result.success && result.url) {
        setProfileImage(result.url);

        // Update profile data with new image URL
        setProfileData(prev => ({
          ...prev,
          profile_image_url: result.url!,
        }));

        // Auto-save to database immediately
        await updateMutation.mutateAsync({
          profile_image_url: result.url,
        });

        toast({
          title: 'រូបថតបានរក្សាទុក',
          description: 'រូបថតប្រវត្តិរូបបានរក្សាទុកក្នុងប្រព័ន្ធ។',
        });
      } else {
        toast({
          title: 'ការផ្ទុកឡើងបរាជ័យ',
          description: result.error || 'បរាជ័យក្នុងការផ្ទុករូបថត',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'កំហុសក្នុងការផ្ទុកឡើង',
        description: 'មានកំហុសកើតឡើងពេលកំពុងផ្ទុកឡើង',
        variant: 'destructive',
      });
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSignature(true);

    try {
      // Upload using utility function
      const result = await uploadSignatureImage(file, profileData.teacher_id);

      if (result.success && result.url) {
        setSignatureImage(result.url);

        // Update profile data with new signature URL
        setProfileData(prev => ({
          ...prev,
          signature_url: result.url!,
        }));

        // Auto-save to database immediately
        await updateMutation.mutateAsync({
          signature_url: result.url,
        });

        toast({
          title: 'ហត្ថលេខាបានរក្សាទុក',
          description: 'ហត្ថលេខាបានរក្សាទុកក្នុងប្រព័ន្ធ។',
        });
      } else {
        toast({
          title: 'ការផ្ទុកឡើងបរាជ័យ',
          description: result.error || 'បរាជ័យក្នុងការផ្ទុកហត្ថលេខា',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'កំហុសក្នុងការផ្ទុកឡើង',
        description: 'មានកំហុសកើតឡើងពេលកំពុងផ្ទុកឡើង',
        variant: 'destructive',
      });
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleSave = () => {
    // Only include fields that exist in Beneficiary model
    const dataToUpdate = {
      name: profileData.name,
      name_english: profileData.name_english,
      phone: profileData.phone,
      sex: profileData.sex,
      position: profileData.position,
      subject: profileData.subject,
      school: profileData.school,
      school_id: profileData.school_id,
      province_name: profileData.province_name,
      district_name: profileData.district_name,
      commune_name: profileData.commune_name,
      village_name: profileData.village_name,
      grade: profileData.grade ? parseInt(profileData.grade) : null,
      profile_image_url: profileImage || profileData.profile_image_url,
      signature_url: signatureImage || profileData.signature_url,
    };
    updateMutation.mutate(dataToUpdate);
  };

  const handleCancel = () => {
    if (beneficiary) {
      setProfileData(beneficiary);
      setProfileImage(beneficiary.profile_image_url);
      setSignatureImage(beneficiary.signature_url);
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <BeneficiaryPortalLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </BeneficiaryPortalLayout>
    );
  }

  return (
    <BeneficiaryPortalLayout>
      <div className="space-y-4">
        {/* Profile Header Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-card shadow-lg">
                  <AvatarImage src={profileImage || profileData.profile_image_url} alt={profileData.name} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {profileData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full h-10 w-10 shadow-lg"
                    onClick={() => profileImageInputRef.current?.click()}
                    disabled={uploadingProfile}
                  >
                    {uploadingProfile ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5" />
                    )}
                  </Button>
                )}
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                  disabled={uploadingProfile}
                />
              </div>

              {/* Name & ID */}
              <div className="text-center">
                <h3 className="text-xl font-bold">{profileData.name}</h3>
                <p className="text-base text-muted-foreground">{profileData.name_english}</p>
                <p className="text-sm text-muted-foreground mt-1">ID: {profileData.teacher_id}</p>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} size="lg" className="w-full">
                  <User className="mr-2 h-5 w-5" />
                  កែប្រែប្រវត្តិរូប
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              ព័ត៌មានផ្ទាល់ខ្លួន
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs">ឈ្មោះពេញ (ខ្មែរ)</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_english" className="text-xs">ឈ្មោះពេញ (អង់គ្លេស)</Label>
                <Input
                  id="name_english"
                  value={profileData.name_english}
                  onChange={(e) => setProfileData({ ...profileData, name_english: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">លេខទូរស័ព្ទ</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-9 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs">អ៊ីមែល</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-9 h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex" className="text-xs">ភេទ</Label>
                <Select
                  value={profileData.sex}
                  onValueChange={(value) => setProfileData({ ...profileData, sex: value as 'M' | 'F' })}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="sex" className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">ប្រុស</SelectItem>
                    <SelectItem value="F">ស្រី</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <School className="h-4 w-4 text-primary" />
              ព័ត៌មានវិជ្ជាជីវៈ
            </h3>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="position" className="text-xs">មុខតំណែង</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-xs">មុខវិជ្ជា</Label>
                <Input
                  id="subject"
                  value={profileData.subject}
                  onChange={(e) => setProfileData({ ...profileData, subject: e.target.value })}
                  disabled={!isEditing}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              ទីតាំង
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">ខេត្ត/រាជធានី</Label>
                  {isEditing ? (
                    <Select
                      value={selectedProvinceId?.toString() || ''}
                      onValueChange={(value) => handleProvinceChange(parseInt(value))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="ជ្រើសរើសខេត្ត..." />
                      </SelectTrigger>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id.toString()}>
                            {province.province_name_kh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profileData.province_name} disabled className="bg-muted h-12" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ស្រុក/ខណ្ឌ</Label>
                  {isEditing ? (
                    <Select
                      value={selectedDistrictId?.toString() || ''}
                      onValueChange={(value) => handleDistrictChange(parseInt(value))}
                      disabled={!selectedProvinceId}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="ជ្រើសរើសស្រុក..." />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id.toString()}>
                            {district.district_name_kh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profileData.district_name} disabled className="bg-muted h-12" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ឃុំ/សង្កាត់</Label>
                  {isEditing ? (
                    <Select
                      value={selectedCommuneId?.toString() || ''}
                      onValueChange={(value) => handleCommuneChange(parseInt(value))}
                      disabled={!selectedDistrictId}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="ជ្រើសរើសឃុំ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {communes.map((commune) => (
                          <SelectItem key={commune.id} value={commune.id.toString()}>
                            {commune.commune_name_kh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profileData.commune_name} disabled className="bg-muted h-12" />
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ភូមិ</Label>
                  {isEditing ? (
                    <Select
                      value={selectedVillageId?.toString() || ''}
                      onValueChange={(value) => handleVillageChange(parseInt(value))}
                      disabled={!selectedCommuneId}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="ជ្រើសរើសភូមិ..." />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village.id} value={village.id.toString()}>
                            {village.village_name_kh}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={profileData.village_name} disabled className="bg-muted h-12" />
                  )}
                </div>
              </div>

              {/* School Field - Under Geography */}
              <div className="space-y-2 pt-2">
                <Label className="text-xs">សាលារៀន</Label>
                {isEditing ? (
                  <div className="space-y-2">
                    {profileData.school && (
                      <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{profileData.school}</p>
                          <p className="text-xs text-muted-foreground">លេខសម្គាល់: {profileData.school_id}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setProfileData((prev) => ({ ...prev, school: '', school_id: '' }))}
                        >
                          ផ្លាស់ប្តូរ
                        </Button>
                      </div>
                    )}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="ស្វែងរកសាលា..."
                        value={schoolSearch}
                        onChange={(e) => setSchoolSearch(e.target.value)}
                        className="pl-9 h-10"
                        disabled={!selectedDistrictId || !!profileData.school}
                      />
                    </div>
                    <ScrollArea className="h-[200px] rounded-md border">
                      {schools
                        .filter((school) =>
                          school.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
                          school.code.toLowerCase().includes(schoolSearch.toLowerCase())
                        )
                        .map((school) => (
                          <div
                            key={school.schoolId}
                            onClick={() => {
                              handleSchoolChange(school.schoolId);
                              setSchoolSearch('');
                            }}
                            className="px-3 py-2 hover:bg-muted cursor-pointer border-b last:border-b-0"
                          >
                            <p className="font-medium text-sm">{school.name}</p>
                            <p className="text-xs text-muted-foreground">{school.code}</p>
                          </div>
                        ))}
                      {schools.length === 0 && selectedDistrictId && (
                        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                          គ្មានសាលាក្នុងស្រុកនេះ
                        </div>
                      )}
                      {!selectedDistrictId && (
                        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                          សូមជ្រើសរើសស្រុក/ខណ្ឌជាមុនសិន
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                ) : (
                  <div>
                    <Input value={profileData.school} disabled className="bg-muted h-12" />
                    {profileData.school_id && (
                      <p className="text-xs text-muted-foreground mt-1">លេខសម្គាល់: {profileData.school_id}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Digital Signature */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1 flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              ហត្ថលេខាឌីជីថល
            </h3>
            <p className="text-xs text-muted-foreground mb-3">ផ្ទុកហត្ថលេខារបស់អ្នកសម្រាប់វិញ្ញាបនប័ត្រ (អតិបរមា 2MB)</p>
            <div className="space-y-3">
              {(signatureImage || profileData.signature_url) && (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <img
                    src={signatureImage || profileData.signature_url}
                    alt="Signature"
                    className="h-24 object-contain w-full"
                  />
                </div>
              )}
              {isEditing && (
                <div>
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureChange}
                  />
                  <Button
                    variant="outline"
                    onClick={() => signatureInputRef.current?.click()}
                    className="w-full h-12"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {signatureImage || profileData.signature_url ? 'ផ្លាស់ប្តូរហត្ថលេខា' : 'ផ្ទុកហត្ថលេខា'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing && (
          <div className="grid grid-cols-2 gap-3 sticky bottom-20 bg-slate-50 dark:bg-slate-950 pt-2 pb-2">
            <Button variant="outline" onClick={handleCancel} size="lg" className="h-14">
              បោះបង់
            </Button>
            <Button onClick={handleSave} size="lg" className="h-14">
              <Save className="mr-2 h-5 w-5" />
              រក្សាទុកការផ្លាស់ប្តូរ
            </Button>
          </div>
        )}
      </div>
    </BeneficiaryPortalLayout>
  );
}
