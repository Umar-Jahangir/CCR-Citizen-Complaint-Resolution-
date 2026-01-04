import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Building2, User, Phone, Mail, Clock, Brain, Send, AlertTriangle, Image as ImageIcon, TrendingUp, MessageSquare, Loader2, ChevronLeft, ChevronRight, X, Eye, Wrench, Target, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { getGrievance, updateGrievance, deleteGrievance, Grievance } from "@/services/grievanceService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from "@/types/grievance";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const DEPARTMENTS = [
  "Municipal Corporation",
  "Water Department",
  "Electricity Board",
  "Public Works Department",
  "Police Department",
  "Health Department",
  "Education Department",
  "Housing Authority",
  "General Administration",
];

const ComplaintDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [status, setStatus] = useState("pending");
  const [assignedDept, setAssignedDept] = useState("");
  const [newNote, setNewNote] = useState("");
  const [previewImage, setPreviewImage] = useState<{ url: string; index: number } | null>(null);
  const [notes, setNotes] = useState<{ id: string; content: string; createdAt: Date; createdBy: string }[]>([
    {
      id: "1",
      content: "Initial complaint received and logged in the system.",
      createdAt: new Date(Date.now() - 86400000 * 2),
      createdBy: "System",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getGrievance(id);
        setGrievance(data);
        setStatus(data.status);
        setAssignedDept(data.department);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch grievance");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !grievance) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h1 className="text-2xl font-bold">Complaint Not Found</h1>
        <p className="text-muted-foreground">{error || "The complaint you're looking for doesn't exist."}</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateGrievance(grievance.id, { status: newStatus });
      setStatus(newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDepartmentChange = async (dept: string) => {
    try {
      await updateGrievance(grievance.id, { department: dept });
      setAssignedDept(dept);
      toast.success(`Assigned to ${dept}`);
    } catch (err) {
      toast.error("Failed to update department");
    }
  };


  const handleAddNote = () => {
    if (!newNote.trim()) return;

    setNotes([
      ...notes,
      {
        id: String(notes.length + 1),
        content: newNote,
        createdAt: new Date(),
        createdBy: "Admin",
      },
    ]);
    setNewNote("");
    toast.success("Note added successfully");
  };

  const handleEscalate = () => {
    toast.success("Complaint escalated to supervisor");
  };

  const handleDelete = async () => {
    if (!grievance) return;
    setDeleting(true);
    try {
      await deleteGrievance(grievance.id);
      toast.success("Complaint deleted successfully");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete complaint");
    } finally {
      setDeleting(false);
    }
  };

  const categoryLabel = CATEGORY_LABELS[grievance.category as Category] || grievance.category || "Other";
  const categoryIcon = CATEGORY_ICONS[grievance.category as Category] || "📋";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{grievance.ticket_id}</h1>
            <Badge variant={grievance.priority === "high" ? "destructive" : grievance.priority === "medium" ? "secondary" : "outline"}>
              {grievance.priority}
            </Badge>
            <Badge
              variant="outline"
              className={
                status === "resolved"
                  ? "border-green-500 text-green-600"
                  : status === "in-progress"
                  ? "border-blue-500 text-blue-600"
                  : "border-yellow-500 text-yellow-600"
              }
            >
              {status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{grievance.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Complaint Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{categoryIcon}</span>
                {categoryLabel}
              </CardTitle>
              <CardDescription>
                Submitted {formatDistanceToNow(new Date(grievance.created_at), { addSuffix: true })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                <p className="text-sm">{grievance.description}</p>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{grievance.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{grievance.department}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{grievance.citizen_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(grievance.created_at).toLocaleString()}</span>
                </div>
                {grievance.citizen_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{grievance.citizen_phone}</span>
                  </div>
                )}
                {grievance.citizen_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{grievance.citizen_email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Images */}
          {grievance.images && grievance.images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Uploaded Images ({grievance.images.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {grievance.images.map((image, idx) => (
                    <div
                      key={idx}
                      className="relative group cursor-pointer"
                      onClick={() => setPreviewImage({ url: image, index: idx })}
                    >
                      <img
                        src={image}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm">Click to view</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Analysis - Full Details for Admin */}
          {grievance.sentiment && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Analysis Report
                </CardTitle>
                <CardDescription>
                  Automated analysis using HuggingFace Sentiment Model & Groq Vision
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Text Analysis Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Text Analysis
                  </h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                      <p className="text-2xl font-bold">{((grievance.sentiment_confidence || 0) * 100).toFixed(0)}%</p>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(grievance.sentiment_confidence || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Urgency Score</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold">{grievance.urgency_score || 5}</p>
                        <p className="text-sm text-muted-foreground mb-1">/10</p>
                      </div>
                      <div className="mt-2 flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-sm ${
                              i < (grievance.urgency_score || 5)
                                ? (grievance.urgency_score || 5) >= 8 ? 'bg-red-500'
                                  : (grievance.urgency_score || 5) >= 5 ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-4">
                      <p className="text-xs text-muted-foreground mb-1">Sentiment Detected</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                          grievance.sentiment === 'negative'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : grievance.sentiment === 'positive'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {grievance.sentiment === 'negative' && '😠'}
                          {grievance.sentiment === 'positive' && '😊'}
                          {grievance.sentiment === 'neutral' && '😐'}
                          <span className="ml-1 capitalize">{grievance.sentiment}</span>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {grievance.sentiment === 'negative' && 'Citizen appears frustrated or upset'}
                        {grievance.sentiment === 'positive' && 'Citizen tone is constructive'}
                        {grievance.sentiment === 'neutral' && 'Neutral/informational tone'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Analysis Section */}
                {grievance.image_analyses && grievance.image_analyses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Image Analysis (Groq Vision AI)
                    </h4>
                    <div className="space-y-4">
                      {grievance.image_analyses.map((analysis, idx) => (
                        <div key={idx} className="rounded-lg border p-4 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                          {/* Header with image thumbnail */}
                          <div className="flex gap-4 mb-4">
                            {grievance.images && grievance.images[idx] && (
                              <img
                                src={grievance.images[idx]}
                                alt={`Evidence ${idx + 1}`}
                                className="w-28 h-28 object-cover rounded-lg border-2 cursor-pointer hover:border-primary transition-colors"
                                onClick={() => setPreviewImage({ url: grievance.images[idx], index: idx })}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-base font-semibold">Image {idx + 1} Analysis</span>
                                <Badge
                                  variant="outline"
                                  className={
                                    analysis.severity === 'high'
                                      ? 'text-red-600 border-red-500 bg-red-50 dark:bg-red-950/30'
                                      : analysis.severity === 'medium'
                                      ? 'text-yellow-600 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30'
                                      : 'text-green-600 border-green-500 bg-green-50 dark:bg-green-950/30'
                                  }
                                >
                                  {analysis.severity?.toUpperCase()} SEVERITY
                                </Badge>
                              </div>
                              {/* Description */}
                              <p className="text-sm text-foreground leading-relaxed">
                                {analysis.description || 'No description available'}
                              </p>
                              {analysis.severity_reason && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  Severity reason: {analysis.severity_reason}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Detailed Analysis Grid */}
                          <div className="grid gap-3 md:grid-cols-2">
                            {/* Key Observations */}
                            {analysis.key_observations && analysis.key_observations.length > 0 && (
                              <div className="rounded-md bg-white/60 dark:bg-gray-900/40 p-3 border">
                                <h5 className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                                  <Eye className="h-3.5 w-3.5" />
                                  Key Observations
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.key_observations.map((obs, oIdx) => (
                                    <li key={oIdx} className="text-xs text-muted-foreground flex items-start gap-1.5">
                                      <span className="text-primary mt-0.5">•</span>
                                      {obs}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Identified Problems */}
                            {analysis.identified_problems && analysis.identified_problems.length > 0 && (
                              <div className="rounded-md bg-red-50/50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-900">
                                <h5 className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Identified Problems
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.identified_problems.map((problem, pIdx) => (
                                    <li key={pIdx} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                                      <span className="text-red-500 mt-0.5">•</span>
                                      {problem}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Affected Areas */}
                            {analysis.affected_areas && analysis.affected_areas.length > 0 && (
                              <div className="rounded-md bg-orange-50/50 dark:bg-orange-950/20 p-3 border border-orange-200 dark:border-orange-900">
                                <h5 className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1.5">
                                  <Target className="h-3.5 w-3.5" />
                                  Affected Areas
                                </h5>
                                <div className="flex flex-wrap gap-1">
                                  {analysis.affected_areas.map((area, aIdx) => (
                                    <span
                                      key={aIdx}
                                      className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full"
                                    >
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommended Actions */}
                            {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
                              <div className="rounded-md bg-green-50/50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-900">
                                <h5 className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-1.5">
                                  <Wrench className="h-3.5 w-3.5" />
                                  Recommended Actions
                                </h5>
                                <ul className="space-y-1">
                                  {analysis.recommended_actions.map((action, rIdx) => (
                                    <li key={rIdx} className="text-xs text-green-700 dark:text-green-300 flex items-start gap-1.5">
                                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 bg-primary/5">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">AI Recommendation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Based on the {grievance.sentiment} sentiment and urgency score of {grievance.urgency_score || 5}/10,
                        {(grievance.urgency_score || 5) >= 7
                          ? ' this complaint requires immediate attention. Consider prioritizing resolution.'
                          : (grievance.urgency_score || 5) >= 4
                          ? ' this complaint should be addressed within standard SLA timelines.'
                          : ' this is a low-priority issue that can be scheduled for routine handling.'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>Add notes visible only to admin staff</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing Notes */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <p className="text-sm">{note.content}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{note.createdBy}</span>
                      <span>-</span>
                      <span>{formatDistanceToNow(note.createdAt, { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Note */}
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                <Send className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Change */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Assignment */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Assign to Department</label>
                <Select value={assignedDept} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Escalate */}
              <Button variant="destructive" className="w-full" onClick={handleEscalate}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Escalate
              </Button>

              {/* Delete */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Complaint
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this complaint ({grievance.ticket_id})?
                      This action cannot be undone and will permanently remove the complaint from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Action History */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">Complaint Submitted</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(grievance.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <div className="w-px flex-1 bg-border" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">AI Analysis Complete</p>
                    <p className="text-xs text-muted-foreground">Automatically processed</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assigned to Department</p>
                    <p className="text-xs text-muted-foreground">{grievance.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">Image Preview</DialogTitle>
          {previewImage && grievance.images && (
            <div className="relative">
              <img
                src={previewImage.url}
                alt={`Preview ${previewImage.index + 1}`}
                className="w-full h-auto max-h-[80vh] object-contain"
              />

              {/* Navigation buttons */}
              {grievance.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const newIndex = previewImage.index === 0
                        ? grievance.images.length - 1
                        : previewImage.index - 1;
                      setPreviewImage({ url: grievance.images[newIndex], index: newIndex });
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newIndex = previewImage.index === grievance.images.length - 1
                        ? 0
                        : previewImage.index + 1;
                      setPreviewImage({ url: grievance.images[newIndex], index: newIndex });
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {previewImage.index + 1} / {grievance.images.length}
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintDetailPage;
