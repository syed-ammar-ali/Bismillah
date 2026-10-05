import { backupDataSchema } from '../core/backup';
import { BackupRepo, ClockPort, SettingsRepo, StoragePort } from '../core/ports';
import { Result } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { log } from './logger';
import { RolloverService } from './rolloverService';

export class BackupService {
  constructor(
    private readonly backupRepo: BackupRepo,
    private readonly storagePort: StoragePort,
    private readonly settingsRepo: SettingsRepo,
    private readonly clockPort: ClockPort,
    private readonly rolloverService: RolloverService,
  ) {}

  async exportBackup(): Promise<Result<{ fileUri: string; filename: string }, string>> {
    try {
      const today = this.clockPort.today();
      const backupData = await this.backupRepo.exportAll();

      const json = JSON.stringify(backupData, null, 2);
      const filename = `bismillah-backup-${today}.json`;
      const fileUri = await this.storagePort.writeBackupFile(filename, json);

      await this.storagePort.shareFile(fileUri, 'application/json', 'Export Bismillah Backup');

      // Update lastBackupAt
      await this.settingsRepo.set('lastBackupAt', today);
      useAppStore.getState().updateSettings({ lastBackupAt: today });

      log('info', 'general', `Backup exported successfully: ${filename}`);
      return { ok: true, value: { fileUri, filename } };
    } catch (err) {
      log('error', 'general', `Backup export failed: ${String(err)}`);
      return { ok: false, reason: `Backup export failed: ${String(err)}` };
    }
  }

  async importBackup(): Promise<Result<{ journeysCount: number }, string>> {
    try {
      const picked = await this.storagePort.pickBackupFile();
      if (!picked) {
        return { ok: false, reason: 'Import cancelled' };
      }

      return await this.restoreBackupJson(picked.content);
    } catch (err) {
      log('error', 'general', `Backup import failed: ${String(err)}`);
      return { ok: false, reason: `Backup import failed: ${String(err)}` };
    }
  }

  async restoreBackupJson(jsonString: string): Promise<Result<{ journeysCount: number }, string>> {
    try {
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonString);
      } catch {
        return { ok: false, reason: 'Invalid JSON file format' };
      }

      // Strict validation with Zod
      const parseResult = backupDataSchema.safeParse(parsedJson);
      if (!parseResult.success) {
        const errorMsg = parseResult.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(', ');
        return { ok: false, reason: `Invalid backup schema: ${errorMsg}` };
      }

      const data = parseResult.data;

      // Replace all tables atomically in a single transaction
      await this.backupRepo.replaceAll(data);

      // Reconcile in-memory stores and state
      await this.rolloverService.reconcile();

      log('info', 'general', `Backup restored successfully: ${data.journeys.length} journeys`);
      return { ok: true, value: { journeysCount: data.journeys.length } };
    } catch (err) {
      log('error', 'general', `Failed to restore backup: ${String(err)}`);
      return { ok: false, reason: `Failed to restore backup: ${String(err)}` };
    }
  }
}
