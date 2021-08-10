import React from 'react';
import BoardData1 from '../WorkGroupData';
import Board from './Board';

const KanbanView = (props) => {
    const BoardData = JSON.parse(BoardData1.data.options)
    return <div>
        <Board dataset={BoardData} key={BoardData.boardId} />
    </div>
}

export default KanbanView;