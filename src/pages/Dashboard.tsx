
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardCheck, Clock, Bookmark, ExternalLink, Link as LinkIcon } from "lucide-react";
import ApplicationCard from "@/components/application/ApplicationCard";

const Dashboard = () => {
  const { agentProfile } = useAuth();
  const { applications, isLoading } = useApplications();
  const navigate = useNavigate();

  // Filter applications that belong to the current agent
  const agentApplications = agentProfile 
    ? applications.filter(app => app.agentId === agentProfile.id)
    : [];

  const pendingApplications = agentApplications.filter(app => app.status === "pending");
  const approvedApplications = agentApplications.filter(app => app.status === "approved");
  const totalApplications = agentApplications.length;

  const copyApplicationLink = () => {
    if (!agentProfile) return;
    
    const applicationUrl = `${window.location.origin}/apply/${agentProfile.urlSlug}`;
    navigator.clipboard.writeText(applicationUrl);
    
    // Alert the user that the link has been copied
    alert("Application link copied to clipboard!");
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {agentProfile?.name || "Agent"}
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your rental applications and settings
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              onClick={copyApplicationLink}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LinkIcon className="h-4 w-4" />
              Copy Application Link
            </Button>
            <Button
              onClick={() => navigate("/applications")}
              className="bg-realestate-navy hover:bg-realestate-navy/90"
            >
              View All Applications
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-600 text-sm font-medium">Total Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-realestate-navy" />
                <span className="text-3xl font-bold">{totalApplications}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-600 text-sm font-medium">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-6 w-6 mr-2 text-yellow-500" />
                <span className="text-3xl font-bold">{pendingApplications.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-600 text-sm font-medium">Approved Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <ClipboardCheck className="h-6 w-6 mr-2 text-green-500" />
                <span className="text-3xl font-bold">{approvedApplications.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Link Section */}
        <Card className="bg-realestate-light border-none">
          <CardHeader>
            <CardTitle>Your Custom Application Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="break-all">
                <span className="text-gray-800">
                  {window.location.origin}/apply/{agentProfile?.urlSlug || "your-name"}
                </span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyApplicationLink}
                >
                  Copy Link
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/apply/${agentProfile?.urlSlug || ""}`, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Share this link with prospective tenants to have them fill out your rental application.
            </p>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/applications")}
              className="text-realestate-teal"
            >
              View all
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : agentApplications.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agentApplications.slice(0, 6).map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-6">
                  Share your application link with prospective tenants to start receiving applications.
                </p>
                <Button
                  onClick={copyApplicationLink}
                  className="bg-realestate-navy hover:bg-realestate-navy/90"
                >
                  Copy Application Link
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
