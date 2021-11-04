import "./App.css";
import React, { Fragment, useEffect, useState} from "react";
//import { card } from "reactstrap";
import Dropdown from 'react-dropdown';
//import Select from 'react-select';
//import 'react-dropdown/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';


import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import {
  GoogleMap,
  useJsApiLoader,
  Circle,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
const places = [
  {
    id: 1,
    name: "Bengaluru",
    latitude: 12.972442,
    longitude: 77.580643,

    image: "images/bnglr.jpg",
    
    options: {
      strokeColor: "blue",
      fillColor: "blue"
    },
    circle: {
      radius: 3000,
      options: {
        strokeColor: "#ff0000"
      }
    }
  },
  
  {
    id: 2,
    name: "Marlton",
    latitude: 39.8912,
    longitude: 74.9218,

    image: "images/mysr.jpg",
    options: {
      strokeColor: "blue",
      fillColor:'blue'
    },
    circle : {
      radius: 3000,
      options: {
        strokeColor: "red"
      }
    }
  },

  {
    id: 3,
    name: "Columbia",
    latitude: 4.5709,
    longitude: 74.2973,

    image: "images/mysr.jpg",
    options: {
      strokeColor: "blue",
      fillColor:'blue'
    },
    circle : {
      radius: 3000,
      options: {
        strokeColor: "red"
      }
    }
  },
];


const containerStyle = {
  width: "auto",
  height: "400px",
};

const center = {
  lat: 13.347490,
  lng: 77.102170,
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
const dropdown = ['Bengaluru','Marlton','Columbia'];
 


const defaultOption = options[0];

function MyComponent() {
  
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3U9SDLkMeTovczI9CFZJrj6hZNS37ThA",
    libraries,
  
  });
  const[ddstate, drpdwnstate] = React.useState(null);
  const [map, setMap] = React.useState(null);
  const [marker, setMarker] = React.useState(null);
  const [radius, setRadius] = React.useState(null);
  const [showInfo, setShowInfo] = React.useState(false);
  const [subRad, setSubRad] = React.useState(null);
  const [markers, setMarkers] = React.useState(places);
  const value1 = {
    lat: ddstate,
    lng: ddstate,
  };
   
  const submit = () => {
    setSubRad(radius);
  };
  const mapRef = React.useRef();
  const onMapLoad = React.useCallback(map => {
    mapRef.current = map;
  }, []);
  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(8);
  }, []);

  console.log(radius);
  console.log(markers);
  const handleChange = event => {
    parseInt(setRadius(event.target.value));
  };
  const handleMarkerTap = showInfo => {
    if (showInfo === false) {
      setShowInfo(true);
    } else if (showInfo === true) {
      setShowInfo(false);
    }
  };

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {}, [markers]);
  const markerHandler = markers => {
    setMarkers([...markers]);
    console.log(markers);
  };
  const toggle = () => {
    setShowInfo(!showInfo);
  };
  console.log(showInfo);

  return isLoaded ? (
    <>
      <br />
      <>
      
      <input
        name="radius"
        style={{
          margin: "5px",
          padding: "5px",
          boxShadow: "2px 3px 5px 5px whitesmoke",
        }}
        value={radius}
        onChange={handleChange}
        placeholder="Enter Radius"
        
      />
      
    
   
    </>
    
    <br />
    
    {/* <button onClick={submit} >Submit</button> */}
      <br />
      <Search onMark={markerHandler} panTo={panTo} />
      <br />
      
      
     
    <div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={8}
        onLoad={onMapLoad}
      >
        <Dropdown
          options={dropdown} value={defaultOption} placeholder="Select an option"
          className="custom-select"
          onChange={(e) => {
            const selectedFood = e.value;
            drpdwnstate(selectedFood);
             
          }}
          />
          
    <p>Selected Value is: {ddstate}</p>
    
    
    {/*<p><b>Selected location is: </b> {ddstate}</p>*/}
    
  
          
    <br />
    
    {places.map(e => {
      if ( e.name === ddstate)
      return(
       
        <p>Latitude: {e.latitude} Longitude: {e.longitude}</p>
        
      ),
     <> 
    <Circle 
            center = {{
            lat: e.latitude,
            lng: e.longitude,
            }}
              radius={parseFloat(radius*1000)}
              options={{ fillColor: "red", strokeColor: "red" }}
            />
            
            <Marker
              key={e.id}
              zoom={10}
              fillColor={e.color}
              
              options={{ fillColor: "blue", strokeColor: "blue" }}
              strokeColor={e.color}
              fillColor={e.color}
              position={{lat: e.latitude, lng:e.longitude}}
              
              onMouseover={markers}
              onClick={() => {
                setMarker(e);
               
              }}
              
            />
            </>
           
          }
          
       
         
        
       )}
      
      
            

      
    {markers.map(place => (
        <>
            {/* <Marker
              key={place.id}
              zoom={8}
              fillColor={place.color}
              
              options={{ fillColor: "blue", strokeColor: "blue" }}
              strokeColor={place.color}
              fillColor={place.color}
              position={{ lat: place.latitude, lng: place.longitude }}
              onMouseover={markers}
              onClick={() => {
                setMarker(place);
               
              }}
              
            /> */}
         
         </>
         
      ))} 
        {marker ? (
          
          <InfoWindow 
            position={{ lat: marker.latitude, lng: marker.longitude }}
            
          >
            
          
            <>
              <img src={marker.image } alt=" "/> 
              <p>{marker.name}</p>
              <p>Latitude:{marker.latitude}</p>
              <p>Longitude:{marker.longitude}</p>
              
            </>
            
            
          </InfoWindow>

          
          
        ) : null}
        
         
      </GoogleMap>
      
      </div>
      </>
    
  ) : (
    <></>
  );
}
function Search(props) {
  const [searchMark, setSearchMark] = React.useState(places);
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 12.971599, lng: () => 77.594566 },
      radius: 200 * 100,
    },
  });
  const onMarkerChange = () => {
    props.onMark(searchMark);
  };
  console.log(searchMark);
  return (
    <div className="search">
      <Combobox
        onSelect={async address => {
          try {
            const results = await getGeocode({ address });
            const { lat, lng } = await getLatLng(results[0]);
            console.log(results[0].formatted_address);
            props.panTo({ lat, lng });
            console.log(lat, lng);
            setSearchMark(current => [
              ...current,
              {
                id: 5,
                name: results[0].formatted_address,
                latitude: lat,
                longitude: lng,
                options: {
                  strokeColor: "blue",
                  fillColor: "blue",
                },
                circle: {
                  radius: 3000,
                  options: {
                    strokeColor: "red",
                  },
                },
              },
            ]);
          } catch (error) {
            console.log(error);
          }
        }}
        onKeyPress={() => {
          onMarkerChange();
        }}
      >
        <ComboboxInput
          onChange={e => {
            setValue(e.target.value);
          }}
          placeholder="Enter Address"
        />
        
        <ComboboxPopover>
          {status === "OK" &&
            data.map(({ id, description }) => (
              <ComboboxOption key={id} value={description} />
            ))}
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}


export default React.memo(MyComponent);
