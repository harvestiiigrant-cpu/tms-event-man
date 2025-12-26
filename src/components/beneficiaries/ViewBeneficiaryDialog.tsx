import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { Beneficiary } from '@/types/training';
import { User, Phone, Mail, MapPin, School, Briefcase, Calendar, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

interface ViewBeneficiaryDialogProps {
  beneficiary: Beneficiary;
  trigger: React.ReactNode;
}

export function ViewBeneficiaryDialog({ beneficiary, trigger }: ViewBeneficiaryDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ព័ត៌មានលម្អិតអ្នកទទួលផល</DialogTitle>
          <DialogDescription>មើលព័ត៌មានលម្អិតពេញលេញរបស់អ្នកទទួលផល</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={beneficiary.profile_image_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {beneficiary.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{beneficiary.name}</h3>
              {beneficiary.name_english && (
                <p className="text-sm text-muted-foreground">{beneficiary.name_english}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono">{beneficiary.teacher_id}</Badge>
                <Badge variant={beneficiary.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {beneficiary.status === 'ACTIVE' ? 'សកម្ម' : 'អសកម្ម'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              ព័ត៌មានទំនាក់ទំនង
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {beneficiary.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{beneficiary.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{beneficiary.sex === 'M' ? 'ប្រុស' : beneficiary.sex === 'F' ? 'ស្រី' : '-'}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* School Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <School className="h-4 w-4" />
              ព័ត៌មានសាលា
            </h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-2 text-sm">
                <School className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{beneficiary.school || '-'}</p>
                  {beneficiary.school_id && (
                    <p className="text-xs text-muted-foreground">ID: {beneficiary.school_id}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{beneficiary.position || '-'}</span>
              </div>
              {beneficiary.subject && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{beneficiary.subject}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              ទីតាំង
            </h4>
            <div className="grid gap-2 text-sm">
              {beneficiary.province_name && <p>ខេត្ត: {beneficiary.province_name}</p>}
              {beneficiary.district_name && <p>ស្រុក/ក្រុង: {beneficiary.district_name}</p>}
              {beneficiary.commune_name && <p>ឃុំ/សង្កាត់: {beneficiary.commune_name}</p>}
              {beneficiary.village_name && <p>ភូមិ: {beneficiary.village_name}</p>}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              បានបង្កើត: {format(new Date(beneficiary.created_at), 'PPP')}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ: {format(new Date(beneficiary.updated_at), 'PPP')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
