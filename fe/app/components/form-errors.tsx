type FormErrorsProps = {
  errors: string[];
};

export function FormErrors({ errors }: FormErrorsProps) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      className="mb-4 rounded bg-accent-vermillion/10 p-3 text-sm text-accent-vermillion"
    >
      <ul>
        {errors.map((error, index) => (
          <li key={`error-${index}`}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
