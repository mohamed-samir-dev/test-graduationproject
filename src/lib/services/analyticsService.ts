import { collection, getDocs, doc, setDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { CompanyBudget, CompanyExpense, SalaryAnalytics, BudgetAnalytics } from "@/lib/types/analytics";
import { getUsers } from "./userService";

export const getBudget = async (): Promise<CompanyBudget | null> => {
  const budgetCollection = collection(db, "budget");
  const snapshot = await getDocs(budgetCollection);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as CompanyBudget;
};

export const getExpenses = async (): Promise<CompanyExpense[]> => {
  const expensesCollection = collection(db, "expenses");
  const snapshot = await getDocs(expensesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CompanyExpense));
};

export const getSalaryAnalytics = async (): Promise<SalaryAnalytics> => {
  const users = await getUsers();
  const usersWithSalary = users.filter(user => user.salary && user.numericId !== 1);
  
  const totalSalaryExpense = usersWithSalary.reduce((sum, user) => sum + (user.salary || 0), 0);
  const averageSalary = totalSalaryExpense / usersWithSalary.length || 0;
  
  const departmentSalaries: { [key: string]: number } = {};
  usersWithSalary.forEach(user => {
    const dept = user.department || user.Department || 'Unassigned';
    departmentSalaries[dept] = (departmentSalaries[dept] || 0) + (user.salary || 0);
  });
  
  const salaryRanges = [
    { range: '30k-50k', min: 30000, max: 50000 },
    { range: '50k-70k', min: 50000, max: 70000 },
    { range: '70k-90k', min: 70000, max: 90000 },
    { range: '90k+', min: 90000, max: Infinity }
  ];
  
  const salaryDistribution = salaryRanges.map(range => ({
    range: range.range,
    count: usersWithSalary.filter(user => 
      (user.salary || 0) >= range.min && (user.salary || 0) < range.max
    ).length
  }));
  
  return {
    totalSalaryExpense,
    averageSalary,
    departmentSalaries,
    salaryDistribution
  };
};

export const getBudgetAnalytics = async (): Promise<BudgetAnalytics> => {
  const budget = await getBudget();
  const expenses = await getExpenses();
  
  if (!budget) {
    return {
      budgetUtilization: 0,
      monthlyExpenses: [],
      expensesByCategory: [],
      projectedBurnRate: 0
    };
  }
  
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetUtilization = (totalExpenses / budget.totalBudget) * 100;
  
  const monthlyExpenses = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ month, amount: expense.amount });
    }
    return acc;
  }, [] as { month: string; amount: number }[]);
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as { [key: string]: number });
  
  const expensesByCategory = Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    amount,
    percentage: (amount / totalExpenses) * 100
  }));
  
  const projectedBurnRate = monthlyExpenses.length > 0 
    ? monthlyExpenses.reduce((sum, month) => sum + month.amount, 0) / monthlyExpenses.length
    : 0;
  
  return {
    budgetUtilization,
    monthlyExpenses,
    expensesByCategory,
    projectedBurnRate
  };
};

export const initializeSampleData = async (): Promise<void> => {
  const budgetRef = doc(db, "budget", "current");
  await setDoc(budgetRef, {
    totalBudget: 2000000,
    allocatedBudget: 1500000,
    remainingBudget: 500000,
    year: 2024,
    month: 12
  });
  
  const sampleExpenses = [
    { category: 'Salaries', amount: 850000, description: 'Monthly salaries', date: '2024-01-01', type: 'salary' },
    { category: 'Office Rent', amount: 25000, description: 'Monthly office rent', date: '2024-01-01', type: 'operational' },
    { category: 'Utilities', amount: 8000, description: 'Electricity and internet', date: '2024-01-01', type: 'utilities' },
    { category: 'Equipment', amount: 45000, description: 'New laptops and monitors', date: '2024-01-15', type: 'equipment' },
    { category: 'Marketing', amount: 15000, description: 'Digital marketing campaigns', date: '2024-01-20', type: 'other' }
  ];
  
  for (let i = 0; i < sampleExpenses.length; i++) {
    const expenseRef = doc(db, "expenses", `expense_${i + 1}`);
    await setDoc(expenseRef, sampleExpenses[i]);
  }
};