import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'alert', // 'alert' | 'confirm'
    onConfirm: null,
  });

  const showAlert = (title, message) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'alert',
      onConfirm: null,
    });
  };

  const showConfirm = (title, message, onConfirmCallback) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type: 'confirm',
      onConfirm: onConfirmCallback,
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) modalState.onConfirm();
    closeModal();
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.isOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1100, backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 rounded-4 shadow-lg" style={{ backgroundColor: 'var(--dl-surface, #fff)' }}>
              <div className="modal-header border-bottom-0 pb-0 px-4 pt-4">
                <h5 className="modal-title fw-bold" style={{ color: 'var(--dl-text-primary, #333)' }}>
                  {modalState.type === 'confirm' ? (
                    <><img src="/icons/notificacao.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {modalState.title}</>
                  ) : (
                    <><img src="/icons/ideia.png" alt="icon" style={{ width: "20px", height: "20px", objectFit: "contain", marginRight: "4px" }} /> {modalState.title}</>
                  )}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body px-4 py-4">
                <p className="text-muted mb-0" style={{ color: 'var(--dl-text-secondary, #666)' }}>
                  {modalState.message}
                </p>
              </div>
              <div className="modal-footer border-top-0 pt-0 px-4 pb-4">
                {modalState.type === 'confirm' && (
                  <button type="button" className="btn btn-light fw-bold rounded-pill px-4" onClick={closeModal}>
                    Cancelar
                  </button>
                )}
                <button 
                  type="button" 
                  className={`btn ${modalState.type === 'confirm' ? 'btn-danger' : 'btn-primary'} fw-bold rounded-pill px-4 shadow-sm`} 
                  onClick={modalState.type === 'confirm' ? handleConfirm : closeModal}
                >
                  {modalState.type === 'confirm' ? 'Confirmar' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
