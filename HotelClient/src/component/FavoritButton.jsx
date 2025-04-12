import React from 'react'
import axios from '../context/api'
import { toast } from 'react-toastify';
export default function FavoritButton({ roomId, isFavorited, onToggle }) {

    const addFavorite = async (roomId) => {
        try{
            const response =  axios.post("/favorites/",{ room: roomId } );
            console.log("response",response.data)
            toast.info("Ajouté aux favoris !")
        }catch(error){
            console.log("error",error)
            toast.error("Erreur d'ajout aux favoris")
        }   
    };
      
      // Supprimer un favori
    const deleteFavorite = async (roomId) => {
        try{
            const response = await axios.delete(`/favorites/${roomId}/`);
            console.log("response",response.data)
            toast.info("Retiré des favoris !")
        }catch(error){
            console.log("error",error)
            toast.error("Erreur de suppression des favoris")
        }
    };

    const handleClick = async () => {
        if (isFavorited) {
          await deleteFavorite(roomId);
          onToggle()
        } else {
          await addFavorite(roomId);
          onToggle()
        } // rafraîchir l'état des favoris
        //window.location.reload();
      };

  return (
    <button className='btn btn-sm bg-gray-100' 
    onClick={handleClick}>
      {isFavorited ? "❤️ Retirer des favoris" : "🤍 Ajouter aux favoris"}
    </button>
  )
}
