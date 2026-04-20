import { useEffect } from 'react';

/**
 * Custom hook to handle closing modals on Escape key press.
 * Add this to any modal component to enable Esc-to-close behavior.
 * 
 * @param {Function} onClose Function to call when modal should be closed
 * @param {boolean} isOpen Boolean representing if the modal is currently open
 */
export function useModalClose(onClose, isOpen = true) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isOpen]);
}
