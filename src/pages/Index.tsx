
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building, CheckCircle, Users, FileText } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-realestate-navy py-20 px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3')] bg-cover bg-center"></div>
        </div>
        <div className="container mx-auto z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Streamline Your Rental Applications
            </h1>
            <p className="text-xl text-white/90 mb-8">
              The all-in-one solution for property managers and real estate agents 
              to collect, manage, and share rental applications.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg"
                className="bg-white text-realestate-navy hover:bg-gray-100"
                onClick={() => navigate("/login")}
              >
                Log In
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Simplify Your Rental Process
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-realestate-teal rounded-full flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Custom Application Forms</h3>
              <p className="text-gray-600">
                Create your own branded application forms with custom questions 
                tailored to your properties and requirements.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-realestate-teal rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Share with Landlords</h3>
              <p className="text-gray-600">
                Generate secure, professional profiles to share application details 
                with property owners without sharing sensitive information.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-realestate-teal rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Applications</h3>
              <p className="text-gray-600">
                Monitor application status, request additional information, and 
                manage approvals all in one central dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-realestate-light">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join other real estate professionals who are streamlining their 
              rental application process.
            </p>
            <Button 
              size="lg"
              className="bg-realestate-teal hover:bg-realestate-teal/90 text-white"
              onClick={() => navigate("/signup")}
            >
              Sign Up for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center mb-4">
              <Building className="h-6 w-6 text-realestate-navy" />
              <span className="ml-2 text-xl font-semibold text-realestate-navy">
                Rent Smart Apply
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
