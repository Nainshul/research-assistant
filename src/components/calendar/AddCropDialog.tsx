import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CROP_TEMPLATES } from '@/lib/taskGenerator';
import { Loader2, Calendar as CalendarIcon, Sprout } from 'lucide-react';
import { useCropCalendar } from '@/hooks/useCropCalendar';

interface AddCropDialogProps {
    children: React.ReactNode;
}

const AddCropDialog = ({ children }: AddCropDialogProps) => {
    const [open, setOpen] = useState(false);
    const [cropName, setCropName] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [area, setArea] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showRiskAlert, setShowRiskAlert] = useState(false);

    const { addCrop } = useCropCalendar();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cropName || !date) return;

        // Guardrail Check
        const plantingDate = new Date(date);
        const month = plantingDate.getMonth(); // 0 = Jan

        // Example Rule: Potato in January (Winter/Summer transition in some regions)
        if (cropName === 'Potato' && month === 0 && !showRiskAlert) {
            setShowRiskAlert(true);
            return;
        }

        await submitCrop(plantingDate);
    };

    const submitCrop = async (plantingDate: Date) => {
        setIsSubmitting(true);
        const success = await addCrop(cropName, plantingDate, area);
        setIsSubmitting(false);
        setShowRiskAlert(false);

        if (success) {
            setOpen(false);
            // Reset form
            setCropName('');
            setArea('');
            setDate(new Date().toISOString().split('T')[0]);
        }
    };

    const cropOptions = Object.keys(CROP_TEMPLATES);

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sprout className="w-5 h-5 text-primary" />
                            Add New Crop
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="crop">Crop Type</Label>
                            <Select onValueChange={setCropName} value={cropName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    {cropOptions.map((crop) => (
                                        <SelectItem key={crop} value={crop}>
                                            {crop}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Planting Date</Label>
                            <div className="relative">
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                                <CalendarIcon className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="area">Field Area / Name (Optional)</Label>
                            <Input
                                id="area"
                                placeholder="e.g. North Field or Backyard"
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || !cropName}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add Crop'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showRiskAlert} onOpenChange={setShowRiskAlert}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            ⚠️ High Risk Warning
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                            Planting <strong>Potato</strong> in January carries a high risk of heat stress during the developing stage in many regions.
                        </p>
                        <p className="text-sm font-medium mt-2">
                            Are you sure you want to proceed?
                        </p>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowRiskAlert(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => submitCrop(new Date(date))}>
                            Proceed Anyway
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default AddCropDialog;
