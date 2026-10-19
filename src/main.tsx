import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AuthModal } from "@/components/auth/AuthModal";
import { SiteHeader, SiteFooter } from "@/components/marketplace/SiteHeader";
import { Toaster } from "@/components/ui/sonner";

import "./styles.css";

// Route pages
import { HomePage } from "@/pages/HomePage";
import { BrowsePage } from "@/pages/BrowsePage";
import { BillboardDetailPage } from "@/pages/BillboardDetailPage";
import { AuthPage } from "@/pages/AuthPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MyBillboardsPage } from "@/pages/MyBillboardsPage";
import { SavedPage } from "@/pages/SavedPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NewBillboardPage } from "@/pages/NewBillboardPage";
import { EditBillboardPage } from "@/pages/EditBillboardPage";
import { OwnerRequestsPage } from "@/pages/OwnerRequestsPage";
import { AdvertiserRequestsPage } from "@/pages/AdvertiserRequestsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <SiteHeader />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/billboards/new" element={<NewBillboardPage />} />
              <Route path="/billboards/:id/edit" element={<EditBillboardPage />} />
              <Route path="/billboards/:id" element={<BillboardDetailPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/my-billboards" element={<MyBillboardsPage />} />
              <Route path="/owner/requests" element={<OwnerRequestsPage />} />
              <Route path="/advertiser/requests" element={<AdvertiserRequestsPage />} />
              <Route path="/saved" element={<SavedPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <SiteFooter />
        </div>
        <AuthModal />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
