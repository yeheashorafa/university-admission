import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importSecondarySchoolRecords } from "@/services/admin-secondary-school-records.service";

export function useImportSecondarySchoolRecordsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => importSecondarySchoolRecords(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}
