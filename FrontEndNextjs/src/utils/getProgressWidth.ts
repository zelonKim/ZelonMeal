export const getProgressWidth = (
  current: number | undefined | null,
  goal: number,
) => {
  const safeCurrent = current ?? 0;
  if (safeCurrent <= 0 || !goal) return "0%";
  const percentage = Math.min((safeCurrent / goal) * 100, 100);
  return `${percentage}%`;
};
