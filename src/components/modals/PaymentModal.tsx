import React from 'react';
import { RazorpayPaymentModal } from './RazorpayPaymentModal';
import { Violation } from '../../types';

interface PaymentModalProps {
  violation: Violation;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ violation, onClose }) => {
  return <RazorpayPaymentModal violation={violation} onClose={onClose} />;
};
