import { Antd, AntdIcons, React } from "oxziongui";
const {Radio} = Antd;
const {UnorderedListOutlined,AppstoreOutlined} = AntdIcons

class FilterFolderContentView extends React.Component{
    constructor(props){
        super(props)
    }    


    checkisLastNode = () =>{
        let isLastTree = this.props.folderData.some((el)=> el.isLeaf === true)
        return isLastTree ? <h5>Attachments</h5> : <h5>Files and Folders</h5>
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           

    render(){
        const getTableHeader = this.checkisLastNode();
        return(
            <div className="document-table-header">
                <b>{getTableHeader}</b>
                <Radio.Group className="document-table-filter" value={this.props.tableView} onChange={(e) => this.props.handleTableViewChange(e)}>
                    <Radio.Button style={{paddingBottom:'36px'}} value="list">
                            <UnorderedListOutlined />
                    </Radio.Button>
                     <Radio.Button style={{paddingBottom:'36px'}} value="grid">
                            <AppstoreOutlined />
                    </Radio.Button>
                </Radio.Group>
            </div>
        );
    }
}

export default FilterFolderContentView;