import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useData } from '../hooks/useData';

export function StudentFeed({ studentId, isAdmin = false }) {
    const { user } = useAuth();
    const { students, studentAssignments, assignments, updateAssignmentStatus } = useData();
    const [essayContent, setEssayContent] = useState({}); // Map assignmentId -> content
    const [editingFeedback, setEditingFeedback] = useState(null); // assignmentId | null
    const [feedbackText, setFeedbackText] = useState('');
    const [gradeText, setGradeText] = useState('');

    const student = students.find(s => s.id === studentId);

    if (!student) return <div className="card">Student not found</div>;

    const myAssignments = studentAssignments
        .filter(sa => sa.studentId === studentId)
        .map(sa => {
            const template = assignments.find(a => a.id === sa.assignmentId);
            return { ...sa, template };
        })
        .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt));

    const getTypeIcon = (type) => {
        switch (type) {
            case 'essay': return '📝';
            case 'sentences': return '🔡';
            case 'grammar': return '📖';
            default: return '📄';
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'pending': { bg: 'var(--bg-secondary)', color: 'var(--text-secondary)' },
            'in-progress': { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--text-brand)' },
            'submitted': { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--text-accent)' },
            'completed': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }
        };
        const style = styles[status] || styles['pending'];

        return (
            <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                backgroundColor: style.bg,
                color: style.color
            }}>
                {status}
            </span>
        );
    };

    const handleEssayChange = (id, value) => {
        setEssayContent(prev => ({ ...prev, [id]: value }));
    };

    const submitEssay = (assignment) => {
        const content = essayContent[assignment.id];
        if (!content) return;
        updateAssignmentStatus(assignment.id, 'submitted', { submissionContent: content });
    };

    const startEditingFeedback = (assignment) => {
        setEditingFeedback(assignment.id);
        setFeedbackText(assignment.teacherFeedback || '');
        setGradeText(assignment.grade || '');
    };

    const saveFeedback = async (assignment) => {
        try {
            await updateAssignmentStatus(assignment.id, assignment.status, {
                teacherFeedback: feedbackText,
                grade: gradeText
            });
            setEditingFeedback(null);
            setFeedbackText('');
            setGradeText('');
        } catch (error) {
            console.error('Error saving feedback:', error);
            alert('Failed to save feedback');
        }
    };

    const cancelEditingFeedback = () => {
        setEditingFeedback(null);
        setFeedbackText('');
        setGradeText('');
    };

    const insertMarkdown = (before, after = '', placeholder = 'text') => {
        const textarea = document.getElementById(`feedback-${editingFeedback}`);
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = feedbackText.substring(start, end) || placeholder;
        const newText = feedbackText.substring(0, start) + before + selectedText + after + feedbackText.substring(end);

        setFeedbackText(newText);

        // Move cursor and select inserted text
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selectedText.length;
        }, 0);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: 'var(--spacing-xl)', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem' }}>Hello, <span style={{ color: 'var(--text-brand)' }}>{student.name}</span>!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Here are your assignments for this week.</p>
            </header>

            {myAssignments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>🎉</div>
                    <h3>All caught up!</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>No active assignments at the moment.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
                    {myAssignments.map((assignment, index) => (
                        <div key={assignment.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            {index === 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    background: 'var(--primary-color)',
                                    color: '#0f172a',
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    padding: '0.25rem 0.75rem',
                                    borderBottomLeftRadius: 'var(--radius-md)'
                                }}>
                                    LATEST
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'flex-start' }}>
                                <div style={{
                                    fontSize: '2rem',
                                    backgroundColor: 'var(--bg-secondary)',
                                    width: '60px',
                                    height: '60px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'var(--radius-lg)'
                                }}>
                                    {getTypeIcon(assignment.template?.type)}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.25rem' }}>{assignment.template?.title}</h3>
                                        {getStatusBadge(assignment.status)}
                                    </div>

                                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', lineHeight: '1.5' }}>
                                        {assignment.template?.description}
                                    </p>

                                    {/* Essay Workflow UI */}
                                    {assignment.template?.type === 'essay' && assignment.status === 'in-progress' && (
                                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                            <textarea
                                                value={essayContent[assignment.id] || ''}
                                                onChange={(e) => handleEssayChange(assignment.id, e.target.value)}
                                                placeholder="Write your essay here..."
                                                rows={6}
                                                style={{ width: '100%', resize: 'vertical' }}
                                            />
                                        </div>
                                    )}

                                    {/* Read-only Submission view */}
                                    {assignment.submissionContent && (
                                        <div style={{ backgroundColor: 'var(--bg-primary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                            <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Your Submission:</h4>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{assignment.submissionContent}</p>
                                        </div>
                                    )}

                                    {/* Teacher Feedback */}
                                    {(assignment.teacherFeedback || isAdmin) && (
                                        <>
                                            {editingFeedback === assignment.id ? (
                                                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                                    <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Edit Teacher Feedback:</h4>

                                                    {/* Markdown Toolbar */}
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '0.25rem', border: '1px solid var(--border-color)' }}>
                                                        <button
                                                            onClick={() => insertMarkdown('**', '**', 'bold')}
                                                            title="Bold"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            B
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('*', '*', 'italic')}
                                                            title="Italic"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontStyle: 'italic', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            I
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('# ', '', 'Heading')}
                                                            title="Heading"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            H1
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('- ', '', 'List item')}
                                                            title="List"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            •
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('[', '](url)', 'Link text')}
                                                            title="Link"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer', color: 'var(--primary-color)' }}
                                                        >
                                                            🔗
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('`', '`', 'code')}
                                                            title="Code"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontFamily: 'monospace', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            &lt;/&gt;
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
                                                            title="Strikethrough"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer', textDecoration: 'line-through' }}
                                                        >
                                                            S
                                                        </button>
                                                        <button
                                                            onClick={() => insertMarkdown('> ', '', 'Quote')}
                                                            title="Quote"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '0.25rem', cursor: 'pointer' }}
                                                        >
                                                            "
                                                        </button>
                                                    </div>

                                                    <textarea
                                                        id={`feedback-${assignment.id}`}
                                                        value={feedbackText}
                                                        onChange={(e) => setFeedbackText(e.target.value)}
                                                        placeholder="Write feedback in markdown (supports formatting)..."
                                                        rows={5}
                                                        style={{ width: '100%', marginBottom: 'var(--spacing-md)', fontFamily: 'monospace', fontSize: '0.875rem' }}
                                                    />
                                                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)', marginBottom: 'var(--spacing-md)' }}>
                                                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grade:</label>
                                                        <input
                                                            type="text"
                                                            value={gradeText}
                                                            onChange={(e) => setGradeText(e.target.value)}
                                                            placeholder="e.g., A, 90/100, Excellent"
                                                            style={{ padding: '0.5rem' }}
                                                        />
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => saveFeedback(assignment)}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.25rem 1rem', fontSize: '0.875rem' }}
                                                        >
                                                            Save Feedback
                                                        </button>
                                                        <button
                                                            onClick={cancelEditingFeedback}
                                                            style={{ padding: '0.25rem 1rem', fontSize: '0.875rem', backgroundColor: 'var(--bg-tertiary)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="markdown-content" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--success-color)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ fontSize: '0.8rem', color: 'var(--success-color)', marginBottom: '0.5rem' }}>Teacher Feedback:</h4>
                                                        {assignment.teacherFeedback ? (
                                                            <div style={{ lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{assignment.teacherFeedback}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No feedback yet</p>
                                        )}
                                        {assignment.grade && <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>Grade: {assignment.grade}</p>}
                                    </div>
                                    {isAdmin && (
                                        <button
                                            onClick={() => startEditingFeedback(assignment)}
                                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--spacing-md)' }}>
                                        <span>Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No date'}</span>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {assignment.status === 'pending' && (
                                                <button
                                                    className="btn"
                                                    style={{ border: '1px solid var(--text-brand)', color: 'var(--text-brand)', padding: '0.25rem 1rem' }}
                                                    onClick={() => updateAssignmentStatus(assignment.id, 'in-progress')}
                                                >
                                                    Start
                                                </button>
                                            )}

                                            {assignment.status === 'in-progress' && (
                                                assignment.template?.type === 'essay' ? (
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => submitEssay(assignment)}
                                                        disabled={!essayContent[assignment.id]}
                                                    >
                                                        Submit Essay
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn"
                                                        style={{ backgroundColor: 'var(--success-color)', color: '#fff', padding: '0.25rem 1rem' }}
                                                        onClick={() => updateAssignmentStatus(assignment.id, 'completed')}
                                                    >
                                                        Complete
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
