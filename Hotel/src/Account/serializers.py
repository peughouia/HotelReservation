from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db.models import Avg
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework import serializers

from Account.models import CustomUser, Category, RoomImage, Room, Reservation, Review, Comment

User = get_user_model()


class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'is_staff')


# serialiser les données de l'user lors de l'enregistrement
class UserRegistrationSerialiser(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'phone', 'first_name', 'last_name', "password1", "password2"]
        extra_kwargs = {"password": {"write_only": True}}  # pour ne pas afficher dans la sortir json

    def validate(self, attrs):
        if attrs['password1'] != attrs['password2']:
            raise serializers.ValidationError("Les mots de passe sont differents!")

        password = attrs.get("password1", "")
        if len(password) < 8:
            raise serializers.ValidationError("le password doit avoir minimum 8 characères")

        return attrs

    # fonction pour creer le user
    def create(self, validated_data):
        password = validated_data.pop("password1")
        validated_data.pop("password2")

        return CustomUser.objects.create_user(password=password, **validated_data)


class UserLoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("identifiants incorrect!")


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password1 = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def validate(self, attrs):
        # Vérifie que les deux nouveaux mots de passe correspondent
        if attrs['new_password1'] != attrs['new_password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("Aucun utilisateur associé à cet e-mail.")
        return value

    def save(self):
        email = self.validated_data['email']
        user = User.objects.get(email=email)

        # Générer un lien avec un token
        token = default_token_generator.make_token(user)
        from django.utils.encoding import force_bytes
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        # urll = env('RESET_URL')
        # reset_url = f"{urll}/{uid}/{token}/"
        # reset_url = f"{get_base_url()}api/password/reset/confirm/{uid}/{token}/"
        reset_url = f"http://127.0.0.1:8000/api/password/reset/confirm/{uid}/{token}/"

        # {
        #     "uid": "dXNlcl9pZA==",
        #     "token": "abc123",
        #     "new_password": "nouveau_mot_de_passe"
        # }

        send_mail(
            subject="Réinitialisation de votre mot de passe",
            message=f"Veuillez cliquer sur ce lien pour réinitialiser votre mot de passe : {reset_url}",
            from_email="worksperforms@gmail.com",
            recipient_list=[email],
        )


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField()

    def validate(self, attrs):
        try:
            uid = urlsafe_base64_decode(attrs['uid']).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError("Lien invalide ou utilisateur inexistant.")

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError("Le token est invalide ou a expiré.")

        attrs['user'] = user
        return attrs


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'description')


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ['id', 'image', 'description']


class RoomSerializer(serializers.ModelSerializer):
    images = RoomImageSerializer(many=True, required=False)  # Permet d'ajouter plusieurs images
    rating = serializers.SerializerMethodField()
    category = CategorySerializer(required=False)

    class Meta:
        model = Room
        fields = ['id', 'room_number', 'price_per_night', 'rating', 'is_available', 'description', 'slug', 'category',
                  'images']
        read_only_fields = ['slug']  # Le slug est généré automatiquement

    def create(self, validated_data):
        images_data = self.context['request'].FILES.getlist('images')  # 🔥 Récupérer les images ici
        room = Room.objects.create(**validated_data)  # Créer la chambre

        # Ajouter les images associées
        for image in images_data:
            RoomImage.objects.create(room=room, image=image)

        return room

    def get_rating(self, obj):
        avg_rating = Review.objects.filter(room=obj).aggregate(Avg('rating'))['rating__avg']
        return round(avg_rating, 1) if avg_rating is not None else 0


class ReservationSerializer(serializers.ModelSerializer):
    room = RoomSerializer()

    class Meta:
        model = Reservation
        fields = "__all__"


class DetailReservationSerializer(serializers.ModelSerializer):
    room = RoomSerializer()
    user = CustomUserSerializer()
    nb_jour = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = "__all__"

    def get_nb_jour(self, obj):
        """Calcule le nombre de jours entre check_in et check_out"""
        if obj.check_in and obj.check_out:
            return (obj.check_out - obj.check_in).days
        return 0


class ReservationsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = "__all__"


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'user', 'room', 'rating']


class CommentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer()

    class Meta:
        model = Comment
        fields = ['id', 'user', 'room', 'comment', 'created_at']


class CommentsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'user', 'room', 'comment', 'created_at']
