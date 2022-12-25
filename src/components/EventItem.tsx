import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import { ScheduleContext } from '../Schedule';
import { CalendarEvent, ItemTypes } from '../types/types';
import { CellDropResult } from './Cell';

const RangeButton = styled.button`
  width: 80px;
  height: 20px;
  cursor: move;
  background: blue;
  position: absolute;
`;

const EventCellItem = styled.div`
  height: 20px;
  width: 80px;
  background: green;
  position: absolute;
`;

const EmptyCellItem = styled.div`
  height: 20px;
  width: 80px;
  z-index: -1;
  position: absolute;
`;

const EventItemStart = ({
  event,
  cellIndex,
  rowIndex
}: {
  event: CalendarEvent;
  cellIndex: number;
  rowIndex: number;
}) => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw Error('Item must be in ScheduleContext');
  }
  const [{}, startDragRef] = useDrag(
    () => ({
      type: ItemTypes.START,
      item: event,
      end: (item, monitor) => {
        const result = monitor.getDropResult() as CellDropResult;
        if (result) {
          context.onEventChange(item, ItemTypes.START, result.position);
        }
      }
    }),
    [context, event]
  );

  return (
    <RangeButton
      ref={startDragRef}
      style={{ left: cellIndex * 80, top: (rowIndex + 1) * 24 }}
    >
      S
    </RangeButton>
  );
};

const EventItemEnd = ({
  event,
  cellIndex,
  rowIndex
}: {
  event: CalendarEvent;
  cellIndex: number;
  rowIndex: number;
}) => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw Error('Item must be in ScheduleContext');
  }
  const [{}, endDragRef] = useDrag(
    () => ({
      type: ItemTypes.END,
      item: event,
      end: (item, monitor) => {
        const result = monitor.getDropResult() as CellDropResult;
        if (result) {
          context.onEventChange(item, ItemTypes.END, result.position);
        }
      }
    }),
    [context, event]
  );

  return (
    <RangeButton
      ref={endDragRef}
      style={{ left: cellIndex * 80, top: (rowIndex + 1) * 24 }}
    >
      E
    </RangeButton>
  );
};

function renderCellEvents(
  event: CalendarEvent | null,
  date: number,
  cellIndex: number,
  rowIndex: number
): React.ReactElement {
  if (event === null) {
    return (
      <EmptyCellItem
        style={{ left: cellIndex * 80, top: (rowIndex + 1) * 24 }}
      />
    );
  }
  if (event.start === date) {
    return (
      <EventItemStart event={event} cellIndex={cellIndex} rowIndex={rowIndex} />
    );
  }
  if (event.end === date) {
    return (
      <EventItemEnd event={event} cellIndex={cellIndex} rowIndex={rowIndex} />
    );
  }
  return (
    <EventCellItem style={{ left: cellIndex * 80, top: (rowIndex + 1) * 24 }} />
  );
}

export const EventRowCell = ({
  event,
  date,
  cellIndex,
  rowIndex
}: {
  event: CalendarEvent | null;
  date: number;
  cellIndex: number;
  rowIndex: number;
}) => {
  return renderCellEvents(event, date, cellIndex, rowIndex);
};
