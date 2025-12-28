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
import ProductDetails from './pages/ProductDetails';

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
        
        {/* Protected Pages - With Navbar & Footer */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/shop" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Shop />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/product/:id" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductDetails />
              </MainLayout>
            </ProtectedRoute>
          } 
        />

        {/* Admin Page - With Admin Layout (No Navbar & Footer) */}
        <Route 
          path="/admin/Addashboard" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout>
                <AdminPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;