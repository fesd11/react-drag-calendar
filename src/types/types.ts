export enum ItemTypes {
  EVENT = 'event',
  START = 'start',
  END = 'end'
}

export type CalendarEvent = {
  id: number;
  start: number;
  end: number;
  duration: number;
};

export type EventGrid = Record<number, (CalendarEvent | null)[]>;
