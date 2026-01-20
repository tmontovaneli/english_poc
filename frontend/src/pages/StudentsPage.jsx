import { AddStudentForm } from '../components/AddStudentForm';
import { StudentList } from '../components/StudentList';

export function StudentsPage() {
    return (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <header style={{ marginBottom: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '2rem' }}>Students</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage student enrollments and assignments.</p>
            </header>

            <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
                <AddStudentForm />
                <StudentList />
            </div>
        </div>
    );
}
