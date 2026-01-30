import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    deleteDoc,
    doc,
    updateDoc
} from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CropSchedule, generateTasksForCrop } from '@/lib/taskGenerator';

export const useCropCalendar = () => {
    const { user } = useAuth();
    const [schedules, setSchedules] = useState<CropSchedule[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Parse tasks from plain objects back to dates if needed (Firestore timestamps)
    // But we store dates as ISO strings in types, so strict JSON is fine.

    useEffect(() => {
        if (!user) {
            setSchedules([]);
            setIsLoading(false);
            return;
        }

        const q = query(
            collection(db, 'schedules'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedSchedules: CropSchedule[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as CropSchedule));

            setSchedules(fetchedSchedules);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching schedules:", error);
            toast.error("Failed to load crop calendar");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const addCrop = async (cropName: string, plantingDate: Date, area?: string) => {
        if (!user) {
            toast.error("You must be logged in");
            return;
        }

        try {
            const tasks = generateTasksForCrop(cropName, plantingDate.toISOString());

            const newSchedule: Omit<CropSchedule, 'id'> = {
                userId: user.uid,
                cropName,
                plantingDate: plantingDate.toISOString(),
                area: area || '',
                tasks,
                createdAt: new Date().toISOString()
            };

            await addDoc(collection(db, 'schedules'), newSchedule);
            toast.success(`${cropName} added to your calendar`);
            return true;
        } catch (error) {
            console.error("Error adding crop:", error);
            toast.error("Failed to add crop");
            return false;
        }
    };

    const deleteCrop = async (scheduleId: string) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'schedules', scheduleId));
            toast.success("Crop removed from calendar");
        } catch (error) {
            console.error("Error deleting crop:", error);
            toast.error("Failed to delete crop");
        }
    };

    const toggleTaskCompletion = async (scheduleId: string, taskId: string, isCompleted: boolean) => {
        if (!user) return;

        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const updatedTasks = schedule.tasks.map(t =>
            t.id === taskId ? { ...t, isCompleted } : t
        );

        try {
            const scheduleRef = doc(db, 'schedules', scheduleId);
            await updateDoc(scheduleRef, { tasks: updatedTasks });
        } catch (error) {
            console.error("Error updating task:", error);
            toast.error("Failed to update task");
        }
    };

    const updateTaskDate = async (scheduleId: string, taskId: string, newDate: Date) => {
        if (!user) return;

        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const targetTask = schedule.tasks.find(t => t.id === taskId);
        if (!targetTask || !targetTask.date) return;

        const oldDateObj = new Date(targetTask.date);
        const timeDiff = newDate.getTime() - oldDateObj.getTime();
        const daysDiff = Math.round(timeDiff / (1000 * 3600 * 24));

        if (daysDiff === 0) return;

        const updatedTasks = schedule.tasks.map(t => {
            if (t.id === taskId) {
                return { ...t, date: newDate.toISOString() };
            }
            // Shift subsequent tasks
            if (t.date && t.dayOffset > targetTask.dayOffset) {
                const tDate = new Date(t.date);
                tDate.setDate(tDate.getDate() + daysDiff);
                return { ...t, date: tDate.toISOString() };
            }
            return t;
        });

        try {
            const scheduleRef = doc(db, 'schedules', scheduleId);
            await updateDoc(scheduleRef, { tasks: updatedTasks });
            toast.success("Schedule updated");
        } catch (error) {
            console.error("Error updating task date:", error);
            toast.error("Failed to update schedule");
        }
    };

    return {
        schedules,
        isLoading,
        addCrop,
        deleteCrop,
        toggleTaskCompletion,
        updateTaskDate
    };
};
