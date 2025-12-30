import React, { createContext, useContext, useState, ReactNode } from 'react';
import CustomAlert from '../components/ui/alert/Alert';

// Định nghĩa các loại thông báo khớp với UI của bạn
type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertContextType {
  showAlert: (message: string, variant?: AlertVariant, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    message: string;
    title?: string;
    variant: AlertVariant;
  }>({
    isOpen: false,
    message: '',
    variant: 'info',
  });

  const showAlert = (message: string, variant: AlertVariant = 'info', title?: string) => {
    setAlertState({
      isOpen: true,
      message,
      variant,
      title,
    });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {/* Component Alert nằm chờ ở đây */}
      <CustomAlert
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        message={alertState.message}
        title={alertState.title}
        variant={alertState.variant}
      />
    </AlertContext.Provider>
  );
}

// Hook để dùng trong các trang
export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert phải được sử dụng bên trong AlertProvider');
  }
  return context;
}