import {React,useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from '../../context/api';
import { format } from "date-fns";
import { toast } from 'react-toastify';
import Modal from '../../component/modal';

export default function ReservationForm({roomSlug, existingReservation = null }) {
    const navigate = useNavigate();
    const [modalOpen, setModalOpen] = useState(false);
    const [checkIn, setCheckIn] = useState(existingReservation ? new Date(existingReservation.check_in) : null);
    const [checkOut, setCheckOut] = useState(existingReservation ? new Date(existingReservation.check_out) : null);
    const [bookedDates, setBookedDates] = useState([]);


    // Charger les réservations pour bloquer les dates
  const fetchBookedDates = async () => {
    try {
      const response = await axios.get(`/rooms/${roomSlug}/availability/`);
      const reservations = response.data;
      const dates = reservations?.flatMap(({ check_in, check_out, id }) => {
        // Exclure les dates de cette réservation si on est en mode édition
        if (existingReservation && id === existingReservation.id) return [];
        let tempDates = [];
        let start = new Date(check_in);
        let end = new Date(check_out);
        while (start <= end) {
          tempDates.push(new Date(start));
          start.setDate(start.getDate() + 1);
        }
        return tempDates;
      });
      setBookedDates(dates);
    } catch (error) {
      toast.error("Erreur lors du chargement des dates réservées");
    }
  };

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const handleOpenModal = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      toast.error("Veuillez sélectionner des dates valides.");
      return;
    }
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    const formattedCheckIn = format(checkIn, "yyyy-MM-dd");
    const formattedCheckOut = format(checkOut, "yyyy-MM-dd");
    const data = {
      check_in: formattedCheckIn,
      check_out: formattedCheckOut,
    };

    try {
      if (existingReservation) {
        data.id = existingReservation.id;
        await axios.patch(`/reservations/create/${roomSlug}/`, data);
        toast.success("Réservation modifiée avec succès !");
      } else {
        await axios.post(`/reservations/create/${roomSlug}/`, data);
        toast.success("Réservation créée avec succès !");
        toast.info("Vous avez 12 heures pour effectuer le paiement.");
      }
      navigate("/moncompte/reservations");
    } catch (error) {
      if (error.response && error.response.data) {
        Object.values(error.response.data).forEach((err) => {
          toast.error(err[0]);
        });
      }
    } finally {
      setModalOpen(false);
    }
  };

  return (
    <form onSubmit={handleOpenModal} className="h-full p-4">
      <h2 className="text-center text-xl font-bold mb-4">
        {existingReservation ? "Modifier la réservation" : "Réserver une chambre"}
      </h2>
      <div className="h-2/5 flex flex-col justify-center bg-base-100 p-1 rounded-lg">
        <label className="block mb-2 font-bold text-xl text-gray-500">Date d'entrée</label>
        <DatePicker
          selected={checkIn}
          onChange={(date) => setCheckIn(date)}
          minDate={new Date()}
          excludeDates={bookedDates}
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded w-full"
          placeholderText='Sélectionnez une date'
          required
        />
        <label className="block mt-4 mb-2 font-bold text-xl text-gray-500">Date de sortie</label>
        <DatePicker
          selected={checkOut}
          onChange={(date) => setCheckOut(date)}
          minDate={checkIn || new Date()}
          excludeDates={bookedDates}
          dateFormat="yyyy-MM-dd"
          className="p-2 border rounded w-full"
          placeholderText='Sélectionnez une date'
          required
        />
        <button type="submit" className="btn btn-success mt-4 text-white text-xl px-4 py-2 rounded">
          {existingReservation ? "Modifier" : "Réserver"}
        </button>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        title={existingReservation ? "Modifier la réservation" : "Confirmer la réservation"}
        message={`Voulez-vous vraiment ${
          existingReservation ? "modifier" : "réserver"
        } la chambre du ${checkIn?.toLocaleDateString()} au ${checkOut?.toLocaleDateString()} ?`}
      />
    </form>
  );
}
