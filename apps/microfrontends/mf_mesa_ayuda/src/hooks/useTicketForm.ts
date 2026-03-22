import { zodResolver } from '@hookform/resolvers/zod'
import {
  useCreateTicketMutation,
  useUpdateTicketMutation,
} from 'mf_store/store'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const ticketFormSchema = z.object({
  titulo: z
    .string()
    .min(5, 'El titulo debe tener al menos 5 caracteres')
    .max(200, 'El titulo no puede superar 200 caracteres'),
  descripcion: z
    .string()
    .min(10, 'La descripcion debe tener al menos 10 caracteres')
    .max(5000, 'La descripcion no puede superar 5000 caracteres'),
  categoriaId: z
    .number({ required_error: 'Seleccione una categoria' })
    .positive(),
  prioridadId: z
    .number({ required_error: 'Seleccione una prioridad' })
    .positive(),
  departamento: z.string().optional(),
})

export type TicketFormValues = z.infer<typeof ticketFormSchema>

interface UseTicketFormOptions {
  defaultValues?: Partial<TicketFormValues>
  ticketId?: number
  onSuccess?: () => void
}

export function useTicketForm(options: UseTicketFormOptions = {}) {
  const { defaultValues, ticketId, onSuccess } = options

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      departamento: '',
      ...defaultValues,
    },
  })

  const [createTicket, createState] = useCreateTicketMutation()
  const [updateTicket, updateState] = useUpdateTicketMutation()

  const isEditing = ticketId !== undefined

  const onSubmit = form.handleSubmit(async (data) => {
    if (isEditing) {
      await updateTicket({ id: ticketId, ...data })
    } else {
      await createTicket(data)
    }
    onSuccess?.()
  })

  return {
    form,
    onSubmit,
    isSubmitting: createState.isLoading || updateState.isLoading,
    isEditing,
    errors: form.formState.errors,
  }
}
