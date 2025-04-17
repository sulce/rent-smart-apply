
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApplications } from "@/context/ApplicationContext";
import MainLayout from "@/components/layout/MainLayout";
import StatusBadge from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Briefcase, 
  Home, 
  Users, 
  FileText, 
  Share2, 
  Download, 
  Check, 
  X, 
  AlertCircle, 
  MessageSquare 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationStatus, Document as DocumentType } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

const ApplicationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { applications, updateApplicationStatus, updateApplication } = useApplications();
  const [additionalInfoRequest, setAdditionalInfoRequest] = useState("");
  const { toast } = useToast();

  // Find the selected application
  const application = applications.find(app => app.id === id);

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    if (!application) return;
    
    const success = updateApplicationStatus(application.id, newStatus);
    
    if (success) {
      toast({
        title: "Status updated",
        description: `Application status changed to ${newStatus}`,
      });
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update application status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRequestInfo = () => {
    if (!application || !additionalInfoRequest.trim()) return;
    
    // In a real app, you'd send a notification to the tenant
    // For this MVP, we'll just update the status and store the request
    const success = updateApplication(application.id, {
      status: "info-requested",
      // In a real app, you would append this to an array of messages
      // Here we're just simulating the functionality
      additionalInfoRequest,
    });
    
    if (success) {
      toast({
        title: "Information requested",
        description: "The tenant will be notified of your request.",
      });
      setAdditionalInfoRequest("");
    } else {
      toast({
        title: "Request failed",
        description: "Failed to send information request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyShareLink = () => {
    if (!application) return;
    
    const shareUrl = `${window.location.origin}/public/${application.id}`;
    navigator.clipboard.writeText(shareUrl);
    
    toast({
      title: "Link copied",
      description: "Shareable application link copied to clipboard",
    });
  };

  if (!application) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Found</h2>
          <p className="text-gray-600 mb-6">
            The application you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/applications">Back to Applications</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { personalInfo, employmentInfo, rentalHistory, references, documents, status, createdAt } = application;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center">
            <Button asChild variant="ghost" size="sm" className="mr-4">
              <Link to="/applications">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{personalInfo.fullName}'s Application</h1>
              <p className="text-sm text-gray-500">
                Submitted on {format(new Date(createdAt), "PPP")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={copyShareLink}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // In a real app, you would generate and download a PDF
                toast({
                  title: "PDF Export",
                  description: "In a production app, this would download a PDF of the application.",
                });
              }}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Application Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center">
                <StatusBadge status={status} className="mr-3" />
                <span className="text-sm text-gray-500">
                  Last updated: {format(new Date(application.updatedAt), "PPP")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={status}
                  onValueChange={(value) => handleStatusChange(value as ApplicationStatus)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="forwarded">Forwarded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="personal" className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="employment" className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Employment</span>
            </TabsTrigger>
            <TabsTrigger value="rental" className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Rental History</span>
            </TabsTrigger>
            <TabsTrigger value="references" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">References</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="h-5 w-5 mr-2 text-realestate-teal" />
                  Personal Information
                </CardTitle>
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
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                    <dd className="mt-1 text-gray-900">{personalInfo.dateOfBirth || "Not provided"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Custom Questions (if any) */}
            {application.customAnswers && application.customAnswers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-4">
                    {application.customAnswers.map((answer) => (
                      <div key={answer.questionId}>
                        <dt className="text-sm font-medium text-gray-500">
                          {/* In a real app, you'd look up the question text */}
                          Custom Question #{answer.questionId}
                        </dt>
                        <dd className="mt-1 text-gray-900">
                          {Array.isArray(answer.answer) ? answer.answer.join(", ") : answer.answer}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Employment Information */}
          <TabsContent value="employment">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-realestate-teal" />
                  Employment Information
                </CardTitle>
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
                    <dd className="mt-1 text-gray-900">${parseInt(employmentInfo.income).toLocaleString()}</dd>
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
                <CardTitle className="text-lg flex items-center">
                  <Home className="h-5 w-5 mr-2 text-realestate-teal" />
                  Rental History
                </CardTitle>
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
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-realestate-teal" />
                  References
                </CardTitle>
                <CardDescription>
                  {references.length} {references.length === 1 ? "reference" : "references"} provided
                </CardDescription>
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
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-realestate-teal" />
                  Uploaded Documents
                </CardTitle>
                <CardDescription>
                  {documents.length} {documents.length === 1 ? "document" : "documents"} uploaded
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((doc: DocumentType) => (
                    <div
                      key={doc.id}
                      className="border rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-realestate-teal mr-3" />
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

        {/* Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Application Actions</CardTitle>
            <CardDescription>Update this application's status or request additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleStatusChange("approved")}
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Application
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleStatusChange("forwarded")}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Forward to Landlord
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
              >
                <X className="h-4 w-4 mr-2" />
                Reject Application
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Request Additional Information</h4>
              <div className="space-y-2">
                <Textarea
                  placeholder="Specify what additional information is needed from the applicant..."
                  value={additionalInfoRequest}
                  onChange={(e) => setAdditionalInfoRequest(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleRequestInfo}
                  disabled={!additionalInfoRequest.trim()}
                  variant="outline"
                  className="w-full"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ApplicationDetails;
