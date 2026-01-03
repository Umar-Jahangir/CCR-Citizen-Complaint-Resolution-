import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CATEGORY_LABELS, CATEGORY_ICONS, Grievance } from '@/types/grievance';
import { Search, Clock, CheckCircle2, AlertCircle, Loader2, MapPin, Building2, User, Calendar, Brain } from 'lucide-react';
import { format } from 'date-fns';

const TrackStatus = () => {
  const location = useLocation();
  const initialTicketId = (location.state as { ticketId?: string })?.ticketId || '';
  
  const [ticketId, setTicketId] = useState(initialTicketId);
  const [searchedTicket, setSearchedTicket] = useState<Grievance | null>(
    initialTicketId ? mockGrievances.find(g => g.ticketId === initialTicketId) || mockGrievances[0] : null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/grievances/track/${ticketId}`
      );

      if (!res.ok) {
        setNotFound(true);
        setSearchedTicket(null);
        return;
      }

      const data = await res.json();
      setSearchedTicket(data);
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setIsSearching(false);
    }
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

  const timeline = [
    { status: 'Submitted', date: searchedTicket?.submittedAt, completed: true },
    { status: 'AI Analysis Complete', date: searchedTicket?.submittedAt, completed: true },
    { status: 'Assigned to Department', date: searchedTicket?.submittedAt, completed: true },
    { status: 'Under Review', date: searchedTicket?.status !== 'pending' ? searchedTicket?.updatedAt : null, completed: searchedTicket?.status !== 'pending' },
    { status: 'Action Taken', date: searchedTicket?.status === 'resolved' ? searchedTicket?.updatedAt : null, completed: searchedTicket?.status === 'resolved' },
    { status: 'Resolved', date: searchedTicket?.status === 'resolved' ? searchedTicket?.updatedAt : null, completed: searchedTicket?.status === 'resolved' },
  ];

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
                  placeholder="Enter Ticket ID (e.g., GRV-2024-001)"
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

        {/* Search Result */}
        {searchedTicket && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Header */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">{searchedTicket.ticketId}</p>
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
                      <span className="text-lg">{CATEGORY_ICONS[searchedTicket.category]}</span>
                      Category
                    </p>
                    <p className="text-sm font-medium">{CATEGORY_LABELS[searchedTicket.category]}</p>
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
                    <p className="text-sm font-medium">{searchedTicket.department.split(' - ')[0]}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted
                    </p>
                    <p className="text-sm font-medium">{format(searchedTicket.submittedAt, 'MMM d, yyyy')}</p>
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

            {/* AI Analysis */}
            {searchedTicket.aiClassification && (
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
                        {(searchedTicket.aiClassification.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Classification Confidence</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent">
                        {searchedTicket.aiClassification.urgencyScore.toFixed(1)}/10
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Urgency Score</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-accent capitalize">
                        {searchedTicket.aiClassification.sentiment}
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
                            {format(item.date, 'MMM d, yyyy h:mm a')}
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
      </div>
    </div>
  );
};

export default TrackStatus;
