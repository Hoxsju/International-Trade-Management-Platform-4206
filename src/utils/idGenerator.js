// Generate alphanumeric IDs
export const generateId = (prefix = '', length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = prefix
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateBuyerId = () => generateId('BUY', 8)
export const generateSupplierId = () => generateId('SUP', 8)
export const generateOrderId = () => generateId('ORD', 10)