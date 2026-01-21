import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function EditGrammarForm({ lesson, onLessonUpdated, onClose }) {
    const { user } = useAuth();
    const [title, setTitle] = useState(lesson.title);
    const [content, setContent] = useState(lesson.content);
    const [slug, setSlug] = useState(lesson.slug);
    const [order, setOrder] = useState(lesson.order);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
            const response = await fetch(`${API_Base}/grammar/${lesson.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    content,
                    slug,
                    order: parseInt(order)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update lesson');
            }

            const updatedLesson = await response.json();
            setSuccess('Grammar lesson updated successfully!');

            if (onLessonUpdated) {
                onLessonUpdated(updatedLesson);
            }

            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 1000);
        } catch (err) {
            setError(err.message || 'Error updating grammar lesson');
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
            <div className="card" style={{
                width: '90%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: 'var(--spacing-lg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <h3>Edit Grammar Lesson</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--text-secondary)'
                        }}
                    >
                        ✕
                    </button>
                </div>

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
                                onChange={(e) => setTitle(e.target.value)}
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
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Lesson Order
                        </label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            min="1"
                        />
                    </div>

                    <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                            Content (Markdown) *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={12}
                            required
                            style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                                border: 'none',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            {loading ? 'Updating...' : 'Update Lesson'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
