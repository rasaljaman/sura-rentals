from django.db import models

class Car(models.Model):
    brand = models.CharField(max_length=50) # e.g., Porsche
    model = models.CharField(max_length=50) # e.g., 911 GT3
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField() # Storing the URL since we will use Supabase for storage
    
    # --- NEW FIELD ---
    gallery = models.JSONField(default=list, blank=True) # Stores an array of multiple image URLs
    # -----------------
    
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, default='Premium') 
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.brand} {self.model}"


class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    user_email = models.EmailField() # Storing the user email securely from Supabase Auth
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    pickup_location = models.CharField(max_length=255, default="Not specified")
    dropoff_location = models.CharField(max_length=255, default="Not specified")
    pickup_time = models.TimeField(null=True, blank=True)
    dropoff_time = models.TimeField(null=True, blank=True)
    
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'), 
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    cancellation_reason = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"Booking for {self.car.model} by {self.user_email}"

class Review(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='reviews')
    user_email = models.CharField(max_length=150)
    rating = models.IntegerField(default=5)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Wishlist(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='favorited_by')
    user_email = models.EmailField()
