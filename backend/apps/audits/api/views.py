from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.audits.models import AuditCycle, AuditAsset
from apps.assets.models import Asset
from .serializers import AuditCycleSerializer, AuditAssetSerializer


class AuditCycleViewSet(viewsets.ModelViewSet):
    queryset = AuditCycle.objects.all()
    serializer_class = AuditCycleSerializer

    @action(detail=True, methods=["post"])
    def mark_asset(self, request, pk=None):
        """Create or update an AuditAsset for this cycle"""
        cycle = self.get_object()
        data = request.data.copy()
        data["audit_cycle"] = cycle.id
        serializer = AuditAssetSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        # If record exists, update it instead
        asset = serializer.validated_data.get("asset")
        record, created = AuditAsset.objects.update_or_create(
            audit_cycle=cycle,
            asset=asset,
            defaults={
                "verified_by": serializer.validated_data.get("verified_by"),
                "verification_status": serializer.validated_data.get("verification_status"),
                "remarks": serializer.validated_data.get("remarks"),
            },
        )
        return Response(AuditAssetSerializer(record).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def discrepancies(self, request, pk=None):
        cycle = self.get_object()
        qs = cycle.audit_assets.exclude(verification_status=AuditAsset.VerificationStatus.VERIFIED)
        data = AuditAssetSerializer(qs, many=True).data
        return Response(data)

    @action(detail=True, methods=["post"])
    def close(self, request, pk=None):
        """Close cycle: update asset statuses for missing/damaged items and lock cycle"""
        cycle = self.get_object()
        changed = []
        for record in cycle.audit_assets.all():
            asset = record.asset
            if record.verification_status == AuditAsset.VerificationStatus.MISSING:
                if asset.status != Asset.Status.LOST:
                    asset.status = Asset.Status.LOST
                    asset.save()
                    changed.append({"asset_id": asset.id, "asset_tag": asset.asset_tag, "new_status": asset.status})
            elif record.verification_status == AuditAsset.VerificationStatus.DAMAGED:
                # mark condition and set to under maintenance
                updated = False
                if asset.condition != Asset.Condition.DAMAGED:
                    asset.condition = Asset.Condition.DAMAGED
                    updated = True
                if asset.status != Asset.Status.UNDER_MAINTENANCE:
                    asset.status = Asset.Status.UNDER_MAINTENANCE
                    updated = True
                if updated:
                    asset.save()
                    changed.append({"asset_id": asset.id, "asset_tag": asset.asset_tag, "new_status": asset.status, "condition": asset.condition})

        cycle.status = AuditCycle.Status.CLOSED
        cycle.save()

        report = {"closed_cycle": cycle.id, "changed_assets": changed}
        return Response(report, status=status.HTTP_200_OK)


class AuditAssetViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditAsset.objects.all()
    serializer_class = AuditAssetSerializer
