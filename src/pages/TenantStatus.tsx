
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, FileText, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { format } from "date-fns";
import { Document as DocumentType, TenantApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const TenantStatus = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<TenantApplication | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch application directly from database
  useEffect(() => {
    const fetchApplication = async () => {
      if (!id) {
        setError("Application ID is missing");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('tenant_applications')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw new Error(error.message);
        
        if (!data) {
          throw new Error("Application not found");
        }
        
        // Transform to app format
        const appData: TenantApplication = {
          id: data.id,
          agentId: data.agent_id,
          status: data.status as any,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          personalInfo: data.personal_info,
          employmentInfo: data.employment_info,
          rentalHistory: data.rental_history,
          references: data.tenant_references,
          documents: data.documents || [],
          customAnswers: data.custom_answers || [],
          additionalInfoRequest: data.additional_info_request
        };
        
        setApplication(appData);
      } catch (error: any) {
        console.error("Error fetching application:", error.message);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplication();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading application status...</p>
        </div>
      </div>
    );
  }
  
  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The application you're looking for doesn't exist or is no longer available."}
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
  
  const { status, personalInfo, createdAt, documents } = application;
  
  const getStatusIcon = () => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-12 w-12 text-green-500 mb-4" />;
      case "rejected":
        return <XCircle className="h-12 w-12 text-red-500 mb-4" />;
      case "info-requested":
        return <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />;
      default:
        return <Clock className="h-12 w-12 text-blue-500 mb-4" />;
    }
  };
  
  const getStatusMessage = () => {
    switch (status) {
      case "approved":
        return "Congratulations! Your application has been approved.";
      case "rejected":
        return "We're sorry, but your application has been declined.";
      case "forwarded":
        return "Your application has been forwarded to the property owner for review.";
      case "info-requested":
        return "Additional information has been requested for your application.";
      default:
        return "Your application is currently under review.";
    }
  };
  
  const getStatusDescription = () => {
    switch (status) {
      case "approved":
        return "The property manager will contact you soon with next steps.";
      case "rejected":
        return "Please contact the property manager for more information.";
      case "forwarded":
        return "The property owner is reviewing your application and will make a decision soon.";
      case "info-requested":
        return "Please check your email for details on what additional information is needed.";
      default:
        return "We'll notify you when there's an update on your application status.";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-t-4" style={{ borderTopColor: getStatusColorByStatus(status) }}>
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                {getStatusIcon()}
                <CardTitle className="text-2xl">{personalInfo.fullName}'s Application</CardTitle>
                <div className="mt-2">
                  <StatusBadge status={status} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <p className="text-lg font-medium mb-2">{getStatusMessage()}</p>
                <p className="text-gray-600">{getStatusDescription()}</p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">Submitted on</div>
                  <div className="font-medium">{format(new Date(createdAt), "PPP")}</div>
                </div>
              </div>
              
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="flex items-center justify-center">
                    <User className="h-4 w-4 mr-2" />
                    Application Details
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center justify-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Uploaded Documents
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="pt-4">
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Name</dt>
                      <dd className="mt-1 text-gray-900">{personalInfo.fullName}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-gray-900">{personalInfo.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-gray-900">{personalInfo.phone}</dd>
                    </div>
                  </dl>
                </TabsContent>
                <TabsContent value="documents" className="pt-4">
                  {documents.length > 0 ? (
                    <ul className="space-y-2">
                      {documents.map((doc: DocumentType) => (
                        <li key={doc.id} className="flex items-center justify-between p-2 bg-white border rounded-md">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-blue-500 mr-2" />
                            <span>{doc.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            View
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center text-gray-500 py-4">No documents uploaded</p>
                  )}
                </TabsContent>
              </Tabs>
              
              {status === "info-requested" && application.additionalInfoRequest && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                  <h3 className="font-medium text-amber-800 flex items-center mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Additional Information Requested
                  </h3>
                  <p className="text-amber-700 text-sm">
                    {application.additionalInfoRequest}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-500 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get status color
function getStatusColorByStatus(status: string): string {
  switch (status) {
    case "approved":
      return "#10B981"; // green
    case "rejected":
      return "#EF4444"; // red  
    case "info-requested":
      return "#F59E0B"; // amber
    case "forwarded":
      return "#3B82F6"; // blue
    default:
      return "#6B7280"; // gray
  }
}

export default TenantStatus;
