import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { AddGrammarForm } from '../components/AddGrammarForm';
import { EditGrammarForm } from '../components/EditGrammarForm';

export function GrammarPage() {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [editingLesson, setEditingLesson] = useState(null);

    // We need to access API_Base from useData or import it directly. 
    // Since useData doesn't export API_Base, we might need to recreate it or refactor useData.
    // Ideally, useData should provide a generic fetcher or expose API_Base.
    // For now, I will use import.meta.env.VITE_API_URL locally here to avoid big refactor.
    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const fetchLessons = () => {
        setLoading(true);
        fetch(`${API_Base}/grammar`)
            .then(res => res.json())
            .then(data => {
                setFiles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load grammar lessons", err);
                setLoading(false);
            });
    };

    const handleLessonAdded = (newLesson) => {
        setFiles(prev => [...prev, newLesson].sort((a, b) => a.order - b.order));
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleLessonClick = async (slug) => {
        if (selectedFile === slug) {
            setSelectedFile(null); // Toggle close
            setFileContent('');
            return;
        }

        try {
            const res = await fetch(`${API_Base}/grammar/slug/${slug}`);
            const data = await res.json();
            setFileContent(data.content);
            setSelectedFile(slug);
        } catch (error) {
            console.error("Failed to load lesson content", error);
        }
    };

    const handleDeleteLesson = async (lesson) => {
        if (!window.confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_Base}/grammar/${lesson.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete lesson');
            }

            setFiles(prev => prev.filter(l => l.id !== lesson.id));
            if (selectedFile === lesson.slug) {
                setSelectedFile(null);
                setFileContent('');
            }
        } catch (error) {
            console.error("Failed to delete lesson", error);
            alert('Failed to delete lesson');
        }
    };

    const handleLessonUpdated = (updatedLesson) => {
        setFiles(prev =>
            prev.map(l => l.id === updatedLesson.id ? updatedLesson : l)
                .sort((a, b) => a.order - b.order)
        );
        setEditingLesson(null);
    };

    return (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <header style={{ marginBottom: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '2rem' }}>Grammar Rules</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Review grammar documentation.</p>
            </header>

            {user && user.role === 'admin' && (
                <AddGrammarForm onLessonAdded={handleLessonAdded} />
            )}

            {loading ? (
                <div className="card">Loading...</div>
            ) : files.length === 0 ? (
                <div className="card" style={{ color: 'var(--text-secondary)' }}>No grammar files found.</div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
                                <th style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>Lesson Topic</th>
                                <th style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', width: 'auto' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(lesson => (
                                <>
                                    <tr key={lesson.slug} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📄</span>
                                                <span style={{ fontWeight: '500' }}>{lesson.order + " - " + lesson.title}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <button
                                                    className="btn"
                                                    onClick={() => handleLessonClick(lesson.slug)}
                                                    style={{
                                                        padding: '0.25rem 0.75rem',
                                                        fontSize: '0.875rem',
                                                        backgroundColor: selectedFile === lesson.slug ? 'var(--text-brand)' : 'var(--bg-secondary)',
                                                        color: selectedFile === lesson.slug ? '#fff' : 'var(--text-primary)'
                                                    }}
                                                >
                                                    {selectedFile === lesson.slug ? 'Close' : 'View'}
                                                </button>
                                                {user && user.role === 'admin' && (
                                                    <>
                                                        <button
                                                            className="btn"
                                                            onClick={() => setEditingLesson(lesson)}
                                                            style={{
                                                                padding: '0.25rem 0.75rem',
                                                                fontSize: '0.875rem',
                                                                backgroundColor: '#3b82f6',
                                                                color: '#fff'
                                                            }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="btn"
                                                            onClick={() => handleDeleteLesson(lesson)}
                                                            style={{
                                                                padding: '0.25rem 0.75rem',
                                                                fontSize: '0.875rem',
                                                                backgroundColor: '#ef4444',
                                                                color: '#fff'
                                                            }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {selectedFile === lesson.slug && (
                                        <tr style={{ backgroundColor: 'var(--bg-primary)' }}>
                                            <td colSpan={2} style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border-color)' }}>
                                                <div className="markdown-content" style={{ lineHeight: '1.7' }}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingLesson && (
                <EditGrammarForm
                    lesson={editingLesson}
                    onLessonUpdated={handleLessonUpdated}
                    onClose={() => setEditingLesson(null)}
                />
            )}
        </div>
    );
}
