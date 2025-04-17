
import React, { createContext, useState, useContext, useEffect } from "react";
import { AgentProfile } from "../types";

interface AuthContextType {
  isAuthenticated: boolean;
  agentProfile: AgentProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (email: string, password: string, name: string, businessName: string) => Promise<boolean>;
  updateProfile: (profile: Partial<AgentProfile>) => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  agentProfile: null,
  isLoading: true,
  login: async () => false,
  logout: () => {},
  signup: async () => false,
  updateProfile: async () => false,
});

// Sample agent data for the MVP
const sampleAgentData: AgentProfile = {
  id: "agent-1",
  name: "Jane Smith",
  businessName: "Smith Real Estate",
  email: "jane@smithrealestate.com",
  phone: "(555) 123-4567",
  logo: "/placeholder.svg",
  primaryColor: "#1a365d",
  urlSlug: "jane-smith",
  customQuestions: [
    {
      id: "cq1",
      questionText: "Do you have any pets?",
      required: true,
      type: "radio",
      options: ["Yes", "No"]
    },
    {
      id: "cq2",
      questionText: "How long do you plan to stay at this property?",
      required: false,
      type: "text"
    }
  ]
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = () => {
      const storedAuth = localStorage.getItem("isAuthenticated");
      const storedProfile = localStorage.getItem("agentProfile");
      
      if (storedAuth === "true" && storedProfile) {
        setIsAuthenticated(true);
        setAgentProfile(JSON.parse(storedProfile));
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For MVP, we'll simulate login with sample data
    try {
      setIsLoading(true);
      
      // Simple validation
      if (email === "demo@example.com" && password === "password") {
        setIsAuthenticated(true);
        setAgentProfile(sampleAgentData);
        
        // Store in localStorage for persistence
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("agentProfile", JSON.stringify(sampleAgentData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    businessName: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For MVP, create a new agent profile
      const newAgent: AgentProfile = {
        id: `agent-${Date.now()}`,
        name,
        businessName,
        email,
        phone: "",
        urlSlug: name.toLowerCase().replace(/\s+/g, '-'),
        customQuestions: []
      };
      
      setIsAuthenticated(true);
      setAgentProfile(newAgent);
      
      // Store in localStorage
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("agentProfile", JSON.stringify(newAgent));
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAgentProfile(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("agentProfile");
  };

  const updateProfile = async (profile: Partial<AgentProfile>): Promise<boolean> => {
    try {
      if (!agentProfile) return false;
      
      const updatedProfile = { ...agentProfile, ...profile };
      setAgentProfile(updatedProfile);
      localStorage.setItem("agentProfile", JSON.stringify(updatedProfile));
      
      return true;
    } catch (error) {
      console.error("Update profile error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      agentProfile,
      isLoading,
      login,
      logout,
      signup,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
