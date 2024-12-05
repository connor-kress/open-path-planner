import { useState } from 'react'
import { Icon, LatLng, LatLngExpression } from 'leaflet';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import './App.css'

async function fetchPathData(start: LatLng, finish: LatLng) {
  console.log(start);
  const url = `http://localhost:5000/api/path?lat1=${start.lat}&lon1=${start.lng}&lat2=${finish.lat}&lon2=${finish.lng}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function App() {
  const [isStart, setIsStart] = useState(true);

  function toggleStartSwitch() {
    if (!isStart) setIsStart(true);
  }

  function toggleEndSwitch() {
    if (isStart) setIsStart(false);
  }

  const [start, setStart] = useState<LatLngExpression | null>(null);
  const [finish, setFinish] = useState<LatLngExpression | null>(null);

  function handleMapClick(e: { latlng: LatLngExpression }) {
    if (isStart) {
      setStart(e.latlng);
    } else {
      setFinish(e.latlng);
    }
  }

  const [pathGeoData, setPathGeoData] = useState<[number, number][]| null>(null);
  const [pathDataLoading, setPathDataLoading] = useState(false);

  async function handleFindPath() {
    if (start === null || finish === null) {
      alert("Please select both endpoints by selecting the start and then finish checkboxes!");
      return;
    }
    setPathDataLoading(true);
    const data = await fetchPathData(start as LatLng, finish as LatLng);
    setPathGeoData(data.geoPath);
    setPathDataLoading(false);
    console.log(data);
  }

  return (
    <>
      <h2>Select Route:</h2>
      <label>
        Start
        <input
          type="checkbox"
          checked={isStart}
          onChange={toggleStartSwitch}
        />
      </label>
      <br/>
      <label>
        Finish
        <input
          type="checkbox"
          checked={!isStart}
          onChange={toggleEndSwitch}
        />
      </label>
      <br/>
      <button onClick={handleFindPath}>
        Find path
      </button>
      {pathDataLoading && <span> Loading...</span>}
      <MyMap
        start={start}
        finish={finish}
        handleMapClick={handleMapClick}
        pathGeoData={pathGeoData}
      />
    </>
  )
}

const redPin = new Icon({
  iconUrl: "/red-pin.png",
  iconSize: [38, 38], // measured in pixels
  iconAnchor: [38/2, 38], // anchor in the bottom middle
});

const purplePin = new Icon({
  iconUrl: "/purple-pin.png",
  iconSize: [38, 38],
  iconAnchor: [38/2, 38],
});

function MyMap({ start, finish, handleMapClick, pathGeoData }: {
  start: LatLngExpression | null,
  finish: LatLngExpression | null,
  handleMapClick: (e: {latlng: LatLngExpression}) => void,
  pathGeoData: [number, number][] | null,
}) {
  const centerPos: LatLngExpression = [29.648643, -82.349709];

  function MapClickHandler() {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  }

  return (
    <MapContainer style={{height: "100vh"}} center={centerPos}
                  zoom={16} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {start !== null &&
        <Marker position={start} icon={redPin} key={0}>
          <Popup>Start</Popup>
        </Marker>
      }
      {finish !== null &&
        <Marker position={finish} icon={purplePin} key={1}>
          <Popup>Finish</Popup>
        </Marker>
      }
      {pathGeoData !== null &&
        <Polyline positions={pathGeoData} color="blue"
                  weight={4} opacity={0.7} />
      }
      <MapClickHandler />
    </MapContainer>
  );
}

export default App
