import { Schema, model } from 'mongoose';
import { IAuditLog } from '../types';

const auditLogSchema = new Schema<IAuditLog>(
  {
    entity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    payloadBefore: {
      type: Schema.Types.Mixed,
    },
    payloadAfter: {
      type: Schema.Types.Mixed,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
auditLogSchema.index({ entity: 1, entityId: 1 });
auditLogSchema.index({ performedBy: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

// Compound index for efficient queries
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });

// Static method to log an action
auditLogSchema.statics.logAction = function (data: {
  entity: string;
  entityId: string;
  action: string;
  payloadBefore?: Record<string, unknown>;
  payloadAfter?: Record<string, unknown>;
  performedBy: string;
}) {
  return this.create(data);
};

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
