"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface BookingContextType {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  serviceDetailsId: string | null;
  openServiceDetails: (id: string) => void;
  closeServiceDetails: () => void;
  isLeadModalOpen: boolean;
  leadService: string | null;
  openLeadModal: (service?: string) => void;
  closeLeadModal: () => void;
}

const BookingContext = createContext<BookingContextType>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
  serviceDetailsId: null,
  openServiceDetails: () => {},
  closeServiceDetails: () => {},
  isLeadModalOpen: false,
  leadService: null,
  openLeadModal: () => {},
  closeLeadModal: () => {},
});

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceDetailsId, setServiceDetailsId] = useState<string | null>(null);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [leadService, setLeadService] = useState<string | null>(null);
  const openModal  = useCallback(() => setIsOpen(true),  []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const openServiceDetails = useCallback((id: string) => setServiceDetailsId(id), []);
  const closeServiceDetails = useCallback(() => setServiceDetailsId(null), []);

  const openLeadModal = useCallback((service?: string) => {
    setLeadService(service || null);
    setIsLeadModalOpen(true);
  }, []);
  const closeLeadModal = useCallback(() => {
    setIsLeadModalOpen(false);
    // leadService'i hemen temizlemiyoruz ki çıkış animasyonu sırasında bozulmasın.
  }, []);

  return (
    <BookingContext.Provider value={{
      isOpen, openModal, closeModal,
      serviceDetailsId, openServiceDetails, closeServiceDetails,
      isLeadModalOpen, leadService, openLeadModal, closeLeadModal,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
