import { getTargetDate } from "./getTargetDate";

export const getTargetDateString = (indexOffset: number) => {
  const targetDate = getTargetDate(indexOffset);
  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const date = String(targetDate.getDate()).padStart(2, "0");
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][
    targetDate.getDay()
  ];

  return `${year}년 ${month}월 ${date}일 (${dayOfWeek})`;
};
