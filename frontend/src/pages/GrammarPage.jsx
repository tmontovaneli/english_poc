import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useData } from '../hooks/useData';

export function GrammarPage() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileContent, setFileContent] = useState('');

    // We need to access API_Base from useData or import it directly. 
    // Since useData doesn't export API_Base, we might need to recreate it or refactor useData.
    // Ideally, useData should provide a generic fetcher or expose API_Base.
    // For now, I will use import.meta.env.VITE_API_URL locally here to avoid big refactor.
    const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        fetch(`${API_Base}/grammar`)
            .then(res => res.json())
            .then(data => {
                setFiles(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load grammar files", err);
                setLoading(false);
            });
    }, []);

    const handleFileClick = async (filename) => {
        if (selectedFile === filename) {
            setSelectedFile(null); // Toggle close
            setFileContent('');
            return;
        }

        try {
            const res = await fetch(`${API_Base}/grammar/${filename}`);
            const data = await res.json();
            setFileContent(data.content);
            setSelectedFile(filename);
        } catch (error) {
            console.error("Failed to load file content", error);
        }
    };

    const formatLessonName = (filename) => {
        return filename.replace(/\.md$/, '')
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div style={{ display: 'grid', gap: 'var(--spacing-lg)' }}>
            <header style={{ marginBottom: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '2rem' }}>Grammar Rules</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Review grammar documentation.</p>
            </header>

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
                                <th style={{ padding: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)', width: '100px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map(file => (
                                <>
                                    <tr key={file.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span>📄</span>
                                                <span style={{ fontWeight: '500' }}>{formatLessonName(file.name)}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--spacing-md)' }}>
                                            <button
                                                className="btn"
                                                onClick={() => handleFileClick(file.name)}
                                                style={{
                                                    padding: '0.25rem 0.75rem',
                                                    fontSize: '0.875rem',
                                                    backgroundColor: selectedFile === file.name ? 'var(--text-brand)' : 'var(--bg-secondary)',
                                                    color: selectedFile === file.name ? '#fff' : 'var(--text-primary)'
                                                }}
                                            >
                                                {selectedFile === file.name ? 'Close' : 'View'}
                                            </button>
                                        </td>
                                    </tr>
                                    {selectedFile === file.name && (
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
        </div>
    );
}
