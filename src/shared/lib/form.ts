interface MessageCarrier {
  message?: unknown;
}

/** Errors nest as deep as the schema does, so the messages are collected flat. */
export function collectErrorMessages(errors: unknown): string[] {
  if (!errors || typeof errors !== 'object') return [];

  const { message } = errors as MessageCarrier;
  if (typeof message === 'string') return [message];

  return Object.values(errors).flatMap(collectErrorMessages);
}
