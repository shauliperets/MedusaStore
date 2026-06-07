const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
}: {
  error?: string | null
  "data-testid"?: string
}) => {
  if (!error) {
    return null
  }

  return (
    <div
      className="mt-3 rounded-lg border border-rose-200/70 bg-rose-50/70 px-3 py-2 text-small-regular text-rose-600 dark:border-rose-800/70 dark:bg-rose-950/30 dark:text-rose-300"
      data-testid={dataTestid}
    >
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
