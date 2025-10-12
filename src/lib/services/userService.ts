import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User } from "@/lib/types";

export const getUsers = async (): Promise<User[]> => {
  const usersCollection = collection(db, "users");
  const snapshot = await getDocs(usersCollection);
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  return users;
};