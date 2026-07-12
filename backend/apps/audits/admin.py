from django.contrib import admin
from .models import AuditCycle, AuditAsset


@admin.register(AuditCycle)
class AuditCycleAdmin(admin.ModelAdmin):
	list_display = ("title", "department", "location", "start_date", "end_date", "status")
	list_filter = ("status", "department")
	search_fields = ("title", "description")


@admin.register(AuditAsset)
class AuditAssetAdmin(admin.ModelAdmin):
	list_display = ("audit_cycle", "asset", "verification_status", "verified_by", "verified_at")
	list_filter = ("verification_status",)
	search_fields = ("asset__asset_tag", "asset__name")
