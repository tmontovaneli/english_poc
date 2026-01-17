import { useState } from 'react';
import { useData } from '../hooks/useData';

export function AddStudentForm() {
    const { addStudent } = useData();
    const [name, setName] = useState('');
    const [level, setLevel] = useState('Beginner');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        addStudent(name, level);
        setName('');
        setLevel('Beginner');
    };

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Add New Student</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-md)' }}>
                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Jane Doe"
                        required
                    />
                </div>

                <div style={{ display: 'grid', gap: 'var(--spacing-xs)' }}>
                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Proficiency Level</label>
                    <select value={level} onChange={(e) => setLevel(e.target.value)}>
                        <option value="Beginner">Beginner (A1-A2)</option>
                        <option value="Intermediate">Intermediate (B1-B2)</option>
                        <option value="Advanced">Advanced (C1-C2)</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary" style={{ justifySelf: 'start' }}>
                    Add Student
                </button>
            </form>
        </div>
    );
}
