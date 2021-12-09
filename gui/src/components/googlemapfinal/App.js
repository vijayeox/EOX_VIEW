import "./App.css";
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
const places = [
  {
    id: 1,
    name: "IHC Group,96 Cummings Point Road Stamford CT 6902 US",
    latitude: 41.02703,
    longitude: -73.55351,

    image: "images/bnglr.jpg",

    options: {
      strokeColor: "blue",
      fillColor: "blue",
    },
    circle: {
      radius: 3000,
      options: {
        strokeColor: "#ff0000",
      },
    },
  },

  {
    id: 2,
    name: "IMA Colorado, 1705 17th Street, Denver, CO 80202, USA",
    latitude: 39.75375275167211,
    longitude: -104.99896465889545,

    image: "images/mysr.jpg",
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

  {
    id: 3,
    name: "Missouri Employers Mutual Insurance, 101 North Keene Street, Columbia, MO 65201, USA",
    latitude: 38.95039,
    longitude: -92.29174,

    image: "images/mysr.jpg",
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
  {
    id: 4,
    name: "Insurance Office Of America, 1855 West State Road 434, Longwood, FL 32750, USA",
    latitude: 28.692830060099194,
    longitude: -81.38701774049494,

    image: "images/mysr.jpg",
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
  {
    id: 5,
    name: "ULLICO Insurance, 1625 I Street NW Washington DC 20006 US",
    latitude: 38.901477661942344,
    longitude: -77.03756899544028,

    image: "images/mysr.jpg",
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
  {
    id: 6,
    name: "Marshall & Sterling Insurance, 110 Main Street, Poughkeepsie, NY 12601, USA",
    latitude: 41.70524877539541,
    longitude: -73.93461921781656,

    image: "images/mysr.jpg",
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
  {
    id: 7,
    name: "Hays Companies, 80 S 8th St UNIT 700, Minneapolis, MN 55402, United States",
    latitude: 44.97632427304173,
    longitude: -93.27183520015177,

    image: "images/mysr.jpg",
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
  {
    id: 8,
    name: "Cross Insurance, 491 Main Street Bangor ME 4401 US",
    latitude: 44.78973080959523,
    longitude: -68.7776404227043,

    image: "images/mysr.jpg",
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
  {
    id: 9,
    name: "CopperPoint Mutual Insurance, 3030 N 3rd Street Phoenix AZ 85012 US",
    latitude: 33.48340454236773,
    longitude: -112.06994717295,

    image: "images/mysr.jpg",
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
  {
    id: 10,
    name: "Farm Bureau Insurance of Michigan, 7373 W Saginaw Highway Lansing MI 48917 US 7373 w saginaw highway lansing mi 48917 us",
    latitude: 42.74008962783502,
    longitude: -84.65708274355198,

    image: "images/mysr.jpg",
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
  {
    id: 11,
    name: "Farmers Mutual Hail Insurance Company of Iowa, 6785 Westown Parkway West Des Moines IA 50266 US",
    latitude: 41.59605245154647,
    longitude: -93.80214032944774,

    image: "images/mysr.jpg",
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
  {
    id: 12,
    name: "RSUI Group, 945 East Paces Ferry Road Suite 1800 Atlanta GA 30326 US",
    latitude: 33.84647337608772,
    longitude: -84.35617911792147,

    image: "images/mysr.jpg",
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
  {
    id: 13,
    name: "National Indemnity Company, 1314 Douglas Street Suite 1400 Omaha NE 68102 US",
    latitude: 41.259077162898635,
    longitude: -95.93385793879955,

    image: "images/mysr.jpg",
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
  {
    id: 15,
    name: "GAINSCO Auto Insurance, 3333 Lee Parkway #1200, Dallas, TX 75219, USA",
    latitude: 32.809373472686644,
    longitude: -96.80528467065552,

    image: "images/mysr.jpg",
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
  {
    id: 16,
    name: "AAA Ohio Auto Club, 90 E Wilson Bridge Road Worthington OH 43085 US",
    latitude: 40.109154691583356,
    longitude: -83.01591500000002,

    image: "images/mysr.jpg",
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
  {
    id: 17,
    name: "NORCAL Mutual, 575 Market Street Suite 1000 San Francisco CA 94105 US",
    latitude: 37.78955209288316,
    longitude: -122.40031414114138,

    image: "images/mysr.jpg",
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
  {
    id: 18,
    name: "Zito Insurance Agency, 8339 Tyler Blvd Ohio US",
    latitude: 41.6841615354835,
    longitude: -81.34303642242105,

    image: "images/mysr.jpg",
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
  {
    id: 19,
    name: "PWC(Private Company Services) 200 Public Square Cleveland Ohio US",
    latitude: 41.50003109594892,
    longitude: -81.69177713532255,
    image: "images/mysr.jpg",
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
  {
    id: 20,
    name: "Peoples Services, Inc., Kimball Road Southeast, Canton, OH, USA",
    latitude: 40.77313827932548,
    longitude: -81.38109640220955,
    image: "images/mysr.jpg",
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
  {
    id: 21,
    name: "Morgan Engineering, 1049 South Mahoning Avenue, Alliance, OH, USA",
    latitude: 40.91135306851379,
    longitude: -81.0870820688778,
    image: "images/mysr.jpg",
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
  {
    id: 22,
    name: "Marsh, 200 Square Cleveland OH, US",
    latitude: 41.49997137004337,
    longitude: -81.69219161655273,

    image: "images/mysr.jpg",
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
  {
    id: 23,
    name: "MAGNET: The Manufacturing Advocacy and Growth Network, 1768 E 25th St, Cleveland, OH, USA",
    latitude: 41.50601313717437,
    longitude: -81.67211469145019,

    image: "images/mysr.jpg",
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
  {
    id: 24,
    name: "Contract Review Advisers, 7 W St Clair Ave, Cleveland, OH, USA",
    latitude: 41.50189483558861,
    longitude: -81.69438143107422,

    image: "images/mysr.jpg",
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
  {
    id: 25,
    name: "ChromaScape, 2055 Enterprise Parkway, Twinsburg, OH, USA",
    latitude: 41.29261714538369,
    longitude: -81.44483848524523,

    image: "images/mysr.jpg",
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
  {
    id: 26,
    name: "Hyperscience, Fulton Street, New York, NY, USA",
    latitude: 40.71300743730904,
    longitude: -74.01316954518781,

    image: "images/mysr.jpg",
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
  {
    id: 27,
    name: "Ninety Consulting, Eastcheap, London, UK",
    latitude: 51.510568778249066,
    longitude: -0.08256006434035326,

    image: "images/mysr.jpg",
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
  {
    id: 28,
    name: "CPC Logistics Inc, 14528 S Outer Forty Rd, Chesterfield, MO, USA",
    latitude: 38.64360004321269,
    longitude: -90.52030373262293,

    image: "images/mysr.jpg",
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
  {
    id: 29,
    name: "Zetec Inc, 8226 Bracken Place Southeast, Snoqualmie, WA, USA",
    latitude: 47.526983848040075,
    longitude: -121.8673617257928,

    image: "images/mysr.jpg",
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
  {
    id: 30,
    name: "MEMIC, Commercial Street, Portland, ME, USA",
    latitude: 43.65503224972327,
    longitude: -70.25558778233727,

    image: "images/mysr.jpg",
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
  {
    id: 31,
    name: "Camp David Inc., 7920 Foster Street, Overland Park, KS, USA",
    latitude: 38.98528258220716,
    longitude: -94.67247143258454,

    image: "images/mysr.jpg",
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
  //40.77314810253639, -81.38109577231508
];

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

function CustomGoogleMapComponent() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyC3U9SDLkMeTovczI9CFZJrj6hZNS37ThA",
    libraries,
  });
  const [ddstate, drpdwnstate] = React.useState(null);

  const [marker, setMarker] = React.useState(null);
  const [radius, setRadius] = React.useState(null);
  const [showInfo, setShowInfo] = React.useState(false);
  const [subRad, setSubRad] = React.useState(null);
  const [markers, setMarkers] = React.useState(places);

  const [place, setPlace] = useState(places);
  const [lat, setLat] = useState(place[0].latitude);
  const [log, setLog] = useState(place[0].longitude);
  const [zoom, setZoom] = useState(20);

  const handleChage = e => {
    place.map(i => {
      if (e.value.props.children === i.name) {
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
    <div className="mt-4">
      <input
        name="radius"
        style={{
          margin: "5px",
          padding: "5px",
        }}
        value={radius}
        onChange={handleChangeRadius}
        placeholder="Enter Radius"
      />
      <Dropdown
        options={place.map(i => {
          return <>{i.name}</>;
        })}
        value={defaultOption}
        placeholder="Select an option"
        onChange={handleChage}
        style={{ marginBottom: "20px" }}
      />
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
                fillColor={place.color}
                options={{ fillColor: "blue", strokeColor: "blue" }}
                strokeColor={place.color}
                fillColor={place.color}
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
  ) : (
    <></>
  );
}

export default React.memo(CustomGoogleMapComponent);
