import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ForumPost, useForumComments } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';

interface PostCardProps {
  post: ForumPost;
  onLike: (postId: string, hasLiked: boolean) => void;
}

const PostCard = ({ post, onLike }: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const { comments, isLoading: commentsLoading, createComment, isCreating } = useForumComments(post.id);

  const authorName = post.author_name || 'Anonymous Farmer';
  const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground">{authorName}</span>
              {post.crop_type && (
                <Badge variant="secondary" className="text-xs">
                  {post.crop_type}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h3 className="font-semibold text-foreground mb-2">{post.title}</h3>
        <p className="text-muted-foreground text-sm whitespace-pre-wrap">{post.content}</p>
        
        {post.image_url && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post image" 
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 ${post.user_has_liked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => user && onLike(post.id, post.user_has_liked)}
              disabled={!user}
            >
              <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
              <span>{post.likes_count}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.comments_count}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        </div>

        {showComments && (
          <CommentSection
            comments={comments}
            isLoading={commentsLoading}
            onAddComment={createComment}
            isCreating={isCreating}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostCard;
