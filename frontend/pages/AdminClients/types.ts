export interface Client {
    id: string;
    name: string;
    lastName?: string | null;
    internalTag?: string | null;
    age: number;
  }
  
  export interface PaymentBlock {
    id: string;
    paidTrainings: number;
    pricePerTraining: number;
    used: number;
  }
  
  export interface AdminClientsProps {
    onBack: () => void;
    onOpenHistory: (userId: string) => void;
    setView: (v: string) => void;
  }
  