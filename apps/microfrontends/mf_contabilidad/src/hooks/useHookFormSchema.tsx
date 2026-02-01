import { zodResolver } from '@hookform/resolvers/zod';
import {
  type DefaultValues,
  type FieldValues,
  type Mode,
  type UseFormReturn,
  useForm,
} from 'react-hook-form';
import type { ZodType } from 'zod';

type useHookFormSchemaProps<T extends FieldValues> = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  schema: ZodType<T, any, any>;
  mode?: Mode;
  defaultValues: DefaultValues<T>;
};

type useHookFormSchemaReturnProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
};

const useHookFormSchema = <T extends FieldValues>({
  schema,
  mode = 'all',
  defaultValues,
}: useHookFormSchemaProps<T>): useHookFormSchemaReturnProps<T> => {
  const methods = useForm<T>({
    mode,
    defaultValues,
    resolver: zodResolver(schema),
  });

  return {
    methods,
  };
};

export default useHookFormSchema;
