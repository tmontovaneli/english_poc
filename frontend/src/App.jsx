import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useData } from './hooks/useData';
import { AdminLayout } from './layouts/AdminLayout';
import { StudentsPage } from './pages/StudentsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { GrammarPage } from './pages/GrammarPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { StudentFeed } from './components/StudentFeed';

// Component to handle redirection logic inside Router
function AppRoutes({ currentUser, setCurrentUser, students }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isTeacher = currentUser === 'teacher';

  // Redirect to appropriate view when context changes
  useEffect(() => {
    if (isTeacher) {
      if (location.pathname === '/' || !['/students', '/assignments', '/grammar', '/reviews'].includes(location.pathname)) {
        navigate('/students');
      }
    } else {
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [currentUser, isTeacher, navigate, location.pathname]);

  const handleSwitchUser = (user) => {
    setCurrentUser(user);
  };

  if (isTeacher) {
    return (
      <Routes>
        <Route element={<AdminLayout currentUser={currentUser} onSwitchUser={handleSwitchUser} students={students} />}>
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/grammar" element={<GrammarPage />} />
          <Route path="*" element={<Navigate to="/students" replace />} />
        </Route>
      </Routes>
    );
  }

  // Student View
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Simple Header for Student View to allow switching back */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          fontSize: '0.875rem'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>Viewing as:</span>
          <select
            value={currentUser}
            onChange={(e) => handleSwitchUser(e.target.value)}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            <option value="teacher">👨‍🏫 Teacher (Admin)</option>
            {students.length > 0 && <optgroup label="Students">
              {students.map(s => (
                <option key={s.id} value={s.id}>📝 {s.name}</option>
              ))}
            </optgroup>}
          </select>
        </div>
      </header>
      <StudentFeed studentId={currentUser} />
    </div>
  );
}

function App() {
  const { students } = useData();
  const [currentUser, setCurrentUser] = useState('teacher');

  return (
    <BrowserRouter>
      <AppRoutes
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        students={students}
      />
    </BrowserRouter>
  );
}

export default App
