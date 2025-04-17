import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApplications } from "@/context/ApplicationContext";
import { AgentProfile, Document, CustomQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import DocumentUploader from "@/components/application/DocumentUploader";
import { ArrowRight, ArrowLeft, Building, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  
  // Employment Info
  employer: string;
  position: string;
  income: string;
  employmentLength: string;
  employerContact: string;
  
  // Rental History
  currentAddress: string;
  currentLandlord: string;
  currentLandlordPhone: string;
  lengthOfStay: string;
  reasonForLeaving: string;
  
  // References
  references: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  
  // Documents
  documents: Document[];
  
  // Custom Answers
  customAnswers: { questionId: string; answer: string }[];
}

const TenantApplication = () => {
  const { agentSlug } = useParams<{ agentSlug: string }>();
  const navigate = useNavigate();
  const { createApplication } = useApplications();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    // Personal Info
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    
    // Employment Info
    employer: "",
    position: "",
    income: "",
    employmentLength: "",
    employerContact: "",
    
    // Rental History
    currentAddress: "",
    currentLandlord: "",
    currentLandlordPhone: "",
    lengthOfStay: "",
    reasonForLeaving: "",
    
    // References
    references: [{ name: "", relationship: "", phone: "" }],
    
    // Documents
    documents: [],
    
    // Custom Answers
    customAnswers: [],
  });

  // Load agent profile based on the slug
  useEffect(() => {
    const fetchAgentBySlug = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching agent with slug:", agentSlug);
        
        // First check localStorage for all agents
        const storedProfiles = localStorage.getItem("agentProfiles");
        
        if (storedProfiles) {
          try {
            const agentProfiles = JSON.parse(storedProfiles);
            console.log("Found agent profiles:", agentProfiles);
            
            if (Array.isArray(agentProfiles) && agentProfiles.length > 0) {
              const foundAgent = agentProfiles.find((agent: AgentProfile) => agent.urlSlug === agentSlug);
              if (foundAgent) {
                console.log("Found agent in agentProfiles:", foundAgent);
                setAgent(foundAgent);
                
                // Set up custom questions if the agent has any
                if (foundAgent.customQuestions?.length) {
                  setFormData(prev => ({
                    ...prev,
                    customAnswers: foundAgent.customQuestions.map((q: CustomQuestion) => ({ 
                      questionId: q.id, 
                      answer: "" 
                    }))
                  }));
                }
                
                setIsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error("Error parsing agentProfiles:", error);
          }
        }
        
        // Check individual agent profile
        const storedAgent = localStorage.getItem("agentProfile");
        if (storedAgent) {
          try {
            const agentData = JSON.parse(storedAgent);
            if (agentData.urlSlug === agentSlug) {
              console.log("Found agent in agentProfile:", agentData);
              setAgent(agentData);
              
              // Set up custom questions if the agent has any
              if (agentData.customQuestions?.length) {
                setFormData(prev => ({
                  ...prev,
                  customAnswers: agentData.customQuestions.map((q: CustomQuestion) => ({ 
                    questionId: q.id, 
                    answer: "" 
                  }))
                }));
              }
              
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("Error parsing agentProfile:", error);
          }
        }
        
        // If not found anywhere, use a default agent
        const defaultAgent: AgentProfile = {
          id: `agent-default-${Date.now()}`,
          name: "Default Agent",
          businessName: "Default Real Estate",
          email: "contact@defaultrealestate.com",
          phone: "(555) 555-5555",
          logo: "/placeholder.svg",
          primaryColor: "#1a365d",
          urlSlug: agentSlug || "default-agent",
          customQuestions: []
        };
        
        console.log("Using default agent:", defaultAgent);
        setAgent(defaultAgent);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching agent:", error);
        setIsLoading(false);
      }
    };
    
    fetchAgentBySlug();
  }, [agentSlug]);

  // Handler for input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, section?: string, index?: number) => {
    const { name, value } = e.target;
    
    if (section === "references" && typeof index === "number") {
      // Update references array
      const updatedReferences = [...formData.references];
      updatedReferences[index] = {
        ...updatedReferences[index],
        [name]: value,
      };
      
      setFormData({
        ...formData,
        references: updatedReferences,
      });
    } else {
      // Update regular fields
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle custom question answers
  const handleCustomQuestionChange = (questionId: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      customAnswers: prev.customAnswers.map(q => 
        q.questionId === questionId ? { ...q, answer } : q
      )
    }));
  };

  // Add a new reference
  const addReference = () => {
    setFormData({
      ...formData,
      references: [...formData.references, { name: "", relationship: "", phone: "" }],
    });
  };

  // Remove a reference
  const removeReference = (indexToRemove: number) => {
    if (formData.references.length <= 1) return; // Keep at least one reference
    
    setFormData({
      ...formData,
      references: formData.references.filter((_, index) => index !== indexToRemove),
    });
  };

  // Handle document uploads
  const handleDocumentsUpdate = (documents: Document[]) => {
    setFormData({
      ...formData,
      documents,
    });
  };

  // Submit the application
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    try {
      if (!agent) {
        console.error("No agent found for application submission");
        toast({
          title: "Submission Error",
          description: "Could not identify the agent for this application.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log("Creating application with agent ID:", agent.id);
      
      const newApplication = createApplication({
        agentId: agent.id,
        status: "pending",
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
        },
        employmentInfo: {
          employer: formData.employer,
          position: formData.position,
          income: formData.income,
          employmentLength: formData.employmentLength,
          employerContact: formData.employerContact,
        },
        rentalHistory: {
          currentAddress: formData.currentAddress,
          currentLandlord: formData.currentLandlord,
          currentLandlordPhone: formData.currentLandlordPhone,
          lengthOfStay: formData.lengthOfStay,
          reasonForLeaving: formData.reasonForLeaving,
        },
        references: formData.references,
        documents: formData.documents,
        customAnswers: formData.customAnswers
      });
      
      console.log("Application created successfully:", newApplication);
      
      // Show success message and navigate to the confirmation screen
      setIsComplete(true);
      toast({
        title: "Application Submitted",
        description: "Your rental application has been successfully submitted.",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Error",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading application form...</p>
        </div>
      </div>
    );
  }

  // Steps configuration
  const steps = [
    {
      title: "Personal Information",
      fields: ["fullName", "email", "phone"],
    },
    {
      title: "Employment Information",
      fields: ["employer", "position", "income"],
    },
    {
      title: "Rental History",
      fields: ["currentAddress", "lengthOfStay"],
    },
    {
      title: "References",
      fields: ["references"],
    },
    {
      title: "Documents",
      fields: ["documents"],
    },
    ...(agent?.customQuestions && agent.customQuestions.length > 0 
      ? [{ title: "Additional Questions", fields: ["customQuestions"] }] 
      : []),
  ];

  // Check if the current step is valid
  const isStepValid = () => {
    const currentStepFields = steps[currentStep].fields;
    
    // Special checks for specific steps
    if (currentStep === 0) {
      // Personal Info validation
      return (
        formData.fullName.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.phone.trim() !== ""
      );
    } else if (currentStep === 1) {
      // Employment info validation
      return (
        formData.employer.trim() !== "" &&
        formData.position.trim() !== "" &&
        formData.income.trim() !== ""
      );
    } else if (currentStep === 2) {
      // Rental history validation
      return (
        formData.currentAddress.trim() !== "" &&
        formData.lengthOfStay.trim() !== ""
      );
    } else if (currentStep === 3) {
      // References validation
      return formData.references.some(ref => ref.name.trim() !== "" && ref.phone.trim() !== "");
    } else if (currentStep === 4) {
      // Documents validation (optional)
      return true;
    } else if (currentStep === 5 && agent?.customQuestions?.length) {
      // Custom questions validation - only required questions must be filled
      const requiredQuestions = agent.customQuestions.filter(q => q.required);
      if (requiredQuestions.length === 0) return true;
      
      return requiredQuestions.every(q => {
        const answer = formData.customAnswers.find(a => a.questionId === q.id)?.answer;
        return answer && answer.trim() !== "";
      });
    }
    
    return false;
  };

  // Navigation between steps
  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render a different view if the application is complete
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4 flex items-center">
            {agent?.logo ? (
              <img
                src={agent.logo}
                alt={`${agent.businessName} logo`}
                className="h-10 w-auto"
              />
            ) : (
              <Building 
                className="h-8 w-8" 
                style={{ color: agent?.primaryColor || "#1a365d" }}
              />
            )}
            <span className="ml-2 text-xl font-semibold" style={{ color: agent?.primaryColor || "#1a365d" }}>
              {agent?.businessName || "Rental Application"}
            </span>
          </div>
        </header>
        
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-8 text-center">
            <CheckCircle 
              className="h-16 w-16 mx-auto mb-6" 
              style={{ color: agent?.primaryColor || "#1a365d" }}
            />
            <h1 className="text-2xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for submitting your rental application. Your application has been received and will be reviewed shortly.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              You will be contacted at {formData.email} with updates on your application status.
            </p>
            <Button
              onClick={() => navigate("/")}
              style={{ 
                backgroundColor: agent?.primaryColor || "#1a365d",
                color: "white"
              }}
            >
              Return to Home
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 flex items-center">
          {agent?.logo ? (
            <img
              src={agent.logo}
              alt={`${agent.businessName} logo`}
              className="h-10 w-auto"
            />
          ) : (
            <Building 
              className="h-8 w-8" 
              style={{ color: agent?.primaryColor || "#1a365d" }}
            />
          )}
          <span className="ml-2 text-xl font-semibold" style={{ color: agent?.primaryColor || "#1a365d" }}>
            {agent?.businessName || "Rental Application"}
          </span>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center ${index > 0 ? 'flex-1' : ''}`}
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      currentStep >= index 
                        ? 'text-white' 
                        : 'bg-white text-gray-400 border border-gray-300'
                    }`}
                    style={{
                      backgroundColor: currentStep >= index ? (agent?.primaryColor || "#1a365d") : undefined,
                    }}
                  >
                    {currentStep > index ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                  {index < steps.length - 1 && (
                    <div 
                      className={`hidden sm:block h-0.5 w-full ${
                        currentStep > index ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: currentStep > index ? (agent?.primaryColor || "#1a365d") : undefined,
                      }}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">{steps[currentStep].title}</h2>
            
            {/* Step 1: Personal Information */}
            {currentStep === 0 && (
              <div className="form-step">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Employment Information */}
            {currentStep === 1 && (
              <div className="form-step">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="employer">Employer Name *</Label>
                    <Input
                      id="employer"
                      name="employer"
                      value={formData.employer}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="position">Position/Title *</Label>
                    <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="income">Annual Income *</Label>
                    <Input
                      id="income"
                      name="income"
                      type="text"
                      value={formData.income}
                      onChange={handleInputChange}
                      placeholder="$"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employmentLength">Length of Employment *</Label>
                    <Input
                      id="employmentLength"
                      name="employmentLength"
                      value={formData.employmentLength}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="employerContact">Employer Contact (optional)</Label>
                    <Input
                      id="employerContact"
                      name="employerContact"
                      value={formData.employerContact}
                      onChange={handleInputChange}
                      placeholder="HR contact or supervisor"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Rental History */}
            {currentStep === 2 && (
              <div className="form-step">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentAddress">Current Address *</Label>
                    <Textarea
                      id="currentAddress"
                      name="currentAddress"
                      value={formData.currentAddress}
                      onChange={handleInputChange}
                      placeholder="Street, City, State, ZIP"
                      className="h-24"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lengthOfStay">Length of Stay *</Label>
                    <Input
                      id="lengthOfStay"
                      name="lengthOfStay"
                      value={formData.lengthOfStay}
                      onChange={handleInputChange}
                      placeholder="e.g., 3 years"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentLandlord">Current Landlord/Property Manager</Label>
                    <Input
                      id="currentLandlord"
                      name="currentLandlord"
                      value={formData.currentLandlord}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currentLandlordPhone">Landlord Phone Number</Label>
                    <Input
                      id="currentLandlordPhone"
                      name="currentLandlordPhone"
                      value={formData.currentLandlordPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reasonForLeaving">Reason for Leaving</Label>
                    <Textarea
                      id="reasonForLeaving"
                      name="reasonForLeaving"
                      value={formData.reasonForLeaving}
                      onChange={handleInputChange}
                      className="h-20"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 4: References */}
            {currentStep === 3 && (
              <div className="form-step">
                {formData.references.map((reference, index) => (
                  <div key={index} className="mb-6 pb-6 border-b last:border-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Reference #{index + 1}</h3>
                      {formData.references.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReference(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`reference-name-${index}`}>Name *</Label>
                        <Input
                          id={`reference-name-${index}`}
                          name="name"
                          value={reference.name}
                          onChange={(e) => handleInputChange(e, "references", index)}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`reference-relationship-${index}`}>Relationship *</Label>
                        <Input
                          id={`reference-relationship-${index}`}
                          name="relationship"
                          value={reference.relationship}
                          onChange={(e) => handleInputChange(e, "references", index)}
                          placeholder="e.g., Former Landlord, Employer, Personal"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`reference-phone-${index}`}>Phone Number *</Label>
                        <Input
                          id={`reference-phone-${index}`}
                          name="phone"
                          value={reference.phone}
                          onChange={(e) => handleInputChange(e, "references", index)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addReference}
                  className="w-full mt-4"
                >
                  Add Another Reference
                </Button>
              </div>
            )}
            
            {/* Step 5: Documents */}
            {currentStep === 4 && (
              <div className="form-step">
                <p className="mb-6 text-gray-600">
                  Please upload the following documents to support your application:
                </p>
                
                <ul className="list-disc pl-5 mb-6 text-gray-600">
                  <li>Photo ID (Driver's License, Passport, etc.)</li>
                  <li>Proof of Income (Pay stubs, Tax returns, etc.)</li>
                  <li>Employment Verification Letter</li>
                  <li>References (if available)</li>
                </ul>
                
                <DocumentUploader
                  onUpload={handleDocumentsUpdate}
                />
                
                <p className="mt-6 text-sm text-gray-500">
                  Accepted formats: JPEG, PNG, PDF (Max 5MB per file)
                </p>
              </div>
            )}
            
            {/* Step 6: Custom Questions */}
            {currentStep === 5 && agent?.customQuestions && agent.customQuestions.length > 0 && (
              <div className="form-step">
                <div className="space-y-6">
                  {agent.customQuestions.map((question) => (
                    <div key={question.id} className="space-y-2">
                      <Label htmlFor={`question-${question.id}`}>
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      
                      {question.type === "text" && (
                        <Input
                          id={`question-${question.id}`}
                          value={formData.customAnswers.find(a => a.questionId === question.id)?.answer || ""}
                          onChange={(e) => handleCustomQuestionChange(question.id, e.target.value)}
                          required={question.required}
                        />
                      )}
                      
                      {question.type === "radio" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                id={`question-${question.id}-option-${idx}`}
                                type="radio"
                                name={`question-${question.id}`}
                                value={option}
                                checked={formData.customAnswers.find(a => a.questionId === question.id)?.answer === option}
                                onChange={() => handleCustomQuestionChange(question.id, option)}
                                required={question.required}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              />
                              <label
                                htmlFor={`question-${question.id}-option-${idx}`}
                                className="ml-2 block text-sm text-gray-700"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "checkbox" && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option, idx) => (
                            <div key={idx} className="flex items-center">
                              <input
                                id={`question-${question.id}-option-${idx}`}
                                type="checkbox"
                                value={option}
                                checked={formData.customAnswers.find(a => a.questionId === question.id)?.answer?.includes(option) || false}
                                onChange={(e) => {
                                  const currentAnswers = formData.customAnswers.find(a => a.questionId === question.id)?.answer || "";
                                  const answersArray = currentAnswers ? currentAnswers.split(",") : [];
                                  
                                  if (e.target.checked) {
                                    answersArray.push(option);
                                  } else {
                                    const index = answersArray.indexOf(option);
                                    if (index > -1) answersArray.splice(index, 1);
                                  }
                                  
                                  handleCustomQuestionChange(question.id, answersArray.join(","));
                                }}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`question-${question.id}-option-${idx}`}
                                className="ml-2 block text-sm text-gray-700"
                              >
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {question.type === "select" && question.options && (
                        <select
                          id={`question-${question.id}`}
                          value={formData.customAnswers.find(a => a.questionId === question.id)?.answer || ""}
                          onChange={(e) => handleCustomQuestionChange(question.id, e.target.value)}
                          required={question.required}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                          <option value="">Select an option</option>
                          {question.options.map((option, idx) => (
                            <option key={idx} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="form-navigation mt-8 flex justify-between">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex items-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
              
              <div className="flex-1"></div>
              
              <Button
                onClick={goToNextStep}
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center"
                style={{ 
                  backgroundColor: agent?.primaryColor || "#1a365d",
                  color: "white" 
                }}
              >
                {currentStep < steps.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {agent?.businessName || "Rent Smart Apply"}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default TenantApplication;
