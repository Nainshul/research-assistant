import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Image as ImageIcon, X } from 'lucide-react';

const CROP_TYPES = [
  'Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton',
  'Sugarcane', 'Soybean', 'Pepper', 'Grape', 'Apple', 'Other'
];

interface CreatePostDialogProps {
  onSubmit: (post: { title: string; content: string; crop_type?: string; image?: File | null }) => Promise<void | boolean>;
  isCreating: boolean;
}

const CreatePostDialog = ({ onSubmit, isCreating }: CreatePostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cropType, setCropType] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    console.log('Submitting post:', { title, content, cropType, hasImage: !!selectedImage });

    try {
      const success = await onSubmit({
        title: title.trim(),
        content: content.trim(),
        crop_type: cropType || undefined,
        image: selectedImage
      });

      if (success === true) {
        setTitle('');
        setContent('');
        setCropType('');
        removeImage();
        setOpen(false);
      }
    } catch (error) {
      console.error("Error in dialog submission:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button size="lg" className="gap-2 touch-target shadow-lg shadow-primary/25">
            <Plus className="h-5 w-5" />
            Ask Question
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ask the Community</DialogTitle>
          <DialogDescription>
            Share your plant health question with farmers and experts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">Question Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="e.g., Yellow spots on tomato leaves"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crop" className="font-semibold">Crop Type (optional)</Label>
            <Select value={cropType} onValueChange={setCropType}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select crop type" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {CROP_TYPES.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="font-semibold">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="content"
              placeholder="Describe the symptoms, when they started, and any treatments you've tried..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] rounded-xl resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Add Photo</Label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border">
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-muted-foreground/30 h-24 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Click to upload image</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim() || isCreating}
            className="rounded-xl px-6 min-w-[140px] overflow-hidden"
            asChild
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              layout
            >
              <AnimatePresence mode="wait">
                {isCreating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center"
                  >
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Posting...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    Post Question
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostDialog;
