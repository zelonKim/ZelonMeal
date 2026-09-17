export const handleZMartLink = (menuName: string) => {
  if (!menuName) return;
  const encodedKeyword = encodeURIComponent(menuName);
  const emartWebUrl = `https://m.ssg.com/search.ssg?query=${encodedKeyword}`;
  window.open(emartWebUrl, "_blank");
};
