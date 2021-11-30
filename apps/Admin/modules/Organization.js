import { React, EOXGrid } from "oxziongui";
import { TitleBar } from "./components/titlebar";
import { GetData } from "./components/apiCalls";

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.drillDownRequired = false;
    (this.actionItems = {
      edit: {
        type: "button",
        api: "account/edit",
        icon: "fad fa-pencil",
        text: "EDIT",
        isPopup: true,
      },
      delete: {
        type: "button",
        api: "account",
        icon: "fad fa-trash",
        text: "DELETE",
        isPopup: true,
      },
      add: {
        type: "button",
        api: "account/add",
        icon: " fa fa-user-plus",
        text: "ADD",
        isPopup: true,
      },
    }),
      (this.api = "account"),
      (this.state = {
        isLoading: true,
        accountData: [],
      });
    this.child = React.createRef();
  }

  componentDidMount() {
    GetData("account").then((data) => {
      this.setState({
        accountData: (data.status === "success" && data.data) || [],
        isLoading: false,
      });
    });
  }

  render = () => {
    let config = {
      height: "100%",
      width: "100%",
      filterable: true,
      reorderable: true,
      sortable: true,
      // sort:true,
      pageSize: 5,
      // pageable:true,
      pageable: {
        skip: 0,
        // pageSize: 10,
        buttonCount: 3,
      },
      groupable: true,
      resizable: true,

      isDrillDownTable: true,

      column: [
        {
          title: "uuid",
          field: "uuid",
        },
        {
          title: "Logo",
          field: "logo",
        },

        {
          title: "Name",
          field: "name",
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
    };
    return (
      <div style={{ height: "inherit" }}>
        <TitleBar
          title="Manage Account"
          menu={this.props.menu}
          args={this.core}
        />
        <React.Suspense fallback={<div>Loading...</div>}>
          <div>
            {!this.state.isLoading && (
              <EOXGrid
                configuration={config}
                data={this.state.accountData}
                core={this.core}
                isDrillDownTable={this.props.drillDownRequired}
                actionItems={this.actionItems}
                api={this.api}
              />
            )}
          </div>
        </React.Suspense>
      </div>
    );
  };
}

export default Organization;
