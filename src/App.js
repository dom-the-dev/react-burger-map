import {useState, useEffect} from "react";
import './App.css';
import axios from "axios";
import ReactMapGL, {Marker} from 'react-map-gl';
import burgerIcon from './burger.svg'

function App() {
    const MAPBOX_TOKEN = "pk.eyJ1IjoiZG9tLXRoZS1kZXYiLCJhIjoiY2tpOTJ6dnUxMDUyYTJzcmtqNHlrYTgzYSJ9.A0f6gvahojPYcwQAidMaow"
    const [loading, setLoading] = useState(true)
    const [selectedBurger, setSelectedBurger] = useState({name: 'Select Burger'})
    const [burgers, setBurgers] = useState(null)
    const [vieport, setVieport] = useState({})

    useEffect(() => {


        const fetchBurgers = async () => {
            let burgers = []
            const {data} = await axios.get("https://my-burger-api.herokuapp.com/burgers")

            for (const burger of data) {
                burger.latLong = await getLatLong(burger.addresses[0])
                burgers.push(burger)
            }

            setBurgers(burgers)
            setLoading(false)
        }

        fetchBurgers()
    });

    const getLatLong = async (address) => {
        const {line1, line2, number, postcode, country} = address;
        let searchKey = [line1, line2, number, postcode, country].filter(Boolean).join().replaceAll(" ", "&");

        const {data: {features}} = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchKey}.json?access_token=${MAPBOX_TOKEN}`)

        return features[0].center;
    }


    function renderBurgers() {
        return burgers.map(burger => (
            <Marker
                key={burger.id}
                latitude={burger.latLong[1]}
                longitude={burger.latLong[0]}
            >
                <div onClick={() => setSelectedBurger(burger)}>
                    <img width="40" src={burgerIcon} alt="burger"/>
                </div>
            </Marker>
        ))
    }


    if (loading) {
        return 'loading burgers..'
    }

    return (
        <div className="App">
            <div>
                <h1 style={{textAlign: 'center'}}>{selectedBurger.name}</h1>
            </div>
            {selectedBurger.description &&
            <div style={{
                position: 'absolute',
                width: 250,
                zIndex: 10,
                backgroundColor: 'rgba(255,255,255,0.6)',
                margin: 20,
                padding: 20,
                borderRadius: 15
            }}>
                {selectedBurger.description}

             <h5>{selectedBurger.addresses[0].country}</h5>
            </div>
            }
            <ReactMapGL
                {...vieport}
                width="100vw"
                height="100vh"
                onViewportChange={nextVieport => setVieport(nextVieport)}
                mapboxApiAccessToken={MAPBOX_TOKEN}
            >
                {renderBurgers()}
            </ReactMapGL>
        </div>
    );
}

export default App;
