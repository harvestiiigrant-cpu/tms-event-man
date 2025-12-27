import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useRef } from 'react';
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

// Custom hook for scroll animations
function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

// Animated counter hook
function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, hasAnimated]);

  return { count, setHasAnimated };
}

export default function HomePage() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Fetch upcoming events for preview
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['events-upcoming'],
    queryFn: api.events.getPublic,
  });

  const featuredEvents = upcomingEvents.slice(0, 3);

  // Parallax mouse effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll animations
  const statsSection = useScrollAnimation();
  const featuresSection = useScrollAnimation();
  const eventsSection = useScrollAnimation();
  const ctaSection = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Fully Animated */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 min-h-[100vh] flex items-center pb-20">
        {/* Animated Background Elements with Parallax */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div
            className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"
            style={{
              animationDelay: '1s',
              transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />
          <div
            className="absolute top-1/4 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-pulse"
            style={{
              animationDelay: '0.5s',
              transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              transition: 'transform 0.3s ease-out',
            }}
          />

          {/* Floating particles */}
          <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        </div>

        {/* Navigation Bar - Slide down animation */}
        <nav className="absolute top-0 left-0 right-0 z-20 backdrop-blur-sm bg-black/10">
          <div className="container mx-auto px-4 py-6 animate-in slide-in-from-top duration-1000">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left duration-1000">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-2xl hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">PLP-TMS</h1>
                  <p className="text-xs text-white/90">Professional Learning Program</p>
                </div>
              </div>
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-1000">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 hidden md:flex hover:scale-105 transition-all"
                  onClick={() => navigate('/events/browse')}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  ព្រឹត្តិការណ៍
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 hidden md:flex hover:scale-105 transition-all"
                  onClick={() => navigate('/trainings/browse')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  ការបណ្តុះបណ្តាល
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/login')}
                  className="shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  ចូលប្រព័ន្ធ
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
            {/* Left Content - Fade in from left */}
            <div className="text-white space-y-8 animate-in fade-in slide-in-from-left duration-1000 delay-300">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 hover:bg-white/30 transition-all cursor-default">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-medium">ប្រព័ន្ធគ្រប់គ្រងទំនើប</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="inline-block animate-in fade-in slide-in-from-bottom duration-700 delay-500">
                  ប្រព័ន្ធគ្រប់គ្រង
                </span>
                <span className="block text-white/90 mt-2 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
                  ការបណ្តុះបណ្តាល
                </span>
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom duration-700 delay-900">
                  និង ព្រឹត្តិការណ៍
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl animate-in fade-in slide-in-from-bottom duration-700 delay-1000">
                ដំណោះស្រាយទំនើប សម្រាប់គ្រប់គ្រងការបណ្តុះបណ្តាលគ្រូបង្រៀន ព្រឹត្តិការណ៍អប់រំ និង សន្និសីទជាតិ
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-1100">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-lg h-14 shadow-2xl hover:shadow-xl hover:scale-105 transition-all group"
                  onClick={() => navigate('/events/browse')}
                >
                  <CalendarDays className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  រកមើលព្រឹត្តិការណ៍
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm hover:scale-105 transition-all group"
                  onClick={() => navigate('/trainings/browse')}
                >
                  <GraduationCap className="mr-2 h-5 w-5 group-hover:-rotate-12 transition-transform" />
                  ការបណ្តុះបណ្តាល
                </Button>
              </div>
            </div>

            {/* Right Content - 3D Card Showcase with Staggered Animation */}
            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-square">
                {/* Floating Cards Animation */}
                <div className="absolute top-0 right-0 w-64 transform rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 animate-in fade-in zoom-in delay-700">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm hover:shadow-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-primary/10 rounded-xl group-hover:rotate-12 transition-transform">
                          <CalendarDays className="h-6 w-6 text-primary animate-pulse" />
                        </div>
                        <div>
                          <p className="font-semibold">ព្រឹត្តិការណ៍</p>
                          <p className="text-sm text-muted-foreground">Events</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-primary animate-pulse">250+</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute bottom-20 left-0 w-64 transform -rotate-6 hover:rotate-0 hover:scale-110 transition-all duration-500 delay-100 animate-in fade-in zoom-in delay-1000">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm hover:shadow-secondary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-secondary/10 rounded-xl">
                          <Users className="h-6 w-6 text-secondary animate-pulse" />
                        </div>
                        <div>
                          <p className="font-semibold">អ្នកចូលរួម</p>
                          <p className="text-sm text-muted-foreground">Participants</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-secondary animate-pulse">15,000+</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="absolute top-1/3 right-1/4 w-64 transform hover:scale-110 transition-all duration-500 delay-200 animate-in fade-in zoom-in delay-1300">
                  <Card className="shadow-2xl border-white/20 bg-white/95 backdrop-blur-sm hover:shadow-green-500/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                          <Award className="h-6 w-6 text-green-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-semibold">វិញ្ញាបនប័ត្រ</p>
                          <p className="text-sm text-muted-foreground">Certificates</p>
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-green-600 animate-pulse">12,500+</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animated Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0 animate-in fade-in slide-in-from-bottom duration-1000">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section - Animated Counters */}
      <section className="py-16 bg-background" ref={statsSection.ref}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={<GraduationCap className="h-8 w-8 text-primary" />}
              end={500}
              suffix="+"
              label="ការបណ្តុះបណ្តាល"
              sublabel="Training Programs"
              color="primary"
              delay={0}
              isVisible={statsSection.isVisible}
            />
            <StatCard
              icon={<CalendarDays className="h-8 w-8 text-secondary" />}
              end={250}
              suffix="+"
              label="ព្រឹត្តិការណ៍"
              sublabel="Events Hosted"
              color="secondary"
              delay={100}
              isVisible={statsSection.isVisible}
            />
            <StatCard
              icon={<Users className="h-8 w-8 text-green-600" />}
              end={15000}
              suffix="+"
              label="អ្នកចូលរួម"
              sublabel="Participants"
              color="green"
              delay={200}
              isVisible={statsSection.isVisible}
            />
            <StatCard
              icon={<Award className="h-8 w-8 text-orange-600" />}
              end={12500}
              suffix="+"
              label="វិញ្ញាបនប័ត្រ"
              sublabel="Certificates"
              color="orange"
              delay={300}
              isVisible={statsSection.isVisible}
            />
          </div>
        </div>
      </section>

      {/* Features Section - Staggered Animation */}
      <section className="py-20 bg-muted/30" ref={featuresSection.ref}>
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-1000 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="mb-4 text-sm px-4 py-1 animate-in fade-in zoom-in">មុខងារទំនើប</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-in fade-in slide-in-from-bottom duration-700">
              ប្រព័ន្ធគ្រប់គ្រងពេញលេញ
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              ដំណោះស្រាយម៉ូឌែនសម្រាប់គ្រប់គ្រងការបណ្តុះបណ្តាល និង ព្រឹត្តិការណ៍
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CalendarDays className="h-7 w-7 text-white" />}
              title="គ្រប់គ្រងព្រឹត្តិការណ៍"
              description="រៀបចំសន្និសីទ សិក្ខាសាលា និង ព្រឹត្តិការណ៍អប់រំជាមួយនឹងប្រព័ន្ធពហុផ្លូវ"
              feature="Multi-track Sessions"
              gradient="from-primary to-primary/70"
              delay={0}
              isVisible={featuresSection.isVisible}
            />
            <FeatureCard
              icon={<UserCheck className="h-7 w-7 text-white" />}
              title="ចុះឈ្មោះអនឡាញ"
              description="អនុញ្ញាតឱ្យអ្នកចូលរួមចុះឈ្មោះដោយខ្លួនឯងតាមរយៈអ៊ីនធឺណិត ឬ QR Code"
              feature="Self-Service Registration"
              gradient="from-secondary to-secondary/70"
              delay={100}
              isVisible={featuresSection.isVisible}
            />
            <FeatureCard
              icon={<Target className="h-7 w-7 text-white" />}
              title="តាមដានវត្តមាន"
              description="ប្រព័ន្ធតាមដានការចូលរួមដោយស្វ័យប្រវត្តិជាមួយនឹង GPS និង QR Code"
              feature="GPS Tracking & QR"
              gradient="from-green-500 to-green-600"
              delay={200}
              isVisible={featuresSection.isVisible}
            />
            <FeatureCard
              icon={<Video className="h-7 w-7 text-white" />}
              title="ព្រឹត្តិការណ៍វឺឈ្វល"
              description="គាំទ្រព្រឹត្តិការណ៍អនឡាញ និង ផ្សំតាមរយៈ Zoom, Teams, Google Meet"
              feature="Virtual & Hybrid Events"
              gradient="from-blue-500 to-blue-600"
              delay={300}
              isVisible={featuresSection.isVisible}
            />
            <FeatureCard
              icon={<TrendingUp className="h-7 w-7 text-white" />}
              title="របាយការណ៍ និង ការវិភាគ"
              description="នាំចេញរបាយការណ៍លម្អិត និង វិភាគទិន្នន័យអ្នកចូលរួមជា Excel"
              feature="Advanced Analytics"
              gradient="from-purple-500 to-purple-600"
              delay={400}
              isVisible={featuresSection.isVisible}
            />
            <FeatureCard
              icon={<Zap className="h-7 w-7 text-white" />}
              title="ស្វ័យប្រវត្តិកម្ម"
              description="ការចុះឈ្មោះស្វ័យប្រវត្តិ ជូនដំណឹង និង ការអនុម័តដោយស្វ័យប្រវត្តិ"
              feature="Smart Automation"
              gradient="from-orange-500 to-orange-600"
              delay={500}
              isVisible={featuresSection.isVisible}
            />
          </div>
        </div>
      </section>

      {/* Upcoming Events Section - Slide in Animation */}
      {featuredEvents.length > 0 && (
        <section className="py-20 bg-background" ref={eventsSection.ref}>
          <div className="container mx-auto px-4">
            <div className={`text-center mb-12 transition-all duration-1000 ${eventsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge className="mb-4 text-sm px-4 py-1">ព្រឹត្តិការណ៍នាពេលខាងមុខ</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                ចូលរួមជាមួយពួកយើង
              </h2>
              <p className="text-xl text-muted-foreground">
                ព្រឹត្តិការណ៍ដែលកំពុងបើកចុះឈ្មោះ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredEvents.map((event: Event, index: number) => (
                <EventCard
                  key={event.id}
                  event={event}
                  delay={index * 200}
                  isVisible={eventsSection.isVisible}
                  onClick={() => navigate(`/events/${event.id}/details`)}
                />
              ))}
            </div>

            <div className={`text-center mt-12 transition-all duration-1000 delay-500 ${eventsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/events/browse')}
                className="group hover:scale-105 transition-all"
              >
                មើលព្រឹត្តិការណ៍ទាំងអស់
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Animated */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5" ref={ctaSection.ref}>
        <div className="container mx-auto px-4">
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${ctaSection.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <Card className="border-primary/20 shadow-2xl overflow-hidden hover:shadow-primary/20 transition-shadow">
              <div className="bg-gradient-to-r from-primary to-primary/80 p-1 animate-gradient">
                <CardContent className="bg-background p-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-6">
                      <h2 className="text-3xl md:text-4xl font-bold">
                        ចាប់ផ្តើមថ្ងៃនេះ
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        ចូលរួមជាមួយប្រព័ន្ធគ្រប់គ្រងការបណ្តុះបណ្តាល និង ព្រឹត្តិការណ៍ទំនើបបំផុត
                      </p>
                      <div className="space-y-2">
                        {[
                          'ចុះឈ្មោះងាយស្រួល រហ័ស',
                          'តាមដានការចូលរួមដោយស្វ័យប្រវត្តិ',
                          'ទទួលបានវិញ្ញាបនប័ត្រឌីជីថល'
                        ].map((text, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-sm transition-all duration-500 ${ctaSection.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                            style={{ transitionDelay: `${i * 100}ms` }}
                          >
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button
                        size="lg"
                        className="w-full text-lg h-14 shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                        onClick={() => navigate('/events/browse')}
                      >
                        <CalendarDays className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                        រកមើលព្រឹត្តិការណ៍
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full text-lg h-14 hover:scale-105 transition-all group"
                        onClick={() => navigate('/trainings/browse')}
                      >
                        <GraduationCap className="mr-2 h-5 w-5 group-hover:-rotate-12 transition-transform" />
                        រកមើលការបណ្តុះបណ្តាល
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="w-full text-lg h-14 hover:scale-105 transition-all group"
                        onClick={() => navigate('/login')}
                      >
                        ចូលប្រព័ន្ធរបស់អ្នក
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
            <div className="md:col-span-2 animate-in fade-in slide-in-from-left duration-1000">
              <div className="flex items-center gap-3 mb-4 group cursor-pointer">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg group-hover:scale-110 transition-transform">
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

            <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
              <h4 className="font-semibold mb-4">តំណរភ្ជាប់រហ័ស</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Button
                    variant="link"
                    className="h-auto p-0 hover:translate-x-1 transition-transform"
                    onClick={() => navigate('/events/browse')}
                  >
                    ព្រឹត្តិការណ៍
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="h-auto p-0 hover:translate-x-1 transition-transform"
                    onClick={() => navigate('/trainings/browse')}
                  >
                    ការបណ្តុះបណ្តាល
                  </Button>
                </li>
                <li>
                  <Button
                    variant="link"
                    className="h-auto p-0 hover:translate-x-1 transition-transform"
                    onClick={() => navigate('/login')}
                  >
                    ចូលប្រព័ន្ធ
                  </Button>
                </li>
              </ul>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              <h4 className="font-semibold mb-4">ទំនាក់ទំនង</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Globe className="h-4 w-4" />
                  <span>moeys.gov.kh</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground animate-in fade-in duration-1000 delay-500">
            <p>© 2025 Ministry of Education, Youth and Sport. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animated Stat Card Component
function StatCard({
  icon,
  end,
  suffix,
  label,
  sublabel,
  color,
  delay,
  isVisible,
}: {
  icon: React.ReactNode;
  end: number;
  suffix: string;
  label: string;
  sublabel: string;
  color: string;
  delay: number;
  isVisible: boolean;
}) {
  const { count, setHasAnimated } = useCounter(end);

  useEffect(() => {
    if (isVisible) {
      setHasAnimated(true);
    }
  }, [isVisible, setHasAnimated]);

  const borderColor = {
    primary: 'border-primary/20 hover:border-primary/40',
    secondary: 'border-secondary/20 hover:border-secondary/40',
    green: 'border-green-500/20 hover:border-green-500/40',
    orange: 'border-orange-500/20 hover:border-orange-500/40',
  }[color];

  const bgColor = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    green: 'bg-green-100 dark:bg-green-900/20',
    orange: 'bg-orange-100 dark:bg-orange-900/20',
  }[color];

  const textColor = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    green: 'text-green-600',
    orange: 'text-orange-600',
  }[color];

  return (
    <Card
      className={`text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-500 ${borderColor} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="pt-6">
        <div className={`mx-auto w-16 h-16 ${bgColor} rounded-2xl flex items-center justify-center mb-4 hover:rotate-12 transition-transform duration-300`}>
          {icon}
        </div>
        <p className={`text-4xl font-bold ${textColor} mb-2`}>
          {isVisible ? count.toLocaleString() : '0'}{suffix}
        </p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{sublabel}</p>
      </CardContent>
    </Card>
  );
}

// Animated Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  feature,
  gradient,
  delay,
  isVisible,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  feature: string;
  gradient: string;
  delay: number;
  isVisible: boolean;
}) {
  return (
    <Card
      className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-primary/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-8">
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-4">
          {description}
        </p>
        <div className="flex items-center gap-2 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
          <CheckCircle2 className="h-4 w-4" />
          {feature}
        </div>
      </CardContent>
    </Card>
  );
}

// Animated Event Card Component
function EventCard({
  event,
  delay,
  isVisible,
  onClick,
}: {
  event: Event;
  delay: number;
  isVisible: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={`group hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer overflow-hidden ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="h-48 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
        {event.banner_image_url ? (
          <img
            src={event.banner_image_url}
            alt={event.event_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <CalendarDays className="h-16 w-16 text-primary/40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
          </div>
        )}
        <div className="absolute top-4 right-4 animate-in fade-in zoom-in delay-500">
          <Badge className="bg-white/95 text-primary shadow-lg hover:scale-110 transition-transform">
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
          <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <Clock className="h-4 w-4" />
            {format(new Date(event.event_start_date), 'dd MMM')} -{' '}
            {format(new Date(event.event_end_date), 'dd MMM yyyy')}
          </div>
          {event.event_location && (
            <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{event.event_location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            {event.current_attendees}/{event.max_attendees} នាក់
          </div>
        </div>

        <Button
          className="w-full group-hover:bg-primary/90 group-hover:scale-105 transition-all"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          ចុះឈ្មោះឥឡូវនេះ
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
