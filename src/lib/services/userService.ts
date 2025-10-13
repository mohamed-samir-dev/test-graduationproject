import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/lib/types";
import { getNextUserId } from "./idService";

export const getUsers = async (): Promise<User[]> => {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return users;
};

export const createUserWithId = async (userData: Omit<User, 'id' | 'numericId'>): Promise<User> => {
  const numericId = await getNextUserId();
  const userRef = doc(collection(db, "users"));
  
  const newUser: User = {
    id: userRef.id,
    numericId,
    ...userData
  };
  
  await setDoc(userRef, newUser);
  return newUser;
};

export const getUserDisplayId = (user: any): string => {
  return user?.numericId?.toString() || "1";
};