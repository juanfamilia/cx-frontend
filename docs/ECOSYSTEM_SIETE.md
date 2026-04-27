# Ecosistema Siete (front)

**Criterios de plataforma y contrato mínimo (v1):** documento canónico en el repositorio **cx-backend**: `docs/SIETE_PLATFORM_MINIMUM_CONTRACT_V1.md`

- **Entitlements**: `EntitlementsService.getMe(companyId?)` → `GET /api/v1/entitlements/me`.
- **Company**: tipos con `siete_field_enabled` y `siete_clever_enabled` para formularios de empresa (superadmin).

Próximo paso: usar `getMe()` en el layout para mostrar/ocultar productos (Field, Clever) sin hardcode.
