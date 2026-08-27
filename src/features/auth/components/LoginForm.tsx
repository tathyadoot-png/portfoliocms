import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Button, Input, Spinner } from '@/shared/components/ui'
import { FormField } from '@/shared/components/form'
import { ROUTES } from '@/shared/constants'
import { getErrorMessage } from '@/shared/utils'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormValues } from '../validation/loginSchema'

interface LocationState {
  from?: string
}

export function LoginForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password)
      const state = location.state as LocationState | null
      navigate(state?.from ?? ROUTES.portfolios.root, { replace: true })
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField
        htmlFor="email"
        label="Email"
        required
        error={errors.email?.message}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          {...register('email')}
        />
      </FormField>

      <FormField
        htmlFor="password"
        label="Password"
        required
        error={errors.password?.message}
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
        />
      </FormField>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : null}
        Sign in
      </Button>
    </form>
  )
}
