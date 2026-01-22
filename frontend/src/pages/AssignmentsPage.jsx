import { AddAssignmentForm } from '../components/AddAssignmentForm';
import { EditAssignmentForm } from '../components/EditAssignmentForm';
import { AssignmentTemplateList } from '../components/AssignmentTemplateList';

export function AssignmentsPage() {
    return (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <header style={{ marginBottom: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '2rem' }}>Assignments</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Create and manage assignment templates.</p>
            </header>

            <div style={{ display: 'grid', gap: 'var(--spacing-xl)' }}>
                <AddAssignmentForm />
                <div className="card">
                    <EditAssignmentForm />
                </div>
                <div className="card">
                    <AssignmentTemplateList />
                </div>
            </div>
        </div>
    );
}
