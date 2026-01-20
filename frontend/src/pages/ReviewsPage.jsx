import { useState, useRef } from 'react';
import { useData } from '../hooks/useData';

export function ReviewsPage() {
    const { studentAssignments, assignments, students, updateAssignmentStatus } = useData();
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [grade, setGrade] = useState('');
    const textareaRef = useRef(null);

    const submittedAssignments = studentAssignments
        .filter(sa => sa.status === 'submitted')
        .map(sa => {
            const template = assignments.find(a => a.id === sa.assignmentId);
            const student = students.find(s => s.id === sa.studentId);
            return { ...sa, template, student };
        });

    const handleSelect = (submission) => {
        setSelectedSubmission(submission);
        setFeedback(submission.teacherFeedback || '');
        setGrade(submission.grade || '');
    };

    const handleFormat = (type) => {
        if (!textareaRef.current) return;

        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const text = feedback;

        let prefix = '';
        let suffix = '';

        switch (type) {
            case 'bold': prefix = '**'; suffix = '**'; break;
            case 'italic': prefix = '*'; suffix = '*'; break;
            case 'strike': prefix = '~~'; suffix = '~~'; break;
            default: return;
        }

        const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
        setFeedback(newText);

        // Restore focus
        textareaRef.current.focus();
    };

    const handleComplete = async () => {
        if (!selectedSubmission) return;

        await updateAssignmentStatus(selectedSubmission.id, 'completed', {
            teacherFeedback: feedback,
            grade: grade
        });

        setSelectedSubmission(null);
        setFeedback('');
        setGrade('');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div>
                <header style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h2 style={{ fontSize: '2rem' }}>Reviews</h2>
                    <p style={{ color: 'var(--text-secondary)' }}><b>{submittedAssignments.length}</b> assignments waiting for review.</p>
                </header>

                <div style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                    {submittedAssignments.length === 0 && (
                        <div className="card" style={{ color: 'var(--text-secondary)' }}>No pending reviews.</div>
                    )}

                    {submittedAssignments.map(submission => (
                        <div
                            key={submission.id}
                            className="card"
                            onClick={() => handleSelect(submission)}
                            style={{
                                cursor: 'pointer',
                                border: selectedSubmission?.id === submission.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600', color: 'var(--text-brand)' }}>{submission.student?.name}</span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                            </div>
                            <h4 style={{ marginBottom: '0.25rem' }}>{submission.template?.title}</h4>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {submission.template?.type?.toUpperCase()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Panel */}
            <div className="card" style={{ height: 'fit-content', position: 'sticky', top: '1rem' }}>
                {!selectedSubmission ? (
                    <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        Select a submission to review
                    </div>
                ) : (
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-md)', fontSize: '1.5rem' }}>Grading</h3>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Student Submission</label>
                            <div style={{
                                padding: 'var(--spacing-md)',
                                backgroundColor: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                whiteSpace: 'pre-wrap',
                                maxHeight: '300px',
                                overflowY: 'auto'
                            }}>
                                {selectedSubmission.submissionContent}
                            </div>
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Feedback</label>

                            {/* Toolbar */}
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }} onClick={() => handleFormat('bold')}><b>B</b></button>
                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }} onClick={() => handleFormat('italic')}><i>I</i></button>
                                <button className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--bg-secondary)' }} onClick={() => handleFormat('strike')}><strike>S</strike></button>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                rows={4}
                                style={{ width: '100%', resize: 'vertical' }}
                                placeholder="Give feedback to the student..."
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Grade (Optional)</label>
                            <input
                                type="text"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                placeholder="e.g. A, 90/100, Good"
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <button
                                className="btn"
                                style={{ flex: 1, backgroundColor: 'var(--bg-secondary)' }}
                                onClick={() => setSelectedSubmission(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ flex: 1, backgroundColor: 'var(--success-color)' }}
                                onClick={handleComplete}
                            >
                                Complete Review
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
