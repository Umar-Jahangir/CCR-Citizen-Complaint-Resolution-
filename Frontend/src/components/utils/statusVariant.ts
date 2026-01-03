export function statusToBadgeVariant(
  status: "pending" | "in-progress" | "resolved"
): "status-pending" | "status-progress" | "status-resolved" {
  switch (status) {
    case "pending":
      return "status-pending";
    case "in-progress":
      return "status-progress";
    case "resolved":
      return "status-resolved";
  }
}
