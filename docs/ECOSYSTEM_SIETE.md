# Ecosistema Siete (front)

**Criterios de plataforma y contrato mínimo (v1):** documento canónico en el repositorio **cx-backend**: `docs/SIETE_PLATFORM_MINIMUM_CONTRACT_V1.md`

**7Field — hallazgos, gobierno de reglas y Clever:** `docs/7FIELD_FINDINGS_GOVERNANCE_AND_EXEC_INTEL_V1.md` en **cx-backend**.

**7Field — prioridades comerciales (Auto QA, Backcheck Intelligence, Cost of Error, narrativa inevitable):** `docs/7FIELD_COMMERCIAL_STRATEGY_V1.md` en **cx-backend**.

- **Entitlements**: `EntitlementsService.getMe(companyId?)` → `GET /api/v1/entitlements/me`.
- **Company**: tipos con `siete_field_enabled` y `siete_clever_enabled` para formularios de empresa (superadmin).

Próximo paso: usar `getMe()` en el layout para mostrar/ocultar productos (Field, Clever) sin hardcode.
