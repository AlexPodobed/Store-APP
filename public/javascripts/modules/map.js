import axios from 'axios';
import { $ } from './bling';

function loadPlaces(map, lat = 43.2, lng = -79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if (!places.length) {
                return;
            }
            const bounds = new google.maps.LatLngBounds();
            const infoWindow = new google.maps.InfoWindow();

            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            markers.forEach(marker => marker.addListener('click', function () {
                const html = `
                <div class="popup">
                     <a href="/store/${this.place.slug}">
                        <img src="/uploads/${this.place.photo || 'store.png'}" alt="">
                        <p>${this.place.name} - ${this.place.location.address}</p>
                     </a>
                </div>
                `
                infoWindow.setContent(html);
                infoWindow.open(map, this)
            }))

            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
}

const mapOptions = {
    center: {
        lat: 43.2,
        lng: -79.8
    },
    zoom: 8
};

function makeMap(mapDiv) {
    if (!mapDiv) return;

    const map = new google.maps.Map(mapDiv, mapOptions);
    const input = $('input[name="geolocate"]');
    loadPlaces(map);
    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const [lat, lng] = [place.geometry.location.lat(), place.geometry.location.lng()]
        loadPlaces(map, lat, lng);
    })
}

export default makeMap;