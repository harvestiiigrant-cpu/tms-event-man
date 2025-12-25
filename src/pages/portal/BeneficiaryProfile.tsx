import { useState, useRef } from 'react';
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
import { Camera, Save, User, School, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { uploadProfileImage, uploadSignatureImage } from '@/lib/uploadUtils';

// Mock user data
const mockUserData = {
  teacher_id: 'T001',
  name: 'សុខ សុវណ្ណា',
  name_english: 'Sok Sovannak',
  phone: '012 345 678',
  email: 'sok.sovannak@moeys.gov.kh',
  sex: 'M',
  position: 'Teacher',
  subject: 'Mathematics',
  school: 'Phnom Penh Primary School',
  school_id: 'SCH-001',
  province_name: 'Phnom Penh',
  district_name: 'Chamkar Mon',
  commune_name: 'Tonle Bassac',
  village_name: 'Phsar Doeum Kor',
  profile_image_url: '',
  signature_url: '',
};

export default function BeneficiaryProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(mockUserData);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

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

        toast({
          title: 'រូបថតបានផ្ទុកឡើង',
          description: 'រូបថតប្រវត្តិរូបបានផ្ទុកឡើងដោយជោគជ័យ។',
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

        toast({
          title: 'ហត្ថលេខាបានផ្ទុកឡើង',
          description: 'ហត្ថលេខាបានផ្ទុកឡើងដោយជោគជ័យ។',
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
    // Here you would save to API
    console.log('Saving profile:', profileData);
    console.log('Profile image:', profileImage);
    console.log('Signature:', signatureImage);

    toast({
      title: 'ប្រវត្តិរូបបានធ្វើបច្ចុប្បន្នភាព',
      description: 'ប្រវត្តិរូបរបស់អ្នកបានធ្វើបច្ចុប្បន្នភាពដោយជោគជ័យ។',
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setProfileData(mockUserData);
    setProfileImage(null);
    setSignatureImage(null);
    setIsEditing(false);
  };

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
                    {profileData.name.charAt(0)}
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
              <div className="space-y-2">
                <Label htmlFor="school" className="text-xs">សាលារៀន</Label>
                <Input
                  id="school"
                  value={profileData.school}
                  disabled
                  className="bg-muted h-12"
                />
                <p className="text-xs text-muted-foreground">លេខសម្គាល់សាលា: {profileData.school_id}</p>
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
                  <Input value={profileData.province_name} disabled className="bg-muted h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ស្រុក/ខណ្ឌ</Label>
                  <Input value={profileData.district_name} disabled className="bg-muted h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ឃុំ/សង្កាត់</Label>
                  <Input value={profileData.commune_name} disabled className="bg-muted h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ភូមិ</Label>
                  <Input value={profileData.village_name} disabled className="bg-muted h-12" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                ព័ត៌មានទីតាំងត្រូវបានគ្រប់គ្រងដោយអ្នកគ្រប់គ្រងប្រព័ន្ធ
              </p>
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
