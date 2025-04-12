import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const RoomCarousel = ({ room }) => {
  const images = room.images;
  const baseUrlImage = "http://192.168.1.110:8000";
  //const baseUrlImage = "http://127.0.0.1:8000";
  const [imageIndex, setImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return <p>Aucune image disponible pour cette chambre.</p>;
  }

  const getImageSrc = (imagePath) => {
    if (!imagePath) return ''; // si l'image n'existe pas
  
    // Vérifie si le chemin est déjà une URL complète
    const isFullUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
    return isFullUrl ? imagePath : baseUrlImage + imagePath;
  };

  const prevImage = () => {
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Image Active */}
      <div className="relative flex items-center justify-center w-full h-64 overflow-hidden">
        <motion.img
          key={imageIndex}
          src={getImageSrc(images[imageIndex].image)}
          alt={`Image ${imageIndex + 1}`}
          className="w-full h-full object-cover rounded-lg shadow-lg"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
        />

        {/* Indicateurs sur l'image */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 px-2 py-1 rounded-full">
          {images.map((_, index) => (
            <div key={index} className={`w-3 h-3 rounded-full transition-all duration-300 ${imageIndex === index ? "bg-white scale-125" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>

      {/* Flèches de Navigation */}
      <button onClick={prevImage} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">
        <ChevronLeft size={24} />
      </button>
      <button onClick={nextImage} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">
        <ChevronRight size={24} />
      </button>
    </div>
  );
};

export default RoomCarousel;
