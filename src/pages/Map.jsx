import React, { useCallback, useRef, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '450px',
  borderRadius: '16px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
};

const center = {
  lat: 28.6139, // Default to New Delhi, change as needed
  lng: 77.2090
};

const ratingColors = {
  1: 'red',
  2: 'orange',
  3: 'yellow',
  4: 'blue',
  5: 'green',
};

const ratingLabels = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Average',
  4: 'Good',
  5: 'Excellent',
};

function Maps() {
  const [markers, setMarkers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pendingMarker, setPendingMarker] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [selectedRating, setSelectedRating] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBOGB2hIIj87TVxQoJcK2Hl5R5CSmTjlKA"
  });

  // Load all markers from Firebase when component mounts
  useEffect(() => {
    const loadAllMarkers = async () => {
      try {
        const markersQuery = query(collection(db, 'markers'), orderBy('time', 'desc'));
        const querySnapshot = await getDocs(markersQuery);
        const loadedMarkers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          time: doc.data().time.toDate()
        }));
        console.log('Loaded markers:', loadedMarkers.length);
        setMarkers(loadedMarkers);
        setConnectionStatus('Connected to Firebase!');
      } catch (error) {
        console.error("Error loading markers:", error);
        setConnectionStatus('Error connecting to Firebase');
      }
    };

    loadAllMarkers();
  }, []); // Empty dependency array means this runs once when component mounts

  const onMapClick = useCallback((event) => {
    setPendingMarker({
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      time: new Date(),
    });
    setShowModal(true);
  }, []);

  const saveMarkerToFirebase = async (marker) => {
    try {
      const markerData = {
        ...marker,
        time: marker.time,
        review: reviewText,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'markers'), markerData);
      return docRef.id;
    } catch (error) {
      console.error("Error saving marker:", error);
      return null;
    }
  };

  const handleRating = async (rating) => {
    setSelectedRating(rating);
  };

  const handleSave = async () => {
    if (!selectedRating) {
      alert('Please select a rating first');
      return;
    }

    // Close modal immediately
    setShowModal(false);
    setPendingMarker(null);
    setReviewText('');
    setSelectedRating(null);

    const marker = {
      ...pendingMarker,
      rating: selectedRating,
      color: ratingColors[selectedRating],
      label: ratingLabels[selectedRating],
      review: reviewText
    };
    
    try {
      const markerId = await saveMarkerToFirebase(marker);
      if (markerId) {
        const newMarker = { ...marker, id: markerId };
        setMarkers((current) => [...current, newMarker]);
        // Navigate to review page after saving
        navigate('/review', { state: { marker: newMarker } });
      }
    } catch (error) {
      console.error("Error saving marker:", error);
      alert("Failed to save marker. Please try again.");
    }
  };

  const handleReviewClick = (marker) => {
    navigate('/review', { state: { marker } });
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="p-6 text-center min-h-screen bg-pink-100" style={{ position: 'relative' }}>
      <h2 className="text-2xl font-bold mb-4">Find Us on the Map</h2>
      <div className="mb-4 p-2 bg-white rounded shadow">
        <p className="text-sm">
          Database Status: <span className={connectionStatus.includes('Error') ? 'text-red-500' : 'text-green-500'}>
            {connectionStatus}
          </span>
        </p>
        <p className="text-sm mt-2">
          Total Markers: {markers.length}
        </p>
      </div>
      <Legend />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
        onClick={onMapClick}
        onLoad={map => (mapRef.current = map)}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={{ lat: marker.lat, lng: marker.lng }}
            icon={{
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 5,
              fillColor: marker.color,
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: '#333',
            }}
            onClick={() => handleReviewClick(marker)}
          />
        ))}
        {selectedMarker && (
          <InfoWindow
            position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div>
              <div><b>Rating:</b> {selectedMarker.rating} - {selectedMarker.label}</div>
              <div><b>Time:</b> {selectedMarker.time.toLocaleString()}</div>
              <div><b>Review:</b> {selectedMarker.review || 'No review yet'}</div>
              <button 
                onClick={() => handleReviewClick(selectedMarker)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Write Review
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
      {showModal && (
        <RatingModal 
          onSelect={handleRating}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setReviewText('');
            setSelectedRating(null);
          }}
          reviewText={reviewText}
          setReviewText={setReviewText}
          selectedRating={selectedRating}
        />
      )}
    </div>
  );
}

function RatingModal({ onSelect, onSave, onClose, reviewText, setReviewText, selectedRating }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 260, textAlign: 'center' }}>
        <h3 className="text-xl font-bold mb-4">Rate and Review Location</h3>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '18px 0' }}>
          {[1,2,3,4,5].map(rating => (
            <button
              key={rating}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none',
                background: selectedRating === rating ? ratingColors[rating] : '#eee',
                color: selectedRating === rating ? '#fff' : '#333',
                fontWeight: 700, fontSize: 18, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
              }}
              onClick={() => onSelect(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
        <div style={{ marginBottom: 12 }}>
          {Object.entries(ratingLabels).map(([num, label]) => (
            <div key={num} style={{ fontSize: 13, color: ratingColors[num], fontWeight: 600 }}>
              {num}: {label}
            </div>
          ))}
        </div>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review here..."
          style={{
            width: '100%',
            minHeight: '100px',
            marginBottom: '12px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            onClick={onSave}
            style={{ 
              background: '#4CAF50', 
              color: 'white',
              border: 'none', 
              borderRadius: 6, 
              padding: '8px 24px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Save & Continue
          </button>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#eee', 
              border: 'none', 
              borderRadius: 6, 
              padding: '8px 24px', 
              cursor: 'pointer' 
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginBottom: 18 }}>
      {Object.entries(ratingColors).map(([num, color]) => (
        <div key={num} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: color, border: '1px solid #333' }}></span>
          <span style={{ fontSize: 13, color: '#333' }}>{ratingLabels[num]}</span>
        </div>
      ))}
    </div>
  );
}

export default Maps;
