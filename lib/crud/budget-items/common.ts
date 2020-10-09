export const amountToValue = (amount: number, type: string) =>
  type === "expense" ? -amount : amount;