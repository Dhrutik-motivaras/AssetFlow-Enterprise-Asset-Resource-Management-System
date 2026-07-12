from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import AuditCycleViewSet, AuditAssetViewSet

router = DefaultRouter()
router.register(r"cycles", AuditCycleViewSet, basename="auditcycle")
router.register(r"assets", AuditAssetViewSet, basename="auditasset")

urlpatterns = [
    path("", include(router.urls)),
]
