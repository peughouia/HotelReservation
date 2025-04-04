from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q

from Account.models import Reservation


@receiver(post_save, sender=Reservation)
def update_room_availability(sender, instance, **kwargs):
    """
    Met à jour la disponibilité de la chambre en fonction des dates de réservation et du statut.
    """
    if instance.status == "confirmed":
        if instance.check_in <= now().date():
            instance.room.is_available = False
            instance.room.save()

    if instance.status == "confirmed" and instance.check_out < now().date():
        instance.room.is_available = True
        instance.completed = "completed"
        instance.save()
        instance.room.save()


@receiver(post_save, sender=Reservation)
def auto_cancel_pending_reservations(sender, instance, created, **kwargs):
    print("lancement du signal anul")
    """
    Annule les réservations qui restent en attente plus de 12 heures après leur création.
    """
    if instance.status == "pending" and (now() - instance.created_at) >= timedelta(minutes=10):
        instance.status = "cancelled"
        print('savegarde')
        instance.save()
        print("terminer")


@receiver(post_save, sender=Reservation)
def prevent_duplicate_reservations(sender, instance, **kwargs):
    """
    Empêche d'avoir plusieurs réservations pour la même chambre aux mêmes dates
    si une autre réservation est en attente ou confirmée.
    """
    if instance.status in ["pending", "confirmed"]:
        conflicts = Reservation.objects.filter(
            room=instance.room,
            check_in__lt=instance.check_out,
            check_out__gt=instance.check_in,
            status__in=["pending", "confirmed"]
        ).exclude(id=instance.id)
        if conflicts.exists():
            raise ValueError("Une autre réservation est déjà en cours pour cette chambre aux mêmes dates.")
