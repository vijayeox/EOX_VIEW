import React from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';
import './index.css';

mapboxgl.accessToken = 'pk.eyJ1IjoicmFrczA3IiwiYSI6ImNrc2EyNHltbTIybmcydnBoaXE0aDNiczIifQ.6YWWVlG659FRbsNFHU367Q';

export default class MapRender extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            lng: this.props.longitude,
            lat: this.props.latitude,
            zoom: 10,
            // summary: this.props.summary
        };
        this.mapContainer = React.createRef();
    }

    componentDidMount() {
        const { lng, lat, zoom } = this.state;
        const map = new mapboxgl.Map({
            container: this.mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        map.on('load', () => {
            console.log("New Summary: " + JSON.stringify(this.props.summary));
            map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': this.props.summary
                    }
                }
            });
            map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': this.props.color,
                    'line-width': 5
                }
            });
        });
        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });

    }
    render() {
        return (
            <div>
                <div className="sidebar">
                    Longitude: {this.state.lng} | Latitude: {this.state.lat} | Zoom: {this.state.zoom}
                </div>
                <div ref={this.mapContainer} className="map-container" />
            </div>
        );
    }
}
