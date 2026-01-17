import { useData } from '../hooks/useData';

export function AssignmentTemplateList() {
    const { assignments } = useData();

    if (assignments.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No assignment templates created.</p>
            </div>
        );
    }

    const getTypeLabel = (type) => {
        switch (type) {
            case 'essay': return '📝 Essay';
            case 'sentences': return '🔡 Sentences';
            case 'grammar': return '📖 Grammar';
            default: return '📄 Assignment';
        }
    };

    return (
        <div className="card">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Assignment Templates ({assignments.length})</h3>
            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
                {assignments.map(assignment => (
                    <div
                        key={assignment.id}
                        style={{
                            padding: 'var(--spacing-md)',
                            backgroundColor: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{assignment.title}</div>
                            <span style={{
                                fontSize: '0.75rem',
                                backgroundColor: 'var(--bg-secondary)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)'
                            }}>
                                {getTypeLabel(assignment.type)}
                            </span>
                        </div>
                        {assignment.description && (
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                {assignment.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
