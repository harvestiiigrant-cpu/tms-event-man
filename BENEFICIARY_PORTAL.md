# Beneficiary Portal

This is the teacher/beneficiary-facing portal where enrolled participants can manage their training attendance and profile.

## Portal Routes

The beneficiary portal is accessible at `/portal/*` paths:

- **`/portal/trainings`** - My Trainings (homepage)
- **`/portal/attendance/:trainingId`** - Attendance Check-in
- **`/portal/history`** - Training History
- **`/portal/history/:trainingId/attendance`** - Attendance History (detail view)
- **`/portal/profile`** - Profile Management

## Features

### 1. My Trainings (`/portal/trainings`)
- View current active training with progress
- See upcoming enrolled trainings
- Quick access to check-in and training details
- Shows attendance percentage and session progress
- GPS/Geofence validation requirements displayed

### 2. Attendance Check-in (`/portal/attendance/:trainingId`)
Fully functional 4-step daily attendance system:

#### Morning Session
- **Check-in AM** - Records morning arrival time
- **Check-out AM** - Records morning departure time

#### Afternoon Session
- **Check-in PM** - Records afternoon arrival time
- **Check-out PM** - Records afternoon departure time

#### GPS Features
- Real-time GPS location detection
- Geofence validation (checks if user is within required radius)
- Distance calculation from venue
- GPS accuracy display
- Location permission handling
- Blocks check-in if outside geofence radius

#### Check-in Rules
- Cannot check-out before checking in
- Sequential check-ins (AM before PM)
- GPS validation required if enabled
- Geofence enforcement if enabled
- Real-time status updates
- Visual indicators for completed check-ins

### 3. Training History (`/portal/history`)
- List of all past trainings
- Filter by status (COMPLETED, DROPPED)
- Filter by year
- Search by training name or code
- Statistics dashboard:
  - Total trainings
  - Completed trainings
  - Certificates earned
  - Total training hours
- Attendance percentage for each training
- Certificate download (if issued)
- Link to detailed attendance records

### 4. Attendance History (`/portal/history/:trainingId/attendance`)
Detailed attendance records for a specific training:
- Daily attendance table with all 4 check-in/out times
- Attendance status badges (PRESENT, LATE, ABSENT, EXCUSED)
- GPS verification indicators
- Manual vs Auto entry tracking
- Summary statistics:
  - Overall attendance percentage
  - Days present/late/absent
- Date range display

### 5. Profile Management (`/portal/profile`)
Complete profile management with photo upload:

#### Profile Photo
- Upload profile picture (max 5MB)
- Live preview
- Avatar fallback with initials
- Camera button for quick upload

#### Personal Information
- Full name (Khmer and English)
- Phone number
- Email
- Gender selection

#### Professional Information
- Position
- Subject/specialty
- School assignment (read-only)
- School ID

#### Location Information (Read-only)
- Province
- District
- Commune
- Village

#### Digital Signature
- Upload signature for certificates (max 2MB)
- Used for automatic certificate generation
- Image preview

#### Edit Mode
- Toggle edit mode to make changes
- Save/Cancel buttons
- Form validation
- Toast notifications for success/errors

## Layout

### BeneficiaryPortalLayout
Custom layout for beneficiary portal with:
- Clean, simple header
- Mobile-responsive navigation
- User profile dropdown
- Four main navigation items:
  - My Trainings
  - Attendance
  - History
  - Profile
- Mobile menu toggle
- Logout functionality

## Mock Data

All pages use mock data for demonstration. When integrating with backend:

1. **Authentication**: Replace `mockUser` in BeneficiaryPortalLayout with actual auth context
2. **Training Data**: Replace mock data with React Query hooks
3. **Attendance API**: Implement actual check-in/out API calls in AttendanceCheckin
4. **Profile API**: Connect profile save to backend endpoint
5. **Image Upload**: Implement actual file upload to server/CDN

## GPS Implementation

The attendance check-in uses browser's Geolocation API:

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Success callback
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  },
  (error) => {
    // Error handling
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  }
);
```

### Distance Calculation
Uses Haversine formula to calculate distance between user location and venue:

```typescript
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Returns distance in meters
};
```

### Geofence Validation
- Compares user location to venue coordinates
- Checks if distance <= geofence_radius
- Blocks check-in if outside radius
- Shows exact distance to venue

## User Flow

1. **Login** → Redirected to `/portal/trainings`
2. **View Current Training** → See training card with progress
3. **Click "Check Attendance"** → Navigate to `/portal/attendance/:id`
4. **GPS Permission** → Browser requests location access
5. **Check Location** → Verifies within geofence
6. **Check In/Out** → Records 4 attendance times per day
7. **View History** → Navigate to `/portal/history`
8. **View Details** → Click on training → See full attendance records
9. **Update Profile** → Navigate to `/portal/profile`
10. **Upload Photo** → Click camera icon, select file
11. **Edit Info** → Click "Edit Profile", make changes, save

## Responsive Design

All pages are mobile-responsive:
- Mobile navigation menu (hamburger)
- Responsive grids (1 column on mobile, 2-4 on desktop)
- Touch-friendly buttons
- Optimized layouts for small screens
- Bottom navigation option available

## Notifications

Uses toast notifications for:
- Successful check-ins
- GPS errors
- Geofence violations
- Profile updates
- File upload errors (size limits)
- Form validation errors

## Accessibility

- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Clear error messages
- Visual status indicators
- High contrast badges

## Next Steps

To make this production-ready:

1. **Authentication**
   - Implement login system
   - Add auth guards to routes
   - Connect to auth context

2. **API Integration**
   - Replace mock data with API calls
   - Add loading states
   - Error handling
   - Retry logic

3. **Real-time Updates**
   - WebSocket for live attendance updates
   - Notifications for new trainings
   - Certificate availability alerts

4. **Offline Support**
   - Service worker for offline check-ins
   - Queue pending check-ins
   - Sync when back online

5. **Testing**
   - Unit tests for components
   - Integration tests for flows
   - E2E tests for critical paths
   - GPS mock for testing

## File Structure

```
src/
├── components/
│   └── layout/
│       └── BeneficiaryPortalLayout.tsx
├── pages/
│   └── portal/
│       ├── MyTrainings.tsx
│       ├── AttendanceCheckin.tsx
│       ├── TrainingHistory.tsx
│       ├── AttendanceHistory.tsx
│       └── BeneficiaryProfile.tsx
└── App.tsx (routes configured)
```
