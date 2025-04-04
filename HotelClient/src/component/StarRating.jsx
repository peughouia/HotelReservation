import { useState } from "react";

const StarRating = ({ onRatingChange }) => {
  const [rating, setRating] = useState(0); // État pour stocker la note
  const [hover, setHover] = useState(0); // Gère l'effet de survol

  const handleClick = (value) => {
    setRating(value);
    onRatingChange(value); // Envoie la note au parent (API)
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          className={`text-3xl focus:outline-none transition ${
            (hover || rating) >= star ? "text-green-500" : "text-gray-300"
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★ 
        </button>
      ))}
    </div>
  );
};

export default StarRating;
