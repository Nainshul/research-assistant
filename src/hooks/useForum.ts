import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, addDoc, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  crop_type: string | null;
  created_at: string;
  updated_at: string;
  author_name: string | null;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_expert_answer: boolean;
  created_at: string;
  author_name: string | null;
}

export const useForum = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ['forum-posts'],
    queryFn: async () => {
      // Fetch posts
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);

      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));

      // Fetch additional data (likes, comments, profiles)
      // Note: Firestore doesn't support joins. Optimized way is to store counts on post doc.
      // For now, doing separate queries (inefficient but compatible).

      const postsWithCounts = await Promise.all(
        posts.map(async (post) => {
          // Likes count
          const likesSnapshot = await getDocs(query(collection(db, 'likes'), where('post_id', '==', post.id)));
          const commentsSnapshot = await getDocs(query(collection(db, 'comments'), where('post_id', '==', post.id)));

          let userHasLiked = false;
          if (user) {
            const userLike = likesSnapshot.docs.find(d => d.data().user_id === user.uid);
            userHasLiked = !!userLike;
          }

          // Author Name often stored in post or fetched from users collection. 
          // Assuming stored in post for now or falling back to 'User'
          const author_name = post.author_name || 'User';

          return {
            ...post,
            author_name,
            likes_count: likesSnapshot.size,
            comments_count: commentsSnapshot.size,
            user_has_liked: userHasLiked
          };
        })
      );

      return postsWithCounts;
    }
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: { title: string; content: string; image_url?: string; crop_type?: string }) => {
      if (!user) throw new Error('Must be logged in');

      const newPost = {
        user_id: user.uid,
        title: post.title,
        content: post.content,
        image_url: post.image_url || null,
        crop_type: post.crop_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: user.displayName || user.email || 'User' // Denormalize author name
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      return { id: docRef.id, ...newPost };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      toast({ title: 'Post created', description: 'Your question has been posted to the community.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      if (!user) throw new Error('Must be logged in');

      const likesRef = collection(db, 'likes');
      const q = query(likesRef, where('post_id', '==', postId), where('user_id', '==', user.uid));
      const snapshot = await getDocs(q);

      if (hasLiked) {
        // Unlike
        snapshot.forEach(async (d) => {
          await deleteDoc(doc(db, 'likes', d.id));
        });
      } else {
        // Like
        if (snapshot.empty) {
          await addDoc(likesRef, { post_id: postId, user_id: user.uid, created_at: new Date().toISOString() });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    }
  });

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    createPost: createPostMutation.mutate,
    isCreating: createPostMutation.isPending,
    toggleLike: toggleLikeMutation.mutate
  };
};

export const useForumComments = (postId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ['forum-comments', postId],
    queryFn: async () => {
      const q = query(collection(db, 'comments'), where('post_id', '==', postId), orderBy('created_at', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumComment));
    }
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Must be logged in');

      const newComment = {
        post_id: postId,
        user_id: user.uid,
        content,
        created_at: new Date().toISOString(),
        author_name: user.displayName || user.email || 'User',
        is_expert_answer: false
      };

      const docRef = await addDoc(collection(db, 'comments'), newComment);
      return { id: docRef.id, ...newComment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    createComment: createCommentMutation.mutate,
    isCreating: createCommentMutation.isPending
  };
};
