import { StoragePort } from '../core/ports';

export class RealStoragePort implements StoragePort {
  async writeBackupFile(filename: string, content: string): Promise<string> {
    const FileSystem = require('expo-file-system');
    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
    const fileUri = `${baseDir}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return fileUri;
  }

  async shareFile(
    fileUri: string,
    mimeType = 'application/json',
    dialogTitle = 'Export Bismillah Backup',
  ): Promise<void> {
    const Sharing = require('expo-sharing');
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    await Sharing.shareAsync(fileUri, {
      mimeType,
      dialogTitle,
      UTI: 'public.json',
    });
  }

  async pickBackupFile(): Promise<{ uri: string; content: string; name: string } | null> {
    const DocumentPicker = require('expo-document-picker');
    const FileSystem = require('expo-file-system');
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/json', '*/*'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset || !asset.uri) {
      return null;
    }

    const content = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return {
      uri: asset.uri,
      content,
      name: asset.name ?? 'backup.json',
    };
  }
}
