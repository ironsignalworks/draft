import { trackEvent, trackPageView, type EventMeta } from './observability';

export const APP_EVENTS = {
  OPEN_SAVED_DOCUMENT: 'open_saved_document',
  DUPLICATE_SAVED_DOCUMENT: 'duplicate_saved_document',
  DELETE_SAVED_DOCUMENT: 'delete_saved_document',
  IMPORT_FILE: 'import_file',
  CHANGE_FORMAT_PRESET: 'change_format_preset',
  OPEN_EXPORT_MODAL: 'open_export_modal',
} as const;

type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

interface AppEventPayloadMap {
  open_saved_document: { id: string };
  duplicate_saved_document: { id: string };
  delete_saved_document: { id: string };
  import_file: { fileName: string; isImage: boolean };
  change_format_preset: { preset: string };
  open_export_modal: { sourceNav: string };
}

export function trackAppEvent<TEvent extends AppEventName>(
  event: TEvent,
  payload: AppEventPayloadMap[TEvent],
): void {
  trackEvent(event, payload as EventMeta);
}

export function trackAppPageView(page: string, meta: EventMeta = {}): void {
  trackPageView(page, meta);
}
