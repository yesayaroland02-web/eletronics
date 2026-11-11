export async function enqueueLowStockNotification(title: string, stock: number) {
  console.log(`[QUEUE] Enqueue low stock alert for '${title}' with stock: ${stock}`);
}