
// Define user roles
export type UserRole = "agent" | "tenant" | "landlord";

// Define application status types
export type ApplicationStatus = "pending" | "forwarded" | "rejected" | "approved" | "info-requested";

// Define agent profile type
export interface AgentProfile {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customQuestions?: CustomQuestion[];
  urlSlug: string;
}

// Define custom question type
export interface CustomQuestion {
  id: string;
  questionText: string;
  required: boolean;
  type: "text" | "radio" | "checkbox" | "select";
  options?: string[];
}

// Define document type
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: Date;
}

// Define tenant application type
export interface TenantApplication {
  id: string;
  agentId: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    dateOfBirth?: string;
  };
  employmentInfo: {
    employer: string;
    position: string;
    income: string;
    employmentLength: string;
    employerContact?: string;
  };
  rentalHistory: {
    currentAddress: string;
    currentLandlord?: string;
    currentLandlordPhone?: string;
    lengthOfStay: string;
    reasonForLeaving?: string;
  };
  references: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  documents: Document[];
  customAnswers?: {
    questionId: string;
    answer: string | string[];
  }[];
  additionalInfoRequest?: string; // Add this field to store requests for additional information
}
