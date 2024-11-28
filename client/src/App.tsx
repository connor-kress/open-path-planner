import { useEffect, useState } from 'react'
import { LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function App() {
  const [data, setData] = useState(null);
  async function fetchData() {
    console.log("Fetching data");
    let res = null;
    try {
      res = await fetch("http://localhost:5000");
      if (!res.ok) throw new Error("Response code is not 200");
    } catch (err) {
      console.log("Error fetching data");
      return;
    }
    console.log("Done fetching data");
    let jsonData = null;
    try {
      jsonData = await res.json();
    } catch (err) {
      const invalidJson = await res.text();
      console.log(`Invalid json ${invalidJson}`);
      return;
    }
    console.log(jsonData);
    setData(jsonData);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <h1>Data:</h1>
      {data ? (
        <p>Data loaded</p>
      ) : (
        <p>loading...</p>
      )}
      <MyMap />
    </>
  )
}

function MyMap() {
  const position: LatLngExpression = [29.648643, -82.349709];
  return (
    <MapContainer style={{height: "100vh"}} center={position} zoom={13} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          You can put any <code>html</code> in here <br/>
          <button>Test Btn</button>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default App
