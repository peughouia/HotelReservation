from django.contrib import admin

from Account.models import CustomUser, Category, RoomImage, Room, Reservation, Review, Comment


# Register your models here.
# Register et afficher dans la parti admin de django.
class UserAdmin(admin.ModelAdmin):
    ordering = ['id']
    list_display = ["id", "email", "last_name", "is_superuser"]


admin.site.register(CustomUser, UserAdmin)


class CategoryAdmin(admin.ModelAdmin):
    ordering = ['id']
    list_display = ["id", "name"]
    list_display_links = ('name',)


admin.site.register(Category, CategoryAdmin)


class ImageRoomAdmin(admin.ModelAdmin):
    ordering = ['id']


admin.site.register(RoomImage, ImageRoomAdmin)


class RoomAdmin(admin.ModelAdmin):
    ordering = ['id']


admin.site.register(Room, RoomAdmin)
admin.site.register(Reservation)
admin.site.register(Review)
admin.site.register(Comment)


