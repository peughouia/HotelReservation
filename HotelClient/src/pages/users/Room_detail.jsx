import {React, useState, useEffect} from 'react'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom';
import axios from '../../context/api'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import RoomCarousel from '../../component/carroussel';
import { FormatDate } from '../../component/FormatDate';
import customer from '../../assets/customer.png'
import back from '../../assets/back.png'
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import StarRating from '../../component/StarRating';




export default function Room_detail() {
    const { roomValue } = useParams();
    const {reservations, user} = useAuth()
    const [rooms, setRoom] = useState([]);
    const[comments, setComments] = useState([]);
    const images = rooms.images;
    const [comment, setComment] = useState('')

    const [rating, setRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.info("Veuillez choisir une note avant d'envoyer !");
      return;
    }

    try {
      await axios.post(`/rooms/${roomValue}/reviews/`, { rating });
      toast.success("Note envoyée avec succès !");
    } catch (error) {
      toast.error("vous avez deja noté");
    }
  };

    const hasStayed = reservations?.some(res => res.room.slug===roomValue && res.completed==="completed")

    const fetchrooms = async () => {
        const response  = await axios.get(`/editRoom/${roomValue}/`);
          setRoom(response.data);
      }; 
      
      const fetchComment = async () => {
        const response  = await axios.get(`/rooms/${roomValue}/comments/`);
          setComments(response.data);
      };
      
    useEffect(() => {
        fetchComment();
        fetchrooms();
      }, []); 

      const sendAvis = async (e) => {
        e.preventDefault();
        if (!comment) {
            toast.error('ce champs ne peut etre vide');
            return
        };

        try{
            const response  = await axios.post(`/rooms/${roomValue}/comments/`,{comment});
            setComment("")
            fetchComment()
            toast.success("message laissé !!")
        }catch(error){
            console.log(error)
            toast.error("une erreur est survenu lors de l'envoie")
        }
        
      };
      


      if (!comments || !rooms || !images || images.length === 0) {
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
      
      
  return (
    <div className="p-2">
        <Link to="/" className='flex  items-center'>
            <img src={back} className="w-16 h-16 rounded-full" alt="Logo" />
            <h1 className="text-3xl font-bold text-gray-500">Room {rooms.room_number}</h1>
        </Link>
        <RoomCarousel room={rooms}/>
        <div className='mt-2'>
            <div className='flex justify-center items-center'>
                <p className='text-2xl font-bold text-gray-500'>Room {rooms.category.name} {rooms.room_number}</p>
            </div>
            <div className='flex p-2 space-x-0 w-full'>
                <div className='flex-1 text-2xl font-bold border-r border-gray-400 p-2  flex items-center justify-center'>{rooms.rating<1?<span>Pas de note</span>:<span>{rooms.rating} <FontAwesomeIcon icon={faStar} className='text-green-600' /></span>}</div>
                <div className="flex-1 text-xl text-orange-600 font-bold border-r border-gray-400 p-2 flex items-center justify-center">{rooms.category.name}</div>
                <div className="flex-1 text-base font-bold p-2 text-center">{rooms.price_per_night} FCFA/nuit</div>
            </div>
            <div>
                <Link to={`/reservation/room/${rooms.slug}`} className='btn bg-red-500 w-full text-xl font-bold text-white'>Reserver</Link>
            </div>
            <div className="mt-2">
                <p className='text-2xl font-bold'>Description</p>
                <p className='text-justify leading-relaxed p-2'>{rooms.description}</p>
            </div>

            <div className="mt-2 ">
                <p className='text-2xl font-bold my-1 flex justify-center '>AVIS</p>

                <div className="mb-4">
                    {hasStayed ? (
                        <div className="flex w-full ">
                            <textarea 
                            className="w-3/4 bg-transparent placeholder-gray-400 focus:outline-none border-b border-gray-400 rounded-none p-1"
                            placeholder="Laissez votre avis" 
                            name='comment'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}/>
                            <button className="ml-1 btn btn-success flex-1 text-white"
                            onClick={sendAvis}
                            >Envoyer</button>
                        </div>
                    ) : (
                    <p className="text-red-500">Vous devez avoir séjourné dans cette chambre pour laisser un commentaire.</p>
                    )}
                </div>

                {hasStayed?(<div className="flex flex-col justify-center items-center p-4 rounded-lg shadow-md bg-white">
                    <h3 className="text-lg font-semibold mb-2">Notez cette chambre :</h3>
                    <StarRating onRatingChange={setRating} />
                    <button
                        className="mt-3  px-4 py-2 w-full btn btn-success text-white rounded hover:bg-green-600"
                        onClick={handleSubmit}
                    >
                        Envoyer la note
                    </button>
                    </div>)
                    :
                    (<p></p>)}

                <div className="mt-6">
                    {comments.length > 0 ? (
                        comments.map((comment) => (
                            <div key={comment.id} className="flex items-center mb-2 ">
                                <img src={customer} alt="customer" className="w-10 h-10 rounded-full mr-2" />
                                {user && user.first_name === comment.user.first_name?
                                (<div className="flex flex-col w-full bg-gray-400 bg-opacity-40 rounded-md p-2">
                                    <span><b>{comment.user.first_name}</b></span>
                                    <p>{comment.comment}</p>
                                    <div className=" w-full text-sm text-gray-500 flex justify-end">{FormatDate(comment.created_at)}</div>
                                    </div>)
                                :
                                (<div className="flex flex-col w-full bg-red-500 bg-opacity-40 rounded-md p-2">
                                    <span><b>{comment.user.first_name}</b></span>
                                    <p>{comment.comment}</p>
                                    <div className=" w-full text-sm text-gray-500 flex justify-end">{FormatDate(comment.created_at)}</div>
                                    </div>)
                              }
                                
                            </div>
                         ))
                    ) : (
                        <div className='flex justify-center items-center'>
                            <p className='text-xl font-bold text-red-500 text-opacity-70'>Aucun Avis pour le moment</p>
                        </div>
                    )}
                </div>    
            </div>
        </div>
    </div>
  );
};
