from rest_framework import serializers
from .models import Car, Booking, Review, Wishlist

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class WishlistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wishlist
        fields = '__all__'

class CarSerializer(serializers.ModelSerializer):
    average_rating = serializers.SerializerMethodField() # Custom star calculator
    
    class Meta:
        model = Car
        fields = '__all__'
        
    def get_average_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return round(sum([r.rating for r in reviews]) / len(reviews), 1)
        return 5.0 # Default if no reviews yet

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
