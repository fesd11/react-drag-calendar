import { useDrop } from 'react-dnd';
import styled from 'styled-components';
import { CalendarEvent, ItemTypes } from '../types/types';

const CellContainer = styled.div`
  position: absolute;
  height: 80px;
  width: 80px;
  border: 1px solid black;
  padding: 8px;
  top: 0;
`;

export type CellDropResult = { position: number } | null;

export const Cell = ({ position }: { position: number }) => {
  const [{ isOver }, dropRef] = useDrop<
    CalendarEvent,
    CellDropResult,
    { isOver: boolean }
  >(
    () => ({
      accept: [ItemTypes.START, ItemTypes.END],
      drop: (item) => {
        return { position };
      },
      canDrop(item, monitor) {
        switch (monitor.getItemType()) {
          case ItemTypes.START:
            return position < item.end;
          case ItemTypes.END:
            return position > item.start;
          default:
            return false;
        }
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
