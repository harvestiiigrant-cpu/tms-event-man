import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  BookOpen,
  ClipboardCheck,
  History,
  User,
  LogOut,
  Bell,
  Home,
  X,
  Clock,
} from 'lucide-react';

interface BeneficiaryPortalLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const navigation = [
  { name: 'Home', href: '/portal/trainings', icon: Home, label: 'ទំព័រដើម', title: 'ការបណ្តុះបណ្តាលរបស់ខ្ញុំ' },
  { name: 'Attendance', href: '/portal/attendance', icon: ClipboardCheck, label: 'ចូលរួម', title: 'ការចូលរួម' },
  { name: 'History', href: '/portal/history', icon: History, label: 'ប្រវត្តិ', title: 'ប្រវត្តិការបណ្តុះបណ្តាល' },
  { name: 'Profile', href: '/portal/profile', icon: User, label: 'ប្រវត្តិរូប', title: 'ប្រវត្តិរូបរបស់ខ្ញុំ' },
];

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    title: 'ការបណ្តុះបណ្តាលនឹងចាប់ផ្តើមឆាប់ៗ',
    message: 'វគ្គបណ្តុះបណ្តាលគណិតវិទ្យានឹងចាប់ផ្តើមក្នុងរយៈពេល ២ ម៉ោង',
    time: '១០ នាទីមុន',
    read: false,
  },
  {
    id: '2',
    title: 'វិញ្ញាបនប័ត្រអាចប្រើបាន',
    message: 'វិញ្ញាបនប័ត្ររបស់អ្នកសម្រាប់គរុកោសល្យភាសាខ្មែររួចរាល់ហើយ',
    time: '១ ម៉ោងមុន',
    read: false,
  },
  {
    id: '3',
    title: 'ការរំលឹកអំពីការចូលរួម',
    message: 'កុំភ្លេចចុះឈ្មោះចូលរួមសម្រាប់វគ្គថ្ងៃនេះ',
    time: '២ ម៉ោងមុន',
    read: true,
  },
];

export function BeneficiaryPortalLayout({ children, title, subtitle }: BeneficiaryPortalLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get current route for bottom nav and page title
  const currentPath = location.pathname;
  const currentPage = navigation.find(
    item => currentPath === item.href || currentPath.startsWith(item.href + '/')
  );
  const pageTitle = title || currentPage?.title || 'Training Portal';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Mobile-Native Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg">
        {/* Status Bar Simulation */}
        <div className="h-6 bg-primary/10 flex items-center justify-end px-4">
          <div className="flex items-center gap-1">
            {/* Status bar icons (simulated) */}
            <div className="h-3 w-3 rounded-full bg-white/40" />
            <div className="h-3 w-3 rounded-full bg-white/40" />
          </div>
        </div>

        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Dynamic Title */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl !bg-white shadow-lg border-2 !border-white"
                style={{ backgroundColor: '#ffffff' }}
              >
                <BookOpen className="h-6 w-6 !text-primary" style={{ color: '#0d9488' }} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{pageTitle}</h2>
                <p className="text-xs text-primary-foreground/80 line-clamp-1">{user?.school}</p>
              </div>
            </div>

            {/* Notifications & Profile */}
            <div className="flex items-center gap-2">
              {/* Notification Sheet */}
              <Sheet open={notificationOpen} onOpenChange={setNotificationOpen}>
                <SheetTrigger asChild>
                  <button
                    className="h-10 w-10 rounded-full flex items-center justify-center relative cursor-pointer"
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#0d9488',
                      border: '2px solid #ffffff',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          border: '2px solid #ffffff',
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-full sm:max-w-md !bg-white"
                  style={{ backgroundColor: '#ffffff' }}
                >
                  <SheetHeader>
                    <div className="flex items-center justify-between">
                      <SheetTitle>ការជូនដំណឹង</SheetTitle>
                      {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                          សម្គាល់ទាំងអស់ថាបានអាន
                        </Button>
                      )}
                    </div>
                  </SheetHeader>
                  <div className="mt-6 space-y-3">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-sm text-muted-foreground">គ្មានការជូនដំណឹង</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            'p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md',
                            notification.read
                              ? 'bg-background border-border'
                              : 'bg-primary/5 border-primary/20'
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm">{notification.title}</h4>
                                {!notification.read && (
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{notification.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-white">
                    <Avatar className="h-10 w-10 border-2 !border-white shadow-lg" style={{ borderColor: '#ffffff' }}>
                      <AvatarImage src={user?.profile_image_url} alt={user?.name} />
                      <AvatarFallback className="!bg-white !text-primary font-semibold" style={{ backgroundColor: '#ffffff', color: '#0d9488' }}>
                        {user?.name?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                      <p className="text-sm font-semibold leading-none">{user?.name}</p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="font-medium">ID:</span> {user?.teacher_id}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{user?.school}</p>
                        <p className="text-xs text-muted-foreground">{user?.province_name}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/portal/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>មើលប្រវត្តិរូប</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ចាកចេញ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Page Subtitle (optional) */}
          {subtitle && (
            <div className="mt-3">
              <p className="text-sm text-primary-foreground/80">{subtitle}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation (Mobile Native Style) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="grid h-20 grid-cols-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || currentPath.startsWith(item.href + '/');

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 transition-all duration-200',
                  'hover:bg-muted/50 active:scale-95',
                  isActive && 'relative'
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-primary" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'text-xs font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe Area for iOS devices */}
        <div className="h-safe-bottom bg-background" />
      </nav>
    </div>
  );
}
