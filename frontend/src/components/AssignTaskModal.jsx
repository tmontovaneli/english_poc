import { useState } from 'react';
import { useData } from '../hooks/useData';

export function AssignTaskModal({ studentId, onClose }) {
    const { assignments, assignToStudent } = useData();
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [dueDate, setDueDate] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedAssignmentId) return;

        assignToStudent(studentId, selectedAssignmentId, dueDate);
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Assign Task</h3>

                {assignments.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No assignment templates available. Create one first.</p>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                        <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select Assignment</label>
                            <select
                                value={selectedAssignmentId}
                                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                required
                            >
                                <option value="">-- Select --</option>
                                {assignments.map(a => (
                                    <option key={a.id} value={a.id}>{a.title}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-sm)' }}>
                            <button
                                type="button"
                                className="btn"
                                onClick={onClose}
                                style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Assign
                            </button>
                        </div>
                    </form>
                )}

                {assignments.length === 0 && (
                    <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            style={{ backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
