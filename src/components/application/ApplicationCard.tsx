
import React from "react";
import { TenantApplication } from "@/types";
import StatusBadge from "@/components/ui/status-badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface ApplicationCardProps {
  application: TenantApplication;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const { id, personalInfo, createdAt, status, documents } = application;

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
          <CardTitle className="text-lg">{personalInfo.fullName}</CardTitle>
          <div className="text-sm text-gray-500">{personalInfo.email}</div>
        </div>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {format(new Date(createdAt), "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm">
              {documents.length} documents
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant="outline">
          <Link to={`/application/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
