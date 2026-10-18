// node_backend/src/utils/logger.ts
export const logger = {
    info: (message, meta) => {
        const timestamp = new Date().toISOString();
        console.info(JSON.stringify({ level: 'info', timestamp, message, ...(meta || {}) }));
    },
    error: (message, meta) => {
        const timestamp = new Date().toISOString();
        console.error(JSON.stringify({ level: 'error', timestamp, message, ...(meta || {}) }));
    },
    warn: (message, meta) => {
        const timestamp = new Date().toISOString();
        console.warn(JSON.stringify({ level: 'warn', timestamp, message, ...(meta || {}) }));
    }
};
