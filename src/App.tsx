import React, { useState } from 'react';
import { ParkingProvider, useParking } from './context/ParkingContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './components/auth/LoginPage';
import { OwnerPortal } from './components/portals/OwnerPortal';
import { OfficerPortal } from './components/portals/OfficerPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { DashboardView } from './components/views/DashboardView';
import { RecordViolationView } from './components/views/RecordViolationView';
import { AllViolationsView } from './components/views/AllViolationsView';
import { VehiclesView } from './components/views/VehiclesView';
import { RepeatOffendersView } from './components/views/RepeatOffendersView';
import { ZonesView } from './components/views/ZonesView';
import { PenaltiesView } from './components/views/PenaltiesView';
import { ReportsAnalyticsView } from './components/views/ReportsAnalyticsView';
import { SettingsView } from './components/views/SettingsView';
import { ViolationDetailModal } from './components/modals/ViolationDetailModal';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useParking();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is logged out, show Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    // 1. Vehicle Owner Portal
    if (currentUser.role === 'OWNER') {
      switch (activeTab) {
        case 'dashboard':
        case 'violations':
        case 'vehicles':
          return <OwnerPortal />;
        case 'settings':
          return <SettingsView />;
        default:
          return <OwnerPortal />;
      }
    }

    // 2. Parking Officer App
    if (currentUser.role === 'OFFICER') {
      switch (activeTab) {
        case 'dashboard':
          return <OfficerPortal />;
        case 'record':
          return <RecordViolationView />;
        case 'violations':
          return <AllViolationsView />;
        case 'vehicles':
          return <VehiclesView />;
        case 'repeat-offenders':
          return <RepeatOffendersView />;
        case 'settings':
          return <SettingsView />;
        default:
          return <OfficerPortal />;
      }
    }

    // 3. Supervisor & Admin Console
    switch (activeTab) {
      case 'dashboard':
        return <AdminPortal />;
      case 'violations':
        return <AllViolationsView />;
      case 'record':
        return <RecordViolationView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'repeat-offenders':
        return <RepeatOffendersView />;
      case 'zones':
        return <ZonesView />;
      case 'penalties':
        return <PenaltiesView />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <AdminPortal />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#FFFCF9] overflow-hidden text-[#1F2937]">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header Bar */}
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Global Violation Details Modal */}
      <ViolationDetailModal />
    </div>
  );
};

export default function App() {
  return (
    <ParkingProvider>
      <MainLayout />
    </ParkingProvider>
  );
}
