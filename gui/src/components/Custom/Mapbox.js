import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import ReactDOM from 'react-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
// import 'mapbox-gl-direction-location/dist/mapbox-gl-directions.css';
import './index.css';
// import MapboxDirections from "mapbox-gl-direction-location/dist/mapbox-gl-directions"
mapboxgl.accessToken = 'pk.eyJ1IjoicmFrczA3IiwiYSI6ImNrc2EyNHltbTIybmcydnBoaXE0aDNiczIifQ.6YWWVlG659FRbsNFHU367Q';

export default function Mapbox() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-122.483696);
    const [lat, setLat] = useState(37.833818);
    const [zoom, setZoom] = useState(15);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom
        });
    });

    useEffect(() => {
        if (!map.current) return; // wait for map to initialize
        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(15));
        });

        const marker = new mapboxgl.Marker()
            .setLngLat([-122.483568, 37.832056])
            .addTo(map.current);

            
        map.current.on('load', () => {
            map.current.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': [
                            [-122.483696, 37.833818],
                            [-122.483482, 37.833174],
                            [-122.483396, 37.8327],
                            [-122.483568, 37.832056],
                            [-122.48404, 37.831141],
                            [-122.48404, 37.830497],
                            [-122.483482, 37.82992],
                            [-122.483568, 37.829548],
                            [-122.48507, 37.829446],
                            [-122.4861, 37.828802],
                            [-122.486958, 37.82931],
                            [-122.487001, 37.830802],
                            [-122.487516, 37.831683],
                            [-122.488031, 37.832158],
                            [-122.488889, 37.832971],
                            [-122.489876, 37.832632],
                            [-122.490434, 37.832937],
                            [-122.49125, 37.832429],
                            [-122.491636, 37.832564],
                            [-122.492237, 37.833378],
                            [-122.493782, 37.833683]
                        ]
                    }
                }
            });
            map.current.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#888',
                    'line-width': 4
                }
            });
        });
    });

    return (
        <div>
            <div className="sidebar">
                Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
            </div>
            <div ref={mapContainer} className="map-container" />
        </div>
    );







    // const mapContainer = useRef(null);
    // const map = useRef(null);
    // const [lng, setLng] = useState(-70.9);
    // const [lat, setLat] = useState(42.35);
    // const [zoom, setZoom] = useState(9);

    // useEffect(() => {
    //     if (map.current) return; // initialize map only once
    //     map.current = new mapboxgl.Map({
    //         container: mapContainer.current,
    //         style: 'mapbox://styles/mapbox/streets-v11',
    //         center: [lng, lat],
    //         zoom: zoom
    //     });

    // map.current.addControl(
    //     new MapboxDirections({
    //         accessToken: mapboxgl.accessToken
    //     }),
    //     'top-left'
    // );
    // const map = new mapboxgl.Map({
    //     container: mapContainer.mapWrapper,
    //     style: 'mapbox://styles/mapbox/streets-v10',
    //     center: [-73.985664, 40.748514],
    //     zoom: 12
    // });

    // const directions = new MapboxDirections({
    //     accessToken: mapboxgl.accessToken,
    //     unit: 'metric',
    //     profile: 'mapbox/driving'
    // });

    // map.addControl(directions, 'top-left');
    // });

    // useEffect(() => {
    //     if (!map.current) return; // wait for map to initialize
    //     map.current.on('move', () => {
    //         setLng(map.current.getCenter().lng.toFixed(4));
    //         setLat(map.current.getCenter().lat.toFixed(4));
    //         setZoom(map.current.getZoom().toFixed(2));
    //     });
    // });

    // return (
    //     <div>
    //         <div className="sidebar">
    //             Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
    //         </div>
    //         <div ref={mapContainer} className="map-container" />
    //     </div>
    // );
}