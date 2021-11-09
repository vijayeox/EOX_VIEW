import { Antd, AntdIcons, React } from "oxziongui";
import "../../../gui/node_modules/antd/dist/antd.css";
import './public/css/DocumentList.css';
import DocumentListDetails from './DocumentListDetails';
import FolderDescription from '../components/FolderDescription';


const { Breadcrumb, Tree, Layout,Button,Drawer} = Antd;
const { DirectoryTree } = Tree;
const { DownOutlined,StepForwardOutlined,MenuOutlined,FolderOpenFilled,FolderFilled} = AntdIcons;
const isRawHtmlRegEx  = /<\/?[a-z][\s\S]*>/i;
class DocumentList extends React.Component {
  constructor(props){
    super(props)
    this.state={
      isMenuBar:false,
      isMobileView:true,
    }
    this.core = this.props.core
    this.clientX = 0;
    this.isResizing = false;
    this.minWidth = 150;
    this.maxWidth = 600;
    this.resizerRef = React.createRef();
    this.sidebarRef = React.createRef();
    this.sidebarBounds = null;
    this.resizerBounds = null;
    this.launchHelper = this.core.make("oxzion/link");
    this.resizeEvent = this.resizeEvent.bind(this);
    document.getElementsByClassName("Window_DocumentsWindow")[0].addEventListener("windowResize", this.resizeEvent, false);
  }

  resizeEvent = () => {
    let that = this;
    window.setTimeout(() => {
      var screen = document
        .querySelector(".Window_DocumentsWindow")
        .querySelector(".osjs-window-content").clientWidth;
      console.log("screenwidth--->",screen)
      screen >= 768 ? this.setState({isMobileView:false}):this.setState({isMobileView:true})
    }, 100);
  };


  showMenuBar = () => {
    this.setState({
      isMenuBar: true,
    });
  };

  closeMenuBar = () => {
    this.setState({
      isMenuBar: false,
    });
  };

  componentDidMount() {
    this.resizerRef.current.addEventListener("mousedown", this.initResize);
    window.addEventListener("mousemove", this.doResize);
    window.addEventListener("mouseup", this.stopResize);
  }

  componentWillUnmount() {
    this.resizerRef.current.addEventListener("mousedown", this.initResize);
    window.removeEventListener("mousemove", this.doResize);
    window.removeEventListener("mouseup", this.stopResize);
  }

  componentDidUpdate(prevProps, prevState){
    if(prevProps.folderData != this.props.folderData){
       this.setState({isMenuBar:false})
    }
  }

  initResize = (event) => {
    this.sidebarBounds = this.sidebarRef.current.getBoundingClientRect();
    this.resizerBounds = event.target.getBoundingClientRect();
    this.clientX = event.clientX;
    this.isResizing = true;
    this.resizerRef.current.className = "document-resizer document-resizer-highlight";
  }

  doResize = (event) => {
    if (this.isResizing) {
      const xOffset = this.clientX - this.resizerBounds.x;
      const resizedWidth = this.sidebarBounds.width + event.clientX - this.clientX - xOffset;
      const widthToSet = resizedWidth < this.minWidth ? this.minWidth
        : resizedWidth > this.maxWidth ? this.maxWidth
        : resizedWidth;
      this.sidebarRef.current.style.width = widthToSet + "px";
      this.sidebarRef.current.style.minWidth = widthToSet + "px";
      this.sidebarRef.current.style.maxWidth = widthToSet + "px";
      this.sidebarRef.current.style.flex = `0 0 ${widthToSet}px`;
    }
  }

  stopResize = (event) => {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizerRef.current.className = "document-resizer";
    }
  }

  getTreeDirectoryIcon = ({ expanded }) => {
    if (expanded) return <FolderOpenFilled style={{color:'#00aeff'}}/>;
    return <FolderFilled style={{color:'#00aeff'}} />;
  }

  getTreeData = () => {
    const { treeData } = this.props;
    const parsedTreeData = JSON.parse(JSON.stringify(treeData));
    const iterTree = (tree) => {
      tree.forEach(element => {
        if (element.isLoadMore) element.icon = <StepForwardOutlined />;
        else if (!element.isLeaf) element.icon = this.getTreeDirectoryIcon;
        if (element.children) iterTree(element.children);
      });
    };
    iterTree(parsedTreeData);
    return parsedTreeData;
  }

  render() {
    const {doSort, expandedKeys, handleTableViewChange, loadMore, onSelect, onExpand, rootInfo, folderData, selectedFolderInfo, selectedKeys, view } = this.props;
    const {isMenuBar,isMobileView} = this.state;
    const isRoot = selectedFolderInfo.key === rootInfo.key;
    const isHtmlDescription = isRawHtmlRegEx.test(selectedFolderInfo.description)
    const isTaskTree = selectedFolderInfo.appName === 'TaskApp1' && selectedFolderInfo.apiType?.includes('attachmentFile') ? true : false;
    const fileId = selectedFolderInfo.fileId;
    const appName = selectedFolderInfo.appName;
    const appId = selectedFolderInfo.appId;
    const titleName = selectedFolderInfo.title;
    return (
      
      <Layout className="document-container">
        <Drawer
          title="Documents"
          placement="left"
          closable={true}
          onClose={this.closeMenuBar}
          visible={isMenuBar}
          getContainer={false}
          style={{position: 'absolute'}}
        >
          <Tree
            autoExpandParent={false}
            defaultExpandParent={false}
            expandedKeys={expandedKeys}
            key={Date.now()}
            onSelect={onSelect}
            onExpand={onExpand}
            selectedKeys={selectedKeys}
            showIcon
            showLine
            switcherIcon={<DownOutlined />}
            treeData={this.getTreeData()}
            />
        </Drawer>
        {!isMobileView?(
          <div className="document-treeview" ref={this.sidebarRef}>
            <Tree
              autoExpandParent={false}
              defaultExpandParent={false}
              expandedKeys={expandedKeys}
              key={Date.now()}
              onSelect={onSelect}
              onExpand={onExpand}
              selectedKeys={selectedKeys}
              showIcon
              showLine
              switcherIcon={<DownOutlined />}
              treeData={this.getTreeData()}
            />
          </div>
        ):null}
        <div className="document-resizer" ref={this.resizerRef} />
        <div className="document-content">
          {isMobileView?
             <div className="document-navbar">
                <MenuOutlined className="menuBar" onClick={() => this.showMenuBar()}/>
              </div>
          :null}
          <div className="document-header">
            {selectedFolderInfo.breadcrumbs.length > 0 &&
              <Breadcrumb style={{marginBottom:'10px'}}>
                  {selectedFolderInfo.breadcrumbs.map((breadcrumb, index) => {
                    return <Breadcrumb.Item style={{cursor:'pointer'}} key={index} onClick={() => onSelect([], {node: breadcrumb})}>
                      {breadcrumb.title}
                    </Breadcrumb.Item>}
                  )}
              </Breadcrumb>}
            <b><h4>{selectedFolderInfo.title}</h4></b>
            {isTaskTree ? <Button style={{marginLeft:'-14px'}} type="link" onClick={() => this.launchHelper.launchApp({fileId:fileId},appName)}>View {titleName}</Button>:null}
            {selectedFolderInfo.description?
              !isHtmlDescription
              ?
                <p>{selectedFolderInfo.description}</p>
              :
              null
                // <FolderDescription entityName={selectedFolderInfo.title} isShow = {this.state.isShowDrawer} onClose={this.onClose} description={selectedFolderInfo.description}/>
            :null}
          </div>
          <DocumentListDetails
            doSort={doSort}
            userprofile={this.props.userprofile}
            folderData={folderData}
            handleTableViewChange={handleTableViewChange}
            isRoot={isRoot}
            loadMore={loadMore}
            onSelect={onSelect}
            selectedFolderInfo={selectedFolderInfo}
            view={view}
            isdataloading={this.props.isdataloading}
          />
        </div>
      </Layout>
    );
  }
}

export default DocumentList;
