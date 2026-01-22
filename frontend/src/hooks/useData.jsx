import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [students, setStudents] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [studentAssignments, setStudentAssignments] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Fetch initial data
    useEffect(() => {
        if (!user) return; // Wait for auth

        const fetchData = async () => {
            try {
                const [studentsData, assignmentsData, linksData, usersData] = await Promise.all([
                    api('/students'),
                    api('/assignments'),
                    api('/student-assignments'),
                    user.role === 'admin' || user.role === 'teacher' ? api('/users') : Promise.resolve([])
                ]);

                setStudents(studentsData);
                setAssignments(assignmentsData);
                setStudentAssignments(linksData);
                setUsers(usersData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Actions
    const addStudent = async (name, level) => {
        try {
            const newStudent = await api('/students', {
                method: 'POST',
                body: JSON.stringify({ name, level })
            });
            setStudents(prev => [...prev, newStudent]);
        } catch (error) {
            console.error("Error adding student:", error);
        }
    };

    const addAssignmentTemplate = async (title, description, type, grammarLessonId = null) => {
        try {
            const payload = { title, description, type };
            if (grammarLessonId) {
                payload.grammarLessonId = grammarLessonId;
            }
            const newTemplate = await api('/assignments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            setAssignments(prev => [...prev, newTemplate]);
        } catch (error) {
            console.error("Error adding assignment:", error);
        }
    };

    const updateAssignmentTemplate = async (id, title, description, type, grammarLessonId = null) => {
        try {
            const payload = { title, description, type };
            if (grammarLessonId !== undefined) {
                payload.grammarLessonId = grammarLessonId;
            }
            const updatedTemplate = await api(`/assignments/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
            setAssignments(prev => prev.map(a => a.id === id ? updatedTemplate : a));
        } catch (error) {
            console.error("Error updating assignment:", error);
        }
    };

    const assignToStudent = async (studentId, assignmentId, dueDate) => {
        try {
            const newLink = await api('/student-assignments', {
                method: 'POST',
                body: JSON.stringify({ studentId, assignmentId, dueDate })
            });
            setStudentAssignments(prev => [...prev, newLink]);
        } catch (error) {
            console.error("Error linking assignment:", error);
        }
    };

    const updateAssignmentStatus = async (id, status, data = {}) => {
        try {
            const updatedLink = await api(`/student-assignments/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, ...data })
            });

            setStudentAssignments(prev => prev.map(a =>
                a.id === id ? updatedLink : a
            ));
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const deleteStudentAssignment = async (id) => {
        try {
            await api(`/student-assignments/${id}`, {
                method: 'DELETE'
            });
            setStudentAssignments(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error("Error deleting assignment:", error);
            throw error;
        }
    };

    // User Management Actions
    const addUser = async (username, password, role) => {
        try {
            const newUser = await api('/users', {
                method: 'POST',
                body: JSON.stringify({ username, password, role })
            });
            setUsers(prev => [...prev, newUser]);
            return newUser;
        } catch (error) {
            console.error("Error adding user:", error);
            throw error;
        }
    };

    const updateUser = async (id, username, password, role) => {
        try {
            const updatedUser = await api(`/users/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ username, password, role })
            });
            setUsers(prev => prev.map(u => u._id === id ? updatedUser : u));
            return updatedUser;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    };

    const deleteUser = async (id) => {
        try {
            await api(`/users/${id}`, {
                method: 'DELETE'
            });
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    };

    const linkUserToStudent = async (studentId, userId) => {
        try {
            const updatedStudent = await api(`/students/${studentId}/link-user`, {
                method: 'PATCH',
                body: JSON.stringify({ userId })
            });
            setStudents(prev => prev.map(s => s.id === studentId ? updatedStudent : s));
            return updatedStudent;
        } catch (error) {
            console.error("Error linking user to student:", error);
            throw error;
        }
    };

    return (
        <DataContext.Provider value={{
            students,
            assignments,
            studentAssignments,
            users,
            loading,
            addStudent,
            addAssignmentTemplate,
            updateAssignmentTemplate,
            assignToStudent,
            updateAssignmentStatus,
            deleteStudentAssignment,
            addUser,
            updateUser,
            deleteUser,
            linkUserToStudent
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
