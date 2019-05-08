import React from "react";
import { Dialog, DialogActionsBar } from "@progress/kendo-react-dialogs";
import { Validator } from "@progress/kendo-validator-react-wrapper";
import { Button } from '@progress/kendo-react-buttons';
import "@progress/kendo-ui";

export default class DialogContainer extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.args;
    this.state = {
      orgInEdit: this.props.dataItem || null,
      visibleDialog: false,
      show: false
    };
  }

  componentDidMount() {
    M.AutoInit();
    M.updateTextFields();
  }

  async pushData() {
    let helper = this.core.make("oxzion/restClient");
    let orgAddData = await helper.request(
      "v1",
      "/organization",
      {
        name: this.state.orgInEdit.name,
        address: this.state.orgInEdit.address,
        city: this.state.orgInEdit.city,
        state: this.state.orgInEdit.state,
        zip: this.state.orgInEdit.zip,
        permission_allowed: "15",
        logo: this.state.orgInEdit.logo,
        languagefile: this.state.orgInEdit.languagefile
      },
      "post"
    );
    return orgAddData;
  }

  async editOrganization() {
    let helper = this.core.make("oxzion/restClient");
    let orgEditData = await helper.request(
      "v1",
      "/organization/" + this.state.orgInEdit.id,
      {
        name: this.state.orgInEdit.name,
        address: this.state.orgInEdit.address,
        city: this.state.orgInEdit.city,
        state: this.state.orgInEdit.state,
        zip: this.state.orgInEdit.zip,
        logo: this.state.orgInEdit.logo,
        languagefile: this.state.orgInEdit.languagefile
      },
      "put"
    );
    return orgEditData;
  }

  onDialogInputChange = event => {
    let target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.props ? target.props.name : target.name;

    const edited = this.state.orgInEdit;
    edited[name] = value;

    this.setState({
      orgInEdit: edited
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.submitData();
  };

  submitData = event => {
    if (this.props.formAction == "edit") {
      this.editOrganization().then(response => {
        var addResponse = response.status;
        this.props.action(addResponse);
      });
    } else {
      this.pushData().then(response => {
        this.props.action(response.status);
      });
    }
    this.props.cancel();
  };

  render() {
    return (
      <Validator>
        <Dialog onClose={this.props.cancel}>
          <div className="row">
            <form
              className="col s12"
              onSubmit={this.submitData}
              id="organizationForm"
            >
              <div className="row">
                <div className="input-field col s12">
                  <input
                    id="organizationName"
                    type="text"
                    name="name"
                    value={this.state.orgInEdit.name || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationName">Organization Name</label>
                </div>
              </div>

              <div className="row">
                <div className="input-field col s12">
                  <textarea
                    id="organizationAddress"
                    type="text"
                    className="materialize-textarea"
                    name="address"
                    value={this.state.orgInEdit.address || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationAddress">Address</label>
                </div>
              </div>

              <div className="row">
                <div className="input-field col s6">
                  <input
                    id="organizationCity"
                    type="text"
                    name="city"
                    value={this.state.orgInEdit.city || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationCity">City</label>
                </div>

                <div className="input-field col s6">
                  <input
                    id="organizationState"
                    type="text"
                    name="state"
                    value={this.state.orgInEdit.state || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationState">State</label>
                </div>
              </div>

              <div className="row">
                <div className="input-field col s12">
                  <input
                    id="organizationZip"
                    type="number"
                    name="zip"
                    value={this.state.orgInEdit.zip || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationZip">Zip Code</label>
                </div>
              </div>

              <div className="row">
                <div className="input-field col s12">
                  <input
                    id="organizationLogo"
                    type="text"
                    name="logo"
                    value={this.state.orgInEdit.logo || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationLogo">Logo</label>
                </div>
              </div>

              <div className="row">
                <div className="input-field col s12">
                  <input
                    id="organizationLang"
                    type="text"
                    name="languagefile"
                    value={this.state.orgInEdit.languagefile || ""}
                    onChange={this.onDialogInputChange}
                    required={true}
                  />
                  <label htmlFor="organizationLang">Language</label>
                </div>
              </div>
            </form>
          </div>

          <DialogActionsBar args={this.core}>
            <Button className="k-button k-primary" primary={true} type="submit" form="organizationForm">
              Submit
            </Button>
            <Button onClick={this.props.cancel}>
              Cancel
            </Button>
          </DialogActionsBar>
        </Dialog>
      </Validator>
    );
  }
}
