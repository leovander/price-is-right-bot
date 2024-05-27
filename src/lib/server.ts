import { logger } from './logger';
import { workers } from './workers';

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const express = require('express');

const PORT = process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT) : 3000;

const app = express();

app.use((req: any, res: any, next: any) => {
    logger.info(`Request on ${req.path}`);
    next();
});

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/queues');

const queues = Object.values(workers).map((worker) => {
    return new BullMQAdapter(worker.queue, {
        readOnlyMode: true,
    });
});

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
    queues: queues,
    serverAdapter: serverAdapter,
});

app.use('/queues', serverAdapter.getRouter());

export const server = app.listen(PORT, () => {
    logger.info(`Server Listening on (${PORT})`);
});