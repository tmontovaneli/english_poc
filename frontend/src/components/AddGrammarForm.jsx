import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function AddGrammarForm({ onLessonAdded }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [slug, setSlug] = useState('');
    const [order, setOrder] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    // Auto-generate slug from title
    const handleTitleChange = (value) => {
        setTitle(value);
        if (!slug || slug === '') {
            const generatedSlug = value
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '_')
                .replace(/[^\w_]/g, '');
            setSlug(generatedSlug);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim() || !content.trim() || !slug.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_Base}/grammar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    slug,
                    order: order ? parseInt(order) : undefined
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create lesson');
            }

            const newLesson = await response.json();
            setSuccess('Grammar lesson created successfully!');
            setTitle('');
            setContent('');
            setSlug('');
            setOrder('');

            if (onLessonAdded) {
                onLessonAdded(newLesson);
            }
        } catch (err) {
            setError(err.message || 'Error creating grammar lesson');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Only show to admins
    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Add New Grammar Lesson</h3>

            {error && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '0.875rem'
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '0.875rem'
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Title *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="e.g. Present Perfect Tense"
                            required
                        />
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Slug *
                        </label>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. present_perfect_tense"
                            required
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Lesson Order (optional)
                    </label>
                    <input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        placeholder="e.g. 4"
                        min="1"
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        If not specified, the lesson will be added at the end
                    </small>
                </div>

                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                        Content (Markdown) *
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="# Lesson Title

Write your lesson content in markdown format..."
                        rows={10}
                        required
                        style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ justifySelf: 'start' }}
                >
                    {loading ? 'Creating...' : 'Create Grammar Lesson'}
                </button>
            </form>
        </div>
    );
}
