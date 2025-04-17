
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApplications } from "@/context/ApplicationContext";
import MainLayout from "@/components/layout/MainLayout";
import ApplicationCard from "@/components/application/ApplicationCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApplicationStatus, TenantApplication } from "@/types";
import { Search, Filter } from "lucide-react";

const Applications = () => {
  const { agentProfile } = useAuth();
  const { applications } = useApplications();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  
  // Debug logging for checking applications
  useEffect(() => {
    console.log("Applications page - Current agent profile:", agentProfile);
    console.log("Applications page - All applications:", applications);
    
    if (agentProfile) {
      const agentApps = applications.filter(app => app.agentId === agentProfile.id);
      console.log("Applications page - Filtered applications for agent:", agentApps);
    }
  }, [applications, agentProfile]);

  // Filter applications that belong to the current agent
  const agentApplications = agentProfile 
    ? applications.filter(app => app.agentId === agentProfile.id)
    : [];

  // Apply filters
  const filteredApplications = agentApplications.filter((application) => {
    const matchesSearch = 
      application.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your tenant applications
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "all")}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="forwarded">Forwarded</SelectItem>
                <SelectItem value="info-requested">Info Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Applications Grid */}
        {agentApplications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
            <p className="text-gray-500 mt-2">
              Share your application link with prospective tenants to start receiving applications.
            </p>
          </div>
        )}

        {/* No results message */}
        {agentApplications.length > 0 && filteredApplications.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-lg font-medium text-gray-900">No matching applications</h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Applications;
