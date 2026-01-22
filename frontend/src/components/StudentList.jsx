import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { AssignTaskModal } from './AssignTaskModal';

export function StudentList() {
    const navigate = useNavigate();
    const { students, studentAssignments, assignments, updateAssignmentStatus, users, linkUserToStudent } = useData();
    const { user: currentUser } = useAuth();
    const [assigningTo, setAssigningTo] = useState(null); // studentId | null
    const [assigningUser, setAssigningUser] = useState(null); // studentId | null
    const [selectedUser, setSelectedUser] = useState('');

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

    const handleAssignUser = async () => {
        if (!selectedUser) return;
        try {
            await linkUserToStudent(assigningUser, selectedUser);
            setAssigningUser(null);
            setSelectedUser('');
        } catch (error) {
            console.error('Failed to assign user:', error);
        }
    };

    const handleUnassignUser = async (studentId) => {
        try {
            await linkUserToStudent(studentId, null);
        } catch (error) {
            console.error('Failed to unassign user:', error);
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
                                    {student.userId && (
                                        <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                                            Assigned to: <span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{users.find(u => u._id === student.userId)?.username || 'Unknown'}</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {currentUser?.role === 'admin' && (
                                        <>
                                            <button
                                                onClick={() => navigate(`/students/${student.id}/feed`)}
                                                className="btn"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.25rem 0.75rem',
                                                    border: '1px solid var(--primary-color)',
                                                    color: 'var(--primary-color)',
                                                    background: 'transparent'
                                                }}
                                            >
                                                📊 View Feed
                                            </button>
                                            <button
                                                onClick={() => setAssigningUser(student.id)}
                                                className="btn"
                                                style={{
                                                    fontSize: '0.8rem',
                                                    padding: '0.25rem 0.75rem',
                                                    border: '1px solid var(--primary-color)',
                                                    color: 'var(--primary-color)',
                                                    background: 'transparent'
                                                }}
                                            >
                                                {student.userId ? 'Change User' : '+ Assign User'}
                                            </button>
                                            {student.userId && (
                                                <button
                                                    onClick={() => handleUnassignUser(student.id)}
                                                    className="btn"
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        padding: '0.25rem 0.75rem',
                                                        border: '1px solid #fecaca',
                                                        color: '#b91c1c',
                                                        background: 'transparent'
                                                    }}
                                                >
                                                    Unassign
                                                </button>
                                            )}
                                        </>
                                    )}
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

            {assigningUser && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-lg)',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Assign User to Student</h2>
                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select User</label>
                            <select
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)',
                                    fontSize: '1rem'
                                }}
                            >
                                <option value="">-- Select a user --</option>
                                {users.map(u => (
                                    <option key={u._id} value={u._id}>{u.username} ({u.role})</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleAssignUser}
                                disabled={!selectedUser}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--primary-color)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: selectedUser ? 'pointer' : 'not-allowed',
                                    opacity: selectedUser ? 1 : 0.5,
                                    fontWeight: 500
                                }}
                            >
                                Assign
                            </button>
                            <button
                                onClick={() => {
                                    setAssigningUser(null);
                                    setSelectedUser('');
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {assigningTo && (
                <AssignTaskModal
                    studentId={assigningTo}
                    onClose={() => setAssigningTo(null)}
                />
            )}
        </div>
    );
}
