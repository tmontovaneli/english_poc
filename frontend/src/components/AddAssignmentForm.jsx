import { useState, useEffect } from 'react';
import { useData } from '../hooks/useData';

export function AddAssignmentForm() {
    const { addAssignmentTemplate } = useData();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('essay');
    const [grammarLessonId, setGrammarLessonId] = useState('');
    const [grammarLessons, setGrammarLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(false);

    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
        if (!title.trim()) return;
        if (type === 'grammar' && !grammarLessonId) {
            alert('Please select a grammar lesson');
            return;
        }

        addAssignmentTemplate(title, description, type, type === 'grammar' ? grammarLessonId : null);
        setTitle('');
        setDescription('');
        setType('essay');
        setGrammarLessonId('');
    };

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Create Assignment Template</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Past Tense Verbs"
                        required
                    />
                </div>

                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="essay">Essay</option>
                        <option value="sentences">Make Sentences</option>
                        <option value="grammar">Grammar Lesson</option>
                    </select>
                </div>

                {type === 'grammar' && (
                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Grammar Lesson</label>
                        {loadingLessons ? (
                            <div style={{ color: 'var(--text-secondary)' }}>Loading lessons...</div>
                        ) : (
                            <select
                                value={grammarLessonId}
                                onChange={(e) => setGrammarLessonId(e.target.value)}
                                required={type === 'grammar'}
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

                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief instructions..."
                        rows={3}
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
                    Create Template
                </button>
            </form>
        </div>
    );
}
