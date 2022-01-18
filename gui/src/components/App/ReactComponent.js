import React, { createRef, useEffect, useMemo} from 'react'
import ReactDOM from 'react-dom'

export default function ReactComponent({appId, fileId, core, data, rowData, parentPageData, componentProps}) {
    const ref = createRef();
    useEffect(() => {
        document.getElementById(`left-navigation-${appId}`).dispatchEvent(
            new CustomEvent("GET_REACT_COMPONENT", {
                detail: {
                    type : data['reactId'],
                    cb : component => {
                        component && ReactDOM.render(component({appId, fileId, core, data, rowData, parentPageData, componentProps}), ref?.current)
                    }
                }
              })
        )
    },[])
    return (
        <div ref={ref}></div>
    )
}
