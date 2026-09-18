import { getTargetDate } from "./getTargetDate";

export const getFormattedYYYYMMDD = (indexOffset: number) => {
  const d = getTargetDate(indexOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
};
