import { Result } from '../core/types';

export class BackupService {
  async exportBackup(): Promise<Result<string, string>> {
    return { ok: false, reason: 'Backup export will be implemented in Step 13' };
  }

  async importBackup(_json: string): Promise<Result<void, string>> {
    return { ok: false, reason: 'Backup import will be implemented in Step 13' };
  }
}
