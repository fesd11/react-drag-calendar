import React, { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styled from 'styled-components';

const Container = styled.div`
  width: calc(7 * 6rem);
  display: flex;
  flex: 1 1;
  flex-wrap: wrap;

  * {
    box-sizing: border-box;
  }
`;

const CellContainer = styled.div`
  position: absolute;
  height: 80px;
  width: 80px;
  border: 1px solid black;
  padding: 8px;
  top: 0;
`;

const RangeButton = styled.button`
  width: 80px;
  cursor: move;
  background: blue;
`;

const EventCellItem = styled.div`
  height: 100%;
  width: 80px;
  background: ocean;
`;

const EmptyCellItem = styled.div`
  position: absolute;
  height: 80px;
  width: 80px;
`;

const MonthEventsRow = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  flex-direction: column;
  height: 80px;
`;

const WeekEventsRow = styled.div`
  display: flex;
  height: 80px;
  width: 100%;
`;

enum ItemTypes {
  EVENT = 'event',
  START = 'start',
  END = 'end'
}

type CalendarEvent = {
  id: number;
  start: number;
  end: number;
  duration: number;
};

// TODO Длина ивента равная 0
const events: CalendarEvent[] = [
  // { id: 1, start: 0, end: 5, duration: 5 },
  // { id: 2, start: 4, end: 5, duration: 2 },
  // { id: 4, start: 0, end: 2, duration: 2 },
  { id: 3, start: 9, end: 11, duration: 2 }
];

const EventItemStart = ({ event }: { event: CalendarEvent }) => {
  const [{ isDragging }, startDragRef] = useDrag(() => ({
    type: ItemTypes.START,
    item: event,
    collect: (monitor) => {
      return {
        isDragging: !!monitor.isDragging()
      };
    },
    end: (item, monitor) => {
      console.log(item);
    }
  }));

  return (
    <RangeButton ref={startDragRef}>S {isDragging && 'isDragging'}</RangeButton>
  );
};

const EventItemEnd = ({ event }: { event: CalendarEvent }) => {
  const [{ isDragging }, endDragRef] = useDrag(() => ({
    type: ItemTypes.END,
    item: event,
    collect: (monitor) => {
      return {
        isDragging: !!monitor.isDragging()
      };
    },
    end: (item, monitor) => {
      console.log(item, monitor.getDropResult());
    }
  }));

  return <RangeButton ref={endDragRef}>E</RangeButton>;
};

const Cell = ({ position }: { position: number }) => {
  const [{ isOver }, dropRef] = useDrop(
    () => ({
      accept: [ItemTypes.START, ItemTypes.END],
      drop: (item) => {
        console.log(item);
        return { position };
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver()
      })
    }),
    [position]
  );
  return (
    <CellContainer ref={dropRef}>
      {isOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '100%',
            zIndex: 1,
            opacity: 0.5,
            backgroundColor: 'yellow'
          }}
        />
      )}
      <span>
        {position} {isOver && 'isOver'}
      </span>
    </CellContainer>
  );
};

function renderCellEvents(
  event: CalendarEvent | null,
  date: number
): React.ReactElement {
  if (event === null) {
    return <EmptyCellItem />;
  }
  if (event.start === date) {
    return <EventItemStart event={event} />;
  }
  if (event.end === date) {
    return <EventItemEnd event={event} />;
  }
  return <EventCellItem />;
}

const EventsCellContainer = ({
  event,
  date
}: {
  event: CalendarEvent | null;
  date: number;
}) => {
  return (
    <div style={{ position: 'absolute', top: 0, paddingTop: 20 }}>
      {renderCellEvents(event, date)}
    </div>
  );
};

const EventRowCell = ({
  event,
  date
}: {
  event: CalendarEvent | null;
  date: number;
}) => {
  return (
    <div style={{ width: 80, height: 80 }} key={date}>
      <Cell position={date} />
      <EventsCellContainer event={event} date={date} />
    </div>
  );
};

type EventGrid = { [key: number]: (CalendarEvent | null)[] };

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

  if (!rowEvents) {
    return null;
  }

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
    for (let i = 0; i <= event.duration; i++) {
      grid[row][i + event.start - startWeek] = event;
    }
    return grid;
  }

  const weekRows = rowEvents.reduce<EventGrid>((res, event) => {
    const grid = findRowForEvent(event, res);
    return grid;
  }, {});

  return (
    <MonthEventsRow>
      {Object.entries(weekRows).map(([rowIndex, row]) => (
        <WeekEventsRow key={rowIndex}>
          {row.map((cell, cellIndex) => (
            <EventRowCell
              key={cellIndex}
              date={startWeek + cellIndex}
              event={cell}
            />
          ))}
        </WeekEventsRow>
      ))}
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

const MonthRow = ({
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
      {/* {Array(7)
        .fill(null)
        .map((__, i) => (
          <React.Fragment key={startWeek + i}>
            <Cell position={startWeek + i} />

          </React.Fragment>
        ))} */}
      <MonthEventsRowContainer>
        <EventsRow startWeek={startWeek} endWeek={endWeek} events={events} />
      </MonthEventsRowContainer>
    </MonthEventsRowBackground>
  );
};

export const ScheduleTest = () => {
  const [stateEvents, setEvents] = useState<CalendarEvent[]>(events);
  return (
    <DndProvider backend={HTML5Backend}>
      <Container>
        {Array(4)
          .fill(null)
          .map((_, i) => (
            <MonthRow
              key={i}
              startWeek={i * 7}
              endWeek={i * 7 + 6}
              events={stateEvents}
            />
          ))}
      </Container>
    </DndProvider>
  );
};
