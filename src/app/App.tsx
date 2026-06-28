import React, { useState } from 'react';
import { GarageProvider } from '../context/GarageContext';
import { ThemeProvider } from '../context/ThemeContext';
import { AppShell } from './layout/AppShell';
import { DashboardView } from '../features/dashboard/DashboardView';
import { GarageView } from '../features/garage/GarageView';
import { HRView } from '../features/hr/HRView';
import { WorkforceView } from '../features/workforce/WorkforceView';
import { FinanceView } from '../features/finance/FinanceView';
import { AnalyticsView } from '../features/analytics/AnalyticsView';
import { InventoryView } from '../features/inventory/InventoryView';
import { SuppliersView } from '../features/suppliers/SuppliersView';
import { VehiclesView } from '../features/vehicles/VehiclesView';
import { CustomersView } from '../features/customers/CustomersView';
import { AppointmentsView } from '../features/appointments/AppointmentsView';
import { ServiceBaysView } from '../features/serviceBays/ServiceBaysView';
import { BranchesView } from '../features/branches/BranchesView';
import { InspectionView } from '../features/inspection/InspectionView';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'garage':
        return <GarageView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'inspections':
        return <InspectionView />;
      case 'customers':
        return <CustomersView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'serviceBays':
        return <ServiceBaysView />;
      case 'hr':
        return <HRView />;
      case 'workforce':
        return <WorkforceView />;
      case 'finance':
        return <FinanceView />;
      case 'branches':
        return <BranchesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'inventory':
        return <InventoryView />;
      case 'suppliers':
        return <SuppliersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <ThemeProvider>
      <GarageProvider>
        <AppShell currentView={currentView} onViewChange={setCurrentView}>
          {renderView()}
        </AppShell>
      </GarageProvider>
    </ThemeProvider>
  );
};

export default App;
