import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useFont, KHMER_FONTS } from '@/contexts/FontContext';
import { useTelegram } from '@/contexts/TelegramContext';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Moon, Sun, Type, LogOut, Bell } from 'lucide-react';

export default function TelegramSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { khmerFont, setKhmerFont } = useFont();
  const { hideMainButton } = useTelegram();
  const [notifications, setNotifications] = useState({
    trainingReminders: true,
    certificateReady: true,
    newTrainings: true,
  });

  useEffect(() => {
    hideMainButton?.();
  }, [hideMainButton]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <TelegramLayout title="Settings">
      <div className="space-y-6">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Name</Label>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1">Teacher ID</Label>
              <p className="font-medium text-sm">{user?.teacher_id}</p>
            </div>
            {user?.school && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1">School</Label>
                <p className="font-medium text-sm line-clamp-2">{user.school}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'system'].map((t) => (
                  <Button
                    key={t}
                    variant={theme === t ? 'default' : 'outline'}
                    size="sm"
                    className="justify-center"
                    onClick={() => setTheme(t as 'light' | 'dark' | 'system')}
                  >
                    {t === 'light' && <Sun className="h-4 w-4 mr-1" />}
                    {t === 'dark' && <Moon className="h-4 w-4 mr-1" />}
                    {t === 'system' && <span>⚙️</span>}
                    <span className="capitalize text-xs">{t}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Font Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Font</CardTitle>
            <CardDescription>Khmer Text Display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              <Select value={khmerFont} onValueChange={setKhmerFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KHMER_FONTS.map((font) => (
                    <SelectItem
                      key={font.value}
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.labelKm}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted rounded text-sm" style={{ fontFamily: khmerFont }}>
              សូមបង្ហាញតម្លៃស្នារាង នៃពុម្ពអក្សរ
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm cursor-pointer">
                  Training Reminders
                </Label>
              </div>
              <Switch
                checked={notifications.trainingReminders}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, trainingReminders: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm cursor-pointer">
                Certificate Ready
              </Label>
              <Switch
                checked={notifications.certificateReady}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, certificateReady: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm cursor-pointer">
                New Trainings Available
              </Label>
              <Switch
                checked={notifications.newTrainings}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, newTrainings: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">App Version: </span>
              <span className="font-medium">1.0.0</span>
            </p>
            <p>
              <span className="text-muted-foreground">Platform: </span>
              <span className="font-medium">Telegram Mini App</span>
            </p>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          variant="destructive"
          className="w-full h-11"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </TelegramLayout>
  );
}
