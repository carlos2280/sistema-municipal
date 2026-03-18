Tengo todo el panorama. Aquí está el análisis completo:

Árbol actual de src/ (archivos relevantes)

src/
├── components/                          ← NO canónico en mf_shell según CLAUDE.md
│   ├── ChatDrawerWrapper.tsx            ← overlay del layout, importado por AppLayout
│   ├── errors/
│   │   ├── MicrofrontendErrorBoundary.tsx  ← usado por utils/generateRoutesFromMenu.tsx
│   │   └── index.ts
│   └── organigrama/                     ← overlay del layout, importado por AppLayout
│       ├── OrgNode.tsx
│       ├── OrganigramaDialog.tsx
│       ├── OrganigramaFlow.tsx
│       └── organigramaMock.ts
│
├── layout/
│   ├── AppLayout.tsx                    ✓ canónico
│   ├── Eyebrow/                         ✓ canónico
│   ├── Compass/                         ✓ canónico
│   ├── NavPanel/                        ✓ canónico
│   ├── Stage/                           ✓ canónico
│   ├── CommandPalette/                  ✓ canónico
│   │
│   ├── AvatarMenu.tsx                   ← activo (importado por AppLayout)
│   ├── NotificationPanel.tsx            ← activo (importado por AppLayout)
│   ├── StatusLine.tsx                   ← activo (importado por AppLayout)
│   │
│   ├── AccountMenu.tsx                  ← MUERTO: nadie lo importa
│   ├── AppPageLayout.tsx                ← MUERTO: nadie lo importa
│   ├── CustomizedMenus.tsx              ← MUERTO: nadie lo importa
│   ├── EconomicIndicators.tsx           ← MUERTO: solo EconomicIndicatorsExamples lo usa
│   ├── EconomicIndicatorsExamples.tsx   ← MUERTO: nadie lo importa
│   ├── MainMenu.tsx                     ← MUERTO: nadie lo importa
│   ├── RecursiveMenu.tsx                ← MUERTO: solo MainMenu lo usa (también muerto)
│   └── StatusBar.tsx                    ← MUERTO: versión vieja de StatusLine, sin importadores
│
└── pages/                               ✓ bien estructurado
    ├── login/    (components/ + hooks/) ✓
    ├── mfa-setup/ (components/ + hooks/)✓
    ├── ChatPage.tsx, DashboardPage.tsx  ← simples, sin sub-componentes, OK sueltos
    └── prueba/                          ← sandbox, no vale reorganizar
Plan de reorganización propuesto
A — Mover overlays de components/ → layout/ (lo correcto según CLAUDE.md)
Origen	Destino
components/ChatDrawerWrapper.tsx	layout/ChatDrawer/ChatDrawerWrapper.tsx + index.ts
components/organigrama/*	layout/Organigrama/* + index.ts
Motivo: ambos son overlays on-demand del layout (usados directamente en AppLayout.tsx), igual que NavPanel, CommandPalette. La carpeta components/ no está en la estructura canónica del shell.

B — Crear subcarpetas para overlays sueltos activos en layout/
Origen	Destino
layout/AvatarMenu.tsx	layout/AvatarMenu/AvatarMenu.tsx + index.ts
layout/NotificationPanel.tsx	layout/NotificationPanel/NotificationPanel.tsx + index.ts
layout/StatusLine.tsx	layout/StatusLine/StatusLine.tsx + index.ts
Motivo: consistencia con los demás organismos del layout. Cada overlay tiene su carpeta propia.

C — Código muerto: propongo eliminar
Estos 8 archivos no tienen ningún importador en el codebase:

Archivo	Razón
layout/AccountMenu.tsx	Sin importadores. Supersedido por AvatarMenu
layout/AppPageLayout.tsx	Sin importadores. Template sin uso
layout/CustomizedMenus.tsx	Sin importadores. Selector de sistema sin uso
layout/EconomicIndicators.tsx	Solo referenciado por Examples (también muerto)
layout/EconomicIndicatorsExamples.tsx	Sin importadores
layout/MainMenu.tsx	Sin importadores. Supersedido por NavPanelMenu
layout/RecursiveMenu.tsx	Solo usado por MainMenu (también muerto)
layout/StatusBar.tsx	Sin importadores. Supersedido por StatusLine
D — Sin cambios
components/errors/ → bien ubicado, lo usa el router (no es organismo de layout)
pages/ → estructura correcta
hooks/, context/, types/, routes/, utils/ → correctos
Resultado final de layout/

layout/
├── AppLayout.tsx
├── Eyebrow/
├── Compass/
├── NavPanel/
├── Stage/
├── CommandPalette/
├── AvatarMenu/          ← nuevo
├── NotificationPanel/   ← nuevo
├── StatusLine/          ← nuevo
├── ChatDrawer/          ← movido desde components/
└── Organigrama/         ← movido desde components/
¿Apruebas este plan? Si quieres ajustar algo (por ejemplo conservar algún archivo "muerto" en lugar de eliminarlo), dímelo y procedo con la reorganización.

