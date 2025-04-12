from django.urls import path

from Account.views import *

urlpatterns = [
    path("register/", UserRegistrationAPIView.as_view(), name="registration"),
    path("login/", UserLoginAPIView.as_view(), name="login"),
    path("logout/", UserLogoutAPIView.as_view(), name="logout"),
    path("password/change/", PasswordChangeAPIView.as_view(), name="password-change"),
    path("password/reset/", PasswordResetAPIView.as_view(), name="password-reset"),
    path(
        "password/reset/confirm/<uid>/<token>/",
        PasswordResetConfirmAPIView.as_view(),
        name="password-reset-confirm",
    ),
    path("user/", UserConnectInfoAPIView.as_view(), name="user_info"),
    path("users/", UsersAPIView.as_view(), name="get_all_user"),
    path("add_category/", AddCategoryAPIView.as_view(), name="add-category"),
    path("add_room/", RoomCreateAPIView.as_view(), name="add-get-room"),
    path("editRoom/<slug:slug>/", RoomAPIView.as_view(), name="edit-get-delete-room"),
    path(
        "reservations/history/",
        HistoriqueReservationAPIView.as_view(),
        name="list-reservation",
    ),
    path("listcategory/", CategoryAPIView.as_view(), name="list-category"),
    path(
        "reservations/getAll/", GetAllReservation.as_view(), name="create-reservation"
    ),
    path(
        "reservations/getDetail/<slug:slug>/",
        DetailReservationAPIView.as_view(),
        name="detail-reservation",
    ),
    path(
        "reservations/create/<slug:slug>/",
        CreateReservationView.as_view(),
        name="create-reservation",
    ),
    path(
        "reservations/<slug:slug>/cancel/",
        CancelReservationView.as_view(),
        name="cancel-reservation",
    ),
    path(
        "reservations/<slug:slug>/confirm/",
        ConfirmReservationView.as_view(),
        name="confirm-reservation",
    ),
    path(
        "reservations/<slug:slug>/complete/",
        CompleteReservationView.as_view(),
        name="complete-reservation",
    ),
    path(
        "rooms/<slug:slug>/availability/",
        RoomAvailabilityAPIView.as_view(),
        name="complete-reservation",
    ),
    path("userResevation/", UserReservation.as_view(), name="user-reservation"),
    path("reservations/<int:reservation_id>/pdf/", generate_pdf, name="generate_pdf"),
    path("rooms/<slug:slug>/reviews/", ReviewAPIView.as_view(), name="room-reviews"),
    path("rooms/<slug:slug>/comments/", CommentAPIView.as_view(), name="room-comments"),
    path("favorites/", FavoriteListCreateAPIView.as_view(), name="room-comments"),
    path(
        "favorites/<int:room_id>/",
        FavoriteDeleteAPIView.as_view(),
        name="room-comments",
    ),
    path(
        "user/favorites/Room/", FavoriteRoomsListAPIView.as_view(), name="room-comments"
    ),
]
