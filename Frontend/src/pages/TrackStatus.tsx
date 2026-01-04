import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getGrievance, Grievance } from '@/services/grievanceService';
import { CATEGORY_LABELS, CATEGORY_ICONS, Category } from '@/types/grievance';
import { Search, Clock, CheckCircle2, AlertCircle, Loader2, MapPin, Building2, Calendar, Brain, Trash2, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

const TrackStatus = () => {
  const location = useLocation();
  const initialTicketId = (location.state as { ticketId?: string })?.ticketId || '';

  const [ticketId, setTicketId] = useState(initialTicketId);
  const [searchedTicket, setSearchedTicket] = useState<Grievance | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  // Auto-search if ticket ID is provided from navigation
  useEffect(() => {
    if (initialTicketId) {
      handleSearchById(initialTicketId);
    }
  }, [initialTicketId]);

  const handleSearchById = async (id: string) => {
    if (!id.trim()) return;

    setIsSearching(true);
    setNotFound(false);
    setIsDeleted(false);
    setSearchedTicket(null);

    try {
      const result = await getGrievance(id.trim());
      setSearchedTicket(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Not found';
      if (errorMessage.includes('not found') || errorMessage.includes('Not found')) {
        setIsDeleted(true);
      } else {
        setNotFound(true);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchById(ticketId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-status-pending" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-status-progress animate-spin" />;
      case 'resolved':
        return <CheckCircle2 className="h-5 w-5 text-status-resolved" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending' as const;
      case 'in-progress':
        return 'status-progress' as const;
      case 'resolved':
        return 'status-resolved' as const;
      default:
        return 'secondary' as const;
    }
  };

  const timeline = searchedTicket ? [
    { status: 'Submitted', date: searchedTicket.created_at, completed: true },
    { status: 'AI Analysis Complete', date: searchedTicket.created_at, completed: !!searchedTicket.sentiment },
    { status: 'Assigned to Department', date: searchedTicket.created_at, completed: !!searchedTicket.department },
    { status: 'Under Review', date: searchedTicket.status !== 'pending' ? searchedTicket.created_at : null, completed: searchedTicket.status !== 'pending' },
    { status: 'Resolved', date: searchedTicket.status === 'resolved' ? searchedTicket.created_at : null, completed: searchedTicket.status === 'resolved' },
  ] : [];

  const categoryLabel = searchedTicket ? (CATEGORY_LABELS[searchedTicket.category as Category] || searchedTicket.category || 'Other') : '';
  const categoryIcon = searchedTicket ? (CATEGORY_ICONS[searchedTicket.category as Category] || '📋') : '';

  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Track Your Grievance</h1>
          <p className="text-muted-foreground">
            Enter your ticket ID to check the current status of your complaint.
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter Ticket ID (e.g., GRV-ABC123)"
                  className="pl-9"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Track'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Deleted Complaint Message */}
        {isDeleted && (
          <Card className="text-center py-12 border-red-200 bg-red-50/50 dark:bg-red-950/20">
            <CardContent>
              <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-red-600">Complaint Has Been Deleted</h3>
              <p className="text-muted-foreground">
                The complaint with ticket ID <strong>{ticketId}</strong> has been deleted from the system.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                If you believe this is an error, please contact the administration.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Not Found Message */}
        {notFound && (
          <Card className="text-center py-12">
            <CardContent>
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Ticket Not Found</h3>
              <p className="text-muted-foreground">
                We couldn't find a grievance with that ticket ID. Please check and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search Result */}
        {searchedTicket && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{searchedTicket.ticket_id}</p>
                    <CardTitle className="text-xl">{searchedTicket.title}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(searchedTicket.status)} className="capitalize text-sm">
                    {getStatusIcon(searchedTicket.status)}
                    <span className="ml-1">{searchedTicket.status.replace('-', ' ')}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{searchedTicket.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="text-lg">{categoryIcon}</span>
                      Category
                    </p>
                    <p className="text-sm font-medium">{categoryLabel}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Location
                    </p>
                    <p className="text-sm font-medium">{searchedTicket.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Department
                    </p>
                    <p className="text-sm font-medium">{searchedTicket.department?.split(' - ')[0] || 'Not assigned'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted
                    </p>
                    <p className="text-sm font-medium">{format(new Date(searchedTicket.created_at), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {/* Priority Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Priority:</span>
                  <Badge variant={`priority-${searchedTicket.priority}` as any} className="capitalize">
                    {searchedTicket.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Images */}
            {searchedTicket.images && searchedTicket.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Uploaded Images ({searchedTicket.images.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {searchedTicket.images.map((image, idx) => (
                      <img
                        key={idx}
                        src={image}
                        alt={`Evidence ${idx + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Analysis */}
            {searchedTicket.sentiment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="h-5 w-5 text-accent" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent">
                        {((searchedTicket.sentiment_confidence || 0) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Analysis Confidence</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent">
                        {searchedTicket.urgency_score || 5}/10
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Urgency Score</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent capitalize">
                        {searchedTicket.sentiment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Sentiment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          item.completed
                            ? 'bg-status-resolved/10 text-status-resolved'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className={`w-0.5 h-8 ${
                            item.completed ? 'bg-status-resolved/30' : 'bg-border'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className={`font-medium ${!item.completed && 'text-muted-foreground'}`}>
                          {item.status}
                        </p>
                        {item.date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(item.date), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackStatus;
