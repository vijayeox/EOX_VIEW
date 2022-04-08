import React from 'react';
import Swal from "sweetalert2";
import MapRender from './MapRender';

export default class Mapbox extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            lng: 0,
            lat: 0,
            zoom: 15,
            summary: [],
            driver: props.config.driver,
            trip: props.config.trip,
            fleet: props.config.fleet,
            color:props.config.color
        };
    }

    getTripSummary(driver, trip, fleet) {
        let ts = [];
        //Code to get the co-ordinates to the map route
        let url = "https://api.zendrive.com/v4/driver/" + driver + "/trip/" + trip + "?fields=simple_path";
        fetch(url,
            {
                method: 'get',
                headers: new Headers({
                    'Authorization': "APIKEY " + fleet,
                    'Content-Type': 'application/x-www-form-urlencoded'
                })
            }
        ).then((response) => {
            if (response.ok) {
                return response.json();
            }
        }).then((data) => {
            if (data.trip_id == trip) {
                if (data.simple_path) {
                    let i = 0;
                    data.simple_path.map(co => {
                        //Code to set the map view for the initial position of the map
                        if (i === 0) {
                            // lat = co.latitude;
                            // lng = co.longitude;
                            this.setState({ lng: co.longitude, lat: co.latitude })
                        }
                        i++;
                        ts.push([co.longitude, co.latitude ])
                    });
                    this.setState({ summary: ts });
                }
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Could not get the trip summary information! ",
                });
                return null;
            }
        });
        return null;
    }

    componentDidMount() {
        let mapData = this.props.data[0];
        if (mapData[this.state.driver] !== null && mapData[this.state.trip] !== null) {
            this.getTripSummary(mapData[this.state.driver], mapData[this.state.trip], mapData[this.state.fleet]);
        }
    }

    render() {
        return (
            <div>
                <MapRender
                    latitude={this.state.lat} key={Math.random()} longitude={this.state.lng} summary={this.state.summary} color={this.state.color} data={this.props.data} canvasElement={this.props.canvasElement}
                />
            </div>
        );
    }
}
