import React from 'react';
import { PAYMENT_CONFIG } from './constants';

const PaymentBadge = ({ method }) => {
  const config = PAYMENT_CONFIG[method?.toLowerCase()] || PAYMENT_CONFIG.cod;
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
};

export default PaymentBadge;