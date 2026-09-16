import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { LanguageProvider } from './context/LanguageContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';

import { LandingPage } from './pages/LandingPage.js';
import { ChatPage } from './pages/ChatPage.js';
import { StandardsExplorer } from './pages/StandardsExplorer.js';
import { ProductCertificationPage } from './pages/ProductCertificationPage.js';
import { ComplianceGeneratorPage } from './pages/ComplianceGeneratorPage.js';
import { GrievanceGuidePage } from './pages/GrievanceGuidePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/standards" element={<StandardsExplorer />} />
                <Route path="/standards/:id" element={<StandardsExplorer />} />
                <Route path="/products" element={<ProductCertificationPage />} />
                <Route path="/schemes" element={<ComplianceGeneratorPage />} />
                <Route path="/grievance" element={<GrievanceGuidePage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
