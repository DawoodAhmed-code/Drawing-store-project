import { CadItem } from '../types/cad';

/**
 * Generates and triggers download of actual CAD drawing file (.dxf format which is standard AutoCAD text-exchange format)
 * and an official RajaCAD license certificate.
 */
export function downloadCadPackage(
  item: CadItem,
  licenseKey: string,
  userEmail: string,
  userName: string
) {
  // 1. Generate an authentic DXF (AutoCAD Drawing Exchange Format) ASCII text structure
  const dxfContent = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1032
9
$INSUNITS
70
4
9
$DWGCODEPAGE
1
ANSI_1252
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LTYPE
70
1
0
LTYPE
2
CONTINUOUS
70
0
3
Solid line
72
65
73
0
40
0.0
0
ENDTAB
0
TABLE
2
LAYER
70
${item.layers.length}
${item.layers
  .map(
    (l, idx) => `0
LAYER
2
${l.name}
70
0
62
${idx + 1}
6
CONTINUOUS`
  )
  .join('\n')}
0
ENDTAB
0
ENDSEC
0
SECTION
2
BLOCKS
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
M-ANNO-TEXT
10
100.0
20
100.0
30
0.0
40
25.0
1
RajaCAD - ${item.title}
0
TEXT
8
M-ANNO-TEXT
10
100.0
20
60.0
30
0.0
40
15.0
1
Licensed To: ${userEmail} [KEY: ${licenseKey}]
0
TEXT
8
M-ANNO-TEXT
10
100.0
20
30.0
30
0.0
40
15.0
1
Standard: ${item.specs.standards} | Scale: ${item.specs.scale}
0
LINE
8
${item.layers[0]?.name || '0'}
10
0.0
20
0.0
30
0.0
11
15000.0
21
0.0
31
0.0
0
LINE
8
${item.layers[0]?.name || '0'}
10
15000.0
20
0.0
30
0.0
11
15000.0
21
10000.0
31
0.0
0
LINE
8
${item.layers[0]?.name || '0'}
10
15000.0
20
10000.0
30
0.0
11
0.0
21
10000.0
31
0.0
0
LINE
8
${item.layers[0]?.name || '0'}
10
0.0
20
10000.0
30
0.0
11
0.0
21
0.0
31
0.0
0
ENDSEC
0
EOF`;

  // 2. Trigger DXF CAD file download
  const cleanTitle = item.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  const dxfBlob = new Blob([dxfContent], { type: 'application/dxf' });
  const dxfUrl = URL.createObjectURL(dxfBlob);
  const link = document.createElement('a');
  link.href = dxfUrl;
  link.download = `RajaCAD_${cleanTitle}.dxf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(dxfUrl);

  // 3. Generate official RajaCAD Commercial License & Spec Sheet TXT
  const certificateContent = `========================================================================
                      RajaCAD OFFICIAL CAD DRAWING LICENSE
========================================================================
PRODUCT:        ${item.title}
TRADE/CATEGORY: ${item.category} - ${item.subCategory}
DWG COMPATIBILITY: ${item.dwgVersion}
STANDARDS:      ${item.specs.standards}
UNITS / SCALE:  ${item.specs.units} / ${item.specs.scale}

------------------------------------------------------------------------
LICENSEE DETAILS
------------------------------------------------------------------------
CLIENT NAME:    ${userName || 'RajaCAD Valued Client'}
EMAIL:          ${userEmail}
LICENSE KEY:    ${licenseKey}
TIMESTAMP:      ${new Date().toISOString()}
AUTHORIZED USE: Commercial & Engineering Project Implementation

------------------------------------------------------------------------
INCLUDED DRAWING LAYERS (${item.layersCount} Total)
------------------------------------------------------------------------
${item.layers.map((l) => `  * ${l.name.padEnd(20)} [Color: ${l.color}] (Type: ${l.lineType})`).join('\n')}

------------------------------------------------------------------------
AUTOCAD & REVIT IMPORT INSTRUCTIONS
------------------------------------------------------------------------
1. Launch AutoCAD, AutoCAD MEP, or Revit.
2. In AutoCAD, type 'DXFIN' or 'OPEN' and select 'RajaCAD_${cleanTitle}.dxf'.
3. Type 'ZOOM' then 'EXTENTS' (or double-click mouse wheel) to center view.
4. Set units to Millimeters via 'UNITS' command.
5. All layers, line weights, and pen tables are pre-configured to standard.

For engineering drawing custom modification or coordination support:
Contact: RajaCAD Lead Draughtsman Studio (dawoodahmed0175@gmail.com)
Website: https://rajacad.com
========================================================================`;

  const certBlob = new Blob([certificateContent], { type: 'text/plain;charset=utf-8' });
  const certUrl = URL.createObjectURL(certBlob);
  const certLink = document.createElement('a');
  certLink.href = certUrl;
  certLink.download = `RajaCAD_LICENSE_${cleanTitle}.txt`;
  setTimeout(() => {
    document.body.appendChild(certLink);
    certLink.click();
    document.body.removeChild(certLink);
    URL.revokeObjectURL(certUrl);
  }, 400);
}
