
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useApplications } from "@/context/ApplicationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Briefcase, Home, Users, FileText, Check, X, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { Document as DocumentType, TenantApplication } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

const LandlordView = () => {
  const { id } = useParams<{ id: string }>();
  const { applications, updateApplicationStatus, getApplicationById } = useApplications();
  const [application, setApplication] = useState<TenantApplication | undefined>(undefined);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch the application
    if (id) {
      const app = getApplicationById(id);
      setApplication(app);
    }
  }, [id, applications, getApplicationById]);

  const handleApprove = () => {
    if (!application) return;
    setIsSubmitting(true);
    
    try {
      updateApplicationStatus(application.id, "approved");
      toast({
        title: "Application Approved",
        description: "The agent will be notified of your decision.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the application status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    if (!application) return;
    setIsSubmitting(true);
    
    try {
      updateApplicationStatus(application.id, "rejected");
      toast({
        title: "Application Rejected",
        description: "The agent will be notified of your decision.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating the application status.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestInfo = () => {
    if (!application || !feedback.trim()) return;
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send a notification to the agent/tenant
      updateApplicationStatus(application.id, "info-requested");
      
      toast({
        title: "Information Requested",
        description: "Your request has been sent to the agent.",
      });
      setFeedback("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error sending your request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h1>
          <p className="text-gray-600">
            The application you're looking for doesn't exist or is no longer available.
          </p>
        </div>
      </div>
    );
  }

  const { personalInfo, employmentInfo, rentalHistory, references, documents, status, createdAt } = application;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{personalInfo.fullName}'s Application</h1>
                <p className="text-sm text-gray-500">
                  Submitted on {format(new Date(createdAt), "PPP")}
                </p>
              </div>
              <StatusBadge status={status} className="mt-2 sm:mt-0" />
            </div>
            
            <p className="text-gray-600 mb-6">
              This is a read-only view of a tenant application. After reviewing, you can approve, 
              reject, or request additional information.
            </p>
            
            {/* Main Content Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="personal" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="employment" className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Employment
                </TabsTrigger>
                <TabsTrigger value="rental" className="flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  Rental
                </TabsTrigger>
                <TabsTrigger value="references" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  References
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Full Name</dt>
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
                      {personalInfo.dateOfBirth && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                          <dd className="mt-1 text-gray-900">{personalInfo.dateOfBirth}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Employment Information */}
              <TabsContent value="employment">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employer</dt>
                        <dd className="mt-1 text-gray-900">{employmentInfo.employer}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Position</dt>
                        <dd className="mt-1 text-gray-900">{employmentInfo.position}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Annual Income</dt>
                        <dd className="mt-1 text-gray-900">
                          ${parseInt(employmentInfo.income).toLocaleString()}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Employment Length</dt>
                        <dd className="mt-1 text-gray-900">{employmentInfo.employmentLength}</dd>
                      </div>
                      {employmentInfo.employerContact && (
                        <div className="col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Employer Contact</dt>
                          <dd className="mt-1 text-gray-900">{employmentInfo.employerContact}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Rental History */}
              <TabsContent value="rental">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rental History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      <div className="col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Current Address</dt>
                        <dd className="mt-1 text-gray-900">{rentalHistory.currentAddress}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Length of Stay</dt>
                        <dd className="mt-1 text-gray-900">{rentalHistory.lengthOfStay}</dd>
                      </div>
                      {rentalHistory.currentLandlord && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Current Landlord</dt>
                          <dd className="mt-1 text-gray-900">{rentalHistory.currentLandlord}</dd>
                        </div>
                      )}
                      {rentalHistory.currentLandlordPhone && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Landlord Phone</dt>
                          <dd className="mt-1 text-gray-900">{rentalHistory.currentLandlordPhone}</dd>
                        </div>
                      )}
                      {rentalHistory.reasonForLeaving && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Reason for Leaving</dt>
                          <dd className="mt-1 text-gray-900">{rentalHistory.reasonForLeaving}</dd>
                        </div>
                      )}
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* References */}
              <TabsContent value="references">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">References</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {references.map((reference, index) => (
                        <div key={index} className="border-t pt-4 first:border-0 first:pt-0">
                          <h4 className="font-medium text-gray-900 mb-2">Reference #{index + 1}</h4>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Name</dt>
                              <dd className="mt-1 text-gray-900">{reference.name}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Relationship</dt>
                              <dd className="mt-1 text-gray-900">{reference.relationship}</dd>
                            </div>
                            <div>
                              <dt className="text-sm font-medium text-gray-500">Phone</dt>
                              <dd className="mt-1 text-gray-900">{reference.phone}</dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map((doc: DocumentType) => (
                        <div
                          key={doc.id}
                          className="border rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <FileText className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                              <h4 className="font-medium text-gray-900">{doc.name}</h4>
                              <p className="text-xs text-gray-500">
                                Uploaded on {format(new Date(doc.uploadedAt), "PPP")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(doc.url, "_blank")}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>

                    {documents.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No documents uploaded
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Decision Section */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Make a Decision</h2>
              
              {status === "pending" || status === "forwarded" ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={isSubmitting}
                      variant="destructive"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Request Additional Information</h3>
                    <Textarea
                      placeholder="What additional information do you need from the applicant?"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button
                      onClick={handleRequestInfo}
                      disabled={isSubmitting || !feedback.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Request
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600">
                    {status === "approved"
                      ? "You have already approved this application."
                      : status === "rejected"
                      ? "You have already rejected this application."
                      : "Additional information has been requested from the applicant."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordView;
