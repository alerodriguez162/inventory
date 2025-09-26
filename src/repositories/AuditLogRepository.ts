import { BaseRepository } from './BaseRepository';
import { AuditLog, IAuditLog } from '../models';

export class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findByEntity(entity: string, entityId: string): Promise<IAuditLog[]> {
    return this.model.find({ entity, entityId }).sort({ createdAt: -1 });
  }

  async findByPerformedBy(userId: string): Promise<IAuditLog[]> {
    return this.model.find({ performedBy: userId }).sort({ createdAt: -1 });
  }

  async findByAction(action: string): Promise<IAuditLog[]> {
    return this.model.find({ action }).sort({ createdAt: -1 });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<IAuditLog[]> {
    return this.model.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ createdAt: -1 });
  }

  async logAction(data: {
    entity: string;
    entityId: string;
    action: string;
    payloadBefore?: Record<string, unknown>;
    payloadAfter?: Record<string, unknown>;
    performedBy: string;
  }): Promise<IAuditLog> {
    return this.model.create(data);
  }

  async searchAuditLogs(query: string, pagination: any): Promise<any> {
    const searchFields = ['entity', 'action', 'notes'];
    const filter = {};
    return this.findWithSearch(filter, searchFields, query, pagination);
  }

  async getRecentActivity(limit: number = 50): Promise<IAuditLog[]> {
    return this.model.find({})
      .populate('performedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
