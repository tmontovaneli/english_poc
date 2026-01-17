import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

const API_Base = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export function DataProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [studentAssignments, setStudentAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, assignmentsRes, linksRes] = await Promise.all([
                    fetch(`${API_Base}/students`),
                    fetch(`${API_Base}/assignments`),
                    fetch(`${API_Base}/student-assignments`)
                ]);

                const studentsData = await studentsRes.json();
                const assignmentsData = await assignmentsRes.json();
                const linksData = await linksRes.json();

                setStudents(studentsData);
                setAssignments(assignmentsData);
                setStudentAssignments(linksData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Actions
    const addStudent = async (name, level) => {
        try {
            const res = await fetch(`${API_Base}/students`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, level })
            });
            const newStudent = await res.json();
            setStudents(prev => [...prev, newStudent]);
        } catch (error) {
            console.error("Error adding student:", error);
        }
    };

    const addAssignmentTemplate = async (title, description, type) => {
        try {
            const res = await fetch(`${API_Base}/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, type })
            });
            const newTemplate = await res.json();
            setAssignments(prev => [...prev, newTemplate]);
        } catch (error) {
            console.error("Error adding assignment:", error);
        }
    };

    const assignToStudent = async (studentId, assignmentId, dueDate) => {
        try {
            const res = await fetch(`${API_Base}/student-assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId, assignmentId, dueDate })
            });
            const newLink = await res.json();
            setStudentAssignments(prev => [...prev, newLink]);
        } catch (error) {
            console.error("Error linking assignment:", error);
        }
    };

    const updateAssignmentStatus = async (id, status) => {
        try {
            const res = await fetch(`${API_Base}/student-assignments/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const updatedLink = await res.json();

            setStudentAssignments(prev => prev.map(a =>
                a.id === id ? updatedLink : a
            ));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <DataContext.Provider value={{
            students,
            assignments,
            studentAssignments,
            loading,
            addStudent,
            addAssignmentTemplate,
            assignToStudent,
            updateAssignmentStatus
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
