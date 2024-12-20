import React, { useEffect, useRef, useState } from "react";
import { loadModules } from "esri-loader";
import Search from "./Search/Search";

const NearbyPlacesMap = () => {
  const mapRef = useRef(null);
  const [latitude, setLatitude] = useState("39.952583");
  const [longitude, setLongitude] = useState("-75.165222");
  const [view, setView] = useState(null);
  const [places, setPlaces] = useState("");

  useEffect(() => {
    // Initialize the map when the component loads
    loadModules(
      [
        "esri/Map",
        "esri/views/MapView",
        "esri/rest/locator",
        "esri/Graphic",
        "esri/widgets/Search",
        "esri/widgets/Home",
        "esri/widgets/Legend",
        "esri/layers/GeoJSONLayer",
      ],
      {
        css: true,
        version: "4.25",
      }
    )
      .then(
        ([
          Map,
          MapView,
          locator,
          Graphic,
          Home,
          Search,
          Legend,
          GeoJSONLayer,
        ]) => {
          const map = new Map({
            basemap: "streets-navigation-vector",
          });

          const mapView = new MapView({
            container: mapRef.current,
            map: map,
            center: [longitude, latitude],
            zoom: 10,
          });

          const geojsonLayer = new GeoJSONLayer({
            url: "https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/LATEST_CORE_SITE_READINGS/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson",
            popupTemplate: {
              title: "{SITE_NAME}", 
              content: `
              <b>Address:</b> {SITE_ADDRESS} <br />
              <b>PM2.5 (ug/m3):</b> {PM25_UG_M3} <br />
              <b>Sample Hour:</b> {SAMPLE_HOUR}
            `,
            },
            renderer: {
              type: "simple", 
              symbol: {
                type: "simple-marker",
                color: "#46ebd5", 
                outline: {
                  color: "#0fb8a1", 
                  width: 1, 
                },
              },
            },
          });

          map.add(geojsonLayer);

          const legend = new Legend({
            view: mapView,
            layerInfos: [
              {
                layer: geojsonLayer,
                title: "GeoJSON Data Points",
              },
            ],
          });
          mapView.ui.add(legend, "bottom-right");

          const searchWidget = new Search({
            view: mapView,
          });
          mapView.ui.add(searchWidget, "top-left");

          const home = new Home({ view: mapView });
          mapView.ui.add(home, "top-right");

          setView(mapView); 
        }
      )
      .catch((err) => console.error("Error loading modules:", err));

    return () => {
      if (view) {
        view.destroy();
      }
    };
  }, [latitude, longitude, view]);

  const handleSearch = () => {
    if (!latitude || !longitude) {
      alert("Please enter both latitude and longitude.");
      return;
    }

    loadModules(["esri/rest/locator", "esri/Graphic"])
      .then(([locator, Graphic]) => {
        const locatorUrl =
          "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";

        const params = {
          location: {
            x: parseFloat(longitude),
            y: parseFloat(latitude),
            spatialReference: { wkid: 4326 },
          },
          categories: [places], 
          maxLocations: 20, 
          outFields: ["PlaceName", "Place_addr"],
        };

        locator
          .addressToLocations(locatorUrl, params)
          .then((results) => {
            if (results.length === 0) {
              alert("No places found nearby.");
              return;
            }

            view.graphics.removeAll();
            results.forEach((result) => {
              const point = {
                type: "point",
                longitude: result.location.x,
                latitude: result.location.y,
              };

              const symbol = {
                type: "simple-marker",
                color: "blue",
                size: "12px",
              };

              const graphic = new Graphic({
                geometry: point,
                symbol: symbol,
                attributes: result.attributes,
                popupTemplate: {
                  title: "{PlaceName}",
                  content: "{Place_addr}",
                },
              });

              view.graphics.add(graphic);
            });

            view.goTo({
              center: [parseFloat(longitude), parseFloat(latitude)],
              zoom: 10,
            });
          })
          .catch((err) => console.error("Error with Locator:", err));
      })
      .catch((err) => console.error("Error loading locator:", err));
  };

  return (
    <div>
      <Search
        handleSearch={handleSearch}
        latitude={latitude}
        longitude={longitude}
        setLatitude={setLatitude}
        setLongitude={setLongitude}
        places={places}
        setPlaces={setPlaces}
      />
      <div style={{ height: "92vh", width: "100%" }}>
        <div ref={mapRef} style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
};

export default NearbyPlacesMap;
