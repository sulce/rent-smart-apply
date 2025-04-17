
import React from "react";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building, Mail, Phone, Link as LinkIcon, Share2 } from "lucide-react";

const AgentProfile = () => {
  const { agentProfile } = useAuth();
  const navigate = useNavigate();

  if (!agentProfile) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2>Profile not found. Please log in again.</h2>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </MainLayout>
    );
  }

  const copyApplicationLink = () => {
    const applicationUrl = `${window.location.origin}/apply/${agentProfile.urlSlug}`;
    navigator.clipboard.writeText(applicationUrl);
    alert("Application link copied to clipboard!");
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
          <Button
            onClick={() => navigate("/setup-profile")}
            variant="outline"
          >
            Edit Profile
          </Button>
        </div>

        <div className="space-y-6">
          {/* Business Profile */}
          <Card>
            <CardHeader>
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Your business information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-24 h-24 flex-shrink-0">
                  {agentProfile.logo ? (
                    <img
                      src={agentProfile.logo}
                      alt={`${agentProfile.businessName} logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building className="h-10 w-10 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{agentProfile.businessName}</h3>
                    <p className="text-gray-500">{agentProfile.name}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{agentProfile.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{agentProfile.phone || "No phone number added"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Link */}
          <Card>
            <CardHeader>
              <CardTitle>Your Application Link</CardTitle>
              <CardDescription>Share this link with prospective tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center break-all">
                  <LinkIcon className="h-4 w-4 mr-2 text-gray-500 shrink-0" />
                  <span className="text-gray-800">
                    {window.location.origin}/apply/{agentProfile.urlSlug}
                  </span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyApplicationLink}
                  >
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/apply/${agentProfile.urlSlug}`, "_blank")}
                  >
                    Open
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Your brand colors and customization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Primary Color</h4>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border border-gray-300"
                      style={{ backgroundColor: agentProfile.primaryColor }}
                    ></div>
                    <span className="text-gray-900">{agentProfile.primaryColor}</span>
                  </div>
                </div>
                
                {agentProfile.customQuestions && agentProfile.customQuestions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Custom Questions</h4>
                    <p className="text-gray-900">{agentProfile.customQuestions.length} custom questions configured</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AgentProfile;
