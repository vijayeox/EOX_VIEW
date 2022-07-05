import React, { createRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { CoreBase, EventListeners } from "../../interfaces";
interface Props {
  appId: string;
  fileId: string;
  core: CoreBase;
  data: any;
  rowData: any;
  parentPageData: any;
  componentProps: any;
}
/**
 * 
 * @param {string} applicationId
 * @param {string} fileId
 * @param {CoreBase} core
 * @param {any} data
 * @param {any} rowData
 * @param {any} parentPageData
 * @param {any} parentInstance
 * @returns <CustomComponent {...props}/>
 */
const ReactComponent: React.FC<Props> = ({
  appId,
  fileId,
  core,
  data,
  rowData,
  parentPageData,
  componentProps,
}) => {
  const ref = createRef<HTMLDivElement>();
  useEffect(() => {
    document.getElementById(`left-navigation-${appId}`).dispatchEvent(
      new CustomEvent(EventListeners.GET_REACT_COMPONENT, {
        detail: {
          type: data["reactId"],
          cb: (component) => {
            component &&
              ReactDOM.render(
                component({
                  appId,
                  fileId,
                  core,
                  data,
                  rowData,
                  parentPageData,
                  componentProps,
                }),
                ref?.current
              );
          },
        },
      })
    );
  }, []);
  return <div ref={ref}></div>;
};
export default ReactComponent;
