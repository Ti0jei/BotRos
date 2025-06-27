export interface User {
    id: string;
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
  }
  
  export interface Training {
    id: string;
    userId: string;
    date: string;
    hour: number;
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
  }
  