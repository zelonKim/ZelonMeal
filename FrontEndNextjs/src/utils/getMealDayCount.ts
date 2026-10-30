export const getMealDayCount = (
  createdAtStr: string,
  locale: "ko" | "en" = "ko",
) => {
  const getLabel = (days: number) => {
    if (locale === "en") {
      return `Day ${days}`;
    }
    return `식단 ${days}일차`;
  };

  if (!createdAtStr) return getLabel(1);

  try {
    const startDate = new Date(createdAtStr.split("T")[0]);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const days = diffDays > 0 ? diffDays : 1;

    return getLabel(days);
  } catch (err) {
    console.error(err);
    return getLabel(1);
  }
};
