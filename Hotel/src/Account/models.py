import os
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.crypto import get_random_string
from django.utils.text import slugify


# Create your models here.
# class permettant de redefinie la creation des utilisateur de django
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'email doit être renseignée")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Le super-utilisateur doit avoir is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Le super-utilisateur doit avoir is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# Creation du model utilisateur.
class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=255)
    phone = models.CharField(max_length=15, unique=True, blank=False)
    first_name = models.CharField(max_length=30, blank=False)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    addressPostal = models.CharField(max_length=150, blank=True, null=True)
    ville = models.CharField(max_length=150, blank=True, null=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ['first_name', 'last_name']

    def __str__(self):
        return self.email


# Catégories de chambre
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# Chambres d'hôtel
class Room(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    room_number = models.CharField(max_length=10, unique=True)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=0)
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True, null=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:  # Générer un slug uniquement s'il n'existe pas encore
            slug_base = slugify(f"{self.category.name}-{self.room_number}")
            slug = slug_base

            if Room.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(3)}'

            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Room {self.room_number} ({self.category.name})"


class Favorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'room')  # Un utilisateur ne peut pas avoir la même chambre en favori deux fois

    def __str__(self):
        return f"{self.user.username} - {self.room.room_number}"


def upload_path(instance, filename):
    """
    Fonction qui génère dynamiquement le chemin d'upload des images
    Format : media/room_images/<slug>/filename
    """
    room_slug = instance.room.slug or slugify(instance.room.slug)  # Générer un slug propre
    # return os.path.join('room_images', room_slug, filename)
    return os.path.join('room_images', filename)


class RoomImage(models.Model):
    room = models.ForeignKey(Room, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to=upload_path)
    description = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Image for Room {self.room.room_number}"


# Réservations
class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('confirmed', 'Confirmée'),
        ('cancelled', 'Annulée'),
        ('completed', 'Terminée'),
    ]
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    check_in = models.DateTimeField()
    check_out = models.DateTimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    completed = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True, blank=True)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)  # Champ stocké

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:  # Générer un slug uniquement s'il n'existe pas encore
            slug_base = slugify(f"{self.user.first_name}-{self.room.room_number}")
            slug = slug_base

            if Reservation.objects.filter(slug=slug).exists():
                slug = f'{slug_base}-{get_random_string(3)}'

            self.slug = slug

        if self.check_in and self.check_out and self.room:
            nb_jours = (self.check_out - self.check_in).days
            self.total_price = max(nb_jours, 1) * self.room.price_per_night  # Stocké en base

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Réservation de {self.user.first_name} - {self.room.room_number}-{self.status}"


class Comment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=True)  # Pour la modération

    def __str__(self):
        return f"Commentaire de {self.user.first_name} - {self.comment[:20]}..."


# Paiements
class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'En attente'),
        ('completed', 'Complété'),
        ('failed', 'Échoué')
    ]
    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=PAYMENT_STATUS, default='pending')
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Paiement {self.status} - {self.reservation.user.first_name}"


# Historique des paiements
class PaymentHistory(models.Model):
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=Payment.PAYMENT_STATUS)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Historique - {self.payment.reservation.user.first_name} ({self.status})"


# Factures
class Invoice(models.Model):
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE)
    pdf_file = models.FileField(upload_to='invoices/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Facture - {self.payment.reservation.user.first_name}"


# Avis des clients
class Review(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    rating = models.IntegerField()  # Note sur 5

    class Meta:
        unique_together = ('user', 'room')

    def __str__(self):
        return f"Note {self.rating}/5 - {self.user.first_name}"


# Notifications
class Notification(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification pour {self.user.first_name} - {'Lue' if self.is_read else 'Non lue'}"
