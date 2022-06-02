import { React, EOXGrid, Helpers } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";
import form from "../modules/forms/editCreateAccount.json";

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        icon: "fas fa-pencil",
        text: "EDIT",
        title: "Edit Account",
      },
      delete: {
        type: "button",
        icon: "fas fa-trash",
        text: "DELETE",
        title: "Delete Account",
      },
      add: {
        type: "button",
        icon: "fas fa-user-plus",
        text: "ADD",
        title: "Add Users to Account",
      },
      create: {
        type: "button",
        icon: " fas fa-plus",
        text: "CREATE",
        title: "Create New",
      },
    }),
      (this.config = {
        height: "100%",
        width: "100%",
        filterable: true,
        reorderable: true,
        sortable: true,
        // sort:true,
        pageSize: 20,
        pageable: {
          skip: 0,
          buttonCount: 3,
          info: true,
          pageSizes: [10, 20, 50]
        },
        groupable: true,
        resizable: true,
        isDrillDownTable: true,
        column: [
          {
            title: "Image",
            field: "logo",
            filterable:false,
            width: "60px"
          },

          {
            title: "Name",
            field: "name",
          },
          {
            title: "Country",
            field: "country",
          },
          {
            title: "State",
            field: "state",
          },
          {
            title: "Zip Code",
            field: "zip",
          },
        ],
      });
    this.state = {
      isLoading: true,
      accountData: [],
      permission: {
        canCreate: this.props.userProfile.privileges.MANAGE_ACCOUNT_CREATE,
        canEdit: this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE,
        canDelete: this.props.userProfile.privileges.MANAGE_ACCOUNT_DELETE,
        canAdd:this.props.userProfile.privileges.MANAGE_ACCOUNT_WRITE,
        canReset:false,
      },
      total: 0,
      skip: 0,
    };
    this.api = "account";
    this.editApi = "account";
    this.createApi = "account";
    this.deleteApi = "account";
    this.addConfig = {
      title: "Account",
      mainList: "users/list",
      subList: "account",
      members: "Users",
    };
  }

  componentDidMount() {
    GetData(Helpers.Utils.getFilterParams(this.api, this.config.pageSize, 0))
      .then((data) => {
        this.setState({
          accountData:
            data?.status === "success" ? data : { data: [], total: 0 },
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          accountData: { data: [], total: 0 },
          isLoading: false,
        });
      });
  }

  getCustomPayload = (formData, type) => {
    /**
     * name: accountname
      address1: 696 West Fabien Court
      Recusandae Necessit
      city: In debitis debitis e
      state: Dolorem non adipisic
      country: Albania
      zip: 94933
      logo: (binary)
      contact: {"firstname":"Jaden","lastname":"Dejesus","username":"sagarsp","email":"ryqa@mailinator.com"}
      preferences: {"dateformat":"dd-MMM-yyyy","currency":"AFN","timezone":"Africa/Abidjan"}
     */
    const newPayload = {};
    const logo = formData?._filesToUpload && Object.values(formData?._filesToUpload)?.[0]?.uploadFile?.file;
    newPayload['name'] = formData.name;
    newPayload['address1'] = formData.address1;
    newPayload['city'] = formData.city;
    newPayload['country'] = formData.country;
    newPayload['state'] = formData.state;
    newPayload['zip'] = formData.zip;
    newPayload['preferences'] = JSON.stringify(formData.preferences);
    if(logo){
      newPayload['logo'] = logo;
    }
    if(type == "put"){
      newPayload['contactid'] = formData.contactid;
    }
    newPayload['contact'] =JSON.stringify( formData.contact)
    return newPayload;
  }


  dataStateChanged({ dataState: { filter, group, skip, sort, take } }) {
    this.setState({ isLoading: true });
    this.config.pageSize = take;
    GetData(
      this.api +
        `?filter=[{"skip":${skip},"take":${
          this.config.pageSize
        }, "filter" : ${JSON.stringify(filter)}}]`
    )
      .then((data) => {
        this.setState({
          accountData:
            data?.status === "success" ? data : { data: [], total: 0 },
          skip,
          isLoading: false,
        });
      })
      .catch(() => {
        this.setState({
          accountData: { data: [], total: 0 },
          isLoading: false,
        });
      });
  }
  render() {
    return (
      <div style={{ height: "inherit",marginTop:"12px"}}>
        <TitleBar
          title="Manage Account"
          menu={this.props.menu}
          args={this.core}
        />
        <React.Suspense fallback={<div>Loading...</div>}>
          <EOXGrid
            configuration={this.config}
            data={this.state.accountData}
            core={this.core}
            isDrillDownTable={this.props.drillDownRequired}
            actionItems={this.actionItems}
            api={this.api}
            permission={this.state.permission}
            editForm={form}
            editApi={this.editApi}
            createApi={this.createApi}
            deleteApi={this.deleteApi}
            addConfig={this.addConfig}
            skip={this.state.skip}
            dataStateChanged={this.dataStateChanged.bind(this)}
            isLoading={this.state.isLoading}
            appendAttachments={this.appendAttachments}
            getCustomPayload={this.getCustomPayload}
            createCrudType="filepost"
            // key={Math.random()}
          />
        </React.Suspense>
      </div>
    );
  }
}

export default Organization;
