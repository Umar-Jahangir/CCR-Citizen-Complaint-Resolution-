import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GrievanceCard from "@/components/GrievanceCard";
import { listGrievances, Grievance } from "@/services/grievanceService";
import { Category } from "@/types/grievance";

const ComplaintsPage = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrievances = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listGrievances({
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        search: searchQuery || undefined,
      });
      setGrievances(result.grievances);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grievances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery !== "") {
        fetchGrievances();
      } else {
        fetchGrievances();
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Transform API data to match GrievanceCard expected format
  const transformedGrievances = grievances.map((g) => ({
    id: g.id,
    ticketId: g.ticket_id,
    title: g.title,
    description: g.description,
    category: (g.category || "other") as Category,
    status: g.status as "pending" | "in-progress" | "resolved",
    priority: g.priority as "low" | "medium" | "high",
    department: g.department,
    location: g.location,
    submittedBy: g.citizen_name,
    submittedAt: g.created_at,
    images: g.images,
    aiClassification: g.sentiment ? {
      confidence: g.sentiment_confidence || 0,
      suggestedCategory: (g.category || "other") as Category,
      urgencyScore: g.urgency_score || 5,
      sentiment: g.sentiment as "positive" | "negative" | "neutral",
    } : undefined,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Complaints</h1>
          <p className="text-muted-foreground">Manage and review all citizen grievances</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGrievances} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket ID, title, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchGrievances()}
                  className="pl-9"
                />
              </div>
              <Button onClick={fetchGrievances} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
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
                <SelectTrigger className="w-[140px]">
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
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-6">
            <p className="text-destructive font-medium">Error loading complaints</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchGrievances} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {transformedGrievances.length} complaint{transformedGrievances.length !== 1 ? 's' : ''}
          </p>

          {/* Complaints Grid */}
          {transformedGrievances.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transformedGrievances.map((grievance) => (
                <Link key={grievance.id} to={`/admin/complaints/${grievance.id}`}>
                  <GrievanceCard grievance={grievance} showAiInsights />
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium">No complaints found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                    ? "Try adjusting your filters or search query"
                    : "No grievances have been submitted yet"}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ComplaintsPage;
