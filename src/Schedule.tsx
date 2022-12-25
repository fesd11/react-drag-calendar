import { createContext, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';
import { Cell } from './components/Cell';
import { EventRowCell } from './components/EventItem';
import { CalendarEvent, EventGrid, ItemTypes } from './types/types';

const Container = styled.div`
  width: calc(7 * 6rem);
  display: flex;
  flex: 1 1;
  flex-wrap: wrap;

  * {
    box-sizing: border-box;
  }
`;

const MonthEventsRow = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  /* flex-direction: column; */
  height: 80px;
`;

// TODO Длина ивента равная 0
const events: CalendarEvent[] = [
  { id: 1, start: 0, end: 5 },
  { id: 2, start: 4, end: 5 },
  { id: 4, start: 10, end: 12 },
  { id: 3, start: 9, end: 11 }
];

function isDayInInterval(day: number, start: number, end: number): boolean {
  return day >= start && day <= end;
}

const EventsRow = ({
  startWeek,
  endWeek,
  events
}: {
  startWeek: number;
  endWeek: number;
  events: CalendarEvent[];
}) => {
  const rowEvents = events.filter(({ start, end }) => {
    return (
      isDayInInterval(start, startWeek, endWeek) ||
      isDayInInterval(end, startWeek, endWeek)
    );
  });

  function findRowForEvent(
    event: CalendarEvent,
    grid: EventGrid,
    row = 0
  ): EventGrid {
    if (!grid[row]) {
      grid[row] = Array(7).fill(null);
    }
    if (
      grid[row][event.start - startWeek] !== null ||
      grid[row][event.end - startWeek] !== null
    ) {
      return findRowForEvent(event, grid, row + 1);
    }
    for (let i = 0; i <= event.end - event.start; i++) {
      grid[row][i + event.start - startWeek] = event;
    }
    return grid;
  }

  const weekRows = rowEvents
    .sort((a, b) => {
      const [durationA, durationB] = [a.end - a.start, b.end - b.start];
      return durationB > durationA ? 1 : -1;
    })
    .reduce<EventGrid>((res, event) => {
      const grid = findRowForEvent(event, res);
      return grid;
    }, {});

  return (
    <MonthEventsRow>
      {Array(7)
        .fill(null)
        .map((_, dayIndex) => (
          <div
            style={{ width: 80, height: 80, position: 'relative' }}
            key={dayIndex + startWeek}
          >
            <Cell position={startWeek + dayIndex} />
          </div>
        ))}
      {Object.entries(weekRows).map(([rowIndex, row]) =>
        row.map((cell, cellIndex) => (
          <EventRowCell
            key={cellIndex}
            cellIndex={cellIndex}
            rowIndex={+rowIndex}
            date={startWeek + cellIndex}
            event={cell}
          />
        ))
      )}
    </MonthEventsRow>
  );
};

const MonthEventsRowBackground = styled.div`
  position: relative;
  display: flex;
  height: 80px;
  width: 100%;
`;

const MonthEventsRowContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 100%;
`;

const WeekRow = ({
  startWeek,
  endWeek,
  events
}: {
  startWeek: number;
  endWeek: number;
  events: CalendarEvent[];
}) => {
  return (
    <MonthEventsRowBackground>
      <MonthEventsRowContainer>
        <EventsRow startWeek={startWeek} endWeek={endWeek} events={events} />
      </MonthEventsRowContainer>
    </MonthEventsRowBackground>
  );
};

type HandleEventChange = (
  event: CalendarEvent,
  itemTrigger: ItemTypes,
  position: number
) => void;
interface IScheduleContext {
  onEventChange: HandleEventChange;
  events: CalendarEvent[];
}

export const ScheduleContext = createContext<IScheduleContext>(
  {} as IScheduleContext
);

export const ScheduleTest = () => {
  const [stateEvents, setEvents] = useState<CalendarEvent[]>(events);

  function onEventChange(
    event: CalendarEvent,
    itemTrigger: ItemTypes,
    position: number
  ): void {
    setEvents((events) =>
      events.map((oldEvent) => {
        if (oldEvent.id === event.id) {
          return {
            ...oldEvent,
            [itemTrigger]: position
          };
        }
        return oldEvent;
      })
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <ScheduleContext.Provider value={{ events: stateEvents, onEventChange }}>
        <Container>
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <WeekRow
                key={i}
                startWeek={i * 7}
                endWeek={i * 7 + 6}
                events={stateEvents}
              />
            ))}
        </Container>
      </ScheduleContext.Provider>
    </DndProvider>
  );
};
