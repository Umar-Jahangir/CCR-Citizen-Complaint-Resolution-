import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { format } from "date-fns";
import { AdminGrievance } from "@/types/adminGrievance";
import { statusToBadgeVariant } from "@/components/utils/statusVariant";

interface Props {
  grievances: AdminGrievance[];
  onView: (g: AdminGrievance) => void;
}

export default function AdminGrievanceTable({ grievances, onView }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {grievances.map((g) => (
            <TableRow key={g.ticketId}>
              <TableCell className="font-mono text-xs">{g.ticketId}</TableCell>
              <TableCell className="font-medium">{g.title}</TableCell>
              <TableCell>{g.category}</TableCell>
              <TableCell>{g.location}</TableCell>
              <TableCell>
                <Badge variant={`priority-${g.priority}`}>
                    {g.priority}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusToBadgeVariant(g.status)}>
                    {g.status}
                </Badge>

              </TableCell>
              <TableCell>{g.department}</TableCell>
              <TableCell className="text-xs">
                {format(new Date(g.submittedAt), "dd MMM yyyy")}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => onView(g)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
