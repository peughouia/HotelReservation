import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../../context/AuthContext';
import Floatbottombar from '../../component/floatbar';
import RoomCarousel from '../../component/carroussel';
import FavoritButton from '../../component/FavoritButton';


export default function Acceuil() {

  const token = localStorage.getItem("accessToken")
  const { user, isLoading, isError, categories, rooms,favorites, refetch } = useAuth();
    if (isError) {
        return <p>Erreur de chargement</p>;
    }
  
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [priceRange, setPriceRange] = useState(50000); // Prix max sélectionné

  const handleResetFilter = () => {
    setSelectedCategory(null);
    setPriceRange(50000);
    // Ajoute ici d'autres actions, comme réinitialiser un état de filtrage par prix ou envoyer un event de tracking.
  };

  // Filtrer les chambres selon la catégorie sélectionnée et le prix max
  if (!rooms || isLoading) {
    return (<div className='w-full h-screen flex justify-center items-center'>
      <l-reuleaux
      size="100"
      stroke="15"
      stroke-length="0.25"
      bg-opacity="0.3"
      speed="1.3" 
      color="orange" 
    >
    </l-reuleaux>
    </div>);
  }

  const filteredRooms = rooms.filter((room) => {
    const isCategoryMatch = selectedCategory ? room.category.name === selectedCategory : true;
    const isPriceMatch = room.price_per_night <= priceRange;
    return isCategoryMatch && isPriceMatch;
  });


const isRoomFavorited = (roomId) => {
  return favorites?.some((fav) => fav.room === roomId);
};


  return (
    <div className='h-full w-screen p-3 flex flex-col '>
      <div className='w-full px-2 '> 
        <h1 className='flex justify-center text-2xl font-bold text-orange-500 pb-2'> Bienvenue {user? user.first_name:""}</h1>
        <input type="search" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)}
        className='w-full bg-white rounded-2xl shadow-md p-4'/>
      </div> 

      <div className='px-2 mt-1'>
        <label className="block text-lg font-bold">Prix max: {priceRange} FCFA</label>
          <input
            type="range"
            min="0"
            max="50000"
            value={priceRange}
            onChange={(e) => setPriceRange(Number(e.target.value))}
            className="w-full"
          />

        <div className='w-full mt-1 flex overflow-x-scroll scrollbar-hide whitespace-nowrap'>
        <button
          className="btn m-1 p-2 rounded-2xl bg-red-500 text-white ml-2"
          onClick={handleResetFilter}
        >
          Tout afficher
        </button>
        {categories? (categories.map(cat =>(
          <div className='m-1' key={cat.id}>
            <button
                className={`btn p-2 rounded-2xl transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-orange-500 text-white" // Bouton sélectionné
                    : "bg-gray-200 text-black" // Boutons non sélectionnés
                }`}
                onClick={() => setSelectedCategory(cat.name)}
              >
                {cat.name}
              </button>

            {/* <button className='btn btn-success p-2 rounded-2xl'>{cat.name}</button> */}
          </div>
        ))): <p>loading...</p>}
      </div>
      </div>

      
      <div className='mb-14'>
        {filteredRooms && filteredRooms.length > 0 ? (filteredRooms.map(room =>(
          <div className='my-4 border-b-2 border-gray-300' key={room.id}>
            <div className=" bg-white rounded-box max-w-md space-x-2  w-full h-3/4">
            {room.images? (
              <RoomCarousel room={room}/>
            ): <p>Aucune images trouvée</p>}
            </div>
            <div className='p-2'>
              <div className='flex justify-between'>
                <div className='font-bold text-2xl'>Room {room.room_number}</div>
                <div className='text-lg'>{room.rating<1?<span>Pas de note</span>:<span>Notée {room.rating} <FontAwesomeIcon icon={faStar} className='text-green-600' /></span>}</div>
              </div>
              <div className='text-2xl flex justify-between text-gray-500 mb-1 '> 
                <div><span className='font-bold'>{room.category.name}</span> Room</div>
                <div className='flex items-center'>
                  {token?(<FavoritButton roomId={room.id} isFavorited={isRoomFavorited(room.id)} onToggle={refetch}/>)
                  :(<div></div>)}
                </div>
              </div>
              <div className='text-xl text-gray-500 '> Actuellement {room.is_available?
                <div className="badge badge-success text-xl font-semibold text-white">Libre</div>
              :
                <div className="badge badge-error text-xl font-semibold text-white">Occuper</div>}
              </div>
              <div className='text-xl flex justify-between items-center'>
                <div>
                <span className='font-bold'>{room.price_per_night} FCFA</span> par Nuit
                </div>
                
                <div>
                  <Link to={`/detail/${room.slug}`}><button className="btn bg-orange-500 text-white text-xl">Voir</button></Link>
                </div>
              </div>
            </div>
          </div>
        ))): <div className='w-full h-screen flex justify-center mt-10 text-gray-500 font-bold text-2xl'>
              <p>Aucune chambre trouvée</p>
          </div>}
      </div>
      <Floatbottombar/>
    </div>
  )
}
