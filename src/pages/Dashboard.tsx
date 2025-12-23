import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingStatusBadge } from '@/components/trainings/TrainingStatusBadge';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Award,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import {
  dashboardStats,
  mockTrainings,
  monthlyTrainingData,
  categoryDistribution,
} from '@/data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

const CHART_COLORS = [
  'hsl(158, 64%, 51%)',
  'hsl(141, 69%, 58%)',
  'hsl(172, 66%, 50%)',
  'hsl(82, 77%, 55%)',
  'hsl(0, 0%, 45%)',
];

export default function Dashboard() {
  const upcomingTrainings = mockTrainings
    .filter((t) => t.training_status === 'ONGOING' || t.training_status === 'DRAFT')
    .slice(0, 4);

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome back, Admin">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Beneficiaries"
          value={dashboardStats.totalBeneficiaries.toLocaleString()}
          description={`${dashboardStats.activeBeneficiaries} active`}
          icon={Users}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Active Trainings"
          value={dashboardStats.ongoingTrainings}
          description={`${dashboardStats.upcomingTrainings} upcoming`}
          icon={GraduationCap}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Average Attendance"
          value={`${dashboardStats.averageAttendance}%`}
          description="Across all trainings"
          icon={ClipboardCheck}
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatsCard
          title="Certificates Issued"
          value={dashboardStats.certificatesIssued}
          description="This year"
          icon={Award}
          trend={{ value: 24.5, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-7">
        {/* Training Overview Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Training Overview
            </CardTitle>
            <CardDescription>
              Monthly trainings and participant count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrainingData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Bar
                    dataKey="participants"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Participants"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Training Categories</CardTitle>
            <CardDescription>Distribution by subject area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                    label={({ category, percent }) =>
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {categoryDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Trainings */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming & Ongoing Trainings
          </CardTitle>
          <CardDescription>
            Trainings scheduled for the coming weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTrainings.map((training) => (
              <div
                key={training.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-foreground">
                      {training.training_name_english}
                    </h4>
                    <TrainingStatusBadge status={training.training_status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {training.training_location} •{' '}
                    {format(new Date(training.training_start_date), 'MMM d')} -{' '}
                    {format(new Date(training.training_end_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {training.current_participants}/{training.max_participants}
                  </p>
                  <p className="text-xs text-muted-foreground">Participants</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
