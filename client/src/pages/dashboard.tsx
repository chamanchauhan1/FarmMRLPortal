import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface DashboardStats {
  totalAnimals: number;
  activeTreatments: number;
  complianceRate: number;
  pendingReports: number;
  violationCount: number;
  warningCount: number;
}

interface TreatmentTrend {
  month: string;
  treatments: number;
}

interface ComplianceData {
  name: string;
  value: number;
  color: string;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: trends, isLoading: trendsLoading } = useQuery<TreatmentTrend[]>({
    queryKey: ["/api/dashboard/trends"],
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery<ComplianceData[]>({
    queryKey: ["/api/dashboard/compliance"],
  });

  const CHART_COLORS = {
    primary: "hsl(var(--chart-1))",
    secondary: "hsl(var(--chart-2))",
    accent: "hsl(var(--chart-3))",
    warning: "hsl(var(--chart-4))",
    success: "hsl(var(--chart-1))",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back, {user?.fullName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your farm's antimicrobial management
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-animals">
                  {stats?.totalAnimals || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all registered farms
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-active-treatments">
                  {stats?.activeTreatments || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently in withdrawal period
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-primary" data-testid="text-compliance-rate">
                  {stats?.complianceRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  MRL compliance this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <>
                <div className="text-2xl font-bold text-destructive" data-testid="text-violations">
                  {(stats?.violationCount || 0) + (stats?.warningCount || 0)}
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge variant="destructive" className="text-xs">
                    {stats?.violationCount || 0} violations
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {stats?.warningCount || 0} warnings
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Antimicrobial Usage Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="treatments"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Compliance Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {complianceLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={compliance || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(compliance || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {stats && (stats.violationCount > 0 || stats.warningCount > 0) && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Threshold Violations Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have <span className="font-bold">{stats.violationCount}</span> compliance violations and{" "}
              <span className="font-bold">{stats.warningCount}</span> warnings that require immediate attention.
              Please review your treatment records and take corrective action.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
