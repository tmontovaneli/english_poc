import { useState } from 'react';
import { useData } from '../hooks/useData';
import { AssignTaskModal } from './AssignTaskModal';

export function StudentList() {
    const { students, studentAssignments, assignments, updateAssignmentStatus } = useData();
    const [assigningTo, setAssigningTo] = useState(null); // studentId | null

    if (students.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No students enrolled yet.</p>
            </div>
        );
    }

    // Helper to get assignments for a student
    const getStudentAssignments = (studentId) => {
        return studentAssignments
            .filter(sa => sa.studentId === studentId)
            .map(sa => {
                const template = assignments.find(a => a.id === sa.assignmentId);
                return { ...sa, template };
            });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'var(--success-color)';
            case 'in-progress': return 'var(--text-brand)';
            default: return 'var(--text-secondary)';
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Enrolled Students ({students.length})</h3>
            <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                {students.map(student => {
                    const myAssignments = getStudentAssignments(student.id);

                    return (
                        <div
                            key={student.id}
                            style={{
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'var(--bg-primary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-md)' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{student.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Level: <span style={{ color: 'var(--text-accent)' }}>{student.level}</span></div>
                                </div>
                                <button
                                    onClick={() => setAssigningTo(student.id)}
                                    className="btn"
                                    style={{
                                        fontSize: '0.8rem',
                                        padding: '0.25rem 0.75rem',
                                        border: '1px solid var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        background: 'transparent'
                                    }}
                                >
                                    + Assign Task
                                </button>
                            </div>

                            {/* Assignments List */}
                            {myAssignments.length > 0 && (
                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-sm)' }}>
                                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Active Assignments</p>
                                    <ul style={{ listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
                                        {myAssignments.map(sa => (
                                            <li key={sa.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                                <span style={{ color: sa.template ? 'inherit' : 'var(--text-muted)' }}>
                                                    {sa.template ? sa.template.title : 'Unknown Assignment'}
                                                </span>
                                                <select
                                                    value={sa.status}
                                                    onChange={(e) => updateAssignmentStatus(sa.id, e.target.value)}
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        padding: '0.1rem 0.5rem',
                                                        borderColor: getStatusColor(sa.status),
                                                        color: getStatusColor(sa.status)
                                                    }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in-progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {assigningTo && (
                <AssignTaskModal
                    studentId={assigningTo}
                    onClose={() => setAssigningTo(null)}
                />
            )}
        </div>
    );
}
