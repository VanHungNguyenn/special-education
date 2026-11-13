export const FormError = ({ message }: { message?: string | null }) =>
  message ? <p role="alert" className="rounded-md bg-coral-50 px-3 py-2.5 text-sm font-medium text-coral-600">{message}</p> : null;
