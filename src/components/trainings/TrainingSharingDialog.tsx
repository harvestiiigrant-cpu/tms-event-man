import { useState } from 'react';
import { Copy, Download, Mail, MessageSquare, Share2, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import type { Training } from '@/types/training';
import { QRCodeSVG } from 'qrcode.react';

interface TrainingSharingDialogProps {
  training: Training;
  trigger?: React.ReactNode;
}

export function TrainingSharingDialog({ training, trigger }: TrainingSharingDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSMS, setCopiedSMS] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const enrollmentUrl = `${window.location.origin}/enroll?training=${training.id}`;

  const smsTemplate = `🎓 Training Enrollment

${training.training_name}
📅 ${training.training_start_date} - ${training.training_end_date}
📍 ${training.training_location}

Enroll here: ${enrollmentUrl}

- MoEYS Training Dept`;

  const emailSubject = `Enroll in ${training.training_name_english}`;
  const emailBody = `Dear Teacher,

You are invited to enroll in the following professional development training:

Training: ${training.training_name} (${training.training_name_english})
Code: ${training.training_code}
Category: ${training.training_category}
Level: ${training.training_level}

Dates: ${training.training_start_date} to ${training.training_end_date}
Location: ${training.training_location} - ${training.training_venue}
Capacity: ${training.max_participants} participants

To enroll, please visit:
${enrollmentUrl}

Or scan the QR code attached to this email.

Instructions:
1. Click the link or scan the QR code
2. The training details will be pre-filled
3. Enter your Teacher ID and phone number
4. Submit the form

For questions, contact your provincial training coordinator.

Best regards,
MoEYS Training Department`;

  const copyToClipboard = async (text: string, type: 'link' | 'sms' | 'email') => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'link') setCopiedLink(true);
      if (type === 'sms') setCopiedSMS(true);
      if (type === 'email') setCopiedEmail(true);

      setTimeout(() => {
        if (type === 'link') setCopiedLink(false);
        if (type === 'sms') setCopiedSMS(false);
        if (type === 'email') setCopiedEmail(false);
      }, 2000);

      toast({
        title: 'Copied!',
        description: `${type === 'link' ? 'Link' : type === 'sms' ? 'SMS template' : 'Email template'} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${training.training_code}-qr-code.png`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: 'QR Code Downloaded',
          description: 'Save this image for printing or digital sharing',
        });
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share & Invite
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Share Training & Invite Teachers</DialogTitle>
          <DialogDescription>
            Use these tools to invite teachers to enroll in {training.training_name_english}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
        <Tabs defaultValue="qr" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="qr">QR Code</TabsTrigger>
            <TabsTrigger value="link">Link</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4">
            <div className="flex flex-col items-center space-y-4 p-6 bg-muted/50 rounded-lg">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={enrollmentUrl}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-2">
                <Badge variant="secondary">{training.training_code}</Badge>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Teachers can scan this QR code to instantly access the enrollment form with pre-filled training details
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={downloadQRCode} className="w-full" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code (PNG)
              </Button>
              <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <strong>💡 Recommended Uses:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Print and display at provincial meetings</li>
                  <li>Include in PowerPoint presentations</li>
                  <li>Share in WhatsApp/Telegram groups</li>
                  <li>Post at school notice boards</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Direct Link Tab */}
          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Direct Enrollment Link</Label>
              <div className="flex gap-2">
                <Input value={enrollmentUrl} readOnly className="font-mono text-sm" />
                <Button
                  onClick={() => copyToClipboard(enrollmentUrl, 'link')}
                  variant="outline"
                  size="icon"
                  className="flex-shrink-0"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This link pre-fills the training details. Teachers only need to enter their ID and phone number.
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Sharing Options</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`Enroll in ${training.training_name_english}: ${enrollmentUrl}`)}`);
                  }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(`Enroll here: ${enrollmentUrl}`)}`);
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-950 p-3 rounded-lg">
              <strong>✅ Best for:</strong> Digital sharing via messaging apps, email, or SMS
            </div>
          </TabsContent>

          {/* SMS Template Tab */}
          <TabsContent value="sms" className="space-y-4">
            <div className="space-y-2">
              <Label>SMS Message Template</Label>
              <textarea
                value={smsTemplate}
                readOnly
                className="w-full h-48 p-3 text-sm border rounded-md font-mono resize-none"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{smsTemplate.length} characters</span>
                <span>~{Math.ceil(smsTemplate.length / 160)} SMS parts</span>
              </div>
            </div>

            <Button
              onClick={() => copyToClipboard(smsTemplate, 'sms')}
              className="w-full"
              size="lg"
            >
              {copiedSMS ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copiedSMS ? 'Copied!' : 'Copy SMS Template'}
            </Button>

            <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
              <strong>📱 SMS Tips:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use bulk SMS service for large groups</li>
                <li>Personalize with teacher names if possible</li>
                <li>Send 2-3 weeks before training starts</li>
                <li>Include training code for reference</li>
              </ul>
            </div>
          </TabsContent>

          {/* Email Template Tab */}
          <TabsContent value="email" className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Email Subject</Label>
                <Input value={emailSubject} readOnly />
              </div>

              <div className="space-y-2">
                <Label>Email Body</Label>
                <textarea
                  value={emailBody}
                  readOnly
                  className="w-full h-64 p-3 text-sm border rounded-md font-mono resize-none"
                />
              </div>
            </div>

            <Button
              onClick={() => copyToClipboard(emailBody, 'email')}
              className="w-full"
              size="lg"
            >
              {copiedEmail ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copiedEmail ? 'Copied!' : 'Copy Email Template'}
            </Button>

            <div className="text-xs text-muted-foreground bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
              <strong>📧 Email Tips:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Attach the QR code image for easy scanning</li>
                <li>Use your official MoEYS email address</li>
                <li>BCC recipients to protect privacy</li>
                <li>Send reminder 1 week before deadline</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Training Details</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Code</p>
              <p className="font-medium">{training.training_code}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-medium">{training.training_category}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dates</p>
              <p className="font-medium">{training.training_start_date} to {training.training_end_date}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Capacity</p>
              <p className="font-medium">{training.current_participants || 0} / {training.max_participants}</p>
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
