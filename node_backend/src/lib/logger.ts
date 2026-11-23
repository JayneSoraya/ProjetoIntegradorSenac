export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function normalizeError(error: unknown) {
  if (!(error instanceof Error)) return error;
  return {
    name: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  };
}

function emit(level: LogLevel, message: string, fields: Record<string, unknown> = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(payload, (_key, value) => value instanceof Error ? normalizeError(value) : value);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug(message: string, fields?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== 'production') emit('debug', message, fields);
  },
  info(message: string, fields?: Record<string, unknown>) {
    emit('info', message, fields);
  },
  warn(message: string, fields?: Record<string, unknown>) {
    emit('warn', message, fields);
  },
  error(message: string, error?: unknown, fields: Record<string, unknown> = {}) {
    emit('error', message, { ...fields, error: normalizeError(error) });
  },
};
