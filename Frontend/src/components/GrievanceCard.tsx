import { Grievance, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types/grievance';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MapPin, Clock, Building2, Brain } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GrievanceCardProps {
  grievance: Grievance;
  showAiInsights?: boolean;
  onClick?: () => void;
}

const GrievanceCard = ({ grievance, showAiInsights = false, onClick }: GrievanceCardProps) => {
  const priorityVariant = `priority-${grievance.priority}` as const;
  const statusVariant = grievance.status === 'pending' 
    ? 'status-pending' 
    : grievance.status === 'in-progress' 
    ? 'status-progress' 
    : 'status-resolved';

  return (
    <Card 
      className="group cursor-pointer transition-all duration-200 hover:shadow-card-hover border-border/50 hover:border-border"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{CATEGORY_ICONS[grievance.category]}</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{grievance.ticketId}</p>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {grievance.title}
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={priorityVariant} className="capitalize">
              {grievance.priority}
            </Badge>
            <Badge variant={statusVariant} className="capitalize">
              {grievance.status.replace('-', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {grievance.description}
        </p>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {grievance.location}
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {grievance.department.split(' - ')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(grievance.submittedAt, { addSuffix: true })}
          </span>
        </div>

        {showAiInsights && grievance.aiClassification && (
          <div className="pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-accent" />
              <span className="text-xs font-medium text-accent">AI Analysis</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <p className="text-muted-foreground">Confidence</p>
                <p className="font-semibold">{(grievance.aiClassification.confidence * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <p className="text-muted-foreground">Urgency</p>
                <p className="font-semibold">{grievance.aiClassification.urgencyScore.toFixed(1)}/10</p>
              </div>
              <div className="bg-muted/50 rounded-md p-2 text-center">
                <p className="text-muted-foreground">Sentiment</p>
                <p className="font-semibold capitalize">{grievance.aiClassification.sentiment}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrievanceCard;
