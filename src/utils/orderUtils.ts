// Order ID generation utility
export const generateOrderId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Function to create order from package selection
export const createOrderFromPackage = (
  packageId: string,
  packageName: string,
  packagePrice: string,
  customerData: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  }
) => {
  return {
    id: generateOrderId(),
    customerName: customerData.name,
    customerEmail: customerData.email,
    customerPhone: customerData.phone,
    packageId,
    packageName,
    packagePrice,
    status: 'pending' as const,
    orderDate: new Date(),
    notes: customerData.notes
  };
};