import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  where,
  doc,
  deleteDoc,
  getDocs,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real-time Posts Listener
  useEffect(() => {
    const postsRef = collection(db, 'posts');
    // Remove orderBy server-side to prevent index issues
    const q = query(postsRef);

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));

      // Sort client-side
      postsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // We still need to check likes for the current user
      // Optimization: Fetch user likes once and map them
      if (user) {
        try {
          const likesRef = collection(db, 'likes');
          const likesQuery = query(likesRef, where('user_id', '==', user.uid));
          const likesSnapshot = await getDocs(likesQuery);
          const likedPostIds = new Set(likesSnapshot.docs.map(d => d.data().post_id));

          const enrichedPosts = postsData.map(post => ({
            ...post,
            user_has_liked: likedPostIds.has(post.id)
          }));
          setPosts(enrichedPosts);
        } catch (error) {
          console.error("Error fetching likes", error);
          setPosts(postsData);
        }
      } else {
        setPosts(postsData);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error listening to posts:", error);
      toast.error("Failed to load community posts");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const createPost = async (postData: { title: string; content: string; crop_type?: string; image?: File | null }): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to post');
      return false;
    }

    setIsCreating(true);
    try {
      let image_url = null;

      if (postData.image) {
        console.log('Starting image upload:', postData.image.name);
        try {
          // Create a promise that rejects after 10 seconds
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timed out')), 10000)
          );

          const storageRef = ref(storage, `post_images/${Date.now()}_${postData.image.name}`);
          const uploadPromise = uploadBytes(storageRef, postData.image);

          // Race the upload against the timeout
          const snapshot = await Promise.race([uploadPromise, timeoutPromise]) as any;

          console.log('Image uploaded successfully, getting URL...');
          image_url = await getDownloadURL(snapshot.ref);
          console.log('Image URL retrieved:', image_url);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Image upload failed/timed out, creating post without image.');
          // Proceed without image
        }
      }

      console.log('Creating post document in Firestore...');
      const newPost = {
        user_id: user.uid,
        title: postData.title,
        content: postData.content,
        image_url,
        crop_type: postData.crop_type || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: user.displayName || 'Farmer',
        likes_count: 0,
        comments_count: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), newPost);
      console.log('Post created with ID:', docRef.id);
      toast.success('Post created successfully!');
      return true;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) return;

    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted');

      // Cleanup likes and comments (optional but good practice)
      // Note: For large apps, use Cloud Functions for cleanup
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleLike = async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
    if (!user) {
      toast.error('Sign in to like posts');
      return;
    }

    try {
      const likesRef = collection(db, 'likes');
      const postRef = doc(db, 'posts', postId);

      if (hasLiked) {
        // Find the like doc
        const q = query(likesRef, where('post_id', '==', postId), where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        snapshot.forEach(async (d) => {
          await deleteDoc(doc(db, 'likes', d.id));
        });
        await updateDoc(postRef, { likes_count: increment(-1) });
      } else {
        await addDoc(likesRef, {
          post_id: postId,
          user_id: user.uid,
          created_at: new Date().toISOString()
        });
        await updateDoc(postRef, { likes_count: increment(1) });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const editPost = async (postId: string, updates: { title: string; content: string; crop_type?: string; image?: File | null; current_image_url?: string | null }) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'posts', postId);
      let image_url = updates.current_image_url;

      if (updates.image) {
        // Upload new image
        const storageRef = ref(storage, `post_images/${Date.now()}_${updates.image.name}`);
        const snapshot = await uploadBytes(storageRef, updates.image);
        image_url = await getDownloadURL(snapshot.ref);
      } else if (updates.image === null) {
        // Explicitly removed image
        image_url = null;
      }

      await updateDoc(postRef, {
        title: updates.title,
        content: updates.content,
        crop_type: updates.crop_type || null,
        image_url: image_url || null,
        updated_at: new Date().toISOString()
      });
      toast.success('Post updated successfully');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
      throw error;
    }
  };

  return {
    posts,
    isLoading,
    createPost,
    isCreating,
    deletePost,
    isDeleting,
    toggleLike,
    editPost
  };
};

export const useForumComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const commentsRef = collection(db, 'comments');
    // Remove orderBy server-side to prevent index requirements
    const q = query(commentsRef, where('post_id', '==', postId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumComment));

      // Sort client-side
      commentsData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      setComments(commentsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading comments", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [postId]);

  const createComment = async (content: string) => {
    if (!user) {
      toast.error('Sign in to comment');
      return;
    }

    setIsCreating(true);
    try {
      const newComment = {
        post_id: postId,
        user_id: user.uid,
        content,
        created_at: new Date().toISOString(),
        author_name: user.displayName || 'Farmer',
        is_expert_answer: false
      };

      await addDoc(collection(db, 'comments'), newComment);

      // Increment comment count on post
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, { comments_count: increment(1) });

      toast.success('Comment added');
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCreating(false);
    }
  };

  return {
    comments,
    isLoading,
    createComment,
    isCreating
  };
};
