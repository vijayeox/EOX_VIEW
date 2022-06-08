import React from 'react';
import EOXGrid from './EOXGrid';
//this component is responsible for render expandableApi kendo grid prop (check example in Team.js in apps/Admin/Team.js)
/**
 * @param instance {this}
 * @param event {Event}
 * @param api {String}
 * @param form {.json}
 * @param GetData {function}
 * @returns <EOXGrid/>
 */
class ChildEOXGrid extends React.Component{
    constructor(props){
      super(props)
      this.instance = this.props.instance;
      this.event = this.props.e;
      this.getData = props.GetData;
      this.api = this.instance.replaceParams(this.instance.config.subRoute, this.event);
      this.state = {
        data : this.parseData(null)
      }
    }
  
    filterChange = ({ dataState, refresh }) => {
      const { filter, group, skip, sort, take } = dataState;
      const config = {...this.instance.config}
      config.pageSize = take;
      if(refresh){
        this.props.dataStateChanged?.({dataState})
      }
      this.getData?.(
        this.api +
          `?filter=[{"skip":${skip},"take":${
            config.pageSize
          }, "filter" : ${JSON.stringify(filter)}}]`
      )
        .then((response) => this.state.callback?.(this.parseData(response).data))
        .catch(() => this.state.callback?.(this.parseData(null).data));
    };
  
    parseData(response) {
      if (response?.status === "success")
        return { data: response.data, total: response.total };
      return { data: [], total: 0 };
    }
    
    render(){
      const {config, core, props, actionItems, state, editApi, createApi, deleteApi, addConfig, noCreateAction } = this.instance;
      return (
        <EOXGrid
          configuration={config}
          data={this.state.data}
          core={core}
          isDrillDownTable={props.drillDownRequired}
          actionItems={actionItems}
          api={this.api}
          permission={state.permission}
          editForm={this.props.form}
          editApi={editApi}
          createApi={createApi}
          deleteApi={deleteApi}
          addConfig={addConfig}
          rowTemplate={(e) => <ChildEOXGrid instance={this.instance} e={e} form={this.props.form} GetData={this.getData} prepareFormData={this.props.prepareFormData}/>}
          expandableApi={(callback) => {
            this.getData?.(this.api).then((response) => {
              const data = this.parseData(response);
              this.setState({ data, callback }, () => {
                callback?.(data.data)
              })
            });
          }}
          noCreateAction={noCreateAction}
          dataStateChanged={this.filterChange}
          prepareFormData={this.props.prepareFormData}
        />
      )
    };
  }
  export default React.memo(ChildEOXGrid);