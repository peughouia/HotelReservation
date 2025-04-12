import {React,useState,useEffect,forwardRef} from 'react'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../../context/api'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { addHours  } from "date-fns";
import { toast } from 'react-toastify';
import back from '../../assets/back.png'
import Modal from '../../component/modal';




export default function Reservation() {

  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = (e) => {
    e.preventDefault();
    setModalOpen(true);
  };

  
    const navigate = useNavigate()
    const [checkIn, setCheckIn] = useState(null);
    const [checkOut, setCheckOut] = useState(null);
    const { roomValue } = useParams();

    // Récupérer les réservations existantes
    const [reservations, setReservation] = useState([])
    const fetchdate = async () => {
        const response  = await axios.get(`/rooms/${roomValue}/availability/`);
        setReservation(response.data);
    }; 

    useEffect(() => {
        fetchdate()
          }, []); 

    // Convertir les dates réservées en objets Date
  const bookedDates = reservations?.flatMap(({ check_in, check_out }) => {
    let dates = [];
    let startDate = new Date(check_in);
    let endDate = new Date(check_out);
    while (startDate <= endDate) {
      dates.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return dates;
  });

  const confirmReservation = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
    alert("Veuillez sélectionner des dates valides.");
    return;
    }

    const adjustedCheckIn = addHours(checkIn, 1);
    const adjustedCheckOut = new Date(checkOut);
    adjustedCheckOut.setHours(adjustedCheckIn.getHours());
    adjustedCheckOut.setMinutes(adjustedCheckIn.getMinutes());

    const reservationData = {
    check_in: adjustedCheckIn.toISOString(),
    check_out: adjustedCheckOut.toISOString(),
    };
  
    try {
        const response = await axios.post(`/reservations/create/${roomValue}/`, reservationData);
        toast.success("Reservation enregistrer!!")
        toast.info("vous avez 12 heures pour effectuer le paiment")
        navigate("/moncompte/reservations")
        window.location.reload();
    } catch (error) {
        if(error.response && error.response.data){
            Object.keys(error.response.data).forEach(field => {
                const err = error.response.data[field]
                if(err && err.length > 0){
                  if(err[0]){
                  toast.error(`${err}`)
                  }
                }
            })
        }
    }
    setModalOpen(false);
  };
  return (
    <div className="container h-screen">
      <Link to="/" className='flex items-center border-b-2 shadow-md'>
            <img src={back} className="w-16 h-16 rounded-full " alt="Logo" />
      </Link>
    
    <form onSubmit={handleOpen} className="h-full p-4">
      <h2 className="text-center text-xl font-bold mb-4">Réserver une chambre</h2>
      <div className="h-2/5 flex flex-col justify-center bg-base-100 p-1 rounded-lg">
      <label className="block mb-2 font-bold text-xl text-gray-500">Date d'entrée</label>
      <DatePicker
        selected={checkIn}
        onChange={(date) => setCheckIn(date)}
        minDate={new Date()} // Pas de date passée
        excludeDates={bookedDates} // Bloquer les dates déjà réservées
        showTimeSelect
        dateFormat="Pp" 
        className="p-2 border rounded w-full"
        placeholderText='Selectionnez une date'
        timeFormat="HH:mm" // Format de l'heure
        timeIntervals={15} // Intervalles d’heure (par défaut : 30min)
        timeCaption="Heure"
        required
      />
      <label className="block mt-4 mb-2 font-bold text-xl text-gray-500">Date de sortie :</label>
      <DatePicker
        selected={checkOut}
        onChange={(date) => setCheckOut(date)}
        minDate={checkIn || new Date()} // Bloquer les dates avant check-in
        excludeDates={bookedDates} // Bloquer les dates déjà réservées
        dateFormat="yyyy-MM-dd"
        className="p-2 border rounded w-full"
        placeholderText='Selectionnez une date'
        required
      />

      

      <button type="submit" className="btn btn-success mt-4 text-white text-xl px-4 py-2 rounded">
        Réserver
      </button>
      </div>
    </form>
    <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmReservation}
        title="Confirmer la réservation"
        message={`Voulez-vous vraiment réserver la chambre du ${checkIn?.toLocaleDateString()} à ${checkIn?.getHours()}h au ${checkOut?.toLocaleDateString()} ?`}
        />
    </div>
  );
}
