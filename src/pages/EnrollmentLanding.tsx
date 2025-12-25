import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Search, ArrowRight, Users, Zap } from 'lucide-react';
import { CompactBrandHeader } from '@/components/branding/BrandHeader';

export default function EnrollmentLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <CompactBrandHeader />
        </div>
      </header>

      <main className="container px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to Training Enrollment
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to enroll in professional development trainings
          </p>
        </div>

        {/* Two Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Option 1: QR Code / Direct Link (Primary) */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg hover:shadow-xl transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <QrCode className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-xl">Scan QR Code</CardTitle>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-xs font-medium">
                    <Zap className="h-3 w-3" />
                    Recommended
                  </div>
                </div>
              </div>
              <CardDescription className="text-base">
                Have a QR code or link from your training coordinator?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Scan the QR code provided by your training coordinator
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Training details will be pre-filled automatically
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enter your ID and phone number to complete enrollment
                  </p>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-green-600" />
                  <span><strong className="text-green-600">Fastest method</strong> - Takes only 30 seconds</span>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  💡 <strong>Tip:</strong> If you received a link via SMS or email, clicking it will bring you directly to the enrollment form
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Option 2: Browse All Trainings (Secondary) */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-muted rounded-full -translate-y-16 translate-x-16" />
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
                  <Search className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Browse Trainings</CardTitle>
              </div>
              <CardDescription className="text-base">
                Explore all available trainings and choose your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Browse 150+ trainings across all categories and provinces
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Filter by subject, location, and date to find the right match
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select your training and complete the enrollment form
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="w-full h-12" variant="outline">
                  <Link to="/trainings/browse">
                    Browse All Trainings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                💡 <strong>Best for:</strong> Teachers who want to explore options or don't have a specific training in mind
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-muted/50 rounded-xl border">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">150+</p>
            <p className="text-xs text-muted-foreground">Active Trainings</p>
          </div>
          <div className="text-center border-l border-r">
            <p className="text-2xl font-bold text-primary">25</p>
            <p className="text-xs text-muted-foreground">Provinces</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-2">Need help?</p>
          <p className="text-sm">
            Contact your provincial training coordinator or email{' '}
            <a href="mailto:support@plp-tms.moeys.gov.kh" className="text-primary hover:underline">
              support@plp-tms.moeys.gov.kh
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
