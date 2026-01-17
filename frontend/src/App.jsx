import { useState } from 'react';
import { useData } from './hooks/useData';
import { AddStudentForm } from './components/AddStudentForm';
import { StudentList } from './components/StudentList';
import { AddAssignmentForm } from './components/AddAssignmentForm';
import { AssignmentTemplateList } from './components/AssignmentTemplateList';
import { StudentFeed } from './components/StudentFeed';

function App() {
  const { students } = useData();
  const [currentUser, setCurrentUser] = useState('teacher'); // 'teacher' or studentId

  const isTeacher = currentUser === 'teacher';

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            English Student <span style={{ color: 'var(--text-brand)' }}>Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage assignments and student progress.</p>
        </div>

        {/* Context Switcher - Simulates Login */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--bg-card)',
          padding: '0.5rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Viewing as:</span>
          <select
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
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

      {isTeacher ? (
        <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 'var(--spacing-xl)' }}>
          <section>
            <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem' }}>Students</h2>
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <AddStudentForm />
              <StudentList />
            </div>
          </section>

          <section>
            <h2 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.25rem' }}>Assignment Templates</h2>
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
              <AddAssignmentForm />
              <AssignmentTemplateList />
            </div>
          </section>
        </main>
      ) : (
        <main>
          <StudentFeed studentId={currentUser} />
        </main>
      )}
    </div>
  )
}

export default App
