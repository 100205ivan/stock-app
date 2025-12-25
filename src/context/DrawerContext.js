// src/context/DrawerContext.js
import React, { createContext, useContext, useState } from 'react';

const DrawerContext = createContext({
  drawerVisible: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within DrawerProvider');
  }
  return context;
};

export const DrawerProvider = ({ children }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <DrawerContext.Provider value={{ drawerVisible, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};
