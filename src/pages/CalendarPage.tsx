import { useState, useMemo } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useCropCalendar } from '@/hooks/useCropCalendar';
import AddCropDialog from '@/components/calendar/AddCropDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Sprout, Calendar as CalendarIcon, Droplets, Bug, Scissors, CheckCircle2, Circle, Trash2, AlertTriangle, Edit2 } from 'lucide-react';
import { format, isAfter, isBefore, addDays, parseISO } from 'date-fns';
import { CalendarTask, TaskType } from '@/lib/taskGenerator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CalendarPage = () => {
    const { schedules, isLoading, deleteCrop, toggleTaskCompletion, updateTaskDate } = useCropCalendar();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('upcoming');

    // Flatten all tasks from all schedules into one list
    const allTasks = useMemo(() => {
        let tasks: (CalendarTask & { cropName: string; scheduleId: string })[] = [];
        schedules.forEach(schedule => {
            schedule.tasks.forEach(task => {
                tasks.push({
                    ...task,
                    cropName: schedule.cropName,
                    scheduleId: schedule.id
                });
            });
        });

        // Sort by date
        return tasks.sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    }, [schedules]);

    const upcomingTasks = allTasks.filter(t => t.date && isAfter(new Date(t.date), new Date()) && !t.isCompleted).slice(0, 10);
    const todaysTasks = allTasks.filter(t => t.date && new Date(t.date).toDateString() === new Date().toDateString());
    const completedTasks = allTasks.filter(t => t.isCompleted).reverse().slice(0, 20);

    const getTaskIcon = (type: TaskType) => {
        switch (type) {
            case 'water': return <Droplets className="w-4 h-4 text-blue-500" />;
            case 'fertilizer': return <Sprout className="w-4 h-4 text-green-500" />;
            case 'pest': return <Bug className="w-4 h-4 text-red-500" />;
            case 'harvest': return <Sprout className="w-4 h-4 text-orange-500" />;
            default: return <Scissors className="w-4 h-4 text-slate-500" />;
        }
    };

    if (!user) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Sign in to manage your farm</h2>
                    <p className="text-muted-foreground">Track your crops and get daily tasks.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="p-4 space-y-6 pb-24">

                {/* Disclaimer Alert */}
                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="text-sm font-semibold">Recommendation Only</AlertTitle>
                    <AlertDescription className="text-xs">
                        {`This schedule is generated based on standard practices. Please adjust specific dates based on your local weather conditions.`}
                    </AlertDescription>
                </Alert>

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">My Farm</h1>
                        <p className="text-sm text-muted-foreground">
                            {schedules.length} crops active • {todaysTasks.length} tasks today
                        </p>
                    </div>
                    <AddCropDialog>
                        <Button size="sm" className="gap-1">
                            <Plus className="w-4 h-4" /> Add Crop
                        </Button>
                    </AddCropDialog>
                </div>

                {/* My Crops Section (Horizontal Scroll) */}
                {schedules.length > 0 && (
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex w-max space-x-4 pb-4">
                            {schedules.map((schedule) => (
                                <Card key={schedule.id} className="w-[200px] shrink-0 overflow-hidden relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                            onClick={() => deleteCrop(schedule.id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <CardHeader className="p-4 pb-2">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                                            <Sprout className="w-4 h-4 text-primary" />
                                            {schedule.cropName}
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Planted {format(parseISO(schedule.plantingDate), 'MMM d')}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="text-xs text-muted-foreground">
                                            {schedule.area && <span>📍 {schedule.area}</span>}
                                        </div>
                                        <Progress value={(schedule.tasks.filter(t => t.isCompleted).length / schedule.tasks.length) * 100} className="h-1 mt-3" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                )}

                {/* Tasks Section */}
                <Tabs defaultValue="upcoming" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upcoming">Upcoming Tasks</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4 pt-4">
                        {allTasks.length === 0 ? (
                            <div className="text-center py-10 space-y-3">
                                <p className="text-muted-foreground text-sm">No tasks scheduled.</p>
                                <AddCropDialog>
                                    <Button variant="outline" size="sm">Add your first crop</Button>
                                </AddCropDialog>
                            </div>
                        ) : upcomingTasks.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground text-sm">All caught up! No upcoming tasks.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {upcomingTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={(completed) => toggleTaskCompletion(task.scheduleId, task.id, completed)}
                                        onDateChange={(date) => updateTaskDate && updateTaskDate(task.scheduleId, task.id, date)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="completed" className="space-y-4 pt-4">
                        {completedTasks.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-muted-foreground text-sm">No completed tasks yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {completedTasks.map(task => (
                                    <TaskItem
                                        key={task.id}
                                        task={task}
                                        onToggle={(completed) => toggleTaskCompletion(task.scheduleId, task.id, completed)}
                                        onDateChange={(date) => updateTaskDate && updateTaskDate(task.scheduleId, task.id, date)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

            </div>
        </AppLayout>
    );
};

const TaskItem = ({
    task,
    onToggle,
    onDateChange
}: {
    task: CalendarTask & { cropName: string },
    onToggle: (checked: boolean) => void,
    onDateChange: (date: Date) => void
}) => {
    const isOverdue = task.date && isBefore(new Date(task.date), new Date()) && !task.isCompleted && new Date(task.date).toDateString() !== new Date().toDateString();
    const taskDate = task.date ? parseISO(task.date) : new Date();

    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl border ${task.isCompleted ? 'bg-muted/50 border-border/50' : 'bg-card border-border'} transition-colors`}>
            <Checkbox
                checked={task.isCompleted}
                onCheckedChange={onToggle}
                className="mt-1"
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 border-current opacity-70">
                        {task.cropName}
                    </Badge>
                    {isOverdue && <Badge variant="destructive" className="text-[10px] h-4 px-1 py-0">Overdue</Badge>}

                    {/* Editable Date */}
                    <div className="ml-auto">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 gap-1"
                                >
                                    <CalendarIcon className="w-3 h-3" />
                                    {format(taskDate, 'MMM d')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={taskDate}
                                    onSelect={(date) => date && onDateChange(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <h4 className={`text-sm font-medium ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                    {task.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {task.description}
                </p>
            </div>
        </div>
    );
};

function Progress({ value, className }: { value: number; className?: string }) {
    return (
        <div className={`w-full bg-secondary rounded-full overflow-hidden ${className}`}>
            <div
                className="bg-primary h-full transition-all duration-500 ease-out"
                style={{ width: `${value}%` }}
            />
        </div>
    );
}

export default CalendarPage;
