import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { Training } from "@/types/training";

interface TrainingQRCodeProps {
  training: Training;
  trigger?: React.ReactNode;
}

export function TrainingQRCode({ training, trigger }: TrainingQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const enrollmentUrl = `${window.location.origin}/enroll?training=${training.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(enrollmentUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Enrollment link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 300;
      
      // Fill white background
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, 300, 300);
      }

      // Download
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `qr-${training.training_code}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);

      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been saved as an image.",
      });
    };
    img.src = url;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Training QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to access the enrollment page for this training.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">{training.training_name}</p>
            {training.training_name_english && (
              <p className="text-sm text-muted-foreground">{training.training_name_english}</p>
            )}
            <p className="text-xs text-muted-foreground">{training.training_code}</p>
          </div>

          <div 
            ref={qrRef}
            className="flex justify-center p-6 bg-card rounded-lg border"
          >
            <QRCodeSVG
              value={enrollmentUrl}
              size={200}
              level="H"
              includeMargin
              className="rounded"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button 
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Print this QR code and display it at training venues for easy participant registration.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
