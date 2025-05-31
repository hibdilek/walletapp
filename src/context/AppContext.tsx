import React, { createContext, useState, ReactNode } from 'react';

export type User = { id: string; name: string ; pass:string};
 
export type Card = {
  maskedPan: string;
  token: string;
};

export type AppContextType = {
  user: { id: string; name: string } | null;
  setUser: (user: { id: string; name: string } | null) => void;
  setPassword : (user: {pass : string} | null) => void;
  balance: number;
  setBalance: (b: number) => void;
  cardInfo: Card | null;
  setCardInfo: (c: Card | null) => void;
  pass : {pass: string} | null;

};

export const AppContext = createContext<AppContextType>({
  user: null,
  setUser: () => {},
  balance : 0 ,
  setBalance: () => {},
  cardInfo : null,
  setCardInfo : () =>{} ,
  setPassword : () =>{} ,
  pass : null
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [balance, setBalance] = useState(0);
  const [cardInfo, setCardInfo] = useState<Card | null>(null);
  const [pass, setPassword] = useState<{ pass: string } | null>(null);


  return (
    <AppContext.Provider
      value={{ user, setUser, balance, setBalance, cardInfo, setCardInfo, setPassword,pass}}
    >
      {children}
    </AppContext.Provider>
  );
};

