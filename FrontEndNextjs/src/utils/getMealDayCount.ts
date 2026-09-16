export const getMealDayCount = (createdAtStr: string) => {
  if (!createdAtStr) return "식단 1일차";
  try {
    const startDate = new Date(createdAtStr.split("T")[0]);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `식단 ${diffDays > 0 ? diffDays : 1}일차`;
  } catch (err) {
    console.log(err);
    return "식단 1일차";
  }
};
