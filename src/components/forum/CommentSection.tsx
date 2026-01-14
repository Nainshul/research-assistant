import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';
import { ForumComment } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  comments: ForumComment[];
  isLoading: boolean;
  onAddComment: (content: string) => void;
  isCreating: boolean;
}

const CommentSection = ({ comments, isLoading, onAddComment, isCreating }: CommentSectionProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onAddComment(newComment.trim());
    setNewComment('');
  };

  return (
    <div className="w-full border-t pt-3 space-y-3">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-2">
          No comments yet. Be the first to reply!
        </p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments.map((comment) => {
            const name = comment.author_name || 'Anonymous';
            const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            
            return (
              <div key={comment.id} className="flex gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">{name}</span>
                    {comment.is_expert_answer && (
                      <Badge variant="default" className="text-xs py-0">Expert</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {user ? (
        <div className="flex gap-2">
          <Textarea
            placeholder="Write a reply..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] text-sm"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isCreating}
            className="flex-shrink-0"
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          Sign in to reply
        </p>
      )}
    </div>
  );
};

export default CommentSection;
