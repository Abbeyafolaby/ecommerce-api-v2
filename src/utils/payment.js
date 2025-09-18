// Simple payment simulator with ~80% success rate
// Returns a promise resolving to { success: boolean, reference: string }

function randomRef() {
  const part = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `PMT_${part}`;
}

export async function simulatePayment(amount) {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 100));
  const success = Math.random() < 0.8; // ~80% success
  return { success, reference: randomRef(), amount };
}

export default { simulatePayment };
