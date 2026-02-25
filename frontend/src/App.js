import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import About from "./pages/About"; 
import Contact from "./pages/Contact";
import Home from "./pages/Home"; 
import Register from "./pages/Register"; 
import AdminPage from "./pages/AdminPage";
import ProtectedRoute from "./components/ProtectedRoute";
// import { ArtisanProvider } from './context/ArtisanContext';
import ProductDetails from './pages/ProductDetails';
import ArtisanStories from "./pages/ArtisiansStories";
import ArtisanPendingApproval from './pages/ArtisanPendingApproval';
import ArtisanDashboard from './pages/ArtisanPage'

// Layout components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Layout wrapper for pages that need Navbar & Footer
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

// Dashboard Layout without Navbar & Footer (for all dashboard pages)
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

// Admin Layout without Navbar & Footer
const AdminLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Pages - With Navbar & Footer */}
        <Route path="/" element={
          <MainLayout>
            <Home />
          </MainLayout>
        } />
        
        <Route path="/about" element={
          <MainLayout>
            <About />
          </MainLayout>
        } />
        
        <Route path="/contact" element={
          <MainLayout>
            <Contact />
          </MainLayout>
        } />
        
        {/* Authentication Pages - With Navbar & Footer */}
        <Route path="/login" element={
          <MainLayout>
            <Login />
          </MainLayout>
        } />
        
        <Route path="/register" element={
          <MainLayout>
            <Register />
          </MainLayout>
        } />
        
        {/* ================================================ */}
        {/* DASHBOARD PAGES - NO NAVBAR/FOOTER */}
        {/* ================================================ */}
        
        {/* Regular User Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <MainLayout >
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        
        {/* Artisan Dashboard */}
        <Route 
          path="/artisan/dashboard" 
          element={
            <DashboardLayout>
              <ProtectedRoute allowedRoles={['artisan']}>
               <ArtisanDashboard />
              </ProtectedRoute>
            </DashboardLayout>
          } 
        />
        
        {/* Artisan Pending Approval */}
        <Route 
          path="/artisan/pending-approval" 
          element={
            <DashboardLayout>
              <ProtectedRoute allowedRoles={['pending_artisan', 'artisan']}>
                <ArtisanPendingApproval />
              </ProtectedRoute>
            </DashboardLayout>
          } 
        />
        {/* Admin Dashboard */}
        <Route 
          path="/admin/Addashboard" 
          element={
            <AdminLayout>
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            </AdminLayout>
          } 
        />
        
        {/* ================================================ */}
        {/* OTHER PROTECTED PAGES - WITH NAVBAR/FOOTER */}
        {/* ================================================ */}
        
        <Route 
          path="/shop" 
          element={
            <MainLayout>
              <ProtectedRoute>
                <Shop />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        
        <Route 
          path="/product/:id" 
          element={
            <MainLayout>
              <ProtectedRoute>
                <ProductDetails />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        
        <Route 
          path="/artisans" 
          element={
            <MainLayout>
              <ProtectedRoute>
                <ArtisanStories />
              </ProtectedRoute>
            </MainLayout>
          } 
        />
        
        {/* Default redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;