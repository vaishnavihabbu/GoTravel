
// mapboxgl.accessToken = mapToken;
// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     center: coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
//     zoom: 9 // starting zoom
//     });

// console.log(coordinates);
//     const marker = new mapboxgl.Marker({color:'red'})
//         .setLngLat(coordinates)
//         .setPopup(new mapboxgl.Popup({offset: 25})
//         .setHTML("<h4>Welcome to GoTravel!</h4><p>Exact location will be provided after booking.</p>"))
//         .addTo(map);

mapboxgl.accessToken = mapToken;
console.log(listing.geometry.coordinates);
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: "mapbox://styles/mapbox/streets-v12",
    center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 9 // starting zoom
});

const marker = new mapboxgl.Marker({ color: "#fe424d"})
.setLngLat(listing.geometry.coordinates) //listing.geometry.coordinates
.setPopup(new mapboxgl.Popup({offset: 25})
.setHTML(`<h5>${listing.title}</h5><p>Exact location will be provided after booking</p>`))
.addTo(map);