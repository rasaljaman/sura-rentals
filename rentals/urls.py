from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, BookingViewSet, ReviewViewSet, WishlistViewSet

router = DefaultRouter()
router.register(r'cars', CarViewSet)
router.register(r'bookings', BookingViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlists', WishlistViewSet)  

urlpatterns = [
    path('', include(router.urls)),
]
