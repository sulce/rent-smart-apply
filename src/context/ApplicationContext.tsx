
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TenantApplication, Document, ApplicationStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ApplicationContextType {
  applications: TenantApplication[];
  isLoading: boolean;
  createApplication: (application: Omit<TenantApplication, "id" | "createdAt" | "updatedAt">) => Promise<TenantApplication>;
  getApplication: (id: string) => TenantApplication | undefined;
  updateApplication: (id: string, data: Partial<TenantApplication>) => void;
  deleteApplication: (id: string) => void;
  updateApplicationStatus: (applicationId: string, status: ApplicationStatus) => Promise<void>;
  getApplicationById: (applicationId: string) => Promise<TenantApplication | null>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, agentProfile, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Load applications from database when authenticated
  useEffect(() => {
    const loadApplications = async () => {
      if (isAuthenticated && user) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('tenant_applications')
            .select('*');
          
          if (error) throw new Error(error.message);
          
          if (data) {
            console.log("Loaded applications from DB:", data);
            
            // Transform from DB format to app format
            const transformedData: TenantApplication[] = data.map(app => ({
              id: app.id,
              agentId: app.agent_id,
              status: app.status as ApplicationStatus,
              createdAt: new Date(app.created_at),
              updatedAt: new Date(app.updated_at),
              personalInfo: app.personal_info,
              employmentInfo: app.employment_info,
              rentalHistory: app.rental_history,
              references: app.tenant_references,
              documents: app.documents || [],
              customAnswers: app.custom_answers || [],
              additionalInfoRequest: app.additional_info_request
            }));
            
            setApplications(transformedData);
          }
        } catch (error: any) {
          console.error("Error loading applications:", error.message);
          toast({
            title: "Error loading applications",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, [isAuthenticated, user]);

  // Create new application in database
  const createApplication = async (applicationData: Omit<TenantApplication, "id" | "createdAt" | "updatedAt">) => {
    try {
      console.log("Creating application:", applicationData);
      
      // Transform from app format to DB format
      const dbApplication = {
        agent_id: applicationData.agentId,
        status: applicationData.status,
        personal_info: applicationData.personalInfo,
        employment_info: applicationData.employmentInfo,
        rental_history: applicationData.rentalHistory,
        tenant_references: applicationData.references,
        documents: applicationData.documents || [],
        custom_answers: applicationData.customAnswers || [],
        additional_info_request: applicationData.additionalInfoRequest
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('tenant_applications')
        .insert(dbApplication)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      // Transform back to app format
      const newApplication: TenantApplication = {
        id: data.id,
        agentId: data.agent_id,
        status: data.status as ApplicationStatus,
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
      
      setApplications(prev => [...prev, newApplication]);
      
      return newApplication;
    } catch (error: any) {
      console.error("Error creating application:", error.message);
      toast({
        title: "Error creating application",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get application by ID
  const getApplication = (id: string) => {
    return applications.find(app => app.id === id);
  };

  // Update application in database
  const updateApplication = async (id: string, applicationData: Partial<TenantApplication>) => {
    try {
      // Transform from app format to DB format
      const dbApplication: any = {};
      
      if (applicationData.status !== undefined) dbApplication.status = applicationData.status;
      if (applicationData.personalInfo !== undefined) dbApplication.personal_info = applicationData.personalInfo;
      if (applicationData.employmentInfo !== undefined) dbApplication.employment_info = applicationData.employmentInfo;
      if (applicationData.rentalHistory !== undefined) dbApplication.rental_history = applicationData.rentalHistory;
      if (applicationData.references !== undefined) dbApplication.tenant_references = applicationData.references;
      if (applicationData.documents !== undefined) dbApplication.documents = applicationData.documents;
      if (applicationData.customAnswers !== undefined) dbApplication.custom_answers = applicationData.customAnswers;
      if (applicationData.additionalInfoRequest !== undefined) dbApplication.additional_info_request = applicationData.additionalInfoRequest;
      
      // Update in database
      const { error } = await supabase
        .from('tenant_applications')
        .update(dbApplication)
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Update in state
      setApplications(prev => prev.map(app => 
        app.id === id 
          ? { ...app, ...applicationData, updatedAt: new Date() } 
          : app
      ));
      
      toast({
        title: "Application updated",
        description: "The application has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating application:", error.message);
      toast({
        title: "Error updating application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Delete application from database
  const deleteApplication = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tenant_applications')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      // Remove from state
      setApplications(prev => prev.filter(app => app.id !== id));
      
      toast({
        title: "Application deleted",
        description: "The application has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting application:", error.message);
      toast({
        title: "Error deleting application",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    applications,
    isLoading,
    createApplication,
    getApplication,
    updateApplication,
    deleteApplication,
  };

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (context === undefined) {
    throw new Error("useApplications must be used within an ApplicationProvider");
  }
  return context;
};
