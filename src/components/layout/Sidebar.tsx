import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebar } from '@/contexts/SidebarContext';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const navItems = [
  { path: '/', label: 'ផ្ទាំងគ្រប់គ្រង', labelEn: 'Dashboard', icon: LayoutDashboard },
  { path: '/trainings', label: 'ការបណ្តុះបណ្តាល', labelEn: 'Trainings', icon: GraduationCap },
  { path: '/beneficiaries', label: 'អ្នកទទួលផល', labelEn: 'Beneficiaries', icon: Users },
  { path: '/attendance', label: 'ការចូលរួម', labelEn: 'Attendance', icon: ClipboardCheck },
];

const bottomItems = [
  { path: '/settings', label: 'ការកំណត់', labelEn: 'Settings', icon: Settings },
];

export function Sidebar({ isMobileMenuOpen = false, onMobileMenuClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleCollapsed } = useSidebar();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onMobileMenuClose?.();
  };

  const handleNavClick = () => {
    // Close mobile menu when navigating
    onMobileMenuClose?.();
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col shadow-lg',
        // Desktop behavior
        'lg:translate-x-0',
        isCollapsed ? 'lg:w-16' : 'lg:w-64',
        // Mobile behavior
        'w-72',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {(!isCollapsed || isMobileMenuOpen) && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground text-lg">TMS</span>
              <p className="text-[10px] text-muted-foreground leading-none">ប្រព័ន្ធគ្រប់គ្រងការបណ្តុះបណ្តាល</p>
            </div>
          </div>
        )}

        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isMobileMenuOpen) {
              onMobileMenuClose?.();
            } else {
              toggleCollapsed();
            }
          }}
          className={cn('h-8 w-8', isCollapsed && !isMobileMenuOpen && 'mx-auto')}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Info - Mobile Only */}
      {isMobileMenuOpen && user && (
        <div className="px-4 py-3 border-b border-border bg-primary/5">
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {user.role === 'SUPER_ADMIN' ? 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់' : 'អ្នកគ្រប់គ្រង'}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showLabel = !isCollapsed || isMobileMenuOpen;

          const linkContent = (
            <Link
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !showLabel && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {showLabel && <span>{item.label}</span>}
            </Link>
          );

          if (!showLabel) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-border px-2 py-4 space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          const showLabel = !isCollapsed || isMobileMenuOpen;

          const linkContent = (
            <Link
              to={item.path}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !showLabel && 'justify-center px-2'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {showLabel && <span>{item.label}</span>}
            </Link>
          );

          if (!showLabel) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}

        {/* Logout Button */}
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive',
                !(!isCollapsed || isMobileMenuOpen) && 'justify-center px-2'
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {(!isCollapsed || isMobileMenuOpen) && <span>ចាកចេញ</span>}
            </button>
          </TooltipTrigger>
          {isCollapsed && !isMobileMenuOpen && (
            <TooltipContent side="right" className="font-medium">
              ចាកចេញ
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </aside>
  );
}
