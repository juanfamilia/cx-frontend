# Ecosistema Siete (front)

**Visión:** Siete Inteligencia Creativa **no** es una colección de pantallas aisladas ni APIs sin continuidad: Field, CX, InS, Clever y Perfil son **vistas** sobre **memoria metodológica viva** (contexto, identidad, lenguaje, señales compartidas). La UI en Angular debe reflejar eso; criterios transversales en **cx-backend**: `docs/7FIELD_PRODUCT_EXPERIENCE_DIRECTION_V1.md`.

**Índice ampliado tenant / productos / API:** `docs/ECOSYSTEM_SIETE.md` en **cx-backend**.

**Criterios de plataforma y contrato mínimo (v1):** `docs/SIETE_PLATFORM_MINIMUM_CONTRACT_V1.md` en **cx-backend**.

**7Field — hallazgos, gobierno de reglas y Clever:** `docs/7FIELD_FINDINGS_GOVERNANCE_AND_EXEC_INTEL_V1.md` en **cx-backend**.

**7Field — prioridades comerciales (Auto QA, Backcheck Intelligence, Cost of Error, narrativa inevitable):** `docs/7FIELD_COMMERCIAL_STRATEGY_V1.md` en **cx-backend**.

**7Field — plan de arquitectura, alcance y tracción (arranque código):** `docs/7FIELD_ARCHITECTURE_SCOPE_AND_TRACTION_V1.md` en **cx-backend**.

**7Field — dirección de experiencia unificada y checklist PR:** `docs/7FIELD_PRODUCT_EXPERIENCE_DIRECTION_V1.md` en **cx-backend**.

**7Field — decisiones estructurales cerradas (motor reglas, Study, Auto QA v1, Readiness, Clever):** `docs/7FIELD_STRUCTURAL_DECISIONS_V1.md` en **cx-backend**.

- **Entitlements**: `EntitlementsService.getMe(companyId?)` → `GET /api/v1/entitlements/me`.
- **Company**: tipos con `siete_field_enabled` y `siete_clever_enabled` para formularios de empresa (superadmin).

Próximo paso: usar `getMe()` en el layout para mostrar/ocultar productos (Field, Clever) sin hardcode.
