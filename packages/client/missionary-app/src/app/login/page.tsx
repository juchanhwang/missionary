import { AsyncBoundary } from 'components/boundary';

import { LoginForm } from './_components/LoginForm';

export default function LoginPage() {
  return (
    <AsyncBoundary>
      <LoginForm />
    </AsyncBoundary>
  );
}
