// import {
//     TreeList, orderBy, filterBy, mapTree, extendDataItem,
// TreeListNumericFilter, TreeListTextFilter, TreeListDateFilter, TreeListBooleanFilter
// } from '@progress/kendo-react-treelist';
// import employees from './data.js';
// import '@progress/kendo-theme-default/dist/all.css';
// import React,{Component} from 'react'


const subItemsField = 'subRevanue';
const expandField = 'expanded';
const columns = [
    { field: 'Particulars', title: 'Particulars', width: 250, filter: TreeListTextFilter, expandable: true, locked: true },
    { field: '31/01/2021', title: '31/01/2021', width: 200, format: '{0:d}', filter: TreeListNumericFilter },
    { field: '28/02/2021', title: '28/02/2021', width: 200, format: '{0:d}', filter: TreeListNumericFilter },
    { field: '31/03/2021', title: '31/03/2021', width: 100, format: '{0:d}', filter: TreeListNumericFilter },
    { field: 'Quarter Ending 03/31/21', title: 'Quarter Ending 03/31/21', width: 100, filter: TreeListNumericFilter },
    { field: '30/04/2021', title: '30/04/2021', width: 100, filter: TreeListNumericFilter },
    { field: '31/05/2021', title: '31/05/2021', width: 100, filter: TreeListNumericFilter },
    { field: '30/06/2021', title: '30/06/2021', width: 100, filter: TreeListNumericFilter },
    { field: 'Quarter Ending 06/30/21', title: 'Quarter Ending 06/30/21', width: 100, filter: TreeListNumericFilter },
    { field: '31/07/2021', title: '31/07/2021', width: 100, filter: TreeListNumericFilter },
    { field: '31/08/2021', title: '31/08/2021', width: 100, filter: TreeListNumericFilter },
    { field: '30/09/2021', title: '30/09/2021', width: 100, filter: TreeListNumericFilter },
    { field: 'Quarter Ending 09/30/21', title: 'Quarter Ending 09/30/21', width: 100, filter: TreeListNumericFilter },
    { field: "YTD 31/03/21", title: "YTD 31/03/21", width: 100, filter: TreeListNumericFilter },
    { field: "YTD Before EJE's 31/03/20", title: "YTD Before EJE's 31/03/20", width: 100, filter: TreeListNumericFilter },
    { filter: TreeListNumericFilter, children: [{ title: "Variance $", field: "Variance $" }, { title: "Variance %", field: "Variance %" }] },
    //     { title:"Before EJE Variance %",field:"Before EJE Variance %"}]},
    // { field: "YTD Before EJE's 28/02/21", title: "YTD Before EJE's 28/02/21", width: 100, filter:TreeListNumericFilter },
    // { field: "Eliminating Journal Entries", title: "Eliminating Journal Entries", width: 100, filter:TreeListNumericFilter },
    // { field: "N-1 YTD 31/03/21", title: "N-1 YTD 31/03/21", width: 100, filter:TreeListNumericFilter },
    // { field: "YTD Before EJE's 29/02/20", title: "YTD Before EJE's 28/02/21", width: 100, filter:TreeListNumericFilter },
    // { field: "Eliminating Journal Entries", title: "Eliminating Journal Entries", width: 100, filter:TreeListNumericFilter },
    // { field: "N-1 YTD 31/03/20", title: "N-1 YTD 31/03/20", width: 100, filter:TreeListNumericFilter },
    // {filter:TreeListNumericFilter, children:[ {title:"Before EJE Variance $",field:"Before EJE Variance $"},
    //     { title:"Before EJE Variance %",field:"Before EJE Variance %"}]}
];

class WidgetCustom extends Component {
    state = {
        data: [...employees],
        dataState: {
            filter: []
        },
        expanded: [1, 2, 3]
    }

    onExpandChange = (e) => {
        this.setState({
            expanded: e.value ?
                this.state.expanded.filter(id => id !== e.dataItem.id) :
                [...this.state.expanded, e.dataItem.id]
        });
    }

    handleDataStateChange = (event) => {
        this.setState({
            dataState: event.dataState
        })
    }

    addExpandField = (dataTree) => {
        const expanded = this.state.expanded;
        return mapTree(dataTree, subItemsField, (item) =>
            extendDataItem(item, subItemsField, {
                [expandField]: expanded.includes(item.id)
            })
        );
    }

    processData = () => {
        let { data, dataState } = this.state;
        let filteredData = filterBy(data, dataState.filter, subItemsField)
        // let sortedData = orderBy(filteredData, dataState.sort, subItemsField)
        return this.addExpandField(filteredData);
    }

    render() {
        return (
            <div style={{ overflow: 'auto' }}>
                {/* <TreeList
        style={{ maxHeight: '510px', overflow: 'auto' }}
        expandField={expandField}
        subItemsField={subItemsField}
        onExpandChange={this.onExpandChange}
        sortable={{ mode: 'multiple' }}
        {...this.state.dataState}
        data={this.processData()}
        onDataStateChange={this.handleDataStateChange}
        columns={columns}
        resizable={true}
        /> */}
            </div>
        );
    }
}

export default App;