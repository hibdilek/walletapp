import React, { createContext, useState, ReactNode } from 'react';

export type User = { id: string; name: string };
 
export type Card = {
  maskedPan: string;
  token: string;
};

export type AppContextType = {
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
  balance: number;
  setBalance: (b: number) => void;
  cardInfo: Card | null;
  setCardInfo: (c: Card | null) => void;
};

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [cardInfo, setCardInfo] = useState<Card | null>(null);

  return (
    <AppContext.Provider
      value={{ user, setUser, balance, setBalance, cardInfo, setCardInfo }}
    >
      {children}
    </AppContext.Provider>
  );
};

