import React from 'react';

export default function PaymentButton() {
  // Cash App link opens the payment gateway directly in a new tab. 
  // The cashtag is securely hidden in the code and never rendered as text on the screen.
  const handlePayment = () => {
    window.open('https://cash.app/$RoadRunner5150A1', '_blank', 'noopener,noreferrer');
  };

  return (
    <button 
      onClick={handlePayment}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
    >
      Complete Secure Payment
    </button>
  );
}
