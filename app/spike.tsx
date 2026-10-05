import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getPlatformAdapters } from '../platform';
import { getStoredCount, incrementStoredCount } from '../widget/snapshot';

interface LogEntry {
  id: string;
  time: string;
  msg: string;
}

export default function SpikeScreen() {
  const adapters = getPlatformAdapters();
  const [count, setCount] = useState<number>(0);
  const [reminderTime, setReminderTime] = useState<string>('05:00');
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      id: 'init-log',
      time: new Date().toTimeString().slice(0, 8),
      msg: `App initialized. isExpoGo: ${adapters.capabilities.isExpoGo}`,
    },
  ]);

  const addLog = (msg: string) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, time, msg },
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    let isMounted = true;
    void getStoredCount().then((val) => {
      if (isMounted) {
        setCount(val);
        const now = new Date();
        const time = now.toTimeString().slice(0, 8);
        setLogs((prev) => [
          { id: `${Date.now()}-${Math.random()}`, time, msg: `Loaded stored counter: ${val}` },
          ...prev.slice(0, 49),
        ]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleIncrement = async () => {
    const next = await incrementStoredCount();
    setCount(next);
    addLog(`Counter incremented to ${next}`);
    await adapters.widget.refresh();
    addLog('Requested widget refresh');
  };

  const handleScheduleOneMinute = async () => {
    addLog('Requesting notification permission...');
    const permission = await adapters.notifications.requestPermission();
    addLog(`Permission result: ${permission}`);

    if (permission === 'granted' || adapters.capabilities.isExpoGo) {
      await adapters.notifications.scheduleOnce({
        triggerSeconds: 60,
        title: 'Bismillah Test',
        body: '1-minute test reminder arrived successfully!',
      });
      addLog('Scheduled notification for +60 seconds');
    }
  };

  const handleScheduleDaily = async () => {
    const parts = reminderTime.split(':');
    const hour = parseInt(parts[0] ?? '5', 10);
    const minute = parseInt(parts[1] ?? '0', 10);

    addLog(
      `Scheduling daily reminder at ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    );
    await adapters.notifications.scheduleDaily({
      hour,
      minute,
      title: 'Bismillah Daily Reminder',
      body: `Daily reminder for ${reminderTime} · Spike active`,
    });
    addLog('Daily reminder scheduled');
  };

  const handleCancelAll = async () => {
    await adapters.notifications.cancelAll();
    addLog('Cancelled all scheduled notifications');
  };

  if (!__DEV__) {
    return <Redirect href="/(tabs)/today" />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Native Spike Screen</Text>
      <Text style={styles.subtitle}>Step 0 verification (FR-35, FR-39, FR-47, FR-49)</Text>

      {/* Environment info */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Environment</Text>
        <Text style={styles.statusText}>
          isExpoGo: <Text style={styles.highlight}>{String(adapters.capabilities.isExpoGo)}</Text>
        </Text>
        <Text style={styles.statusText}>
          supportsWidget: <Text style={styles.highlight}>{String(adapters.capabilities.supportsWidget)}</Text>
        </Text>
      </View>

      {/* Counter & Widget section */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Counter (expo-sqlite/kv-store)</Text>
        <Text style={styles.counterValue}>{count}</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={handleIncrement} activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>+1 (Increment & Update Widget)</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications section */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Notifications</Text>

        <TouchableOpacity style={styles.button} onPress={handleScheduleOneMinute} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Schedule test notification in 1 minute</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={reminderTime}
            onChangeText={setReminderTime}
            placeholder="05:00"
            placeholderTextColor="#8B93A7"
            maxLength={5}
          />
          <TouchableOpacity
            style={[styles.button, styles.flexButton]}
            onPress={handleScheduleDaily}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Schedule daily reminder</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelAll} activeOpacity={0.8}>
          <Text style={styles.cancelButtonText}>Cancel all</Text>
        </TouchableOpacity>
      </View>

      {/* Logs section */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Recent Logs</Text>
        {logs.length === 0 ? (
          <Text style={styles.emptyLog}>No events logged yet</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logTime}>{log.time}</Text>
              <Text style={styles.logMsg}>{log.msg}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F1A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#8B93A7',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#141A2B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#263049',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B93A7',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 15,
    color: '#F2EFE6',
    marginBottom: 6,
  },
  highlight: {
    color: '#D4AF37',
    fontWeight: '700',
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F2EFE6',
    textAlign: 'center',
    marginVertical: 12,
  },
  primaryButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0B0F1A',
    fontWeight: '700',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#1C2438',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#263049',
  },
  buttonText: {
    color: '#F2EFE6',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1C2438',
    borderWidth: 1,
    borderColor: '#263049',
    borderRadius: 10,
    color: '#F2EFE6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    width: 80,
    textAlign: 'center',
  },
  flexButton: {
    flex: 1,
    marginBottom: 0,
  },
  cancelButton: {
    borderColor: '#5A6277',
    marginBottom: 0,
  },
  cancelButtonText: {
    color: '#8B93A7',
    fontSize: 13,
  },
  emptyLog: {
    color: '#5A6277',
    fontStyle: 'italic',
    fontSize: 13,
  },
  logRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  logTime: {
    width: 70,
    fontSize: 11,
    color: '#8B93A7',
    fontFamily: 'monospace',
  },
  logMsg: {
    flex: 1,
    fontSize: 12,
    color: '#F2EFE6',
  },
});
