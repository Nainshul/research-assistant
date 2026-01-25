import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { User, History, Settings, LogIn, LogOut, Mail, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { useForum } from '@/hooks/useForum';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostCard from '@/components/forum/PostCard';
import { useState } from 'react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const { scans } = useScans();
  const { posts, deletePost, isDeleting, toggleLike, editPost } = useForum();
  const [activeTab, setActiveTab] = useState("profile");

  const handleSignOut = async () => {
    await signOut();
  };

  const healthyCount = scans.filter(s => s.disease_detected.toLowerCase().includes('healthy')).length;
  
  const myPosts = posts.filter(post => post.user_id === user?.uid);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 pb-24">
        <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Account</h1>
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="posts">My Posts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-6">
            {/* Profile Info */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border shadow-sm"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              {user ? (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-1">
                    {user.user_metadata?.full_name || user.displayName || 'Farmer'}
                  </h2>
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground mb-1">Guest User</h2>
                  <p className="text-muted-foreground text-sm">Sign in to sync your data</p>
                </>
              )}
            </motion.div>

            {/* Quick stats */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-3"
            >
              <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                <p className="text-2xl font-bold text-primary">{scans.length}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Scans</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                <p className="text-2xl font-bold text-success">{healthyCount}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Healthy</p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border text-center shadow-sm">
                <p className="text-2xl font-bold text-blue-500">{myPosts.length}</p>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Posts</p>
              </div>
            </motion.div>

            {/* Menu items */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <button 
                onClick={() => navigate('/history')}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Scan History</p>
                  <p className="text-xs text-muted-foreground">View your past diagnoses</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/settings')}
                className="w-full flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-foreground">Settings</p>
                  <p className="text-xs text-muted-foreground">Update profile & preferences</p>
                </div>
              </button>
            </motion.div>

            {/* Sign in/out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {user ? (
                <Button 
                  variant="outline"
                  className="w-full mt-4 h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" 
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Button 
                  className="w-full mt-4 h-12 shadow-lg shadow-primary/20" 
                  onClick={() => navigate('/auth')}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="posts" className="min-h-[50vh]">
            {!user ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 opacity-50" />
                </div>
                <p>Sign in to view your posts</p>
                <Button onClick={() => navigate('/auth')}>Sign In</Button>
              </div>
            ) : myPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-4 border-2 border-dashed rounded-2xl border-muted">
                 <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <div>
                  <p className="font-medium">No posts yet</p>
                  <p className="text-sm">Share your first question with the community!</p>
                </div>
                <Button onClick={() => navigate('/community')} variant="outline">
                  Go to Community
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                 <AnimatePresence>
                  {myPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <PostCard 
                        post={post} 
                        onLike={(id, hasLiked) => toggleLike({ postId: id, hasLiked })}
                        onDelete={deletePost}
                        onEdit={editPost}
                        isDeleting={isDeleting}
                      />
                    </motion.div>
                  ))}
                 </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
