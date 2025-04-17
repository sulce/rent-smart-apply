import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AgentProfile, UserRole, UserProfile, CustomQuestion } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: Session | null;
  agentProfile: AgentProfile | null;
  login: (email: string, password: string, navigate: (path: string) => void) => Promise<void>;
  signup: (email: string, password: string, navigate: (path: string) => void) => Promise<void>;
  logout: (navigate: (path: string) => void) => Promise<void>;
  updateAgentProfile: (profileData: Partial<AgentProfile>) => Promise<void>;
  createAgentProfile: (profileData: Omit<AgentProfile, "id">, navigate: (path: string) => void) => Promise<void>;
  addCustomQuestion: (question: CustomQuestion) => Promise<void>;
  deleteCustomQuestion: (questionId: string) => Promise<void>;
  updateCustomQuestion: (question: CustomQuestion) => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    console.log("Setting up auth listener");
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);
        
        // Fetch agent profile if user is authenticated, but use setTimeout to avoid Supabase deadlock
        if (currentSession?.user) {
          setTimeout(() => {
            fetchAgentProfile(currentSession.user.id);
          }, 0);
        } else {
          setAgentProfile(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Got initial session:", currentSession?.user?.id);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsAuthenticated(!!currentSession);
      
      // Fetch agent profile if there's an existing session
      if (currentSession?.user) {
        fetchAgentProfile(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch agent profile from database
  const fetchAgentProfile = async (userId: string) => {
    try {
      console.log("Fetching agent profile for user:", userId);
      const { data, error } = await supabase
        .from('agent_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching agent profile:", error.message);
        setAgentProfile(null);
      } else if (data) {
        console.log("Fetched agent profile:", data);
        // Transform from DB format to app format
        const profile: AgentProfile = {
          id: data.id,
          name: data.name,
          businessName: data.business_name,
          email: data.email,
          phone: data.phone || '',
          logo: data.logo || undefined,
          primaryColor: data.primary_color || '#1a365d',
          secondaryColor: data.secondary_color || undefined,
          urlSlug: data.url_slug,
          customQuestions: [] // We'll fetch these separately
        };
        
        // Fetch custom questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('custom_questions')
          .select('*')
          .eq('agent_id', data.id);
        
        if (!questionsError && questionsData) {
          console.log("Fetched custom questions:", questionsData);
          profile.customQuestions = questionsData.map(q => ({
            id: q.id,
            questionText: q.question_text,
            required: q.required || false,
            type: q.type as "text" | "radio" | "checkbox" | "select",
            options: q.options || []
          }));
        }
        
        setAgentProfile(profile);
      }
    } catch (error: any) {
      console.error("Error in fetchAgentProfile:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string, navigate: (path: string) => void) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: "Login successful",
        description: "You have been successfully logged in.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signup = async (email: string, password: string, navigate: (path: string) => void) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      
      toast({
        title: "Signup successful",
        description: "Your account has been created. Please check your email for verification.",
      });
      
      navigate("/setup-profile");
    } catch (error: any) {
      console.error("Signup error:", error.message);
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = async (navigate: (path: string) => void) => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setAgentProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logout successful",
        description: "You have been successfully logged out.",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update agent profile
  const updateAgentProfile = async (profileData: Partial<AgentProfile>) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      if (!agentProfile) {
        throw new Error("Agent profile not found");
      }

      setIsLoading(true);
      
      // Transform to DB format
      const dbProfileData: any = {};
      
      if (profileData.name !== undefined) dbProfileData.name = profileData.name;
      if (profileData.businessName !== undefined) dbProfileData.business_name = profileData.businessName;
      if (profileData.email !== undefined) dbProfileData.email = profileData.email;
      if (profileData.phone !== undefined) dbProfileData.phone = profileData.phone;
      if (profileData.logo !== undefined) dbProfileData.logo = profileData.logo;
      if (profileData.primaryColor !== undefined) dbProfileData.primary_color = profileData.primaryColor;
      if (profileData.secondaryColor !== undefined) dbProfileData.secondary_color = profileData.secondaryColor;
      if (profileData.urlSlug !== undefined) dbProfileData.url_slug = profileData.urlSlug;
      
      // Update profile in database
      const { error } = await supabase
        .from('agent_profiles')
        .update(dbProfileData)
        .eq('id', agentProfile.id);
      
      if (error) throw new Error(error.message);
      
      // Update custom questions if provided
      if (profileData.customQuestions) {
        // Get existing questions
        const { data: existingQuestions, error: fetchError } = await supabase
          .from('custom_questions')
          .select('id')
          .eq('agent_id', agentProfile.id);
        
        if (fetchError) throw new Error(fetchError.message);
        
        const existingIds = existingQuestions?.map(q => q.id) || [];
        const newQuestionIds = profileData.customQuestions.map(q => q.id).filter(id => id);
        
        // Delete questions that are no longer in the list
        const idsToDelete = existingIds.filter(id => !newQuestionIds.includes(id));
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('custom_questions')
            .delete()
            .in('id', idsToDelete);
          
          if (deleteError) throw new Error(deleteError.message);
        }
        
        // Update or insert questions
        for (const question of profileData.customQuestions) {
          const dbQuestion = {
            agent_id: agentProfile.id,
            question_text: question.questionText,
            required: question.required || false,
            type: question.type,
            options: question.options || []
          };
          
          if (question.id && existingIds.includes(question.id)) {
            // Update existing question
            const { error: updateError } = await supabase
              .from('custom_questions')
              .update(dbQuestion)
              .eq('id', question.id);
            
            if (updateError) throw new Error(updateError.message);
          } else {
            // Insert new question
            const { error: insertError } = await supabase
              .from('custom_questions')
              .insert(dbQuestion);
            
            if (insertError) throw new Error(insertError.message);
          }
        }
      }
      
      // Refresh profile data
      await fetchAgentProfile(user.id);
      
      toast({
        title: "Profile updated",
        description: "Your agent profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update profile error:", error.message);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create agent profile
  const createAgentProfile = async (profileData: Omit<AgentProfile, "id">, navigate: (path: string) => void) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      setIsLoading(true);
      
      // Transform to DB format
      const dbProfileData = {
        user_id: user.id,
        name: profileData.name,
        business_name: profileData.businessName,
        email: profileData.email,
        phone: profileData.phone,
        logo: profileData.logo,
        primary_color: profileData.primaryColor,
        secondary_color: profileData.secondaryColor,
        url_slug: profileData.urlSlug,
      };
      
      // Insert profile into database
      const { data, error } = await supabase
        .from('agent_profiles')
        .insert(dbProfileData)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      // Insert custom questions if any
      if (profileData.customQuestions && profileData.customQuestions.length > 0) {
        const dbQuestions = profileData.customQuestions.map(q => ({
          agent_id: data.id,
          question_text: q.questionText,
          required: q.required || false,
          type: q.type,
          options: q.options || []
        }));
        
        const { error: questionsError } = await supabase
          .from('custom_questions')
          .insert(dbQuestions);
        
        if (questionsError) throw new Error(questionsError.message);
      }
      
      // Refresh profile data
      await fetchAgentProfile(user.id);
      
      toast({
        title: "Profile created",
        description: "Your agent profile has been created successfully.",
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Create profile error:", error.message);
      toast({
        title: "Profile creation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add a custom question
  const addCustomQuestion = async (question: CustomQuestion) => {
    try {
      if (!user || !agentProfile) {
        throw new Error("User not authenticated or agent profile not found");
      }

      setIsLoading(true);

      const dbQuestion = {
        agent_id: agentProfile.id,
        question_text: question.questionText,
        required: question.required || false,
        type: question.type,
        options: question.options || []
      };

      // Insert the question
      const { data, error } = await supabase
        .from('custom_questions')
        .insert(dbQuestion)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Update the agentProfile state
      const newQuestion: CustomQuestion = {
        id: data.id,
        questionText: data.question_text,
        required: data.required,
        type: data.type as "text" | "radio" | "checkbox" | "select",
        options: data.options || []
      };

      setAgentProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          customQuestions: [...prev.customQuestions, newQuestion]
        };
      });

      toast({
        title: "Question added",
        description: "Custom question has been added successfully.",
      });
    } catch (error: any) {
      console.error("Add custom question error:", error.message);
      toast({
        title: "Adding question failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a custom question
  const deleteCustomQuestion = async (questionId: string) => {
    try {
      if (!user || !agentProfile) {
        throw new Error("User not authenticated or agent profile not found");
      }

      setIsLoading(true);

      // Delete the question
      const { error } = await supabase
        .from('custom_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw new Error(error.message);

      // Update the agentProfile state
      setAgentProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          customQuestions: prev.customQuestions.filter(q => q.id !== questionId)
        };
      });

      toast({
        title: "Question deleted",
        description: "Custom question has been deleted successfully.",
      });
    } catch (error: any) {
      console.error("Delete custom question error:", error.message);
      toast({
        title: "Deleting question failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update a custom question
  const updateCustomQuestion = async (question: CustomQuestion) => {
    try {
      if (!user || !agentProfile || !question.id) {
        throw new Error("User not authenticated, agent profile not found, or invalid question");
      }

      setIsLoading(true);

      const dbQuestion = {
        agent_id: agentProfile.id,
        question_text: question.questionText,
        required: question.required || false,
        type: question.type,
        options: question.options || []
      };

      // Update the question
      const { error } = await supabase
        .from('custom_questions')
        .update(dbQuestion)
        .eq('id', question.id);

      if (error) throw new Error(error.message);

      // Update the agentProfile state
      setAgentProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          customQuestions: prev.customQuestions.map(q => 
            q.id === question.id ? question : q
          )
        };
      });

      toast({
        title: "Question updated",
        description: "Custom question has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update custom question error:", error.message);
      toast({
        title: "Updating question failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profile: UserProfile) => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      setIsLoading(true);

      // Update user data in Supabase Auth
      const { error: userUpdateError } = await supabase.auth.updateUser({
        email: profile.email,
        data: {
          full_name: profile.fullName,
          phone: profile.phone
        }
      });

      if (userUpdateError) throw new Error(userUpdateError.message);

      // If this is an agent, also update the agent profile
      if (agentProfile) {
        const { error: profileUpdateError } = await supabase
          .from('agent_profiles')
          .update({
            name: profile.fullName,
            email: profile.email,
            phone: profile.phone
          })
          .eq('user_id', user.id);

        if (profileUpdateError) throw new Error(profileUpdateError.message);

        // Refresh the agent profile
        await fetchAgentProfile(user.id);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Update profile error:", error.message);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    session,
    agentProfile,
    login,
    signup,
    logout,
    updateAgentProfile,
    createAgentProfile,
    addCustomQuestion,
    deleteCustomQuestion,
    updateCustomQuestion,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
