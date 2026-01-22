import { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';

export function EditAssignmentForm() {
    const { assignments, updateAssignmentTemplate } = useData();
    const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('essay');
    const [grammarLessonId, setGrammarLessonId] = useState('');
    const [grammarLessons, setGrammarLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // When assignment selection changes, populate the form
    useEffect(() => {
        const assignment = assignments.find(a => a.id === selectedAssignmentId);
        if (assignment) {
            setTitle(assignment.title);
            setDescription(assignment.description || '');
            setType(assignment.type || 'essay');
            setGrammarLessonId(assignment.grammarLessonId?.id || '');
        }
    }, [selectedAssignmentId, assignments]);

    // Fetch grammar lessons when type changes to grammar
    useEffect(() => {
        if (type === 'grammar') {
            setLoadingLessons(true);
            const token = localStorage.getItem('token');
            fetch(`${API_Base}/grammar`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    setGrammarLessons(Array.isArray(data) ? data : []);
                    setLoadingLessons(false);
                })
                .catch(err => {
                    console.error('Failed to load grammar lessons', err);
                    setLoadingLessons(false);
                });
        }
    }, [type, API_Base]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedAssignmentId) {
            alert('Please select an assignment');
            return;
        }
        if (!title.trim()) return;
        if (type === 'grammar' && !grammarLessonId) {
            alert('Please select a grammar lesson');
            return;
        }

        updateAssignmentTemplate(selectedAssignmentId, title, description, type, type === 'grammar' ? grammarLessonId : null);
        setSelectedAssignmentId('');
        setTitle('');
        setDescription('');
        setType('essay');
        setGrammarLessonId('');
        alert('Assignment updated successfully!');
    };

    return (
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <h3>Edit Assignment</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div>
                    <label>Select Assignment to Edit:</label>
                    <select
                        value={selectedAssignmentId}
                        onChange={(e) => setSelectedAssignmentId(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem' }}
                    >
                        <option value="">-- Select an assignment --</option>
                        {assignments.map(a => (
                            <option key={a.id} value={a.id}>
                                {a.title} ({a.type})
                            </option>
                        ))}
                    </select>
                </div>

                {selectedAssignmentId && (
                    <>
                        <div>
                            <label>Title:</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Assignment title"
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>

                        <div>
                            <label>Description:</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Assignment description"
                                rows={3}
                                style={{ width: '100%', padding: '0.5rem', resize: 'vertical' }}
                            />
                        </div>

                        <div>
                            <label>Type:</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem' }}
                            >
                                <option value="essay">Essay</option>
                                <option value="sentences">Sentences</option>
                                <option value="grammar">Grammar</option>
                            </select>
                        </div>

                        {type === 'grammar' && (
                            <div>
                                <label>Grammar Lesson:</label>
                                {loadingLessons ? (
                                    <p style={{ color: 'var(--text-secondary)' }}>Loading lessons...</p>
                                ) : (
                                    <select
                                        value={grammarLessonId}
                                        onChange={(e) => setGrammarLessonId(e.target.value)}
                                        style={{ width: '100%', padding: '0.5rem' }}
                                    >
                                        <option value="">Select a lesson...</option>
                                        {grammarLessons.map(lesson => (
                                            <option key={lesson.id} value={lesson.id}>
                                                {lesson.order} - {lesson.title}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary">
                            Update Assignment
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
