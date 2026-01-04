import { useState } from "react";
import { Download, FileText, CheckCircle2, Clock, Target } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatCard from "@/components/StatCard";
import DateRangePicker from "@/components/admin/DateRangePicker";
import { mockGrievances, departmentStats, categoryDistribution, weeklyTrend } from "@/data/mockGrievances";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Calculate metrics
  const totalComplaints = mockGrievances.length;
  const resolvedComplaints = mockGrievances.filter((g) => g.status === "resolved").length;
  const avgResolutionTime = 42; // Mock: 42 hours average
  const slaCompliance = 87; // Mock: 87% SLA compliance

  // Resolution time distribution (mock data)
  const resolutionTimeData = [
    { range: "< 12h", count: 15 },
    { range: "12-24h", count: 28 },
    { range: "24-48h", count: 35 },
    { range: "48-72h", count: 18 },
    { range: "> 72h", count: 8 },
  ];

  // Department performance data
  const deptPerformanceData = departmentStats.map((dept) => ({
    name: dept.name.split(" ")[0],
    resolved: dept.resolved,
    pending: dept.pending,
    avgTime: Math.floor(Math.random() * 30 + 20), // Mock avg resolution time
  }));

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ["Ticket ID", "Title", "Category", "Priority", "Status", "Department", "Submitted At"];
    const rows = mockGrievances.map((g) => [
      g.ticketId,
      g.title,
      g.category,
      g.priority,
      g.status,
      g.department,
      new Date(g.submittedAt).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grievances-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Report exported successfully");
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive reports and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportCSV}>
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          description="In selected period"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Resolved"
          value={resolvedComplaints}
          description={`${Math.round((resolvedComplaints / totalComplaints) * 100)}% resolution rate`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Avg. Resolution Time"
          value={`${avgResolutionTime}h`}
          description="Time to resolve"
          icon={Clock}
          variant="accent"
        />
        <StatCard
          title="SLA Compliance"
          value={`${slaCompliance}%`}
          description="Within target time"
          icon={Target}
          variant="warning"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Trend</CardTitle>
            <CardDescription>Complaints received vs resolved per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Received"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(var(--status-resolved))"
                    strokeWidth={2}
                    name="Resolved"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown by complaint type</CardDescription>
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
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Resolved vs pending by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptPerformanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="resolved" fill="hsl(var(--status-resolved))" name="Resolved" />
                  <Bar dataKey="pending" fill="hsl(var(--status-pending))" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Distribution</CardTitle>
            <CardDescription>How quickly complaints are resolved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Complaints" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
