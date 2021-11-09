import './index.scss';
import { React} from "oxziongui";
import DocumentList from "./src/DocumentList";
const ROOT_APPS_INFO = {
  breadcrumbs: [],
  description: "Documents app gives you secure access to all your files across apps - all in one place. Collaborate with teammates from any device.",
  key: "application_folder",
  title: "All Apps"
};

const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 10;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.loader = this.core.make("oxzion/splash");
    this.userprofile = this.core ? this.core.make("oxzion/profile").get().key : undefined;
    this.helper = this.core.make("oxzion/restClient");
    this.state = {
      currentView: "list",
      sorter: {field: "name", order: "ascend"},
      expandedKeys: [ROOT_APPS_INFO.key],
      selectedKeys: [ROOT_APPS_INFO.key],
      userprofile:this.userprofile,
      treeData: null,
      folderData: null,
      dataReady: false,
      selectedFolderInfo: ROOT_APPS_INFO,
      isdataloading:false
    }
  }

  componentDidMount() {
    this.getApps().then((response) => {
      this.constructTreeData(response);
    });
  }

  selectFolder = async (treeNode, breadcrumbs, state={}) => {
    const selectedFolderInfo = breadcrumbs.length === 1 ? ROOT_APPS_INFO
      : { ...treeNode, breadcrumbs };
    const expandedKeys = [...this.state.expandedKeys];
    for (const breadcrumb of breadcrumbs) {
      if (!expandedKeys.includes(breadcrumb.key)) expandedKeys.push(breadcrumb.key);
    }
    this.setState({
      expandedKeys,
      folderData: treeNode.children,
      selectedFolderInfo,
      selectedKeys: [treeNode.key],
      isdataloading:false,
      ...state
    });
  }

  onSelect = (keys, obj) => {
    console.log("Trigger Select");
    console.log(obj);
    let { breadcrumbs, treeData, treeNode } = this.getTreeNode(obj.node);
    // const arePagesLoaded = "pagesLoaded" in treeNode && treeNode.pagesLoaded;
    const areItemsLoaded = !("pagesLoaded" in treeNode) && treeNode.loaded;
    const isSortSame = "sorter" in treeNode ? treeNode.sorter.field === this.state.sorter.field && treeNode.sorter.order === this.state.sorter.order : false;
    if (treeNode.loading) return;
    if (treeNode.isLoadMore) {
      const parents = [...treeNode.parents];
      const key = parents.pop();
      this.loadMore({ key, parents });
      return;
    }
    if (isSortSame || areItemsLoaded) {
      this.selectFolder(treeNode, breadcrumbs);
      return;
    }
    treeNode.loading = true;
    this.setState({ treeData: JSON.parse(JSON.stringify(treeData))},
    () => {
      this.setState({isdataloading:true})
      this.loadData(treeNode, (updatedTreeNode) => {
        updatedTreeNode.loaded = true;
        updatedTreeNode.loading = false;
        this.selectFolder(updatedTreeNode, breadcrumbs, { treeData: JSON.parse(JSON.stringify(treeData)) });
      }, false, true);
    });
  };

  onExpand = (keys, obj) => {
    console.log("Trigger Expand");
    const expandedKeys = [...this.state.expandedKeys];
    let { treeData, treeNode } = this.getTreeNode(obj.node, this.state.treeData);
    if (treeNode.isLeaf) return;
    if (treeNode.loaded || !obj.expanded) this.setExpandedKeys(treeNode.key);
    else {
      if (obj.expanded) {
        if (!treeNode.loading) {
          const expandedKeys = [...this.state.expandedKeys, treeNode.key];
          treeNode.loading = true;
          this.setState({ treeData: JSON.parse(JSON.stringify(treeData)) },
            () => {
              this.loadData(treeNode, (updatedTreeNode) => {
                updatedTreeNode.loaded = true;
                updatedTreeNode.loading = false;
                this.loadDataCallback(treeData, {expandedKeys});
              });
            }
          );
        }
      }
    }
  }

  loadDataCallback = (treeData, state={}) => {
    this.setState({
      treeData: JSON.parse(JSON.stringify(treeData)),
      ...state
    });
  }

  setExpandedKeys = (key) => {
    let expandedKeys = [...this.state.expandedKeys];
    if (expandedKeys.includes(key)) expandedKeys = expandedKeys.filter(value => value !== key);
    else expandedKeys.push(key);
    this.setState({ expandedKeys });
  }

  async getApps() {
    let appsResponse = await this.helper.request("v1",'user/me/a+ap' ,{},"get");
    if (appsResponse.status == "success") {
      return appsResponse.data;
    }
  }

  async getEntities(appId) {
    let entity = await this.helper.request("v1",'app/'+appId+'/entity', {}, "get");
    if (entity.status == "success") {
      return entity.data;
    }
  }

  async getFiles(appId, entityId, params) {
    let entity = await this.helper.request("v1",'app/'+appId+'/file/user/'+this.userprofile.uuid+"?filter="+JSON.stringify(params) ,{entityName:entityId},"get");
    if (entity.status == "success") {
      return entity.data;
    }
  }

  async getFileAttachments(appId, fileId) {
    let entity = await this.helper.request("v1",'app/'+appId+'/file/'+fileId+'/document' ,{},"get");
    if (entity.status == "success") {
      return entity.data;
    }
  }

  getTreeNode = (node, tree = null) => {
    let treeData = tree ? tree : this.state.treeData;
    let treeNode = null;
    let breadcrumbs = [];
    if (node.parents.length === 0) {
      treeNode = treeData[0];
      breadcrumbs = [];
    } else {
      let i = 0;
      for (const key of node.parents) {
        if (i === 0) treeNode = treeData.find(data => data.key === key);
        else treeNode = treeNode.children.find(data => data.key === key);
        breadcrumbs.push(treeNode);
        i++;
      }
      treeNode = treeNode.children.find(data => data.key === node.key);
      breadcrumbs.push(treeNode);
    }
    return { breadcrumbs, treeData, treeNode };
  }

  doSort = (sorter) => {
    const { selectedFolderInfo } = this.state;
    let { breadcrumbs, treeData, treeNode } = this.getTreeNode(selectedFolderInfo);
    treeNode.loading = true;
    this.setState({sorter: { field: sorter.field, order: sorter.order }, treeData: JSON.parse(JSON.stringify(treeData))},
      () => {
        this.loadData(treeNode, (updatedTreeNode) => {
          updatedTreeNode.loading = false;
          this.selectFolder(updatedTreeNode, breadcrumbs, { treeData });
        }, false, true);
      }
    );
  }

  loadMore = (node) => {
    let { breadcrumbs, treeData, treeNode } = this.getTreeNode(node);
    if (treeNode.loading || treeNode.pagesLoaded) return;
    treeNode.loading = true;
    this.setState({ treeData },
      () => {
        this.setState({isdataloading:true});
        this.loadData(treeNode, (updatedTreeNode) => {
          updatedTreeNode.loaded = true;
          updatedTreeNode.loading = false;
          this.selectFolder(updatedTreeNode, breadcrumbs, { treeData });
        }, true)
      }
    );
  }

  getParams = (node, reload = false) => {
    const { sorter } = this.state;
    const order = sorter.order === "ascend" ? "asc" : "desc";
    let field = "name";
    const skip = reload || !("page" in node) ? DEFAULT_PAGE_NUMBER : "page" in node ? node.page + DEFAULT_PAGE_SIZE : DEFAULT_PAGE_NUMBER;
    switch (sorter.field) {
      case "title":
        break;
      case "date_modified":
        field = "date_modified";
        break;
    }
    return [{sort:[{field, dir: order}], skip, take: DEFAULT_PAGE_SIZE}];
  }

  getNodePaginationAttr = (node, itemsReceivedLength, reload = false) => {
    const sorter = { ...this.state.sorter };
    const page = reload || !("page" in node) ? DEFAULT_PAGE_NUMBER : "page" in node ? node.page + DEFAULT_PAGE_SIZE : DEFAULT_PAGE_NUMBER;
    let child = {};
    if (itemsReceivedLength === DEFAULT_PAGE_SIZE) {
      child = {
        isLeaf: true,
        isLoadMore: true,
        key: [...node.parents, node.key, "load_more"].join("-"),
        parents: [...node.parents, node.key],
        sorter,
        title: "Load More ..."
      };
    }
    const pagesLoaded = itemsReceivedLength < DEFAULT_PAGE_SIZE;
    return { child, attributes: { page, pagesLoaded, sorter } };
  }

  loadData = async(node, callback, append = false, reload = false) => {
    console.log("Loading async data");
    console.log(node);
    const params = this.getParams(node, reload);
    console.log("params--->",params)
    if(node.apiType === "app") {
      var appId = node.appId;
      var response = await this.getEntities(appId);
      var entityList = [];
      if(response) {
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          entityList.push({
            ...element,
            appId,
            apiType: "entity",
            entityId: element.name,
            isLeaf: false,
            key: [...node.parents, node.key, 'application_'+appId+'_entity_'+element.name].join("-"),
            loaded: false,
            loading: false,
            parents: [...node.parents, node.key],
            title:element.name
          });
        }
        node.children = entityList;
      }
    }
    if(node.apiType === "entity") {
      var response = await this.getFiles(node.appId, node.entityId, params);
      var fileList = [];
      if(response) {
        for (let i = 0; i < response.length; i++) {
          const element = response[i];
          fileList.push({
            ...element,
            appId: node.appId,
            apiType: "attachmentFile",
            fileId: element.uuid,
            entityId: node.entityId,
            isLeaf: false,
            key: [...node.parents, node.key, 'application_'+node.appId+'_attachmentfile_'+element.uuid].join("-"),
            loaded: false,
            loading: false,
            parents: [...node.parents, node.key],
            title:element.name
          });
        }
        const { child, attributes } = this.getNodePaginationAttr(node, fileList.length, reload);
        for (const item in attributes) {
          node[item] = attributes[item];
        }
        if (append) node.children = [...node.children.filter(item => !item.isLoadMore), ...fileList];
        else node.children = fileList;
        if (Object.keys(child).length > 0) node.children.push(child);
      }
    }
    if(node.apiType === "attachmentFile") {
      var response = await this.getFileAttachments(node.appId, node.fileId, params);
      var fileFolders = [];
      if(response) {
        for (const folder in response) {
          if (response.hasOwnProperty.call(response, folder)) {
            const ele = response[folder];
            var folderFiles = [];
            for (let i = 0; i < response[folder].value.length; i++) {
              const element = response[folder].value[i];
              folderFiles.push({
                ...element,
                appId: node.appId,
                apiType: "attachment",
                isLeaf: true,
                key: [...node.parents, node.key, "filefolder_"+folder, 'application_'+node.appId+'_file_'+element.originalName].join("-"),
                loaded: true,
                loading: false,
                parents: [...node.parents, node.key, [...node.parents, node.key, 'filefolder_'+folder].join("-")],
                title:element.originalName
              });
            }
            fileFolders.push({
              ...ele,
              children: folderFiles,
              key:[...node.parents, node.key, 'filefolder_'+folder].join("-"),
              loaded: true,
              loading: false,
              parents: [...node.parents, node.key],
              title:folder
            });
          }
        }
        node.children = fileFolders;
      }
    }
    callback(node);
  }

  constructTreeData(profile) {
    var appsList = [];
    if(profile.apps) {
      for (let i = 0; i < profile['apps'].length; i++) {
        const element = profile['apps'][i];
        if(element.type == '2'){
          appsList.push({
            ...element,
            apiType: "app",
            appId: element.uuid,
            icon: this.getTreeIcon,
            isLeaf: false,
            key: 'app_'+element.uuid,
            loaded: false,
            loading: false,
            parents:[ROOT_APPS_INFO.key],
            title:element.name
          });
        }
      }
    }
    const treeNode = {
      ...ROOT_APPS_INFO,
      children: appsList,
      icon: this.getTreeIcon,
      loaded: true,
      loading: false,
      parents: []
    };
    this.selectFolder(treeNode, [ROOT_APPS_INFO],
      {dataReady: true, treeData: [treeNode]});
  }

  handleTableViewChange = (e) => {
    this.setState({ currentView: e.target.value });
  }

  render() {
    const { currentView, expandedKeys, dataReady, folderData, selectedFolderInfo, selectedKeys, treeData,isdataloading} = this.state;
    if(dataReady) {
      return (
      <div className="app-container" id="root">
        <DocumentList
          core={this.core}
          doSort={this.doSort}
          userprofile={this.userprofile}
          expandedKeys={expandedKeys}
          folderData={folderData}
          handleTableViewChange={this.handleTableViewChange}
          loadMore={this.loadMore}
          onExpand={this.onExpand}
          onSelect={this.onSelect}
          rootInfo={ROOT_APPS_INFO}
          selectedFolderInfo={selectedFolderInfo}
          selectedKeys={selectedKeys}
          treeData={treeData}
          view={currentView}
          isdataloading={isdataloading}
        /></div>);
    } else {
      return (<div id="root"></div>);
    }
  }
}
export default App;
