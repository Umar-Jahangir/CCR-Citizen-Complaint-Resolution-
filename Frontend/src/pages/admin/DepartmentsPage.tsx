import { Link } from "react-router-dom";
import { Building2, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { departmentStats } from "@/data/mockGrievances";

const DepartmentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">Monitor department performance and workload</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departmentStats.map((dept, index) => {
          const total = dept.pending + dept.inProgress + dept.resolved;
          const resolutionRate = total > 0 ? Math.round((dept.resolved / total) * 100) : 0;

          return (
            <Link key={dept.name} to={`/admin/departments/${index + 1}`}>
              <Card className="transition-all hover:shadow-md hover:border-primary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-yellow-50 p-2">
                      <Clock className="mx-auto h-4 w-4 text-yellow-600" />
                      <p className="mt-1 text-lg font-bold text-yellow-600">{dept.pending}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-2">
                      <AlertTriangle className="mx-auto h-4 w-4 text-blue-600" />
                      <p className="mt-1 text-lg font-bold text-blue-600">{dept.inProgress}</p>
                      <p className="text-xs text-muted-foreground">In Progress</p>
                    </div>
                    <div className="rounded-lg bg-green-50 p-2">
                      <CheckCircle2 className="mx-auto h-4 w-4 text-green-600" />
                      <p className="mt-1 text-lg font-bold text-green-600">{dept.resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolution Rate</span>
                      <span className="font-medium">{resolutionRate}%</span>
                    </div>
                    <Progress value={resolutionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default DepartmentsPage;
