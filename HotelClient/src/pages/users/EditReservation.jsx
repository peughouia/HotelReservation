import React from 'react'
import { useLocation, useNavigate,Link } from 'react-router-dom'
import ReservationForm from './ReservationForm'
import back from '../../assets/back.png'

export default function EditReservation() {
  const {state} = useLocation();
  const navigate = useNavigate();
  if (!state) {
    navigate("/moncompte/reservations")
  }
  const handleRetour = () => {
    navigate(-1); // <- Retour à la page précédente
  };
  return (
    <div>
      <button onClick={handleRetour}  className='flex items-center  mb-2'>
            <img src={back} className="w-16 h-16 rounded-full " alt="Logo" /> 
            <span className="text-lg font-semibold">Retour</span>
      </button>
        <ReservationForm roomSlug={state.room.slug} existingReservation={state} />
    </div>
  )
}
