import { useState, useEffect } from "react";
import { LeaveRequest } from "@/lib/types";
import { getLeaveRequests } from "@/lib/services/leaveService";

export const useLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const requests = await getLeaveRequests();
      setLeaveRequests(requests);
      setError(null);
    } catch (err) {
      setError("Failed to fetch leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const refetch = () => {
    fetchLeaveRequests();
  };

  return { leaveRequests, loading, error, refetch };
};