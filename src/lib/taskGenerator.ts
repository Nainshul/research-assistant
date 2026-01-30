export type TaskType = 'water' | 'fertilizer' | 'pest' | 'harvest' | 'general';

export interface CalendarTask {
    id: string;
    dayOffset: number; // Days after planting
    title: string;
    description: string;
    type: TaskType;
    isCompleted: boolean;
    date?: string; // Calculated date string (ISO)
}

export interface CropSchedule {
    id: string;
    userId: string;
    cropName: string;
    plantingDate: string; // ISO string
    area?: string;
    tasks: CalendarTask[];
    createdAt: string;
}

// Master list of crop schedules
// In a real app, this would be more extensive or fetched from a database
export const CROP_TEMPLATES: Record<string, Omit<CalendarTask, 'id' | 'isCompleted' | 'date'>[]> = {
    'Tomato': [
        { dayOffset: 1, title: 'Watering', description: 'Lightly water the newly planted seeds/seedlings.', type: 'water' },
        { dayOffset: 7, title: 'Thinning', description: 'Remove weaker seedlings to allow strong ones to grow.', type: 'general' },
        { dayOffset: 15, title: 'First Fertilization', description: 'Apply nitrogen-rich fertilizer for leaf growth.', type: 'fertilizer' },
        { dayOffset: 21, title: 'Staking', description: 'Install stakes or cages to support future plant growth.', type: 'general' },
        { dayOffset: 30, title: 'Pruning', description: 'Remove suckers (side shoots) between main stem and branches.', type: 'general' },
        { dayOffset: 45, title: 'Flowering Check', description: 'Plants should be flowering. Ensure consistent watering.', type: 'water' },
        { dayOffset: 60, title: 'Pest Check', description: 'Check leaves for blight or hornworms.', type: 'pest' },
        { dayOffset: 75, title: 'First Harvest', description: 'Pick fruits when they are fully colored and firm.', type: 'harvest' },
    ],
    'Potato': [
        { dayOffset: 1, title: 'Planting', description: 'Plant seed potatoes 4 inches deep.', type: 'general' },
        { dayOffset: 14, title: 'Hilling', description: 'Mound soil around the base of the plants as they grow.', type: 'general' },
        { dayOffset: 28, title: 'Weeding', description: 'Remove weeds carefully to avoid damaging shallow roots.', type: 'general' },
        { dayOffset: 45, title: 'Fertilization', description: 'Apply balanced fertilizer.', type: 'fertilizer' },
        { dayOffset: 60, title: 'Pest Check', description: 'Look for Colorado Potato Beetles.', type: 'pest' },
        { dayOffset: 90, title: 'Stop Watering', description: 'Stop watering to allow skins to cure.', type: 'water' },
        { dayOffset: 100, title: 'Harvest', description: 'Dig up potatoes carefully after foliage dies back.', type: 'harvest' },
    ],
    'Wheat': [
        { dayOffset: 1, title: 'Sowing', description: 'Ensure soil is moist but not waterlogged.', type: 'water' },
        { dayOffset: 21, title: 'First Irrigation (CRI Stage)', description: 'Critical Root Initiation stage. Must errigate now.', type: 'water' },
        { dayOffset: 45, title: 'Tillering Stage', description: 'Check for proper tiller development.', type: 'general' },
        { dayOffset: 65, title: 'Jointing Stage', description: 'Apply nitrogen top dressing.', type: 'fertilizer' },
        { dayOffset: 85, title: 'Booting Stage', description: 'Check for rust diseases on leaves.', type: 'pest' },
        { dayOffset: 110, title: 'Grain Filling', description: 'Ensure no water stress during this period.', type: 'water' },
        { dayOffset: 130, title: 'Harvesting', description: 'Harvest when grain is hard and moisture is low.', type: 'harvest' },
    ]
};

export const generateTasksForCrop = (cropName: string, plantingDate: string): CalendarTask[] => {
    const template = CROP_TEMPLATES[cropName] || [];
    const start = new Date(plantingDate);

    return template.map((t, index) => {
        const taskDate = new Date(start);
        taskDate.setDate(start.getDate() + t.dayOffset);

        return {
            id: crypto.randomUUID(),
            dayOffset: t.dayOffset,
            title: t.title,
            description: t.description,
            type: t.type,
            isCompleted: false,
            date: taskDate.toISOString()
        };
    });
};
