import { updateProfile } from "@/api/user/updateProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      alert("프로필 정보가 성공적으로 변경되었습니다!");
    },
    onError: () => {
      alert("프로필 정보를 수정하는 중 오류가 발생했습니다.");
    },
  });
};
