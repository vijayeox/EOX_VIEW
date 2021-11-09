import { React, Notification, ReactBootstrap } from "oxziongui";
import merge from "deepmerge";
import osjs from "osjs";

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.core = this.props.core;
    this.userprofile = this.core.make("oxzion/profile").get();
    console.log(this.userprofile.key);
    this.state = {
      profileData: this.userprofile.key,
      kraData : []
    };
    this.helper = this.core.make("oxzion/restClient");
    this.mailTo = "mailto:" + this.state.profileData.email;
    this.tel = "tel:" + this.state.profileData.phone_number;
  }

  componentDidMount() {
    this.getByUserId().then((response) => {
      this.setState({
        kraData: response.data,
      });
    });
  }

  async getByUserId() {
    return await this.helper.request(
      "v1",
      "/kra/user/" + this.state.profileData.uuid,
      {},
      "get"
    );
  }

  getColor(color) {
    if (color === 'red')
      return 'danger'
    else if (color === 'yellow')
      return 'warning'
    else
      return 'success'
  }

  render() {
    return (
      <div className="myProfileDiv">
        <ReactBootstrap.CardColumns>
          {this.state.kraData.map((kra) => {
            return (
              <ReactBootstrap.Card 
                border="dark" 
                bg={this.getColor(kra.limit_achieved)}
                key={kra.uuid}
                text={'white'}>
                <ReactBootstrap.Card.Header style={{textAlign : 'center'}}>{kra.name}</ReactBootstrap.Card.Header>
                <ReactBootstrap.Card.Title style={{textAlign : 'center'}}>
                  {kra.goal_achieved}
                </ReactBootstrap.Card.Title>
              </ReactBootstrap.Card>
            );
          })}
        </ReactBootstrap.CardColumns>
      </div>
    );
  }
}

export default Profile;
