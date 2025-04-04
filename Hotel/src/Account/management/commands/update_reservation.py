from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta

from Account.models import Reservation, Room


class Command(BaseCommand):
    help = "Met à jour les réservations et la disponibilité des chambres"

    def handle(self, *args, **kwargs):
        now = timezone.now().date()

        # 2. Réactiver les chambres lorsque la date de check-out arrive
        reservations_to_end = Reservation.objects.filter(status='confirmed')
        for reservation in reservations_to_end:
            if reservation.check_out < now:
                print(reservation.room.is_available)
                reservation.room.is_available = True
                reservation.completed = 'completed'  # Mettre à jour le statut "completed"
                reservation.save()
                reservation.room.save()

        # 1. Désactiver les chambres lorsque la date de check-in arrive et le statut est "confirmed"
        reservations_to_start = Reservation.objects.filter(status='confirmed')
        for reservation in reservations_to_start:
            if reservation.check_in <= now < reservation.check_out:
                print(reservation.room.is_available)
                reservation.room.is_available = False
                reservation.room.save()

        # 3. Annuler les réservations "pending" qui dépassent 12h
        twelve_hours_ago = timezone.now() - timedelta(hours=5)
        pending_reservations = Reservation.objects.filter(status='pending', created_at__lt=twelve_hours_ago)
        for reservation in pending_reservations:
            reservation.status = 'cancelled'
            reservation.completed = 'cancelled'
            reservation.save()

        self.stdout.write(self.style.SUCCESS("Mise à jour des réservations et des chambres effectuée !"))
