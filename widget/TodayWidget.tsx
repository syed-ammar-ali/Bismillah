import React from 'react';
import {
  FlexWidget,
  OverlapWidget,
  SvgWidget,
  TextWidget,
} from 'react-native-android-widget';
import { WidgetSnapshot } from './snapshot';

export interface TodayWidgetProps {
  snapshot?: WidgetSnapshot | null;
  widgetInfo?: {
    widgetName?: string;
    width?: number;
    height?: number;
  };
}

export function renderProgressRingSvg(done: number, total: number, size = 56): string {
  const strokeWidth = 4;
  const r = (size - strokeWidth * 2) / 2;
  const c = 2 * Math.PI * r;
  const fraction = total > 0 ? Math.min(1, Math.max(0, done / total)) : 0;
  const offset = c * (1 - fraction);
  const cx = size / 2;
  const cy = size / 2;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" stroke="rgba(255, 255, 255, 0.18)" stroke-width="${strokeWidth}" fill="none" />
    <circle cx="${cx}" cy="${cy}" r="${r}" stroke="#FFFFFF" stroke-width="${strokeWidth}" fill="none" stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})" />
  </svg>`;
}

export function renderCrescentSvg(size = 32, color = '#FFFFFF'): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="${color}" />
  </svg>`;
}

export function renderCircleBoxSvg(size = 16, color = 'rgba(255, 255, 255, 0.5)'): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" stroke="${color}" stroke-width="2" fill="none" />
  </svg>`;
}

export function TodayWidgetSmall({ snapshot }: { snapshot?: WidgetSnapshot | null }) {
  const journeys = snapshot?.journeys ?? [];
  const noJourneys = journeys.length === 0;
  const doneAll = journeys.reduce((sum, j) => sum + j.done, 0);
  const totalAll = journeys.reduce((sum, j) => sum + j.total, 0);
  const maxStreak = journeys.length > 0 ? Math.max(...journeys.map((j) => j.streak)) : 0;
  const allSealed = journeys.length > 0 && journeys.every((j) => j.done >= j.total && j.total > 0);
  const hijriText = snapshot?.hijriLabel ?? '';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#060709',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1E2536',
        padding: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* Top Header */}
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextWidget
          text="BISMILLAH"
          style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        />
        <TextWidget
          text={hijriText}
          style={{
            fontSize: 9,
            color: '#94A3B8',
          }}
        />
      </FlexWidget>

      {/* Center Display */}
      {noJourneys ? (
        <FlexWidget style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SvgWidget svg={renderCrescentSvg(28, '#FFFFFF')} style={{ width: 28, height: 28 }} />
          <TextWidget
            text="No journey today"
            style={{ fontSize: 12, fontWeight: 'bold', color: '#F8FAFC', marginTop: 4 }}
          />
          <TextWidget
            text="Tap to open"
            style={{ fontSize: 9, color: '#64748B', marginTop: 1 }}
          />
        </FlexWidget>
      ) : allSealed ? (
        <FlexWidget style={{ alignItems: 'center', justifyContent: 'center' }}>
          <SvgWidget svg={renderCrescentSvg(30, '#FFFFFF')} style={{ width: 30, height: 30 }} />
          <TextWidget
            text="All sealed"
            style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF', marginTop: 3 }}
          />
          <TextWidget
            text={maxStreak > 0 ? `${maxStreak}d streak` : 'Complete today'}
            style={{ fontSize: 9, color: '#FCD34D', marginTop: 1 }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ alignItems: 'center', justifyContent: 'center' }}>
          <OverlapWidget style={{ width: 54, height: 54 }}>
            <SvgWidget svg={renderProgressRingSvg(doneAll, totalAll, 54)} style={{ width: 54, height: 54 }} />
            <FlexWidget
              style={{
                width: 54,
                height: 54,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TextWidget
                text={`${doneAll}/${totalAll}`}
                style={{ fontSize: 12, fontWeight: 'bold', color: '#F8FAFC' }}
              />
            </FlexWidget>
          </OverlapWidget>
          <TextWidget
            text={maxStreak > 0 ? `${maxStreak}d streak` : `${totalAll - doneAll} left`}
            style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold', marginTop: 3 }}
          />
        </FlexWidget>
      )}

      {/* Bottom Footer */}
      <TextWidget
        text={noJourneys ? 'Create a journey' : `${journeys.length} active journey${journeys.length > 1 ? 's' : ''}`}
        style={{
          fontSize: 9,
          color: '#64748B',
        }}
      />
    </FlexWidget>
  );
}

export function TodayWidgetMedium({ snapshot }: { snapshot?: WidgetSnapshot | null }) {
  const journeys = snapshot?.journeys ?? [];
  const noJourneys = journeys.length === 0;
  const doneAll = journeys.reduce((sum, j) => sum + j.done, 0);
  const totalAll = journeys.reduce((sum, j) => sum + j.total, 0);
  const maxStreak = journeys.length > 0 ? Math.max(...journeys.map((j) => j.streak)) : 0;
  const allSealed = journeys.length > 0 && journeys.every((j) => j.done >= j.total && j.total > 0);
  const hijriText = snapshot?.hijriLabel ?? '';

  // First journey with pending tasks
  const activeJourney = journeys.find((j) => j.pendingTasks.length > 0) ?? journeys[0];
  const activePendingTasks = activeJourney?.pendingTasks ?? [];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#060709',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#1E2536',
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* Left Column */}
      <FlexWidget
        style={{
          width: 96,
          height: 'match_parent',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        clickAction="OPEN_APP"
      >
        <TextWidget
          text="BISMILLAH"
          style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        />

        {noJourneys ? (
          <SvgWidget svg={renderCrescentSvg(28, '#FFFFFF')} style={{ width: 28, height: 28 }} />
        ) : allSealed ? (
          <FlexWidget style={{ alignItems: 'center' }}>
            <SvgWidget svg={renderCrescentSvg(26, '#FFFFFF')} style={{ width: 26, height: 26 }} />
            <TextWidget
              text="All sealed"
              style={{ fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', marginTop: 2 }}
            />
          </FlexWidget>
        ) : (
          <OverlapWidget style={{ width: 48, height: 48 }}>
            <SvgWidget svg={renderProgressRingSvg(doneAll, totalAll, 48)} style={{ width: 48, height: 48 }} />
            <FlexWidget
              style={{
                width: 48,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TextWidget
                text={`${doneAll}/${totalAll}`}
                style={{ fontSize: 11, fontWeight: 'bold', color: '#F8FAFC' }}
              />
            </FlexWidget>
          </OverlapWidget>
        )}

        <TextWidget
          text={hijriText}
          style={{
            fontSize: 9,
            color: '#94A3B8',
          }}
        />
      </FlexWidget>

      {/* Divider Line */}
      <FlexWidget
        style={{
          width: 1,
          height: 'match_parent',
          backgroundColor: '#1E2536',
          marginHorizontal: 8,
        }}
      />

      {/* Right Column */}
      <FlexWidget
        style={{
          flex: 1,
          height: 'match_parent',
          justifyContent: 'space-between',
        }}
      >
        {noJourneys ? (
          <FlexWidget style={{ justifyContent: 'center', height: 'match_parent' }} clickAction="OPEN_APP">
            <TextWidget
              text="No active journeys"
              style={{ fontSize: 13, fontWeight: 'bold', color: '#F8FAFC' }}
            />
            <TextWidget
              text="Tap anywhere to open Bismillah and create your first journey."
              style={{ fontSize: 10, color: '#94A3B8', marginTop: 3 }}
            />
          </FlexWidget>
        ) : allSealed ? (
          <FlexWidget style={{ justifyContent: 'center', height: 'match_parent' }} clickAction="OPEN_APP">
            <TextWidget
              text="All journeys sealed!"
              style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}
            />
            <TextWidget
              text="All daily tasks completed for today."
              style={{ fontSize: 10, color: '#F8FAFC', marginTop: 2 }}
            />
            <TextWidget
              text={maxStreak > 0 ? `🔥 ${maxStreak}-day streak active` : 'Keep the glow alive ✨'}
              style={{ fontSize: 10, color: '#FCD34D', marginTop: 3 }}
            />
          </FlexWidget>
        ) : (
          <FlexWidget style={{ height: 'match_parent', justifyContent: 'space-between' }}>
            {/* Header with Journey Name & Count */}
            <FlexWidget
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              clickAction="OPEN_APP"
            >
              <FlexWidget style={{ flex: 1 }}>
                <TextWidget
                  text={activeJourney?.name ?? 'Daily Tasks'}
                  truncate="END"
                  maxLines={1}
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: '#F8FAFC',
                  }}
                />
              </FlexWidget>
              <TextWidget
                text={`${activePendingTasks.length} left`}
                style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#FFFFFF',
                  marginLeft: 4,
                }}
              />
            </FlexWidget>

            {/* Task rows (up to 3) */}
            <FlexWidget>
              {activePendingTasks.slice(0, 3).map((task) => (
                <FlexWidget
                  key={task.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 6,
                    paddingHorizontal: 6,
                    paddingVertical: 3,
                    marginBottom: 3,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                  }}
                  clickAction="TICK_TASK"
                  clickActionData={{
                    journeyId: activeJourney?.id,
                    taskId: task.id,
                    dayNumber: activeJourney?.dayNumber,
                  }}
                >
                  <SvgWidget svg={renderCircleBoxSvg(14, '#FFFFFF')} style={{ width: 14, height: 14 }} />
                  <FlexWidget style={{ flex: 1, marginLeft: 6 }}>
                    <TextWidget
                      text={task.title}
                      truncate="END"
                      maxLines={1}
                      style={{
                        fontSize: 11,
                        color: '#F2EFE6',
                      }}
                    />
                  </FlexWidget>
                </FlexWidget>
              ))}
            </FlexWidget>

            {/* Footer */}
            <TextWidget
              text={
                activePendingTasks.length > 3
                  ? `+${activePendingTasks.length - 3} more tasks in app`
                  : 'Tap a task to mark complete'
              }
              style={{ fontSize: 9, color: '#64748B' }}
              clickAction="OPEN_APP"
            />
          </FlexWidget>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}

export function TodayWidget({ snapshot, widgetInfo }: TodayWidgetProps) {
  const isMedium =
    widgetInfo?.widgetName === 'TodayWidgetMedium' || (widgetInfo?.width ?? 0) >= 200;

  if (isMedium) {
    return <TodayWidgetMedium snapshot={snapshot} />;
  }

  return <TodayWidgetSmall snapshot={snapshot} />;
}
