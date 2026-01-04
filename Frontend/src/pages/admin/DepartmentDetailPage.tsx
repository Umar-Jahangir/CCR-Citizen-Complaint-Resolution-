import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2, Users, Clock, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import { departmentStats, mockGrievances } from "@/data/mockGrievances";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const DepartmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const deptIndex = parseInt(id || "1") - 1;
  const department = departmentStats[deptIndex];

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">Department Not Found</h1>
        <p className="text-muted-foreground">The department you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/admin/departments">Back to Departments</Link>
        </Button>
      </div>
    );
  }

  const total = department.pending + department.inProgress + department.resolved;
  const resolutionRate = total > 0 ? Math.round((department.resolved / total) * 100) : 0;
  const slaTarget = 48; // hours
  const avgResolutionTime = 36; // mock average resolution time in hours
  const slaCompliance = 85; // mock SLA compliance rate

  // Mock staff data
  const staffMembers = [
    { name: "Rahul Sharma", role: "Manager", assigned: 12, resolved: 45 },
    { name: "Priya Patel", role: "Senior Officer", assigned: 8, resolved: 38 },
    { name: "Amit Kumar", role: "Officer", assigned: 15, resolved: 32 },
    { name: "Sneha Gupta", role: "Officer", assigned: 10, resolved: 28 },
  ];

  // Staff workload chart data
  const workloadData = staffMembers.map((staff) => ({
    name: staff.name.split(" ")[0],
    assigned: staff.assigned,
    resolved: staff.resolved,
  }));

  // Department complaints
  const deptComplaints = mockGrievances.filter((g) =>
    g.department.toLowerCase().includes(department.name.split(" ")[0].toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/departments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            {department.name}
          </h1>
          <p className="text-muted-foreground">Department performance and workload overview</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Complaints"
          value={total}
          description="All assigned complaints"
          icon={Building2}
          variant="primary"
        />
        <StatCard
          title="Pending"
          value={department.pending}
          description="Awaiting action"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Resolution Rate"
          value={`${resolutionRate}%`}
          description="Complaints resolved"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="SLA Compliance"
          value={`${slaCompliance}%`}
          description={`Target: ${slaTarget}h`}
          icon={Target}
          variant="accent"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Workload
            </CardTitle>
            <CardDescription>Current assignments and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workloadData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={60} />
                  <Tooltip />
                  <Bar dataKey="assigned" fill="hsl(var(--primary))" name="Assigned" />
                  <Bar dataKey="resolved" fill="hsl(var(--status-resolved))" name="Resolved (Month)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* SLA Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              SLA Tracking
            </CardTitle>
            <CardDescription>Service Level Agreement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>SLA Compliance Rate</span>
                <span className="font-medium">{slaCompliance}%</span>
              </div>
              <Progress value={slaCompliance} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Target Resolution</p>
                <p className="text-2xl font-bold">{slaTarget}h</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Avg. Resolution</p>
                <p className="text-2xl font-bold">{avgResolutionTime}h</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">At-Risk Complaints</p>
              <div className="rounded-lg bg-destructive/10 p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">3 complaints nearing SLA breach</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>Team members and their current assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {staffMembers.map((staff, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                    {staff.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{staff.name}</p>
                    <p className="text-sm text-muted-foreground">{staff.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium">{staff.assigned}</p>
                    <p className="text-muted-foreground">Assigned</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-green-600">{staff.resolved}</p>
                    <p className="text-muted-foreground">Resolved</p>
                  </div>
                  <Badge variant={staff.assigned > 12 ? "destructive" : staff.assigned > 8 ? "secondary" : "outline"}>
                    {staff.assigned > 12 ? "Overloaded" : staff.assigned > 8 ? "Busy" : "Available"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentDetailPage;
