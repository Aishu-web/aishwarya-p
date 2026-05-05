import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const registerFcmToken = async (userId: string) => {
  try {
    const messaging = getMessaging();
    
    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    // Get token
    const token = await getToken(messaging, { 
      vapidKey: 'YOUR_VAPID_KEY_FROM_FIREBASE_CONSOLE' 
    });

    if (token) {
      await setDoc(doc(db, 'user_tokens', userId), {
        userId,
        token,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('FCM Registration Error:', error);
  }
};
