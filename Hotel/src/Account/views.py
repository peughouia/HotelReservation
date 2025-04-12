from io import BytesIO
import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Table, TableStyle
from rest_framework import status, generics
from rest_framework.generics import GenericAPIView, RetrieveAPIView, ListAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from Account.models import (
    CustomUser,
    Category,
    Room,
    Reservation,
    Review,
    Comment,
    Favorite,
)
from Account.serializers import (
    UserRegistrationSerialiser,
    CustomUserSerializer,
    UserLoginSerializer,
    PasswordChangeSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer,
    CategorySerializer,
    RoomSerializer,
    ReservationSerializer,
    ReviewSerializer,
    CommentSerializer,
    CommentsSerializer,
    ReservationsSerializer,
    DetailReservationSerializer,
    FavoriteSerializer,
)


# Create your views here.
class UserConnectInfoAPIView(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user


class UserRegistrationAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserRegistrationSerialiser

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {
            "message": "Utilisateur créé avec succès",
            "refresh": str(token),
            "access": str(token.access_token),
        }
        return Response(data, status=status.HTTP_201_CREATED)


class UserLoginAPIView(GenericAPIView):
    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = CustomUserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {
            "message": "utilisateur connecté",
            "refresh": str(token),
            "access": str(token.access_token),
        }
        return Response(data, status=status.HTTP_200_OK)


class UserLogoutAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            content = {"message": "user deconnecté"}
            return Response(content, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            content = {"message": f"{e}"}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class UsersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = CustomUser.objects.all()
        serializer = CustomUserSerializer(user, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        user.delete()
        return Response(
            {"message": "user supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT
        )

    def patch(self, request):
        # Pour des mises à jour partielles
        user = request.user
        # user = get_object_or_404(CustomUser, pk=pk)
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            # Met à jour le mot de passe de l'utilisateur
            request.user.set_password(serializer.validated_data["new_password1"])
            request.user.save()
            return Response(
                {"message": "Mot de passe mis à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetAPIView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "E-mail envoyé avec succès."}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmAPIView(APIView):
    def post(self, request, uid, token):
        data = {
            "uid": uid,
            "token": token,
            "new_password": request.data.get("new_password"),
        }

        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Mot de passe mis à jour avec succès."},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddCategoryAPIView(APIView):
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": "Nouvelle categorie ajouté"}, status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class RoomCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = RoomSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            room = serializer.save()
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        room = Room.objects.all()
        serializer = RoomSerializer(room, many=True)
        return Response(serializer.data)


class RoomAPIView(APIView):
    def patch(self, request, slug):
        # Pour des mises à jour partielles
        room = Room.objects.get(slug=slug)
        serializer = RoomSerializer(room, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "chambre modifiée"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        try:
            room = get_object_or_404(Room, slug=slug)
            room.delete()
            return Response(
                {"success": "Chambre supprimé avec succès"},
                status=status.HTTP_204_NO_CONTENT,
            )
        except:
            return Response(
                {"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )

    def get(self, request, slug):
        try:
            room = Room.objects.get(slug=slug)
            serializer = RoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response(
                {"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )


class CreateReservationView(APIView):
    permission_classes = [IsAuthenticated]

    # Crée une nouvelle réservation en s'assurant qu'il n'y a pas de conflit de dates.
    def post(self, request, slug):
        room = Room.objects.get(slug=slug)
        user = request.user

        data = request.data.copy()
        data["user"] = user.id
        data["room"] = room.id
        serializer = ReservationsSerializer(data=data)
        print(data)
        if serializer.is_valid():
            room = serializer.validated_data["room"]
            check_in = serializer.validated_data["check_in"]
            check_out = serializer.validated_data["check_out"]
            if check_out < check_in:
                return Response(
                    {"error": "la date d'entrée doit être avant la date de sorti"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Vérifier les conflits de réservation
            conflicts = Reservation.objects.filter(
                room=room,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=["pending", "confirmed"],
            )

            if conflicts.exists():
                return Response(
                    {"error": "une réservation est déjà pour cette interval de dates."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH : modifier une réservation existante
    def patch(self, request, slug):
        room = Room.objects.get(slug=slug)
        user = request.user
        reservation_id = request.data.get("id")

        if not reservation_id:
            return Response(
                {"error": "ID de réservation manquant"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation = get_object_or_404(Reservation, id=reservation_id, user=user)

        data = request.data.copy()
        data["room"] = room.id
        data["user"] = user.id

        serializer = ReservationsSerializer(
            instance=reservation, data=data, partial=True
        )

        if serializer.is_valid():
            check_in = serializer.validated_data.get("check_in", reservation.check_in)
            check_out = serializer.validated_data.get(
                "check_out", reservation.check_out
            )

            if check_out < check_in:
                return Response(
                    {"error": "La date d'entrée doit être avant la date de sortie"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Vérifie les conflits sauf la réservation elle-même
            conflicts = Reservation.objects.filter(
                room=room,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=["pending", "confirmed"],
            ).exclude(id=reservation.id)

            if conflicts.exists():
                return Response(
                    {"error": "Conflit avec une autre réservation sur ces dates."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug):
        try:
            reservation = Reservation.objects.get(slug=slug)
            reservation.delete()
            return Response(
                {"success": "suppression"}, status=status.HTTP_204_NO_CONTENT
            )
        except Exception as e:
            return Response(
                {"erreur": f"Erreur lors de la suppression : {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class GetAllReservation(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reservation = Reservation.objects.all()
        serializer = ReservationSerializer(reservation, many=True)
        return Response(serializer.data)


class CancelReservationView(APIView):
    """Annule une réservation spécifique."""

    def post(self, request, slug):
        try:
            reservation = Reservation.objects.get(slug=slug)
            reservation.status = "cancelled"
            reservation.completed = "cancelled"
            reservation.save()
            return Response(
                {"success": "Réservation annulée avec succès."},
                status=status.HTTP_200_OK,
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Réservation introuvable ou déjà confirmée."},
                status=status.HTTP_404_NOT_FOUND,
            )


class ConfirmReservationView(APIView):
    """Confirme une réservation et met la chambre en indisponible si le check-in est atteint."""

    def post(self, request, slug):
        try:
            reservation = Reservation.objects.get(slug=slug, status="pending")
            reservation.status = "confirmed"
            reservation.save()

            if reservation.check_in <= now().date():
                reservation.room.is_available = False
                reservation.room.save()

            return Response(
                {"message": "Réservation confirmée avec succès."},
                status=status.HTTP_200_OK,
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Réservation introuvable ou déjà traitée."},
                status=status.HTTP_404_NOT_FOUND,
            )


class CompleteReservationView(APIView):
    """Marque une réservation comme terminée après le check-out."""

    def post(self, request, slug):
        try:
            reservation = Reservation.objects.get(
                slug=slug, status="confirmed", check_out__lte=now().date()
            )
            reservation.status = "completed"
            reservation.room.is_available = True
            reservation.room.save()
            reservation.save()
            return Response(
                {"message": "Réservation complétée avec succès."},
                status=status.HTTP_200_OK,
            )
        except Reservation.DoesNotExist:
            return Response(
                {"error": "Réservation introuvable ou non confirmée."},
                status=status.HTTP_404_NOT_FOUND,
            )


class HistoriqueReservationAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        reservation = Reservation.objects.filter(user=user)
        serializer = ReservationSerializer(reservation, many=True)
        return Response(serializer.data)


class DetailReservationAPIView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, slug):
        reservation = Reservation.objects.filter(slug=slug)
        serializer = DetailReservationSerializer(reservation, many=True)
        return Response(serializer.data)


class CategoryAPIView(APIView):
    def get(self, request):
        cat = Category.objects.all()
        serializer = CategorySerializer(cat, many=True)
        return Response(serializer.data)


class ReviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        """Récupérer les notes pour une chambre spécifique"""
        try:
            room = Room.objects.get(slug=slug)
            reviews = Review.objects.filter(room=room)
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response(
                {"erreur": "cette chambre n'existe pas "},
                status=status.HTTP_404_NOT_FOUND,
            )

    def post(self, request, slug):
        try:
            """Ajouter une note si l'utilisateur a séjourné dans la chambre"""
            room = Room.objects.get(slug=slug)
            user = request.user

            if not Reservation.objects.filter(
                user=user, room=room, completed="completed"
            ).exists():
                return Response(
                    {
                        "error": "Vous devez avoir réservé cette chambre pour la noter..."
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            data = request.data.copy()
            data["user"] = user.id
            data["room"] = room.id
            serializer = ReviewSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response(
                {"erreur": "cette chambre n'existe pas"},
                status=status.HTTP_404_NOT_FOUND,
            )


class CommentAPIView(APIView):
    def get_permissions(self):
        """Définir des permissions différentes pour GET et POST"""
        if self.request.method == "GET":
            return [AllowAny()]  # Tout le monde peut voir les commentaires
        return [IsAuthenticated()]

    def get(self, request, slug):
        try:
            room = Room.objects.get(slug=slug)
            """ Récupérer tous les commentaires validés pour une chambre """
            comments = Comment.objects.filter(room=room, is_approved=True)
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response({"error": "cette chambre n'exite pas"})

    def post(self, request, slug):
        """Ajouter un commentaire si l'utilisateur a réservé la chambre"""
        room = Room.objects.get(slug=slug)
        user = request.user
        if not Reservation.objects.filter(
            user=user, room=room, completed="completed"
        ).exists():
            return Response(
                {
                    "error": "Vous devez avoir séjourné dans cette chambre pour commenter."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        data = request.data.copy()
        data["user"] = user.id
        data["room"] = room.id
        serializer = CommentsSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserReservation(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        reservation = Reservation.objects.filter(user=user)
        serializer = ReservationSerializer(reservation, many=True)
        return Response(serializer.data, status.HTTP_200_OK)


class RoomAvailabilityAPIView(APIView):
    def get(self, request, slug):
        """Retourne les périodes déjà réservées pour une chambre"""
        try:
            room = Room.objects.get(slug=slug)
            reservations = Reservation.objects.filter(
                room=room, status__in=["pending", "confirmed"]
            ).values("check_in", "check_out", "status", "id")
            return Response(reservations, status=status.HTTP_200_OK)
        except Room:
            return Response(
                {"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND
            )


def generate_pdf(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)
    # Définir la réponse HTTP en tant que fichier PDF
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = (
        f'attachment; filename=f"recu_Room{reservation.room.category.name}_{reservation.room.room_number}.pdf"'
    )

    # Créer un PDF avec ReportLap

    pdf = canvas.Canvas(response, pagesize=A4)
    width, height = A4
    styles = getSampleStyleSheet()
    pdf.setTitle("Réservation - Hotel")

    # Ajouter un logo (ex: logo.png)
    logo_path = "Reservia.png"  # chemin du logo
    logo_width = 90
    logo_height = 90
    pdf.drawImage(
        logo_path, 40, height - 100, width=logo_width, height=logo_height, mask="auto"
    )

    # Titre après le logo
    pdf.setFont("Helvetica-Bold", 30)
    pdf.setFillColor(colors.orange)
    pdf.drawString(130, height - 70, "RESERVIA")  # décalé à droite
    pdf.setFillColor(colors.black)

    # Infos client & réservation
    pdf.setFont("Helvetica-Bold", 10)
    left_x = 40
    right_x = 320
    top_y = height - 150
    line_gap = 50

    infos = [
        (
            "NOM DU CLIENT:",
            f"{reservation.user.first_name} {reservation.user.last_name}",
        ),
        (
            "ADRESSE POSTALE:",
            reservation.user.addressPostal if reservation.user.addressPostal else "RAS",
        ),
        ("VILLE:", reservation.user.ville if reservation.user.ville else "RAS"),
        ("ADDRESS MAIL:", reservation.user.email),
        ("DATE D'ARRIVÉE:", f"{reservation.check_in.date()}"),
        ("HEURE D'ARRIVÉE:", f"{reservation.check_in.time()}"),
    ]

    infos_right = [
        (
            "N° DE REÇU:",
            f"rcpt {reservation.created_at.year}{reservation.room.room_number}{reservation.user.id}",
        ),
        ("N° DE CHAMBRE:", reservation.room.room_number),
        ("CODE DE RÉDUCTION:", "SPRING15"),
        ("NUM TÉLÉPHONE:", reservation.user.phone),
        ("DATE DE DÉPART:", f"{reservation.check_out.date()}"),
        ("HEURE DE DÉPART:", f"{reservation.check_out.time()}"),
    ]

    for i, ((labelL, valueL), (labelR, valueR)) in enumerate(zip(infos, infos_right)):
        y = top_y - i * line_gap
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(left_x, y, labelL)
        pdf.setFont("Helvetica", 13)
        pdf.drawString(left_x + 115, y, valueL)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(right_x, y, labelR)
        pdf.setFont("Helvetica", 13)
        pdf.drawString(right_x + 135, y, valueR)

    data = [
        ["DATE DE FACTURATION", "DESCRIPTION", "QTÉ", "MONTANT/Nuit", "TOTAL"],
        [
            f"{reservation.created_at.date()}",
            f"Chambre {reservation.room.category}",
            "1",
            reservation.room.price_per_night,
            reservation.total_price,
        ],
    ]

    table = Table(data, colWidths=[140, 125, 55, 90, 80])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("ALIGN", (2, 1), (-1, -1), "CENTER"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
            ]
        )
    )
    table.wrapOn(pdf, width, height)
    table.drawOn(pdf, 40, 300)

    # Sous-total, taxe, total
    pdf.setFont("Helvetica", 10)
    pdf.drawString(350, 280, "SOUS-TOTAL:")
    pdf.drawRightString(520, 280, f"{reservation.total_price} FCFA")

    pdf.drawString(350, 265, "TAXE:")
    pdf.drawRightString(520, 265, "0 FCFA")

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(350, 250, "TOTAL:")
    pdf.drawRightString(520, 250, f"{reservation.total_price} FCFA")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(350, 235, "MONTANT PAYÉ:")
    pdf.drawRightString(520, 235, f"{reservation.total_price} FCFA")

    pdf.drawString(350, 220, "MONTANT DÛ:")
    pdf.drawRightString(520, 220, "0 FCFA")

    # Générer un QR Code contenant l'URL de confirmation ou l'ID de réservation
    qr_data = f"http://192.168.1.110:5173/moncompte/detail/{reservation.slug}"
    qr = qrcode.make(qr_data)
    # Convertir l'image du QR Code en un format compatible avec ReportLab
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    qr_image = ImageReader(qr_buffer)

    # Ajouter le QR Code au PDF
    pdf.drawImage(
        qr_image, 460, height - 100, width=90, height=90
    )  # Position et taille du QR code

    pdf.setFont("Helvetica", 10)
    pdf.drawString(475, height - 105, "Scannez MOI")

    pdf.setFont("Helvetica-Bold", 15)
    pdf.setFillColor(colors.orange)
    pdf.drawCentredString(width / 2, 80, "Reservia")
    pdf.setFont("Helvetica", 9)
    pdf.drawCentredString(
        width / 2, 65, "ADRESSE DE L’HÔTEL, VILLE, ÉTAT ET CODE POSTAL"
    )
    pdf.drawCentredString(
        width / 2,
        50,
        "Tél: 321-456-7890 | e-mail: reservations@hotelname.com | site Web: hotelname.com",
    )

    # Sauvegarder
    pdf.showPage()
    pdf.save()

    return response


class FavoriteListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FavoriteDeleteAPIView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "room_id"

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)


class FavoriteRoomsListAPIView(ListAPIView):
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Room.objects.filter(favorite__user=self.request.user)
