import { Job } from 'bullmq';
import { redisQueue } from '../lib/cache';
import { TELEGRAM_CHAT_ID, bot as telegramBot } from '../lib/telegraf';
import { LocalWorker } from '../lib/worker';

const QUEUE_NAME = 'discord';

export type DISCORD_MESSAGE = {
    author: string;
    guildName: string;
    guildId: string;
    channelName: string;
    channelId: string;
    content: string;
};

export const worker = new LocalWorker<DISCORD_MESSAGE>(
    QUEUE_NAME,
    {
        connection: redisQueue,
    },
    async (job: Job<DISCORD_MESSAGE>): Promise<string> => {
        const discordData = job.data;

        const telegramResponse = await telegramBot.telegram
            .sendMessage(TELEGRAM_CHAT_ID, discordData.content)
            .catch(async (err: Error) => {
                if (worker.rateLimiter) {
                    await worker.rateLimiter(err, job);
                }
            });

        return telegramResponse?.message_id.toString() ?? '';
    },
);
