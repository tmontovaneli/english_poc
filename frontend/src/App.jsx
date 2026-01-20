import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useData, DataProvider } from './hooks/useData';
import { AdminLayout } from './layouts/AdminLayout';
import { StudentsPage } from './pages/StudentsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { GrammarPage } from './pages/GrammarPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { StudentFeed } from './components/StudentFeed';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';
import { PrivateRoute } from './components/PrivateRoute';

// Component to handle redirection logic inside Router
function AppRoutes({ students }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  // Helper to determine where to redirect logging out or root access
  // But PrivateRoute handles the protection. 

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        {/* 
                  If user is teacher, they can access admin routes. 
                  If they are student, they should only see student feed.
                  We can implement a role check wrapper or simple logic here.
                */}
        {isTeacher ? (
          <Route element={<AdminLayout currentUser="teacher" onSwitchUser={() => { }} students={students} />}>
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/reviews" replace />} />
          </Route>
        ) : (
          /* Student Routes - Catch all for students and show feed */
          <Route path="*" element={
            <div className="container" style={{ padding: '2rem 0' }}>
              <StudentHeader />
              <StudentFeed studentId={user?.id} />
            </div>
          } />
        )}
      </Route>
    </Routes>
  );
}

function App() {
  // We need DataProvider inside AuthProvider ideally because useData depends on useAuth now.
  // So AuthProvider -> DataProvider -> Routes
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <InnerApp />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function InnerApp() {
  const { students } = useData();
  return <AppRoutes students={students} />;
}

function StudentHeader() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-color)'
    }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Student Dashboard</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Welcome, {user?.username}
        </p>
      </div>
      <button
        onClick={handleLogout}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        🚪 Sign Out
      </button>
    </header>
  );
}

export default App;

