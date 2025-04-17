
import React, { createContext, useState, useContext, useEffect } from "react";
import { TenantApplication, ApplicationStatus } from "../types";

interface ApplicationContextType {
  applications: TenantApplication[];
  isLoading: boolean;
  getApplicationById: (id: string) => TenantApplication | undefined;
  getApplicationsByAgentId: (agentId: string) => TenantApplication[];
  createApplication: (application: Omit<TenantApplication, "id" | "createdAt" | "updatedAt">) => TenantApplication;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => boolean;
  updateApplication: (id: string, data: Partial<TenantApplication>) => boolean;
}

// Sample application data for the MVP
const sampleApplications: TenantApplication[] = [
  {
    id: "app-1",
    agentId: "agent-1",
    status: "pending",
    createdAt: new Date("2023-11-10T10:00:00Z"),
    updatedAt: new Date("2023-11-10T10:00:00Z"),
    personalInfo: {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "(555) 987-6543",
      dateOfBirth: "1988-04-15",
    },
    employmentInfo: {
      employer: "Tech Solutions Inc.",
      position: "Software Developer",
      income: "85000",
      employmentLength: "3 years",
      employerContact: "HR Dept: (555) 123-4567",
    },
    rentalHistory: {
      currentAddress: "123 Main St, Apt 4B, Cityville, ST 12345",
      currentLandlord: "Property Management LLC",
      currentLandlordPhone: "(555) 456-7890",
      lengthOfStay: "2 years",
      reasonForLeaving: "Relocating for new job",
    },
    references: [
      {
        name: "Jane Smith",
        relationship: "Former Colleague",
        phone: "(555) 222-3333",
      },
      {
        name: "Michael Johnson",
        relationship: "Personal Friend",
        phone: "(555) 444-5555",
      },
    ],
    documents: [
      {
        id: "doc-1",
        name: "ID Document",
        type: "image/jpeg",
        url: "/placeholder.svg",
        uploadedAt: new Date("2023-11-10T10:00:00Z"),
      },
      {
        id: "doc-2",
        name: "Proof of Income",
        type: "application/pdf",
        url: "/placeholder.svg",
        uploadedAt: new Date("2023-11-10T10:00:00Z"),
      },
    ],
    customAnswers: [
      {
        questionId: "cq1",
        answer: "No"
      },
      {
        questionId: "cq2",
        answer: "2 years minimum"
      }
    ]
  },
  {
    id: "app-2",
    agentId: "agent-1",
    status: "approved",
    createdAt: new Date("2023-10-05T14:30:00Z"),
    updatedAt: new Date("2023-10-08T09:15:00Z"),
    personalInfo: {
      fullName: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 123-7890",
    },
    employmentInfo: {
      employer: "City Hospital",
      position: "Registered Nurse",
      income: "72000",
      employmentLength: "5 years",
    },
    rentalHistory: {
      currentAddress: "456 Oak Ave, Townsville, ST 67890",
      lengthOfStay: "4 years",
    },
    references: [
      {
        name: "Robert Smith",
        relationship: "Supervisor",
        phone: "(555) 888-9999",
      }
    ],
    documents: [
      {
        id: "doc-3",
        name: "Driver's License",
        type: "image/png",
        url: "/placeholder.svg",
        uploadedAt: new Date("2023-10-05T14:30:00Z"),
      }
    ]
  }
];

// Create the context with default values
const ApplicationContext = createContext<ApplicationContextType>({
  applications: [],
  isLoading: true,
  getApplicationById: () => undefined,
  getApplicationsByAgentId: () => [],
  createApplication: () => ({} as TenantApplication),
  updateApplicationStatus: () => false,
  updateApplication: () => false,
});

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load applications from localStorage or use sample data
    const loadApplications = () => {
      const storedApplications = localStorage.getItem("applications");
      
      if (storedApplications) {
        // Parse dates correctly
        const parsedApplications = JSON.parse(storedApplications, (key, value) => {
          if (key === "createdAt" || key === "updatedAt" || key === "uploadedAt") {
            return new Date(value);
          }
          return value;
        });
        
        setApplications(parsedApplications);
      } else {
        // Use sample data for the first load
        setApplications(sampleApplications);
        localStorage.setItem("applications", JSON.stringify(sampleApplications));
      }
      
      setIsLoading(false);
    };
    
    loadApplications();
  }, []);

  const getApplicationById = (id: string): TenantApplication | undefined => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByAgentId = (agentId: string): TenantApplication[] => {
    return applications.filter(app => app.agentId === agentId);
  };

  const createApplication = (applicationData: Omit<TenantApplication, "id" | "createdAt" | "updatedAt">): TenantApplication => {
    const newApplication: TenantApplication = {
      ...applicationData,
      id: `app-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const updatedApplications = [...applications, newApplication];
    setApplications(updatedApplications);
    localStorage.setItem("applications", JSON.stringify(updatedApplications));
    
    return newApplication;
  };

  const updateApplicationStatus = (id: string, status: ApplicationStatus): boolean => {
    try {
      const appIndex = applications.findIndex(app => app.id === id);
      if (appIndex === -1) return false;
      
      const updatedApplications = [...applications];
      updatedApplications[appIndex] = {
        ...updatedApplications[appIndex],
        status,
        updatedAt: new Date()
      };
      
      setApplications(updatedApplications);
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      return true;
    } catch (error) {
      console.error("Error updating application status:", error);
      return false;
    }
  };

  const updateApplication = (id: string, data: Partial<TenantApplication>): boolean => {
    try {
      const appIndex = applications.findIndex(app => app.id === id);
      if (appIndex === -1) return false;
      
      const updatedApplications = [...applications];
      updatedApplications[appIndex] = {
        ...updatedApplications[appIndex],
        ...data,
        updatedAt: new Date()
      };
      
      setApplications(updatedApplications);
      localStorage.setItem("applications", JSON.stringify(updatedApplications));
      return true;
    } catch (error) {
      console.error("Error updating application:", error);
      return false;
    }
  };

  return (
    <ApplicationContext.Provider value={{
      applications,
      isLoading,
      getApplicationById,
      getApplicationsByAgentId,
      createApplication,
      updateApplicationStatus,
      updateApplication
    }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => useContext(ApplicationContext);
