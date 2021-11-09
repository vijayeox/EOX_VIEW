import { Antd, AntdIcons, React,Moment} from "oxziongui";

const { Table,Skeleton } = Antd;
const {FileTextOutlined,FolderFilled} = AntdIcons;

class DocumentTable extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      isdataloading:this.props.isdataloading
    }
  }

  componentDidMount() {
    const documentTable = document.querySelector(".document-table");
    documentTable.addEventListener("scroll", this.loadMoreData);
  }

  componentWillUnmount() {
    const documentTable = document.querySelector(".document-table");
    documentTable.removeEventListener("scroll", this.loadMoreData);
  }

  componentWillUpdate(prevProps, prevState, snapshot){
    if(prevProps.isdataloading != this.props.isdataloading){
      this.setState({isdataloading:!this.props.isdataloading});
    }
  }

  loadMoreData = (event) => {
    const { loadMore, selectedFolderInfo } = this.props;
    const maxScroll = event.target.scrollHeight - event.target.clientHeight;
    const currentScroll = event.target.scrollTop;
    if (currentScroll === maxScroll && selectedFolderInfo.apiType === "entity") {
      console.log("Load more triggered");
      console.log(selectedFolderInfo);
      loadMore(selectedFolderInfo);
    }
  }

  getIcon = (record) => {
    return !record.isLeaf ? <FolderFilled className="folder-content-icon" /> :
    <FileTextOutlined className="folder-content-icon" /> 
  }

  isValidDate = (date) => {
    return date instanceof Date && !isNaN(date);
  }

  getformatDate = (dateTime, dateTimeFormat) => {
    if(dateTime){
      let userTimezone, userDateTimeFomat = null;
      userTimezone = this.props.userprofile.preferences.timezone ? this.props.userprofile.preferences.timezone : Moment.tz.guess();
      userDateTimeFomat = this.props.userprofile.preferences.dateformat ? this.props.userprofile.preferences.dateformat : "MM/dd/yyyy";
      dateTimeFormat ? (userDateTimeFomat = dateTimeFormat) : null;
      return Moment(dateTime).utc(dateTime, "MM/dd/yyyy HH:mm:ss").clone().tz(userTimezone).format(userDateTimeFomat);
    }
  };

  getColumns = () => {
    const { onSelect, selectedFolderInfo } = this.props;
    return [
      {
        title: "Name",
        dataIndex: "title",
        sorter: selectedFolderInfo.apiType === "entity" ? true : (a, b) => {
          if (a.title === b.title || !a.title) return 0;
          if (!b.title) return 1;
          return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
        },
        defaultSortOrder: "ascend",
        sortDirections: ["ascend", "descend", "ascend"],
        render: (text, record) => <span onClick={() => onSelect([], {node: record})}>
            <i>{this.getIcon(record)}</i>
            <span className="folder-content-name">{text}</span>
          </span>
      },
      {
        title: "Last modified time",
        dataIndex: "date_modified",
        sorter: selectedFolderInfo.apiType === "entity" ? true : (a, b) => {
          const date1 = new Date(a);
          const date2 = new Date(b);
          if (a.date_modified === b.date_modified) return 0;
          if (!this.isValidDate(date1)) return 1;
          if (!this.isValidDate(date2)) return -1;
          return date1 - date2;
        },
        sortDirections: ["ascend", "descend", "ascend"],
        sorter: true,
        render:(text,record) => this.getformatDate(text,null)
      },
      {
        title: "Members",
        dataIndex: "members"
      }
    ];
  }

  getRowSelection = () => {
    return {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      type: "checkbox"
    }
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { doSort, selectedFolderInfo } = this.props;
    if (selectedFolderInfo.apiType === "entity") {
      console.log("Triggered server side sort...");
      console.log(sorter);
      doSort(sorter);
    }
  };

  render() {
    const { folderData,onSelect} = this.props;
    const {isdataloading} = this.state;
    return (
      <div className="document-table">
        <Table
          style={{cursor:'pointer'}}
          childrenColumnName="children<children>"
          columns={this.getColumns()}
          dataSource={isdataloading ? [] : folderData}
          onChange={this.handleTableChange}
          pagination={false}
          onRow={(record,recordIndex) =>({onClick: event => onSelect([], {node: record})})}
          locale={{
            emptyText: isdataloading ? <Skeleton active={true} /> : null
          }}
          // rowSelection={this.getRowSelection()}
        />
      </div>
    );
  }
}

export default DocumentTable;
