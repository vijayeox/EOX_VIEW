import { Antd, AntdIcons, React,Moment} from "oxziongui";
import './public/css/DocumentListDetails.css';
import FilterFolderContentView from '../components/FilterFolderContentView';
import DocumentTable from "./DocumentTable";

const {Empty, Row, Col } = Antd;
const {FileFilled,FolderFilled} = AntdIcons;

  class DocumentListDetails extends React.Component {
    constructor(props) {
      super(props);
      this.core = this.props.core;
      this.state = {
        folderData : this.props.folderData
      };
    }

    getData = () => {
      const { folderData, selectedFolderInfo } = this.props;
      return selectedFolderInfo && selectedFolderInfo.isLeaf ? [] : folderData.filter(data => !data.isLoadMore);
    }

    getIcon = (record) => {
      return !record.isLeaf ? <FolderOutlined className="folder-content-icon" /> :
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
      const { onSelect } = this.props;
      return [
        {
          title: "Name",
          dataIndex: "title",
          sorter: (a, b) => {
            if (a.title === b.title || !a.title) return 0;
            if (!b.title) return 1;
            return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
          },
          render: (text, record) => 
            <span onClick={() => onSelect([], {node: record})}>
              <i>{this.getIcon(record)}</i>
              <span className="folder-content-name">{text}</span>
            </span>
        },
        {
          title: "Last modified time",
          dataIndex: "date_modified",
          sorter: (a, b) => {
            const date1 = new Date(a);
            const date2 = new Date(b);
            if (a.date_modified === b.date_modified) return 0;
            if (!this.isValidDate(date1)) return 1;
            if (!this.isValidDate(date2)) return -1;
            return date1 - date2;
          },
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

    render() {
      const { doSort, handleTableViewChange, isRoot, loadMore, onSelect, selectedFolderInfo, view } = this.props;
      const folderData = this.getData();
      const hasFolderContents = !!folderData && folderData.length > 0;
      if (selectedFolderInfo && selectedFolderInfo.isLeaf) {
        const url = this.core.config("wrapper.url") + selectedFolderInfo.file;
        return (
          <div className="document-details">
            <Row type="flex" style={{flexDirection: "column", height: "100%"}}>
              <Col style={{background: 'white',padding:'10px',alignItems: "center", display: "flex", justifyContent: "flex-end", height: "50px", width: "100%"}}>
                {/* <a href="https://www.irs.gov/pub/irs-pdf/fw4.pdf" target="_blank">
                  <Button icon={<DownloadOutlined />} size="medium">
                    Download
                  </Button>
                </a> */}
              </Col>
              <Col style={{flex: "1"}}>
                <embed src={url} style={{
                  height: "100%",
                  width: "100%"
                }} />
              </Col>
            </Row>
          </div>
        );
      }
      if (!hasFolderContents && !isRoot) {
        return (<Empty description="No Files" />);
      }
      return (
        <div className="document-details">
          {isRoot || view === "grid"
          ? <Row>
              {!isRoot && <FilterFolderContentView folderData={folderData} tableView={view} handleTableViewChange={handleTableViewChange}/>}
              {folderData.map((folder, index) => (
                <Col className="document-folder" onClick={() => onSelect([], {node: folder})} sm={{span:8,offset:1}} lg={{span:4,offset:1}} key={index}>
                  {folder.isLeaf ? <FileFilled className="file-icon" /> : <FolderFilled className="folder-icon" />}
                  <div>{folder.title}</div>
                </Col>
              ))}
            </Row>
          : <Row className="document-viewer" type="flex">
              <Col style={{flex: 1, height: "100%"}}>
                <FilterFolderContentView folderData={folderData} tableView={view} handleTableViewChange={handleTableViewChange}/>
                <DocumentTable
                  doSort={doSort}
                  folderData={folderData}
                  loadMore={loadMore}
                  onSelect={onSelect}
                  selectedFolderInfo={selectedFolderInfo}
                  userprofile={this.props.userprofile}
                  isdataloading={this.props.isdataloading}
                />
              </Col>
              {/* <Col style={{width: 160}}>
                <div className="document-metadata">
                  <FolderTwoTone className="folder-icon small" />
                  <b>{selectedFolderInfo.title}</b>
                </div>
              </Col> */}
            </Row>}
        </div>
    );
  }
};

export default DocumentListDetails;
