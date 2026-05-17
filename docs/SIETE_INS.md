# Siete InS en el frontend

Ruta: **`/ins`** (lazy). Requiere sesión y, salvo rol **0**, empresa con **`siete_ins_enabled`** en backend (`GET /api/v1/ins/access`).

**Continuidad ecosistema:** InS forma parte de Siete Inteligencia Creativa; cuando existan contratos y vínculos en datos, debe alinearse con la intención metodológica y señales compartidas con Field/CX — ver en **cx-backend** `docs/7FIELD_PRODUCT_EXPERIENCE_DIRECTION_V1.md` §10.

## Archivos

| Área | Archivo |
|------|---------|
| Acceso | `src/app/core/services/ins-access.service.ts` |
| Guarda | `src/app/core/guards/ins.guard.ts` |
| API estudios | `src/app/features/ins/ins-study.service.ts` |
| UI lista | `src/app/features/ins/ins-study-list.component.*` |
| Rutas | `src/app/features/ins/ins.routes.ts` |
| App | `src/app/app.routes.ts` (`path: 'ins'`) |
| Nav | `navRoutes.constant.ts`, `sidebar`, `nav-mobile` |

## Comportamiento

- **Menú “Siete InS”**: visible si el rol está permitido y (`requiresIns` es falso **o** `canShowInsNavLink`: rol 0 siempre; resto si `ins_enabled`).
- **Rol 0**: selector de empresa + listado/creación con `company_id` en el body.
- **Otros roles**: usan `company_id` del usuario; si InS no está habilitado, no ven el ítem y la guarda redirige a `/`.

## Próximo paso UI

Formulario de empresa (superadmin) para toggle `siete_ins_enabled` si aún no existe en el front.
