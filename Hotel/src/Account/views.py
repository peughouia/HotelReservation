from io import BytesIO

import qrcode
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from Account.models import CustomUser, Category, Room, Reservation, Review, Comment
from Account.serializers import UserRegistrationSerialiser, CustomUserSerializer, UserLoginSerializer, \
    PasswordChangeSerializer, PasswordResetSerializer, PasswordResetConfirmSerializer, CategorySerializer, \
    RoomSerializer, ReservationSerializer, ReviewSerializer, CommentSerializer, CommentsSerializer, \
    ReservationsSerializer, DetailReservationSerializer


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
            "access": str(token.access_token)
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
            content = {'message': 'user deconnecté'}
            return Response(content, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            content = {'message': f'{e}'}
            return Response(content, status=status.HTTP_400_BAD_REQUEST)


class UsersAPIView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        user = CustomUser.objects.all()
        serializer = CustomUserSerializer(user, many=True)
        return Response(serializer.data)

    def delete(self, request, pk):
        user = get_object_or_404(CustomUser, pk=pk)
        user.delete()
        return Response({"message": "user supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)

    def patch(self, request, pk):
        # Pour des mises à jour partielles
        user = get_object_or_404(CustomUser, pk=pk)
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordChangeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Met à jour le mot de passe de l'utilisateur
            request.user.set_password(serializer.validated_data['new_password1'])
            request.user.save()
            return Response({"message": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetAPIView(APIView):
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "E-mail envoyé avec succès."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmAPIView(APIView):
    def post(self, request, uid, token):
        data = {
            "uid": uid,
            "token": token,
            "new_password": request.data.get("new_password")
        }

        serializer = PasswordResetConfirmSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddCategoryAPIView(APIView):
    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": "Nouvelle categorie ajouté"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class RoomCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        serializer = RoomSerializer(data=request.data, context={'request': request})
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
            return Response({"success": "Chambre supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
        except:
            return Response({"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND)

    def get(self, request, slug):
        try:
            room = Room.objects.get(slug=slug)
            serializer = RoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response({"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND)


class CreateReservationView(APIView):
    permission_classes = [IsAuthenticated]

    # Crée une nouvelle réservation en s'assurant qu'il n'y a pas de conflit de dates.
    def post(self, request, slug):
        room = Room.objects.get(slug=slug)
        user = request.user

        data = request.data.copy()
        data['user'] = user.id
        data['room'] = room.id
        serializer = ReservationsSerializer(data=data)
        print(data)
        if serializer.is_valid():
            room = serializer.validated_data["room"]
            check_in = serializer.validated_data["check_in"]
            check_out = serializer.validated_data["check_out"]
            if check_out < check_in:
                return Response(
                    {"error": "la date d'entrée doit être avant la date de sorti"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Vérifier les conflits de réservation
            conflicts = Reservation.objects.filter(
                room=room,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=["pending", "confirmed"]
            )

            if conflicts.exists():
                return Response(
                    {"error": "une réservation est déjà pour cette interval de dates."},
                    status=status.HTTP_400_BAD_REQUEST
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
            return Response({"error": "ID de réservation manquant"}, status=status.HTTP_400_BAD_REQUEST)

        reservation = get_object_or_404(Reservation, id=reservation_id, user=user)

        data = request.data.copy()
        data['room'] = room.id
        data['user'] = user.id

        serializer = ReservationsSerializer(instance=reservation, data=data, partial=True)

        if serializer.is_valid():
            check_in = serializer.validated_data.get("check_in", reservation.check_in)
            check_out = serializer.validated_data.get("check_out", reservation.check_out)

            if check_out < check_in:
                return Response({"error": "La date d'entrée doit être avant la date de sortie"},
                                status=status.HTTP_400_BAD_REQUEST)

            # Vérifie les conflits sauf la réservation elle-même
            conflicts = Reservation.objects.filter(
                room=room,
                check_in__lt=check_out,
                check_out__gt=check_in,
                status__in=["pending", "confirmed"]
            ).exclude(id=reservation.id)

            if conflicts.exists():
                return Response({"error": "Conflit avec une autre réservation sur ces dates."},
                                status=status.HTTP_400_BAD_REQUEST)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
            return Response({"success": "Réservation annulée avec succès."}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({"error": "Réservation introuvable ou déjà confirmée."}, status=status.HTTP_404_NOT_FOUND)


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

            return Response({"message": "Réservation confirmée avec succès."}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({"error": "Réservation introuvable ou déjà traitée."}, status=status.HTTP_404_NOT_FOUND)


class CompleteReservationView(APIView):
    """Marque une réservation comme terminée après le check-out."""

    def post(self, request, slug):
        try:
            reservation = Reservation.objects.get(slug=slug, status="confirmed", check_out__lte=now().date())
            reservation.status = "completed"
            reservation.room.is_available = True
            reservation.room.save()
            reservation.save()
            return Response({"message": "Réservation complétée avec succès."}, status=status.HTTP_200_OK)
        except Reservation.DoesNotExist:
            return Response({"error": "Réservation introuvable ou non confirmée."}, status=status.HTTP_404_NOT_FOUND)


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
        """ Récupérer les notes pour une chambre spécifique """
        try:
            room = Room.objects.get(slug=slug)
            reviews = Review.objects.filter(room=room)
            serializer = ReviewSerializer(reviews, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except:
            return Response({"erreur": "cette chambre n'existe pas "}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, slug):
        try:
            """ Ajouter une note si l'utilisateur a séjourné dans la chambre """
            room = Room.objects.get(slug=slug)
            user = request.user

            if not Reservation.objects.filter(user=user, room=room, completed='completed').exists():
                return Response({"error": "Vous devez avoir réservé cette chambre pour la noter..."},
                                status=status.HTTP_403_FORBIDDEN)

            data = request.data.copy()
            data['user'] = user.id
            data['room'] = room.id
            serializer = ReviewSerializer(data=data)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({'erreur': "cette chambre n'existe pas"}, status=status.HTTP_404_NOT_FOUND)


class CommentAPIView(APIView):
    def get_permissions(self):
        """ Définir des permissions différentes pour GET et POST """
        if self.request.method == 'GET':
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

        """ Ajouter un commentaire si l'utilisateur a réservé la chambre """
        room = Room.objects.get(slug=slug)
        user = request.user
        if not Reservation.objects.filter(user=user, room=room, completed='completed').exists():
            return Response({"error": "Vous devez avoir séjourné dans cette chambre pour commenter."},
                            status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        data['user'] = user.id
        data['room'] = room.id
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
            reservations = Reservation.objects.filter(room=room, status__in=['pending', 'confirmed']).values("check_in",
                                                                                                             "check_out",
                                                                                                             'status',
                                                                                                             'id')
            return Response(reservations, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({"error": "Chambre non trouvée"}, status=status.HTTP_404_NOT_FOUND)


def generate_pdf(request, reservation_id):
    reservation = get_object_or_404(Reservation, id=reservation_id)

    # Définir la réponse HTTP en tant que fichier PDF
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="recu_reservation_{reservation.id}.pdf"'

    # Créer un PDF avec ReportLap

    pdf = canvas.Canvas(response, pagesize=A4)
    pdf.setTitle(f'Reçu Réservation {reservation.id}')

    # Ajouter du texte au PDF
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(200, 800, "Reçu de Réservation")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(100, 750, f"Numéro de réservation: {reservation.id}")
    pdf.drawString(100, 730, f"Nom du client: {reservation.user.first_name}")
    pdf.drawString(100, 710, f"Chambre réservée: {reservation.room.room_number}")
    pdf.drawString(100, 690, f"Date d'arrivée: {reservation.check_in}")
    pdf.drawString(100, 670, f"Date de départ: {reservation.check_out}")
    pdf.drawString(100, 650, f"Montant payé: {reservation.total_price} FCFA")

    # Générer un QR Code contenant l'URL de confirmation ou l'ID de réservation
    qr_data = f"http://127.0.0.1:8000/api/reservations/{reservation.id}/verify/"
    qr = qrcode.make(qr_data)

    # Convertir l'image du QR Code en un format compatible avec ReportLab
    qr_buffer = BytesIO()
    qr.save(qr_buffer, format="PNG")
    qr_buffer.seek(0)
    qr_image = ImageReader(qr_buffer)

    # Ajouter le QR Code au PDF
    pdf.drawImage(qr_image, 400, 600, width=100, height=100)  # Position et taille du QR code

    pdf.setFont("Helvetica", 10)
    pdf.drawString(380, 580, "Scannez ce QR Code pour vérifier la réservation")

    pdf.showPage()
    pdf.save()

    return response
