export interface User {
  id: string;
  name: string;
  lastName?: string | null;
  internalTag?: string | null;
  // future?: string; // можно добавить роль, номер, email и т.п.
}

export interface Training {
  id: string;
  userId: string;
  date: string; // ISO string (e.g., 2025-07-03)
  hour: number; // 0–23
  status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
  attended: boolean | null;
  isSinglePaid: boolean;
  user: {
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  };
}

export interface PaymentBlock {
  id: string;
  paidTrainings: number;
  used: number;
  // Optionally: startDate, endDate, pricePerTraining
}
