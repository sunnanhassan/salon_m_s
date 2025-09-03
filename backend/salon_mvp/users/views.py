from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import UserRegisterSerializer

# -----------------------------
# User Registration
# -----------------------------
class UserRegisterViewSet(viewsets.GenericViewSet):
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        """POST /api/auth/register/"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if user.role == 'superadmin':
            return Response(
                {"detail": "Cannot register as superadmin."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role
        }, status=status.HTTP_201_CREATED)


# -----------------------------
# Current logged-in user
# -----------------------------
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
    })
