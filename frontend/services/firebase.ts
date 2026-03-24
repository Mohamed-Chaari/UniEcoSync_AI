// 100% Mocked System for Demo
export const db = {} as any;

export const auth = {
  currentUser: { uid: 'mock-admin', email: 'admin@uniecosync.edu' }
} as any;

export interface AnomalyReport {
  userId: string;
  type: "water_leak" | "overflow_bin" | "electrical" | "other";
  description: string;
  location: string;
  imageUrl: string;
  status?: "pending" | "in_progress" | "resolved";
  points_awarded?: number;
}

export const submitAnomalyReport = async (report: AnomalyReport): Promise<void> => {
  console.log("Mock submitted report:", report);
  return Promise.resolve();
};