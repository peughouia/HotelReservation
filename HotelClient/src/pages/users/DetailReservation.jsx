import {React, useState, useEffect} from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from '../../context/api'
import back from '../../assets/back.png'
import { FormatDate } from '../../component/FormatDate'
import { FaUser,FaEdit, FaCalendarAlt, FaBed, FaMoneyBillWave, FaCheckCircle, FaTimesCircle, FaClock,FaTrash, FaDownload } from "react-icons/fa";
import { toast } from 'react-toastify'
import Modal from '../../component/modal'


export default function DetailReservation() {

  const navigate = useNavigate();

  const { reserveValue } = useParams();
  const [reservations, setReservation] = useState([])
  const [modalOpen, setModalOpen] = useState(false);


  const handleSend = (reservation) => {
    navigate("/moncompte/editReservation", { state: reservation });
  };

  const fetchreservation = async () => {
      const response  = await axios.get(`/reservations/getDetail/${reserveValue}/`);
      setReservation(response.data);
  }; 

  useEffect(() => {
      fetchreservation()
  }, []); 

  if (reservations.length === 0) {
    return <div className='w-full h-screen flex justify-center items-center'>
          <l-reuleaux
            size="100"
            stroke="15"
            stroke-length="0.25"
            bg-opacity="0.3"
            speed="1.3" 
            color="orange" 
          ></l-reuleaux>
        </div>;
  }

  const handleOpen = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const handleCancel = async (reservation) => {
    const response = await axios.post(`/reservations/${reservation.slug}/cancel/`);
    if (response.status === 200) {
        fetchreservation();
        toast.success("Réservation annulée avec succès !");
    } else {
        toast.error("Erreur lors de l'annulation de la réservation.");
    }
    setModalOpen(false);
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
        return "bg-white-500 border border-green-500 text-green-500"; // Si jamais le statut est inconnu
    }
  };
     
  return (
    <div className='container w-full h-screen block'>
      <Link to="/moncompte/reservations" className='flex items-center border-b-2 shadow-md mb-2'>
            <img src={back} className="w-16 h-16 rounded-full " alt="Logo" /> 
            <span className="text-lg font-semibold">Mes Reservation</span>
      </Link>
      {reservations?.map((reservation, index) => (            
      <div key={index} className="max-w-md mx-auto p-4 bg-white shadow-lg rounded-2xl">
        {/* Identification utilisateur */}
        <div className="flex items-center space-x-3 border-b pb-3">
          <FaUser size={35} className="text-orange-500 text-xl" />
          <div className="py-1">
                  <h3  key={index} className="text-lg font-bold">
                      {reservation.user.first_name}
                  </h3>
                  <p className="text-gray-500 text-sm">
                  {reservation.user.email}
                  </p>
          </div>
          {reservation.status === "confirmed" ? (
              <div className="w-1/2 flex flex-col justify-end items-end">
                  <FaDownload size={35} className='text-orange-500'/>
              </div>
          ):
          (<p></p>)}
          
        </div>

        {/* Statut de la réservation */}

        <div className={`mt-3 px-4 py-2 text-center font-bold rounded-full ${getStatusColor(reservation.status)}`}>
              <p> {reservation.status}</p>
        </div>

        {/* Détails de la réservation */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-2 text-gray-700">
              <FaCalendarAlt className="text-xl text-gray-600" />
              <span>Début :</span>
            </span>
            <span className="font-semibold">{FormatDate(reservation.check_in)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-2 text-gray-700">
              <FaCalendarAlt className="text-xl text-gray-600" />
              <span>Fin :</span>
            </span>
            <span className="font-semibold">{FormatDate(reservation.check_out)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-2 text-gray-700">
              <FaClock className="text-xl text-gray-600" />
              <span>Date de création :</span>
            </span>
            <span className="font-semibold">{FormatDate(reservation.created_at)}</span>
          </div>
        </div>

        {/* Informations sur la chambre */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h4 className="text-lg font-bold mb-2">Détails de la Chambre</h4>
          <div className="flex justify-between items-center">
            <span className="flex items-center space-x-2">
              <FaBed className="text-xl text-gray-600" />
              <span>Catégorie :</span>
            </span>
            <span className="font-semibold">{reservation.room.category.name}</span>
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="flex items-center space-x-2">
              <FaBed className="text-xl text-gray-600" />
              <span>Numéro :</span>
            </span>
            <span className="font-semibold">Room {reservation.room.room_number}</span>
          </div>
        </div>

        {/* Prix et paiement */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <h4 className="text-lg font-bold mb-2">Tarification</h4>

          <div className="flex justify-between">
            <span className="flex items-center space-x-2">
              <FaMoneyBillWave className="text-xl text-green-600" />
              <span>Durée du Sejour :</span>
            </span>
            <span className="font-semibold">{reservation.nb_jour} jour(s)</span>
          </div>

          <div className="flex justify-between mt-2">
            <span className="flex items-center space-x-2">
              <FaMoneyBillWave className="text-xl text-green-600" />
              <span>Prix par jour :</span>
            </span>
            <span className="font-semibold">{reservation.room.price_per_night} FCFA</span>
          </div>

          <div className="flex justify-between mt-2">
            <span className="flex items-center space-x-2">
              <FaMoneyBillWave className="text-xl text-green-600" />
              <span>Prix total :</span>
            </span>
            <span className="font-semibold">{reservation.total_price} FCFA</span>
          </div>
        </div>

        {/* Statut du séjour */}
        <div className="mt-4 p-3 bg-gray-100 rounded-lg flex justify-between items-center">
          <h4 className="text-lg font-bold">Statut du séjour :</h4>
          {reservation.completed === "completed" ? (
              <div className="flex">
            <FaCheckCircle className="text-green-500 text-2xl" /><span>Terminé </span>
            </div>
          ) : (
            <FaTimesCircle className="text-red-500 text-2xl" />
          )}
        </div>

          {/* Boutons d'action */}
      {reservation.status === "pending"? (
          <div className="flex space-x-3 mt-4">
          <button
            className="flex-1 flex items-center justify-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
            onClick={() => handleSend(reservation)}
          >
            <FaEdit className="mr-2" />
            Modifier
          </button>

          <button
            className="flex-1 flex items-center justify-center bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
            onClick={handleOpen}
          >
            <FaTrash className="mr-2" />
            Annuler
          </button>
        </div>
        ):(
            <p></p>
        )}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={() => handleCancel(reservation)}
          title="Annuler la réservation"
          message={`Voulez-vous vraiment annuler la réservation ?`}
        />
      </div>
      ))} 
    </div>
  )
}
