
import React from "react";
import { cn } from "@/lib/utils";
import { ApplicationStatus } from "@/types";

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "forwarded":
        return "bg-blue-100 text-blue-800";
      case "info-requested":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "forwarded":
        return "Forwarded";
      case "info-requested":
        return "Info Requested";
      default:
        return "Unknown";
    }
  };

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center justify-center",
        getStatusStyles(),
        className
      )}
    >
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;
