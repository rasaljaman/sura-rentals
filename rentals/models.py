from django.db import models

class Car(models.Model):
    brand = models.CharField(max_length=50) # e.g., Porsche
    model = models.CharField(max_length=50) # e.g., 911 GT3
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField() # Storing the URL since we will use Supabase for storage
    is_available = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.brand} {self.model}"

class Booking(models.Model):
    car = models.ForeignKey(Car, on_delete=models.CASCADE, related_name='bookings')
    user_email = models.EmailField() # Storing the user email securely from Supabase Auth
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, 
        choices=[('Pending', 'Pending'), ('Confirmed', 'Confirmed')],
        default='Pending'
    )
    
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