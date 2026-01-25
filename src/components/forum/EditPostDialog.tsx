import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
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
import { Loader2, Image as ImageIcon, X, Edit2 } from 'lucide-react';
import { ForumPost } from '@/hooks/useForum';

const CROP_TYPES = [
  'Rice', 'Wheat', 'Corn', 'Tomato', 'Potato', 'Cotton', 
  'Sugarcane', 'Soybean', 'Pepper', 'Grape', 'Apple', 'Other'
];

interface EditPostDialogProps {
  post: ForumPost;
  onEdit: (postId: string, updates: { title: string; content: string; crop_type?: string; image?: File | null; current_image_url?: string | null }) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditPostDialog = ({ post, onEdit, open, onOpenChange }: EditPostDialogProps) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [cropType, setCropType] = useState(post.crop_type || '');
  const [selectedImage, setSelectedImage] = useState<File | null>(undefined); // undefined means no change
  const [imagePreview, setImagePreview] = useState<string | null>(post.image_url);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(post.title);
      setContent(post.content);
      setCropType(post.crop_type || '');
      setImagePreview(post.image_url);
      setSelectedImage(undefined);
    }
  }, [open, post]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
    setSelectedImage(null); // null means explicitly removed
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onEdit(post.id, {
        title: title.trim(),
        content: content.trim(),
        crop_type: cropType || undefined,
        image: selectedImage,
        current_image_url: post.image_url
      });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="font-semibold">Question Title <span className="text-destructive">*</span></Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-crop" className="font-semibold">Crop Type (optional)</Label>
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
            <Label htmlFor="edit-content" className="font-semibold">Description <span className="text-destructive">*</span></Label>
            <Textarea
              id="edit-content"
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || !content.trim() || isSaving}
            className="rounded-xl px-6"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
