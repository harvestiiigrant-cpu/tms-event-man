import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Event } from '@/types/event';
import {
  GraduationCap,
  CalendarDays,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  CheckCircle2,
  Globe,
  Video,
  UserCheck,
  BookOpen,
  Target,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const navigate = useNavigate();

  // Fetch upcoming events for preview
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: api.events.getPublic,
  });

  const featuredEvents = upcomingEvents.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Stunning Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse delay-500" />
        </div>

        {/* Navigation Bar */}
        <nav className="relative z-10 container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xl">
                <GraduationCap className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">PLP-TMS</h1>
                <p className="text-xs text-white/90">Professional Learning Program</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 hidden md:flex"
                onClick={() => navigate('/events/browse')}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                ព្រឹត្តិការណ៍
              </Button>
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20 hidden md:flex"
                onClick={() => navigate('/trainings/browse')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                ការបណ្តុះបណ្តាល
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/login')}
                className="shadow-lg"
              >
                ចូលប្រព័ន្ធ
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">ប្រព័ន្ធគ្រប់គ្រងទំនើប</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                ប្រព័ន្ធគ្រប់គ្រង
                <span className="block text-white/90 mt-2">
                  ការបណ្តុះបណ្តាល
                </span>
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  និង ព្រឹត្តិការណ៍
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                ដំណោះស្រាយទំនើប សម្រាប់គ្រប់គ្រងការបណ្តុះបណ្តាលគ្រូបង្រៀន ព្រឹត្តិការណ៍អប់រំ និង សន្និសីទជាតិ
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg h-14 shadow-2xl hover:shadow-xl transition-all"
                  onClick={() => navigate('/events/browse')}
                >
                  <CalendarDays className="mr-2 h-5 w-5" />
                  រកមើលព្រឹត្តិការណ៍
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                  onClick={() => navigate('/trainings/browse')}
                >
                  <GraduationCap className="mr-2 h-5 w-5" />
                  ការបណ្តុះបណ្តាល
                </Button>
              </div>
            </div>

            {/* Right Content - 3D Card Showcase */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square">
                {/* Floating Cards Animation */}
                <div className="absolute top-0 right-0 w-64 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <CalendarDays className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">ព្រឹត្តិការណ៍</p>
                          <p className="text-sm text-muted-foreground">Events</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary">250+</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute bottom-20 left-0 w-64 transform -rotate-6 hover:rotate-0 transition-transform duration-500 delay-100">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-secondary/10 rounded-xl">
                          <Users className="h-6 w-6 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold">អ្នកចូលរួម</p>
                          <p className="text-sm text-muted-foreground">Participants</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-secondary">15,000+</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute top-1/3 right-1/4 w-64 transform hover:scale-105 transition-transform duration-500 delay-200">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                          <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold">វិញ្ញាបនប័ត្រ</p>
                          <p className="text-sm text-muted-foreground">Certificates</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600">12,500+</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow border-primary/20">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-sm text-muted-foreground font-medium">ការបណ្តុះបណ្តាល</p>
                <p className="text-xs text-muted-foreground">Training Programs</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-secondary/20">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4">
                  <CalendarDays className="h-8 w-8 text-secondary" />
                </div>
                <p className="text-4xl font-bold text-secondary mb-2">250+</p>
                <p className="text-sm text-muted-foreground font-medium">ព្រឹត្តិការណ៍</p>
                <p className="text-xs text-muted-foreground">Events Hosted</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-green-500/20">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">15K+</p>
                <p className="text-sm text-muted-foreground font-medium">អ្នកចូលរួម</p>
                <p className="text-xs text-muted-foreground">Participants</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow border-orange-500/20">
              <CardContent className="pt-6">
                <div className="mx-auto w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-4xl font-bold text-orange-600 mb-2">12K+</p>
                <p className="text-sm text-muted-foreground font-medium">វិញ្ញាបនប័ត្រ</p>
                <p className="text-xs text-muted-foreground">Certificates</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 text-sm px-4 py-1">មុខងារទំនើប</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              ប្រព័ន្ធគ្រប់គ្រងពេញលេញ
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ដំណោះស្រាយម៉ូឌែនសម្រាប់គ្រប់គ្រងការបណ្តុះបណ្តាល និង ព្រឹត្តិការណ៍
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-primary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <CalendarDays className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">គ្រប់គ្រងព្រឹត្តិការណ៍</h3>
                <p className="text-muted-foreground leading-relaxed">
                  រៀបចំសន្និសីទ សិក្ខាសាលា និង ព្រឹត្តិការណ៍អប់រំជាមួយនឹងប្រព័ន្ធពហុផ្លូវ
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Multi-track Sessions
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-secondary/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <UserCheck className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">ចុះឈ្មោះអនឡាញ</h3>
                <p className="text-muted-foreground leading-relaxed">
                  អនុញ្ញាតឱ្យអ្នកចូលរួមចុះឈ្មោះដោយខ្លួនឯងតាមរយៈអ៊ីនធឺណិត ឬ QR Code
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-secondary font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Self-Service Registration
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-green-500/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Target className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">តាមដានវត្តមាន</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ប្រព័ន្ធតាមដានការចូលរួមដោយស្វ័យប្រវត្តិជាមួយនឹង GPS និង QR Code
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  GPS Tracking & QR
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-blue-500/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Video className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">ព្រឹត្តិការណ៍វឺឈ្វល</h3>
                <p className="text-muted-foreground leading-relaxed">
                  គាំទ្រព្រឹត្តិការណ៍អនឡាញ និង ផ្សំតាមរយៈ Zoom, Teams, Google Meet
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Virtual & Hybrid Events
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-purple-500/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">របាយការណ៍ និង ការវិភាគ</h3>
                <p className="text-muted-foreground leading-relaxed">
                  នាំចេញរបាយការណ៍លម្អិត និង វិភាគទិន្នន័យអ្នកចូលរួមជា Excel
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-purple-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Advanced Analytics
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-orange-500/20">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">ស្វ័យប្រវត្តិកម្ម</h3>
                <p className="text-muted-foreground leading-relaxed">
                  ការចុះឈ្មោះស្វ័យប្រវត្តិ ជូនដំណឹង និង ការអនុម័តដោយស្វ័យប្រវត្តិ
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-orange-600 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Smart Automation
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      {featuredEvents.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 text-sm px-4 py-1">ព្រឹត្តិការណ៍នាពេលខាងមុខ</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                ចូលរួមជាមួយពួកយើង
              </h2>
              <p className="text-xl text-muted-foreground">
                ព្រឹត្តិការណ៍ដែលកំពុងបើកចុះឈ្មោះ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event: Event) => (
                <Card
                  key={event.id}
                  className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/events/${event.id}/details`)}
                >
                  <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
                    {event.banner_image_url ? (
                      <img
                        src={event.banner_image_url}
                        alt={event.event_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CalendarDays className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/95 text-primary shadow-lg">
                        {format(new Date(event.event_start_date), 'MMM dd')}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {event.event_name}
                    </h3>
                    {event.event_name_english && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-1">
                        {event.event_name_english}
                      </p>
                    )}

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {format(new Date(event.event_start_date), 'dd MMM')} -{' '}
                        {format(new Date(event.event_end_date), 'dd MMM yyyy')}
                      </div>
                      {event.event_location && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{event.event_location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {event.current_attendees}/{event.max_attendees} នាក់
                      </div>
                    </div>

                    <Button className="w-full group-hover:bg-primary/90" size="sm">
                      ចុះឈ្មោះឥឡូវនេះ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/events/browse')}
              >
                មើលព្រឹត្តិការណ៍ទាំងអស់
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/20 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-1">
                <CardContent className="bg-background p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        ចាប់ផ្តើមថ្ងៃនេះ
                      </h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        ចូលរួមជាមួយប្រព័ន្ធគ្រប់គ្រងការបណ្តុះបណ្តាល និង ព្រឹត្តិការណ៍ទំនើបបំផុត
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span>ចុះឈ្មោះងាយស្រួល រហ័ស</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span>តាមដានការចូលរួមដោយស្វ័យប្រវត្តិ</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <span>ទទួលបានវិញ្ញាបនប័ត្រឌីជីថល</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full text-lg h-14 shadow-lg"
                        onClick={() => navigate('/events/browse')}
                      >
                        <CalendarDays className="mr-2 h-5 w-5" />
                        រកមើលព្រឹត្តិការណ៍
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full text-lg h-14"
                        onClick={() => navigate('/trainings/browse')}
                      >
                        <GraduationCap className="mr-2 h-5 w-5" />
                        រកមើលការបណ្តុះបណ្តាល
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="w-full text-lg h-14"
                        onClick={() => navigate('/login')}
                      >
                        ចូលប្រព័ន្ធរបស់អ្នក
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">PLP-TMS</h3>
                  <p className="text-xs text-muted-foreground">Training Management System</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                ប្រព័ន្ធគ្រប់គ្រងការបណ្តុះបណ្តាលគ្រូបង្រៀន និង ព្រឹត្តិការណ៍អប់រំ
                របស់ក្រសួងអប់រំ យុវជន និងកីឡា
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">តំណរភ្ជាប់រហ័ស</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate('/events/browse')}>
                    ព្រឹត្តិការណ៍
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate('/trainings/browse')}>
                    ការបណ្តុះបណ្តាល
                  </Button>
                </li>
                <li>
                  <Button variant="link" className="h-auto p-0" onClick={() => navigate('/login')}>
                    ចូលប្រព័ន្ធ
                  </Button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">ទំនាក់ទំនង</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>moeys.gov.kh</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Ministry of Education, Youth and Sport. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
