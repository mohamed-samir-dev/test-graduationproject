import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const ID_COUNTER_DOC = "userIdCounter";
const COUNTERS_COLLECTION = "counters";

export const getNextUserId = async (): Promise<number> => {
  try {
    const counterRef = doc(db, COUNTERS_COLLECTION, ID_COUNTER_DOC);
    const counterDoc = await getDoc(counterRef);
    
    let nextId = 1;
    
    if (counterDoc.exists()) {
      nextId = (counterDoc.data().currentId || 0) + 1;
    }
    
    await setDoc(counterRef, { currentId: nextId });
    return nextId;
  } catch (error) {
    console.error("Error getting next user ID:", error);
    return Date.now(); // Fallback to timestamp
  }
};

export const initializeUserIds = async (): Promise<void> => {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);
    
    let currentId = 1;
    const batch: Promise<void>[] = [];
    
    snapshot.docs.forEach((userDoc) => {
      const userData = userDoc.data();
      if (!userData.numericId) {
        const userRef = doc(db, "users", userDoc.id);
        batch.push(setDoc(userRef, { ...userData, numericId: currentId }, { merge: true }));
        currentId++;
      }
    });
    
    await Promise.all(batch);
    
    // Update counter
    const counterRef = doc(db, COUNTERS_COLLECTION, ID_COUNTER_DOC);
    await setDoc(counterRef, { currentId: currentId - 1 });
    
  } catch (error) {
    console.error("Error initializing user IDs:", error);
  }
};