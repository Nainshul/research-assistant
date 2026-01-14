import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Lock, WifiOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useForum } from '@/hooks/useForum';
import PostCard from '@/components/forum/PostCard';
import CreatePostDialog from '@/components/forum/CreatePostDialog';

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, isLoading, createPost, isCreating, toggleLike } = useForum();
  const isOnline = navigator.onLine;

  if (!isOnline) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">You're Offline</h1>
          <p className="text-muted-foreground mb-6 max-w-xs">
            The Community Forum requires an internet connection. Please check your connection and try again.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 pb-24 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Community</h1>
            <p className="text-muted-foreground text-sm">Ask questions & share tips</p>
          </div>
          
          {user ? (
            <CreatePostDialog onSubmit={createPost} isCreating={isCreating} />
          ) : (
            <Button onClick={() => navigate('/auth')} className="gap-2">
              <Lock className="h-4 w-4" />
              Sign in to Post
            </Button>
          )}
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-1">No posts yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Be the first to ask a question or share farming tips with the community!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={(postId, hasLiked) => toggleLike({ postId, hasLiked })}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CommunityPage;
