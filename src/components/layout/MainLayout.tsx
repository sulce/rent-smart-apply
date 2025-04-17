
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Building, Users, UserCircle, LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, agentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && (
        <header className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  {agentProfile?.logo ? (
                    <img
                      className="h-8 w-auto"
                      src={agentProfile.logo}
                      alt={`${agentProfile.businessName} logo`}
                    />
                  ) : (
                    <Building className="h-8 w-8 text-realestate-navy" />
                  )}
                  <span className="ml-2 text-xl font-semibold text-realestate-navy">
                    {agentProfile?.businessName || "Rent Smart"}
                  </span>
                </div>
                <nav className="ml-6 flex space-x-8">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-realestate-navy"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link
                    to="/applications"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-realestate-navy"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Applications
                  </Link>
                </nav>
              </div>
              <div className="flex items-center">
                <Link
                  to="/profile"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-realestate-navy mr-4"
                >
                  <UserCircle className="h-4 w-4 mr-1" />
                  Profile
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-realestate-navy"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Rent Smart Apply. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
