import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatCard from '@/components/StatCard';
import GrievanceCard from '@/components/GrievanceCard';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Building2,
  Brain,
  Filter,
  BarChart3,
  PieChart
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line, Legend } from 'recharts';

import { useEffect } from "react";
import {
  fetchAdminStats,
  fetchAdminGrievances,
  fetchAdminAnalytics
} from "@/api/admin";

import AdminGrievanceTable from "@/components/AdminGrievanceTable";
import GrievanceDetailDrawer from "@/components/GrievanceDetailDrawer";
import { AdminGrievance } from "@/types/adminGrievance";
import { AdminAnalytics } from "@/types/adminAnalytics";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    high_priority: 0,
     escalated: 0,
  });

  const [grievances, setGrievances] = useState<AdminGrievance[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const totalComplaints = stats.total;
  const pendingComplaints = stats.pending;
  const inProgressComplaints = stats.in_progress;
  const resolvedComplaints = stats.resolved;

  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    weeklyTrend: [],
    categoryDistribution: [],
    departmentStats: [],
  });


  const COLORS = ['#059669', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];
  const [selectedGrievance, setSelectedGrievance] = useState<AdminGrievance | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);

        const [
          statsData,
          grievanceData,
          analyticsData
        ] = await Promise.all([
          fetchAdminStats(),
          fetchAdminGrievances(statusFilter, priorityFilter),
          fetchAdminAnalytics(),
        ]);

        setStats(statsData);
        setGrievances(grievanceData);
        setAnalytics(analyticsData);

      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [statusFilter, priorityFilter]);

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor and manage citizen grievances</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Brain className="h-3 w-3" />
            AI Analysis Active
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Complaints"
          value={totalComplaints}
          description="All time submissions"
          icon={FileText}
          variant="primary"
        />
        <StatCard
          title="Pending"
          value={pendingComplaints}
          description="Awaiting action"
          icon={Clock}
          variant="warning"
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="In Progress"
          value={inProgressComplaints}
          description="Being resolved"
          icon={AlertTriangle}
          variant="accent"
        />
        <StatCard
          title="Resolved"
          value={resolvedComplaints}
          description="Successfully closed"
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Escalations"
          value={stats.escalated}
          description="Overdue complaints"
          icon={AlertTriangle}
          variant="warning"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Weekly Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Weekly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="complaints" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="hsl(var(--status-resolved))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--status-resolved))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={analytics.categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="count"
                      nameKey="category"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {analytics.categoryDistribution.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Department Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departmentStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12}
                    width={150}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pending" fill="hsl(var(--status-pending))" name="Pending" />
                  <Bar dataKey="inProgress" fill="hsl(var(--status-progress))" name="In Progress" />
                  <Bar dataKey="resolved" fill="hsl(var(--status-resolved))" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Complaints Grid */}
          {loading ? (
            <p className="text-muted-foreground">Loading grievances...</p>
          ) : (
            <AdminGrievanceTable
              grievances={grievances}
              onView={setSelectedGrievance}
            />
          )}

          <GrievanceDetailDrawer
            grievance={selectedGrievance}
            onClose={() => setSelectedGrievance(null)}
          />
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.departmentStats.map((dept, index) => (
              <Card key={index} className="hover:shadow-card transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-3 rounded-lg bg-status-pending/10">
                      <p className="text-2xl font-bold text-status-pending">{dept.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="p-3 rounded-lg bg-status-progress/10">
                      <p className="text-2xl font-bold text-status-progress">{dept.inProgress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="p-3 rounded-lg bg-status-resolved/10">
                      <p className="text-2xl font-bold text-status-resolved">{dept.resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Resolution Rate</span>
                      <span className="font-semibold text-status-resolved">
                        {((dept.resolved / (dept.pending + dept.inProgress + dept.resolved)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
