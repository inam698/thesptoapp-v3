import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export type AnnouncementType = 'info' | 'warning' | 'success' | 'urgent';

export interface Announcement {
  message: string;
  type: AnnouncementType;
  active: boolean;
  updatedAt?: string;
}

/**
 * Listens in real-time to Firestore `announcements/current`.
 * Returns null if no active announcement.
 */
export function useAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'announcements', 'current'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Announcement;
          if (data.active && data.message) {
            setAnnouncement(data);
            setDismissed(false); // reset dismiss on new message
          } else {
            setAnnouncement(null);
          }
        } else {
          setAnnouncement(null);
        }
      },
      () => setAnnouncement(null)
    );
    return () => unsub();
  }, []);

  return { announcement: dismissed ? null : announcement, dismiss: () => setDismissed(true) };
}
