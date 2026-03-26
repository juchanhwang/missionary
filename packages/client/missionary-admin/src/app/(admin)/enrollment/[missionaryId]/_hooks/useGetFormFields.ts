import { useQuery } from '@tanstack/react-query';
import { formFieldApi, type FormFieldDefinition } from 'apis/formField';
import { queryKeys } from 'lib/queryKeys';

interface UseGetFormFieldsOptions {
  missionaryId: string;
  initialData?: FormFieldDefinition[];
}

export function useGetFormFields({
  missionaryId,
  initialData,
}: UseGetFormFieldsOptions) {
  return useQuery({
    queryKey: queryKeys.formFields.list(missionaryId),
    queryFn: async () => {
      const response = await formFieldApi.getFormFields(missionaryId);
      return response.data;
    },
    initialData,
    enabled: !!missionaryId,
  });
}
