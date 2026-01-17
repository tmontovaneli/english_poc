import { useState } from 'react';
import { useData } from '../hooks/useData';

export function AddAssignmentForm() {
    const { addAssignmentTemplate } = useData();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('essay');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        addAssignmentTemplate(title, description, type);
        setTitle('');
        setDescription('');
        setType('essay');
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
