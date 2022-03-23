import React, { useEffect, useState, useRef } from "react";
import OX_Grid from "../../components/OI/OX_Grid";

function QueryResult(props) {
  const [columnNames, setColumnNames] = useState();
  const [gridData, setGridData] = useState([]);
  const refreshGrid = useRef(null);

  useEffect(() => {
    setGridData(props.queryResult);
    setColumnNames(props.columns);
    props.loader.destroy();
  }, [props.queryResult]);

  return (
    <>
      <div className='row' style={{ marginLeft: "0.1em", marginRight: "0.1em" }}>
        <div className='col query-result-details'>
          Query Name: <span>{props.queryName ? props.queryName : "Test Query"}</span>
        </div>
        <div className='col query-result-details'>
          Execution Time:<span>{props.elapsedTime.toFixed(2)}ms</span>
        </div>
      </div>

      <div className='query-result-tab' id='query-result-tab'>
        {Array.isArray(props.queryResult) ? (
          <OX_Grid ref={refreshGrid} osjsCore={props.core} data={gridData || ""} filterable={true} reorderable={true} sortable={true} pageable={true} columnConfig={columnNames || [{}]} />
        ) : (
          <div className='query-result-text-tab'>
            <span>RESULT:</span>
            <span style={{ marginLeft: "2em" }}>{props.queryResult}</span>
          </div>
        )}
      </div>
    </>
  );
}
export default QueryResult;
