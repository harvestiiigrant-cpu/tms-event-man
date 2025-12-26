import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { BeneficiaryPortalLayout } from '@/components/layout/BeneficiaryPortalLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPinned,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

// Mock training data
const mockTraining = {
  id: '1',
  training_code: 'TR-2024-001',
  training_name: 'វគ្គបណ្តុះបណ្តាលគណិតវិទ្យា',
  training_location: 'Phnom Penh',
  training_venue: 'Ministry of Education',
  training_start_date: '2024-01-15',
  training_end_date: '2024-01-20',
  gps_validation_required: true,
  geofence_validation_required: true,
  venue_latitude: 11.5564,
  venue_longitude: 104.9282,
  geofence_radius: 100,
};

// Mock today's attendance
const mockTodayAttendance = {
  date: new Date().toISOString().split('T')[0],
  morning_in: '08:00',
  morning_out: null,
  afternoon_in: null,
  afternoon_out: null,
};

export default function AttendanceCheckin() {
  const { trainingId } = useParams();
  const [training] = useState(mockTraining);
  const [todayAttendance, setTodayAttendance] = useState(mockTodayAttendance);
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Get current GPS location
  const getCurrentLocation = async (): Promise<GeolocationPosition> => {
    setLoadingLocation(true);
    setLocationError(null);

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = 'កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រទីតាំងភូមិសាស្ត្រទេ';
        setLocationError(error);
        setLoadingLocation(false);
        reject(new Error(error));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCurrentPosition(geoPosition);
          setLoadingLocation(false);
          resolve(geoPosition);
        },
        (error) => {
          let errorMessage = 'មិនអាចទាញយកទីតាំងរបស់អ្នកបានទេ';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'ការអនុញ្ញាតទីតាំងត្រូវបានបដិសេធ។ សូមបើកការចូលប្រើទីតាំង។';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'ព័ត៌មានទីតាំងមិនមានទេ។';
              break;
            case error.TIMEOUT:
              errorMessage = 'សំណើរទីតាំងផុតកំណត់។';
              break;
          }
          setLocationError(errorMessage);
          setLoadingLocation(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Check if within geofence
  const isWithinGeofence = (position: GeolocationPosition): boolean => {
    if (!training.geofence_validation_required) return true;

    const distance = calculateDistance(
      position.latitude,
      position.longitude,
      training.venue_latitude!,
      training.venue_longitude!
    );

    return distance <= training.geofence_radius;
  };

  // Handle check-in/out
  const handleCheckInOut = async (type: 'morning_in' | 'morning_out' | 'afternoon_in' | 'afternoon_out') => {
    setCheckingIn(type);

    try {
      // Get location if GPS validation required
      let position: GeolocationPosition | null = currentPosition;
      if (training.gps_validation_required || training.geofence_validation_required) {
        position = await getCurrentLocation();

        // Check geofence if required
        if (training.geofence_validation_required && !isWithinGeofence(position)) {
          const distance = calculateDistance(
            position.latitude,
            position.longitude,
            training.venue_latitude!,
            training.venue_longitude!
          );
          toast({
            title: 'នៅក្រៅរង្វង់ Geofence',
            description: `អ្នកស្ថិតនៅ ${Math.round(distance)}ម ពីទីកន្លែង។ អ្នកត្រូវស្ថិតក្នុងរង្វង់ ${training.geofence_radius}ម ដើម្បីចុះឈ្មោះ។`,
            variant: 'destructive',
          });
          setCheckingIn(null);
          return;
        }
      }

      // Record attendance
      const currentTime = format(new Date(), 'HH:mm');
      setTodayAttendance({
        ...todayAttendance,
        [type]: currentTime,
      });

      const typeLabels: Record<string, string> = {
        morning_in: 'ចូលពេលព្រឹក',
        morning_out: 'ចេញពេលព្រឹក',
        afternoon_in: 'ចូលពេលរសៀល',
        afternoon_out: 'ចេញពេលរសៀល',
      };
      toast({
        title: 'ចុះឈ្មោះបានជោគជ័យ',
        description: `${typeLabels[type]} បានកត់ត្រានៅម៉ោង ${currentTime}`,
      });
    } catch (error) {
      toast({
        title: 'ការចុះឈ្មោះបរាជ័យ',
        description: error instanceof Error ? error.message : 'បរាជ័យក្នុងការកត់ត្រាការចូលរួម',
        variant: 'destructive',
      });
    } finally {
      setCheckingIn(null);
    }
  };

  // Load location on mount if GPS required
  useEffect(() => {
    if (training.gps_validation_required || training.geofence_validation_required) {
      getCurrentLocation().catch(() => {
        // Error already handled in getCurrentLocation
      });
    }
  }, []);

  const getCheckInStatus = (value: string | null) => {
    if (value) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-semibold">{value}</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <XCircle className="h-5 w-5" />
        <span>មិនទាន់បានកត់ត្រា</span>
      </div>
    );
  };

  return (
    <BeneficiaryPortalLayout>
      <div className="space-y-4">
        {/* Training Info - Compact Card */}
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg line-clamp-1">{training.training_name}</h3>
                <p className="text-xs text-muted-foreground">{training.training_code}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="line-clamp-1">{training.training_location}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* GPS Status */}
        {(training.gps_validation_required || training.geofence_validation_required) && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPinned className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">ការផ្ទៀងផ្ទាត់ទីតាំង</h3>
              </div>

              {loadingLocation && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">កំពុងទាញយកទីតាំងរបស់អ្នក...</p>
                  </div>
                </div>
              )}

              {locationError && (
                <div className="rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-900 dark:text-red-100">{locationError}</p>
                  </div>
                </div>
              )}

              {currentPosition && !locationError && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">បានរកឃើញទីតាំង</p>
                        <p className="text-xs text-green-700 dark:text-green-300">ភាពត្រឹមត្រូវ: {Math.round(currentPosition.accuracy)}ម</p>
                      </div>
                    </div>
                  </div>

                  {training.geofence_validation_required && (
                    <div className={`rounded-xl border p-4 ${
                      isWithinGeofence(currentPosition)
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-start gap-3">
                        {isWithinGeofence(currentPosition) ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-green-900 dark:text-green-100">នៅក្នុងរង្វង់ Geofence</p>
                              <p className="text-xs text-green-700 dark:text-green-300">អ្នកស្ថិតក្នុងរង្វង់ {training.geofence_radius}ម ពីទីកន្លែង</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-900 dark:text-red-100">នៅក្រៅរង្វង់ Geofence</p>
                              <p className="text-xs text-red-700 dark:text-red-300">
                                អ្នកស្ថិតនៅ {Math.round(
                                  calculateDistance(
                                    currentPosition.latitude,
                                    currentPosition.longitude,
                                    training.venue_latitude!,
                                    training.venue_longitude!
                                  )
                                )}ម ពីទីកន្លែង (ត្រូវស្ថិតក្នុងរង្វង់ {training.geofence_radius}ម)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!loadingLocation && !currentPosition && (
                <Button onClick={() => getCurrentLocation()} className="w-full h-12" size="lg">
                  <MapPinned className="mr-2 h-5 w-5" />
                  ទាញយកទីតាំងរបស់ខ្ញុំ
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Morning Session */}
        <Card className="overflow-hidden border-2 shadow-md bg-gradient-to-br from-orange-500 to-amber-500">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 pb-3 text-white">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold text-lg">វគ្គពេលព្រឹក</h3>
              </div>
            </div>

            {/* Content */}
            <div className="bg-card p-4 space-y-3">
              {/* Morning Check-in */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ចូល</span>
                  {getCheckInStatus(todayAttendance.morning_in)}
                </div>
                <Button
                  onClick={() => handleCheckInOut('morning_in')}
                  disabled={!!todayAttendance.morning_in || checkingIn !== null}
                  className="w-full h-14 text-base"
                  size="lg"
                >
                  {checkingIn === 'morning_in' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {todayAttendance.morning_in ? '✓ បានចូល' : 'ចូល (ព្រឹក)'}
                </Button>
              </div>

              {/* Morning Check-out */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ចេញ</span>
                  {getCheckInStatus(todayAttendance.morning_out)}
                </div>
                <Button
                  onClick={() => handleCheckInOut('morning_out')}
                  disabled={!todayAttendance.morning_in || !!todayAttendance.morning_out || checkingIn !== null}
                  className="w-full h-14 text-base"
                  size="lg"
                  variant="outline"
                >
                  {checkingIn === 'morning_out' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {todayAttendance.morning_out ? '✓ បានចេញ' : 'ចេញ (ព្រឹក)'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Afternoon Session */}
        <Card className="overflow-hidden border-2 shadow-md bg-gradient-to-br from-blue-500 to-cyan-500">
          <CardContent className="p-0">
            {/* Header */}
            <div className="p-4 pb-3 text-white">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <h3 className="font-semibold text-lg">វគ្គពេលរសៀល</h3>
              </div>
            </div>

            {/* Content */}
            <div className="bg-card p-4 space-y-3">
              {/* Afternoon Check-in */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ចូល</span>
                  {getCheckInStatus(todayAttendance.afternoon_in)}
                </div>
                <Button
                  onClick={() => handleCheckInOut('afternoon_in')}
                  disabled={!!todayAttendance.afternoon_in || checkingIn !== null}
                  className="w-full h-14 text-base"
                  size="lg"
                >
                  {checkingIn === 'afternoon_in' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {todayAttendance.afternoon_in ? '✓ បានចូល' : 'ចូល (រសៀល)'}
                </Button>
              </div>

              {/* Afternoon Check-out */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ចេញ</span>
                  {getCheckInStatus(todayAttendance.afternoon_out)}
                </div>
                <Button
                  onClick={() => handleCheckInOut('afternoon_out')}
                  disabled={!todayAttendance.afternoon_in || !!todayAttendance.afternoon_out || checkingIn !== null}
                  className="w-full h-14 text-base"
                  size="lg"
                  variant="outline"
                >
                  {checkingIn === 'afternoon_out' && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {todayAttendance.afternoon_out ? '✓ បានចេញ' : 'ចេញ (រសៀល)'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              សង្ខេបថ្ងៃនេះ
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 p-3">
                <p className="text-xs text-muted-foreground mb-1">ចូលពេលព្រឹក</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{todayAttendance.morning_in || '-'}</p>
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 p-3">
                <p className="text-xs text-muted-foreground mb-1">ចេញពេលព្រឹក</p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{todayAttendance.morning_out || '-'}</p>
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-3">
                <p className="text-xs text-muted-foreground mb-1">ចូលពេលរសៀល</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{todayAttendance.afternoon_in || '-'}</p>
              </div>
              <div className="rounded-xl border border-border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-3">
                <p className="text-xs text-muted-foreground mb-1">ចេញពេលរសៀល</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{todayAttendance.afternoon_out || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </BeneficiaryPortalLayout>
  );
}
