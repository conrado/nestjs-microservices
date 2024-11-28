import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Inbox } from './entities/inbox.entity';

@Injectable()
export class InboxService {
  constructor(private readonly datasource: DataSource) {}

  async processInboxMessages(
    process: (messages: Inbox[], manager: EntityManager) => Promise<unknown>,
    options: { take: number },
  ) {
    return this.datasource.transaction(async (manager) => {
      const inboxRepository = manager.getRepository(Inbox);
      const messages = await inboxRepository.find({
        where: { status: 'pending' },
        order: { createdAt: 'ASC' },
        take: options.take,
        // While this approach works, it is far from ideal as we'll have 2 nodes
        // running cron jobs that basically fail to acquire a lock.
        // So we need to use a more sophisticated solution like "@nestjs/bull"
        lock: {
          mode: 'pessimistic_write',
          onLocked: 'nowait',
        },
      });
      await process(messages, manager);
    });
  }
}
