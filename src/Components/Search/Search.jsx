import React from "react";
import "./Search.css";

export default function Search({
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  places,
  setPlaces,
  handleSearch,
}) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Enter Latitude"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter Longitude"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
      />
      <input
        type="text"
        placeholder="Search Place"
        value={places}
        onChange={(e) => setPlaces(e.target.value)}
      />
      <button onClick={handleSearch}>Search Nearby Places</button>
    </div>
  );
}
