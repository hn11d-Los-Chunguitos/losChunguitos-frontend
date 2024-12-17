import React, { createContext, useContext, useState } from "react";

type User = {
    id: number;
    username: string;
    created_at: string;
    karma: number;
    about: string;
    avatar: string | null;
    banner: string | null;
    apiKey: string;
  };
  
type GlobalContextType = {
  loggedUser: User; 
  setUser: (value: User) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedUser, setUser] = useState<User | null>(null); // Estado del usuario

  return (
    <GlobalContext.Provider value={{ loggedUser, setUser }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext debe usarse dentro de GlobalProvider");
  }
  console.log("Contexto global:", context);
  return context;
};
