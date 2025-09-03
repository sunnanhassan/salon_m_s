from django.urls import path
from .views import UserRegisterViewSet, current_user
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

register = UserRegisterViewSet.as_view({'post': 'register'})

urlpatterns = [
    path('register/', register, name='user-register'),         # POST /api/auth/register/
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # POST /api/auth/login/
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', current_user, name='current_user'),            # GET /api/auth/me/
]
