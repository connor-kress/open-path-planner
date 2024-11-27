import { useEffect, useState } from 'react'

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
    </>
  )
}

export default App
