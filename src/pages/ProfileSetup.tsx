
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Check } from "lucide-react";

const ProfileSetup = () => {
  const { agentProfile, updateProfile } = useAuth();
  const [logo, setLogo] = useState<string | undefined>(agentProfile?.logo);
  const [phone, setPhone] = useState(agentProfile?.phone || "");
  const [primaryColor, setPrimaryColor] = useState(agentProfile?.primaryColor || "#1a365d");
  const [urlSlug, setUrlSlug] = useState(agentProfile?.urlSlug || "");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset form when agentProfile changes
  useEffect(() => {
    if (agentProfile) {
      setLogo(agentProfile.logo);
      setPhone(agentProfile.phone);
      setPrimaryColor(agentProfile.primaryColor || "#1a365d");
      setUrlSlug(agentProfile.urlSlug);
    }
  }, [agentProfile]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For MVP, use URL.createObjectURL instead of actual upload
      const logoUrl = URL.createObjectURL(file);
      setLogo(logoUrl);
    }
  };

  const handleSave = async () => {
    // Generate URL slug if empty
    const finalUrlSlug = urlSlug || 
      (agentProfile?.name ? agentProfile.name.toLowerCase().replace(/\s+/g, '-') : "agent");

    const success = await updateProfile({
      logo,
      phone,
      primaryColor,
      urlSlug: finalUrlSlug,
    });

    if (success) {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Profile</h1>
        
        <div className="space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Business Logo</CardTitle>
              <CardDescription>
                Upload your business logo for use in your application forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                {logo ? (
                  <div className="mb-4">
                    <img
                      src={logo}
                      alt="Business logo"
                      className="h-24 w-auto object-contain"
                    />
                  </div>
                ) : (
                  <div className="mb-4 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      {logo ? "Change Logo" : "Upload Logo"}
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                This information will be displayed to applicants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="urlSlug">Custom URL</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      {window.location.origin}/apply/
                    </span>
                    <Input
                      id="urlSlug"
                      value={urlSlug}
                      onChange={(e) => {
                        // Replace spaces with hyphens and convert to lowercase
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '');
                        setUrlSlug(value);
                      }}
                      className="flex-1 rounded-l-none"
                      placeholder={agentProfile?.name.toLowerCase().replace(/\s+/g, '-')}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be the URL you share with applicants
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>
                Customize the look of your application forms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-md border border-gray-300"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32"
                    />
                    <div 
                      className="flex-1 h-10 rounded-md"
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              className="bg-realestate-navy hover:bg-realestate-navy/90"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfileSetup;
