import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { getToday } from '../core/dates';
import { ClockPort } from '../core/ports';
import { db } from '../db/client';
import { createRepositories } from '../db/repos';
import {
  NoopNotificationPort,
  NoopStoragePort,
  NoopSystemSettingsPort,
  noopCapabilities,
} from '../platform/noop';
import { RealWidgetPort } from '../platform/widget';
import { createServices } from '../services/createServices';
import { log } from '../services/logger';
import {
  buildWidgetSnapshot,
  getWidgetSnapshot,
  setWidgetSnapshot,
  WidgetSnapshot,
} from './snapshot';
import { TodayWidget } from './TodayWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  try {
    const today = getToday();
    let snapshot = await getWidgetSnapshot();

    // If snapshot is missing or stale (e.g. midnight passed while app was closed), rebuild from DB
    if (!snapshot || snapshot.date !== today) {
      const repos = createRepositories(db);
      const clock: ClockPort = { today: () => today };
      snapshot = await buildWidgetSnapshot({
        journeyRepo: repos.journeyRepo,
        taskRepo: repos.taskRepo,
        completionRepo: repos.completionRepo,
        settingsRepo: repos.settingsRepo,
        clock,
      });
      await setWidgetSnapshot(snapshot);
    }

    switch (props.widgetAction) {
      case 'WIDGET_CLICK': {
        if (props.clickAction === 'TICK_TASK') {
          const clickData = props.clickActionData as
            | {
                journeyId?: string;
                taskId?: string;
                dayNumber?: number;
              }
            | undefined;

          if (clickData?.journeyId && clickData?.taskId && clickData?.dayNumber) {
            const repos = createRepositories(db);
            const clock: ClockPort = { today: () => today };
            const widgetPort = new RealWidgetPort();
            const notificationPort = new NoopNotificationPort();
            const systemSettings = new NoopSystemSettingsPort();
            const storage = new NoopStoragePort();

            const services = createServices({
              repos,
              clock,
              notifications: notificationPort,
              widget: widgetPort,
              systemSettings,
              storage,
              capabilities: noopCapabilities,
            });

            await services.tickService.toggle(
              clickData.journeyId,
              clickData.taskId,
              clickData.dayNumber,
            );

            // Rebuild snapshot after the tick mutation
            snapshot = await buildWidgetSnapshot({
              journeyRepo: repos.journeyRepo,
              taskRepo: repos.taskRepo,
              completionRepo: repos.completionRepo,
              settingsRepo: repos.settingsRepo,
              clock,
            });
            await setWidgetSnapshot(snapshot);
            log('info', 'widget', `Widget task ticked: ${clickData.taskId}`);
          }
        }
        props.renderWidget(
          <TodayWidget snapshot={snapshot} widgetInfo={props.widgetInfo} />,
        );
        break;
      }

      case 'WIDGET_ADDED':
      case 'WIDGET_UPDATE':
      case 'WIDGET_RESIZED':
      default:
        props.renderWidget(
          <TodayWidget snapshot={snapshot} widgetInfo={props.widgetInfo} />,
        );
        break;
    }
  } catch (err) {
    log('error', 'widget', `widgetTaskHandler failure: ${String(err)}`);
    // Fallback gracefully to last known snapshot
    try {
      const fallbackSnapshot: WidgetSnapshot | null = await getWidgetSnapshot();
      props.renderWidget(
        <TodayWidget snapshot={fallbackSnapshot} widgetInfo={props.widgetInfo} />,
      );
    } catch {
      // Prevent crash at all costs
    }
  }
}
