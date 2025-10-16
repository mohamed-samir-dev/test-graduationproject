import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
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

export const getUserDisplayId = (user: User): string => {
  return user?.numericId?.toString() || "1";
};

export const updateUserDepartment = async (userId: string, department: string): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { department });
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<void> => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, userData);
};

export const deleteUser = async (userId: string): Promise<void> => {
  // Delete the user
  await deleteDoc(doc(db, "users", userId));
  
  // Reorganize IDs
  const users = await getUsers();
  const sortedUsers = users.filter(u => u.numericId !== 1).sort((a, b) => (a.numericId || 0) - (b.numericId || 0));
  
  // Reassign sequential IDs starting from 1 (skip admin)
  for (let i = 0; i < sortedUsers.length; i++) {
    const newId = i + 2; // Start from 2 (admin is 1)
    if (sortedUsers[i].numericId !== newId) {
      const userRef = doc(db, "users", sortedUsers[i].id);
      await updateDoc(userRef, { numericId: newId });
    }
  }
};