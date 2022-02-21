import "./App.scss";
import React, { Fragment, useEffect, useState } from "react";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Container } from "react-bootstrap";
import Requests from "../../Requests";
import Geocode from "react-geocode";

Geocode.setApiKey("AIzaSyC3U9SDLkMeTovczI9CFZJrj6hZNS37ThA");

const containerStyle = {
  width: "auto",
  height: "400px",
};

const options = {
  strokeColor: "#FF0000",
  strokeOpacity: 0.8,
  strokeWeight: 2,
  fillColor: "#FF0000",
  fillOpacity: 0.35,
  clickable: false,
  draggable: false,
  editable: false,
  visible: true,
  radius: 30000,
  zIndex: 1,
};
const libraries = ["places"];
const defaultOption = options[0];

function CustomGoogleMapComponent(props) {

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3U9SDLkMeTovczI9CFZJrj6hZNS37ThA",
    libraries,
  });
  const [ddstate, drpdwnstate] = useState(null);

  const [marker, setMarker] = useState(null);
  const [radius, setRadius] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [subRad, setSubRad] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [place, setPlace] = useState([]);
  const [lat, setLat] = useState();
  const [log, setLog] = useState();
  const [zoom, setZoom] = useState(20);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let url = "/app/ff1ecbb7-3a45-4966-b38c-bf203f171423/command/delegate/GetContactAddress"
    Requests.doRestRequest(
      props.core,
      url,
      {},
      'get',
      function (response) {
        const places = [];
        response.addressData.forEach(function (item, index) {
          Geocode.fromAddress(item).then(
            (addr) => {
              const { lat, lng } = addr.results[0].geometry.location;
              let address = {
                id: index + 1,
                name: item,
                latitude: lat,
                longitude: lng,
              };
              places.push(address);
              setPlace(places);
              setMarkers(places);
              setOptions(places.map((p) => {
                return p.name
              }))
              setLoading(false);
            },
            (error) => {
              console.error("Geocoding error", error);
            }
          );
        });
      },
      function (error) {
        console.log("error " + error)
      });
  }, []);

  const handleChange = (e) => {
    place.map(i => {
      if (e.value === i.name) {
        setLat(i.latitude);
        setLog(i.longitude);
      }
    });
  };

  const center = {
    lat: lat,
    lng: log,
  };

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback(map => {
    mapRef.current = map;
  }, []);

  const handleChangeRadius = event => {

    parseInt(setRadius(event.target.value));
    if (radius >= 1000) {
      setZoom(2);
    } else if (radius === null || radius === undefined) {
      setZoom(20);
    } else if (radius >= 100) {
      setZoom(5);
    } else if (radius >= 10) {
      setZoom(8);
    } else if (radius >= 0.1) {
      setZoom(12);
    } else {
      setZoom(20);
    }
  };
  const handleMarkerTap = showInfo => {
    if (showInfo === false) {
      setShowInfo(true);
    } else if (showInfo === true) {
      setShowInfo(false);
    }
  };

  useEffect(() => { }, [markers]);

  const markerHandler = markers => {
    setMarkers([...markers]);
  };
  const toggle = () => {
    setShowInfo(!showInfo);
  };

  return isLoaded ? (
    <Container fluid>
      <div className="mt-4">
        <input
          name="radius"
          style={{
            margin: "5px 5px 5px 0px",
            padding: "5px 5px 5px 0px",
          }}
          value={radius}
          onChange={handleChangeRadius}
          placeholder="Enter Radius"
        />
        <Dropdown
          // options={place.map(i => {
          //   return <>{i.name}</>;
          // })}
          options={options}
          // value={defaultOption}
          placeholder="Select an option"
          onChange={handleChange}
          style={{ marginBottom: "20px" }} />
        {/*className="custom-select" */}

        <div className="mt-4">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            onLoad={onMapLoad}
          >
            <p>Selected Value is: {ddstate}</p>
            <br />
            {place.map(e => {
              if (e.name === ddstate)
                return (
                  <p>
                    Latitude: {e.latitude} Longitude: {e.longitude}
                  </p>
                );
            })}
            <Circle
              center={{
                lat: lat,
                lng: log,
              }}
              radius={parseFloat(radius * 1000)}
              options={{ fillColor: "red", strokeColor: "red" }}
            />

            {markers.map(place => (
              <>
                <Marker
                  key={place.id}
                  zoom={8}
                  options={{ fillColor: "blue", strokeColor: "blue" }}
                  // strokeColor={place.color}
                  // fillColor={place.color}
                  position={{ lat: place.latitude, lng: place.longitude }}
                  onMouseover={markers}
                  onClick={() => {
                    setMarker(place);
                  }}
                />
              </>
            ))}
            {marker ? (
              <InfoWindow
                position={{ lat: marker.latitude, lng: marker.longitude }}
              >
                <>
                  {/* <img src={marker.image} alt=" " /> */}
                  <p>{marker.name}</p>
                  <p>Latitude:{marker.latitude}</p>
                  <p>Longitude:{marker.longitude}</p>
                </>
              </InfoWindow>
            ) : null}
          </GoogleMap>
        </div>
      </div>

    </Container>
  ) : (
    <></>
  );
}

export default React.memo(CustomGoogleMapComponent);
