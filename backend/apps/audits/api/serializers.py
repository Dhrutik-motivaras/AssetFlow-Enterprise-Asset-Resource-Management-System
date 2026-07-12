from rest_framework import serializers
from apps.audits.models import AuditCycle, AuditAsset
from apps.assets.models import Asset
from apps.organization.models import Employee, Department


class AssetNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = ("id", "asset_tag", "name", "serial_number", "location", "status", "condition")


class AuditAssetSerializer(serializers.ModelSerializer):
    asset = AssetNestedSerializer(read_only=True)
    asset_id = serializers.PrimaryKeyRelatedField(queryset=Asset.objects.all(), source="asset", write_only=True)

    class Meta:
        model = AuditAsset
        fields = ("id", "audit_cycle", "asset", "asset_id", "verified_by", "verification_status", "remarks", "verified_at")
        read_only_fields = ("verified_at",)


class AuditCycleSerializer(serializers.ModelSerializer):
    assigned_auditors = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), many=True)
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all(), allow_null=True, required=False)
    audit_assets = AuditAssetSerializer(many=True, read_only=True)

    class Meta:
        model = AuditCycle
        fields = ("id", "title", "description", "department", "location", "start_date", "end_date", "assigned_auditors", "status", "remarks", "audit_assets", "created_at", "updated_at")
        read_only_fields = ("created_at", "updated_at")

    def create(self, validated_data):
        auditors = validated_data.pop("assigned_auditors", [])
        cycle = AuditCycle.objects.create(**validated_data)
        cycle.assigned_auditors.set(auditors)
        return cycle

    def update(self, instance, validated_data):
        auditors = validated_data.pop("assigned_auditors", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if auditors is not None:
            instance.assigned_auditors.set(auditors)
        return instance
