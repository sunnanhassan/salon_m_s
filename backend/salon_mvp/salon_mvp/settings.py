"""
Django settings for salon_mvp project.
"""

import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production!
SECRET_KEY = "django-insecure-av%26rya$fu-*j_$*v0ab-(n^*owk6on7=gh6s(*@_8v*^xlsc"

# SECURITY WARNING: don't run with debug turned on in production!
# Set DEBUG based on environment variable for production safety
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Add all necessary hosts
ALLOWED_HOSTS = [
    'salonms-production.up.railway.app',
    '*.railway.app', 
    'localhost', 
    '127.0.0.1'
]

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Local apps
    "users",
    "salons",
    "bookings",
    "payments",

    # Third-party
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # must be high in the list
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # For static files in production
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "salon_mvp.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "salon_mvp.wsgi.application"

# Database
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Karachi"  # Pakistan Standard Time
USE_I18N = True
USE_TZ = True  # Keep True to store in UTC but display in PKT

# Static files configuration for production
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Custom User model
AUTH_USER_MODEL = "users.User"

# Django REST Framework config
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

# JWT config
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=1),   # 24 hours
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
}

# CSRF trusted origins for Railway
CSRF_TRUSTED_ORIGINS = [
    'https://salonms-production.up.railway.app',
    'http://salonms-production.up.railway.app',
    # Add your Vercel URL here when you get it
    # 'https://your-app-name.vercel.app',
]

# CORS configuration for React frontend
CORS_ALLOWED_ORIGINS = [
    # Local development
    "http://localhost:5173",     # Vite dev server
    "http://127.0.0.1:5173",     # Vite dev server
    "http://localhost:3000",     # Create React App dev server
    # Add your Vercel URL here when you get it
    # "https://your-app-name.vercel.app",
]

# Allow credentials for authentication
CORS_ALLOW_CREDENTIALS = True