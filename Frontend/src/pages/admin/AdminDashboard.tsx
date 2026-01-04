import { FileText, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { mockGrievances, departmentStats, categoryDistribution, weeklyTrend } from "@/data/mockGrievances";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Link } from "react-router-dom";
import GrievanceCard from "@/components/GrievanceCard";

const AdminDashboard = () => {
  const totalComplaints = mockGrievances.length;
  const pendingCount = mockGrievances.filter((g) => g.status === "pending").length;
  const inProgressCount = mockGrievances.filter((g) => g.status === "in-progress").length;
  const resolvedCount = mockGrievances.filter((g) => g.status === "resolved").length;

  const recentComplaints = [...mockGrievances]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of grievance management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          description="All time submissions"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Pending"
          value={pendingCount}
          description="Awaiting action"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          description="Being resolved"
          icon={AlertTriangle}
          variant="accent"
        />
        <StatCard
          title="Resolved"
          value={resolvedCount}
          description="Successfully closed"
          icon={CheckCircle2}
          variant="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Weekly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Trend</CardTitle>
            <CardDescription>Complaints vs Resolved over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="complaints"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                    name="Complaints"
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    stroke="hsl(var(--status-resolved))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--status-resolved))" }}
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
            <CardDescription>Breakdown of complaints by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
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

      {/* Recent Complaints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Complaints</CardTitle>
            <CardDescription>Latest submitted grievances</CardDescription>
          </div>
          <Link
            to="/admin/complaints"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentComplaints.slice(0, 3).map((grievance) => (
              <Link key={grievance.id} to={`/admin/complaints/${grievance.id}`}>
                <GrievanceCard grievance={grievance} showAiInsights={false} />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
