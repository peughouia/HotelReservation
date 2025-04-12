import React from 'react'
import { Link } from 'react-router-dom'
import back from '../../assets/back.png'
import { useAuth } from '../../context/AuthContext'
import { FormatDate } from '../../component/FormatDate'

export default function UsersReservation() {
    const {UserReservations, isLoading} = useAuth();
    console.log(UserReservations)
    if (isLoading) {
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

       const getStatusColor = (status) => {
        switch (status) {
          case "pending":
            return "text-sm text-orange-500 bg-white border border-orange-500 p-1 rounded-xl mr-2 font-bold";
          case "confirmed":
            return "text-sm text-green-500 bg-white border border-green-500 p-1 rounded-xl mr-2 font-bold";
          case "cancelled":
            return "text-sm text-red-500 bg-white border border-red-500 p-1 rounded-xl mr-2 font-bold";
          default:
            return "bg-gray-500"; // Si jamais le statut est inconnu
        }
      };
      
      
    
  return (
    <div className='w-full h-full block'>
        <Link to="/moncompte" className='flex items-center border-b-2 shadow-md'>
             <img src={back} className="w-16 h-16 rounded-full " alt="Logo" /> 
             <span className="text-lg font-semibold">Mon Compte</span>
        </Link>
        <div className='w-full'>
            <div className='p-2'>
                {UserReservations?
                  (UserReservations.map((reservation, index) => (
                      <Link key={index} to={`/moncompte/detail/${reservation.slug}`} >
                      <div  className="bg-white shadow-md rounded-md p-4 w-full my-4">
                          <div className='flex justify-between'>
                              <h1 className='text-lg text-gray-600 font-bold'>Room {reservation.room.category.name} {reservation.room.room_number} </h1>
                              <p className={`${getStatusColor(reservation.status)}`}>{reservation.status}</p>
                          </div>

                          <div className=''>
                              <p className='font-bold text-opacity-70'>Prix: {reservation.total_price} FCFA</p>
                              <p className='text-gray-500'>Créé le {FormatDate(reservation.created_at)}</p>
                          </div>
                      </div>
                      </Link>
                  )))
                :(<div className='h-screen flex justify-center mt-10 text-gray-500 font-bold text-2xl'>
                    <p className='text-gray-500 font-bold text-lg'>Aucune réservation trouvée</p>
                    </div>
                  )}
            </div>
        </div>
    </div>
  )
}
