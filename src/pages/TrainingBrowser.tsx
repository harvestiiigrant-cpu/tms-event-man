import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  ChevronRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { CompactBrandHeader } from '@/components/branding/BrandHeader';

// Categories with icons and colors
const categories = [
  { code: 'MATH', label: 'Mathematics', icon: '📐', color: 'from-purple-500 to-purple-600' },
  { code: 'KHMER', label: 'Khmer Language', icon: '📝', color: 'from-blue-500 to-blue-600' },
  { code: 'IT', label: 'Information Technology', icon: '💻', color: 'from-cyan-500 to-cyan-600' },
  { code: 'PEDAGOGY', label: 'Pedagogy & Teaching', icon: '👥', color: 'from-green-500 to-green-600' },
  { code: 'LEADERSHIP', label: 'Leadership Development', icon: '🎯', color: 'from-orange-500 to-orange-600' },
];

const provinces = [
  'Phnom Penh', 'Kandal', 'Siem Reap', 'Battambang', 'Kampong Cham',
  'Kampong Thom', 'Prey Veng', 'Takeo', 'Kampot', 'Pursat',
];

const trainingLevels = ['SCHOOL', 'CLUSTER', 'DISTRICT', 'PROVINCIAL', 'NATIONAL'];

export default function TrainingBrowser() {
  const navigate = useNavigate();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('date');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch published trainings
  const { data: allTrainings = [] } = useQuery({
    queryKey: ['trainings-public'],
    queryFn: api.trainings.getAll,
  });

  // Available trainings (published and ongoing/draft)
  const availableTrainings = allTrainings.filter(
    (t: any) => t.is_published && (t.training_status === 'ONGOING' || t.training_status === 'DRAFT')
  );

  // Apply filters
  const filteredTrainings = useMemo(() => {
    let filtered = [...availableTrainings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.training_name?.toLowerCase().includes(query) ||
          t.training_name_english?.toLowerCase().includes(query) ||
          t.training_code.toLowerCase().includes(query) ||
          t.training_location?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'ALL') {
      filtered = filtered.filter((t) => t.training_category === selectedCategory);
    }

    // Province filter
    if (selectedProvince !== 'ALL') {
      filtered = filtered.filter((t) => t.training_location === selectedProvince);
    }

    // Level filter
    if (selectedLevel !== 'ALL') {
      filtered = filtered.filter((t) => t.training_level === selectedLevel);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.training_start_date).getTime() - new Date(b.training_start_date).getTime();
        case 'name':
          return (a.training_name_english || '').localeCompare(b.training_name_english || '');
        case 'location':
          return (a.training_location || '').localeCompare(b.training_location || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [availableTrainings, searchQuery, selectedCategory, selectedProvince, selectedLevel, sortBy]);

  // Active filters count
  const activeFiltersCount = [
    selectedCategory !== 'ALL',
    selectedProvince !== 'ALL',
    selectedLevel !== 'ALL',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedCategory('ALL');
    setSelectedProvince('ALL');
    setSelectedLevel('ALL');
    setSearchQuery('');
  };

  const getCategoryConfig = (code: string) => {
    return categories.find((c) => c.code === code) || categories[0];
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm shadow-sm">
        <div className="container py-3">
          <CompactBrandHeader className="mb-3" />
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold">Browse Trainings</h1>
            <p className="text-xs text-muted-foreground">{filteredTrainings.length} available</p>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-4 pb-20 space-y-4">
        {/* Quick Category Filters */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Categories</h2>
            {activeFiltersCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                Clear all
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <Card
                key={cat.code}
                onClick={() => setSelectedCategory(selectedCategory === cat.code ? 'ALL' : cat.code)}
                className={cn(
                  'cursor-pointer transition-all active:scale-95',
                  selectedCategory === cat.code
                    ? 'border-primary shadow-md'
                    : 'border-border'
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-2xl',
                      cat.color
                    )}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{cat.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {availableTrainings.filter(t => t.training_category === cat.code).length} trainings
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Filters & Sort */}
        <div className="flex gap-2">
          {/* Filters Sheet */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex-1 h-12 relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 flex items-center justify-center p-0 bg-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Province Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Province</label>
                  <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Provinces</SelectItem>
                      {provinces.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p} ({availableTrainings.filter(t => t.training_location === p).length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Training Level</label>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Levels</SelectItem>
                      {trainingLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level} ({availableTrainings.filter(t => t.training_level === level).length})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={clearFilters} className="flex-1 h-12">
                    Clear All
                  </Button>
                  <Button onClick={() => setFiltersOpen(false)} className="flex-1 h-12">
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="name">By Name</SelectItem>
              <SelectItem value="location">By Location</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Training List */}
        <div className="space-y-3">
          {filteredTrainings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Trainings Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredTrainings.map((training) => {
              const categoryConfig = getCategoryConfig(training.training_category);
              return (
                <Card
                  key={training.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/enroll?training=${training.id}`)}
                >
                  <CardContent className="p-0">
                    {/* Gradient Header */}
                    <div className={cn(
                      'p-4 pb-3 bg-gradient-to-br',
                      categoryConfig.color
                    )}>
                      <div className="flex items-start justify-between gap-3 text-white">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                              {training.training_category}
                            </Badge>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/20">
                              {training.training_level}
                            </Badge>
                          </div>
                          <h3 className="font-semibold line-clamp-1">{training.training_name}</h3>
                          <p className="text-sm text-white/90 line-clamp-1">{training.training_name_english}</p>
                          <p className="text-xs text-white/70 mt-1">{training.training_code}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 flex-shrink-0" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {format(parseISO(training.training_start_date), 'MMM d')} - {format(parseISO(training.training_end_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground line-clamp-1">
                            {training.training_location} • {training.training_venue}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-muted-foreground">
                            {training.current_participants || 0} / {training.max_participants} enrolled
                          </span>
                        </div>
                      </div>

                      <Button className="w-full h-12">
                        Enroll Now
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
