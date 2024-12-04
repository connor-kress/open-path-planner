import { useState } from 'react'
import { Icon, LatLngExpression } from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import './App.css'

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
      <MyMap
        start={start}
        finish={finish}
        handleMapClick={handleMapClick}
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

function MyMap({ start, finish, handleMapClick }: {
  start: LatLngExpression | null,
  finish: LatLngExpression | null,
  handleMapClick: (e: {latlng: LatLngExpression}) => void,
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
      {start != null &&
        <Marker position={start} icon={redPin} key={0}>
          <Popup>Start</Popup>
        </Marker>
      }
      {finish != null &&
        <Marker position={finish} icon={purplePin} key={1}>
          <Popup>Finish</Popup>
        </Marker>
      }
      <MapClickHandler />
    </MapContainer>
  );
}

export default App
