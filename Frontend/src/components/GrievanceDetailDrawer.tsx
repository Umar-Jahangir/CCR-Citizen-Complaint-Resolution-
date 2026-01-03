import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AdminGrievance } from "@/types/adminGrievance";

import { updateGrievanceStatus } from "@/api/admin";

interface Props {
  grievance: AdminGrievance | null;
  onClose: () => void;
}


export default function GrievanceDetailDrawer({ grievance, onClose }: Props) {
  if (!grievance) return null;

  return (
    <Drawer open={!!grievance} onOpenChange={onClose}>
      <DrawerContent className="p-6 space-y-4">
        <DrawerHeader>
          <DrawerTitle>{grievance.title}</DrawerTitle>
          <p className="text-sm text-muted-foreground">{grievance.ticketId}</p>
        </DrawerHeader>

        <p>{grievance.description}</p>

        <div className="grid grid-cols-2 gap-4">
          <Badge>Status: {grievance.status}</Badge>
          <Badge>Priority: {grievance.priority}</Badge>
          <Badge>Urgency: {grievance.aiClassification?.urgencyScore}</Badge>
          <Badge>Sentiment: {grievance.aiClassification?.sentiment}</Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await updateGrievanceStatus(grievance.ticketId, "In Progress");
              onClose();
            }}
          >
            Mark In Progress
          </Button>

          <Button
            variant="hero"
            onClick={async () => {
              await updateGrievanceStatus(grievance.ticketId, "Resolved");
              onClose();
            }}
          >
            Resolve
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
