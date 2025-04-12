import React from "react";
import { useAuth } from "../../context/AuthContext";
import RoomCarousel from "../../component/carroussel";
import { Link } from "react-router-dom";
import FavoritButton from "../../component/FavoritButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import Floatbottombar from "../../component/floatbar";

export default function FavoriteRoom() {
  const { UserFavRooms, favorites, refetch } = useAuth();
  const token = localStorage.getItem("accessToken");
  if (!UserFavRooms) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <l-reuleaux
          size="100"
          stroke="15"
          stroke-length="0.25"
          bg-opacity="0.3"
          speed="1.3"
          color="orange"
        ></l-reuleaux>
      </div>
    );
  }
  const isRoomFavorited = (roomId) => {
    return favorites?.some((fav) => fav.room === roomId);
  };
  return (
    <div className="h-screen w-screen p-3 flex flex-col">
      <div className="">
        <div className="w-full mb-20">
          <h1 className="text-2xl text-gray-400 flex justify-center font-bold">
            Mes Favoris
          </h1>
          {UserFavRooms.length > 0 ? (
            UserFavRooms.map((room) => (
              <div className="my-4 border-b-2 border-gray-300" key={room.id}>
                <div className=" bg-white rounded-box max-w-md space-x-2  w-full h-3/4">
                  {room.images ? (
                    <RoomCarousel room={room} /> // Utilisation de la fonction de carrousel
                  ) : (
                    <div>pas d'image</div>
                  )}
                </div>
                <div className="p-2">
                  <div className="flex justify-between">
                    <div className="font-bold text-2xl">
                      Room {room.room_number}
                    </div>
                    <div className="text-lg">
                      {room.rating < 1 ? (
                        <span>Pas de note</span>
                      ) : (
                        <span>
                          Notée {room.rating}{" "}
                          <FontAwesomeIcon
                            icon={faStar}
                            className="text-green-600"
                          />
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-2xl flex justify-between text-gray-500 mb-1 ">
                    <div>
                      <span className="font-bold">{room.category.name}</span>{" "}
                      Room
                    </div>
                    <div className="flex items-center">
                      {token ? (
                        <FavoritButton
                          roomId={room.id}
                          isFavorited={isRoomFavorited(room.id)}
                          onToggle={refetch}
                        />
                      ) : (
                        <div></div>
                      )}
                    </div>
                  </div>
                  <div className="text-xl text-gray-500 ">
                    {" "}
                    Actuellement{" "}
                    {room.is_available ? (
                      <div className="badge badge-success text-xl font-semibold text-white">
                        Libre
                      </div>
                    ) : (
                      <div className="badge badge-error text-xl font-semibold text-white">
                        Occuper
                      </div>
                    )}
                  </div>
                  <div className="text-xl flex justify-between items-center">
                    <div>
                      <span className="font-bold">
                        {room.price_per_night} FCFA
                      </span>{" "}
                      par Nuit
                    </div>

                    <div>
                      <Link to={`/detail/${room.slug}`}>
                        <button className="btn bg-orange-500 text-white text-xl">
                          Voir
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full h-screen flex justify-center mt-10 text-gray-500 font-bold text-2xl">
              <p>Aucune chambre trouvée</p>
            </div>
          )}
        </div>
      </div>
      <Floatbottombar />
    </div>
  );
}
