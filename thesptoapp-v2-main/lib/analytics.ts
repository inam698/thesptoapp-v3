import { db } from '@/lib/firebase';
import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';

/**
 * Track an article view. Fires once per article open.
 */
export async function trackArticleView(articleId: string, userId?: string): Promise<void> {
  try {
    // Log the view event
    await addDoc(collection(db, 'article_views'), {
      articleId,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      readDurationSeconds: 0,
      completedReading: false,
    });

    // Increment the article's viewCount
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
      viewCount: increment(1),
    });
  } catch {
    // Analytics should never block the user experience
  }
}

/**
 * Track how long a user spent reading an article.
 */
export async function trackReadTime(
  articleId: string,
  durationSeconds: number,
  userId?: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'article_views'), {
      articleId,
      userId: userId || 'anonymous',
      timestamp: new Date().toISOString(),
      readDurationSeconds: Math.round(durationSeconds),
      completedReading: durationSeconds > 60,
      type: 'read_time',
    });
  } catch {
    // Analytics should never block the user experience
  }
}
