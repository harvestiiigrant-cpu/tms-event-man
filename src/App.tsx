import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import Trainings from "./pages/Trainings";
import Events from "./pages/Events";
import Materials from "./pages/Materials";
import Surveys from "./pages/Surveys";
import Beneficiaries from "./pages/Beneficiaries";
import Attendance from "./pages/Attendance";
import Settings from "./pages/Settings";
import TrainingCalendar from "./pages/TrainingCalendar";
import TrainingEventCalendar from "./pages/TrainingEventCalendar";
import PublicEnrollment from "./pages/PublicEnrollment";
import EnrollmentLanding from "./pages/EnrollmentLanding";
import TrainingBrowser from "./pages/TrainingBrowser";
import EventsBrowser from "./pages/EventsBrowser";
import PublicEventDetails from "./pages/PublicEventDetails";
import PublicEventRegistration from "./pages/PublicEventRegistration";
import NotFound from "./pages/NotFound";
import MyTrainings from "./pages/portal/MyTrainings";
import TrainingDetails from "./pages/portal/TrainingDetails";
import AttendanceCheckin from "./pages/portal/AttendanceCheckin";
import TrainingHistory from "./pages/portal/TrainingHistory";
import AttendanceHistory from "./pages/portal/AttendanceHistory";
import BeneficiaryProfile from "./pages/portal/BeneficiaryProfile";
import MySurveys from "./pages/portal/MySurveys";
import TakeSurvey from "./pages/portal/TakeSurvey";
import SurveyResults from "./pages/portal/SurveyResults";
import TelegramAuth from "./pages/telegram/TelegramAuth";
import TelegramOverview from "./pages/telegram/Overview";
import TelegramTrainings from "./pages/telegram/Trainings";
import TelegramAchievements from "./pages/telegram/Achievements";
import TelegramSettings from "./pages/telegram/Settings";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { FontProvider } from "@/contexts/FontContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TelegramProvider } from "@/contexts/TelegramContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <FontProvider>
          <TelegramProvider>
            <TooltipProvider>
              <SidebarProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                {/* Public Home Page */}
                <Route path="/" element={<HomePage />} />

                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Public Training Discovery & Enrollment */}
                <Route path="/enroll/start" element={<EnrollmentLanding />} />
                <Route path="/trainings/browse" element={<TrainingBrowser />} />
                <Route path="/enroll" element={<PublicEnrollment />} />

                {/* Public Event Discovery & Registration */}
                <Route path="/events/browse" element={<EventsBrowser />} />
                <Route path="/events/:eventId/details" element={<PublicEventDetails />} />
                <Route path="/events/:eventId/register" element={<PublicEventRegistration />} />

                {/* Admin Dashboard Routes - Protected */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainings"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Trainings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Events />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/materials"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Materials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training-calendar"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <TrainingCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/training-event-calendar"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <TrainingEventCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/surveys"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Surveys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/beneficiaries"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Beneficiaries />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Attendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* Beneficiary Portal Routes - Protected */}
                <Route
                  path="/portal/trainings"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <MyTrainings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/trainings/:id"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TrainingDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <AttendanceCheckin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/attendance/:trainingId"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <AttendanceCheckin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/history"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TrainingHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/history/:trainingId/attendance"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <AttendanceHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/profile"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <BeneficiaryProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/surveys"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <MySurveys />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/surveys/:surveyId/take"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TakeSurvey />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portal/surveys/:surveyId/results"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <SurveyResults />
                    </ProtectedRoute>
                  }
                />

                {/* Telegram Mini App Routes */}
                <Route path="/tg/auth" element={<TelegramAuth />} />
                <Route
                  path="/tg/overview"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TelegramOverview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tg/trainings"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TelegramTrainings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tg/achievements"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TelegramAchievements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tg/settings"
                  element={
                    <ProtectedRoute allowedRoles={['BENEFICIARY']}>
                      <TelegramSettings />
                    </ProtectedRoute>
                  }
                />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </SidebarProvider>
            </TooltipProvider>
          </TelegramProvider>
        </FontProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
