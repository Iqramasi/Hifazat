import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthContext';
import './review.css';

function Review() {
  const { user } = useAuth();
  const [allMarkers, setAllMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Add refs for reviews
  const reviewRefs = useRef({});

  // Function to scroll to review
  const scrollToReview = (reviewId) => {
    if (reviewRefs.current[reviewId]) {
      reviewRefs.current[reviewId].scrollIntoView({ behavior: 'smooth' });
      setSelectedReviewId(reviewId);
      // Reset selection after 2 seconds
      setTimeout(() => setSelectedReviewId(null), 2000);
    }
  };

  useEffect(() => {
    const loadAllMarkers = async () => {
      const markersQuery = query(collection(db, 'markers'), orderBy('time', 'desc'));
      const querySnapshot = await getDocs(markersQuery);
      setAllMarkers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadAllMarkers();
  }, []);

  useEffect(() => {
    const loadReviews = async () => {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(reviewsQuery);
      setReviews(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    loadReviews();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 2 - images.length);
    setImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !newReview.trim() || !selectedMarker) return;
    setUploading(true);
    try {
      const newReviewData = {
        text: newReview,
        markerId: selectedMarker.id,
        userId: user.uid,
        createdAt: new Date(),
        rating: rating || null,
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, "reviews"), newReviewData);
      
      // Add to local state immediately
      setReviews(prevReviews => [{
        id: docRef.id,
        ...newReviewData
      }, ...prevReviews]);

      // Reset form
      setNewReview("");
      setImagePreviews([]);
      setImages([]);
      setRating(0);
      setSelectedMarker(null);
    } catch (err) {
      alert("Failed to submit review. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="neu-bg" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '1.5rem 1rem',
      gap: '1.5rem',
      background: '#fffdf0'
    }}>
      {/* Header Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px rgba(255, 193, 7, 0.10)',
          border: '2px solid #ffc107',
          padding: '1.5rem',
          width: '100%',
          textAlign: 'center',
          fontWeight: 'bold',
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: '#ffc107' }}>
            Share Your Experience
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#555' }}>
            Help others by sharing your thoughts about safe locations
          </div>
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        width: '100%',
      }}>
        <div style={{ 
          fontWeight: 700, 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          textAlign: 'center',
          background: '#fff',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.75rem',
          border: '2px solid #ffc107',
          boxShadow: '0 4px 24px rgba(255, 193, 7, 0.10)',
          color: '#ffc107'
        }}>
          Recent Reviews
        </div>
        <div style={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {reviews.map((review) => {
            const marker = allMarkers.find(m => m.id === review.markerId);
            return (
              <div
                key={review.id}
                ref={el => reviewRefs.current[review.id] = el}
                style={{
                  background: '#fff',
                  borderRadius: '1rem',
                  boxShadow: '0 4px 24px rgba(255, 193, 7, 0.10)',
                  border: '2px solid #ffc107',
                  padding: '1.25rem',
                  width: '100%',
                  fontSize: '1rem',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  transform: selectedReviewId === review.id ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selectedReviewId === review.id ? '0 8px 32px rgba(255, 193, 7, 0.15)' : '0 4px 24px rgba(255, 193, 7, 0.10)',
                }}
              >
                <div style={{fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.75rem', color: '#555'}}>{review.text}</div>
                <div style={{color: '#ffc107', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem'}}>
                  {marker ? marker.label : 'Unknown Location'}
                </div>
                {review.rating && (
                  <div style={{
                    color: '#555',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>Rating:</span>
                    <div style={{
                      display: 'flex',
                      gap: '0.25rem'
                    }}>
                      {[1,2,3,4,5].map(num => (
                        <span
                          key={num}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: '1px solid #ffc107',
                            background: num <= review.rating ? '#ffc107' : '#fff',
                            color: num <= review.rating ? '#111' : '#ffc107',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ color: '#888', fontWeight: 400, fontSize: '0.8rem' }}>
                  {review.createdAt?.toDate?.().toLocaleString?.() || ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Section */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '1rem',
          boxShadow: '0 4px 24px rgba(60,60,60,0.10)',
          border: '2px solid #111',
          padding: '1.5rem',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <form className="login-form" onSubmit={handleSubmitReview} style={{width:'100%', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <select
                value={selectedMarker?.id || ''}
                onChange={e => setSelectedMarker(allMarkers.find(m => m.id === e.target.value))}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #ffc107',
                  fontSize: '0.9rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffc107\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.75rem center',
                  backgroundSize: '1em'
                }}
              >
                {allMarkers.map(marker => (
                  <option key={marker.id} value={marker.id}>
                    {marker.label} - {marker.rating ? `${marker.rating}/5 (${marker.label})` : 'No rating'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <textarea
                value={newReview}
                onChange={e => setNewReview(e.target.value)}
                placeholder="Write your review..."
                required
                style={{ 
                  minHeight: '120px', 
                  resize: 'vertical', 
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #ffc107',
                  fontSize: '1rem',
                  backgroundColor: '#fffdf0',
                  boxShadow: '0 4px 12px rgba(255, 193, 7, 0.1)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            {/* Image Upload (Optional) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '0.5rem',
              padding: '1rem',
              background: '#fffdf0',
              borderRadius: '0.75rem',
              border: '2px solid #ffc107'
            }}>
              <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffc107' }}>Add Photos (Optional)</label>
              <div style={{ 
                display: 'flex', 
                gap: '0.75rem', 
                justifyContent: 'center'
              }}>
                {imagePreviews.map((src, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={src} alt="preview" style={{ width: 60, height: 60, borderRadius: '0.75rem', objectFit: 'cover', border: '2px solid #ffc107' }} />
                    <button type="button" onClick={() => handleRemoveImage(idx)} style={{
                      position: 'absolute', 
                      top: -6, 
                      right: -6, 
                      background: '#ffc107', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: 20, 
                      height: 20, 
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>×</button>
                  </div>
                ))}
                {images.length < 2 && (
                  <label style={{
                    width: 60, 
                    height: 60, 
                    border: '2px dashed #ffc107', 
                    borderRadius: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, background-color 0.2s',
                    backgroundColor: '#fffdf0'
                  }}>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    <span style={{ fontSize: 24, color: '#ffc107' }}>+</span>
                  </label>
                )}
              </div>
            </div>

            {/* Submit Button Container */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              padding: '0.75rem',
              background: '#fffdf0',
              borderRadius: '0.75rem',
              border: '2px solid #ffc107'
            }}>
              <button 
                type="submit" 
                disabled={uploading || !selectedMarker || !newReview.trim()} 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: '2px solid #ffc107',
                  background: '#ffc107',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  ':hover': {
                    transform: 'scale(1.02)',
                    boxShadow: '0 4px 12px rgba(255, 193, 7, 0.2)'
                  },
                  ':disabled': {
                    opacity: 0.7,
                    cursor: 'not-allowed',
                    background: '#ffe082'
                  }
                }}
              >
                {uploading ? (
                  <>
                    <span>Submitting...</span>
                    <span style={{ fontSize: '1.2rem' }}>⌛</span>
                  </>
                ) : (
                  <>
                    <span>Submit Review</span>
                    <span style={{ fontSize: '1.2rem' }}>📝</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Review;