import { INITIAL_INDEX } from "@/constants/INITIAL_INDEX";

export const getTargetDate = (indexOffset: number) => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + (indexOffset - INITIAL_INDEX));
  return targetDate;
};
