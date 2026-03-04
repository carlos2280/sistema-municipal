export type OrgNodeType =
  | 'root'
  | 'main'
  | 'unit'
  | 'department'
  | 'staff'
  | 'advisory';

export interface OrgTreeNode {
  id: string;
  label: string;
  type: OrgNodeType;
  children?: OrgTreeNode[];
}

/**
 * Mock del organigrama del Departamento de Administración de Educación Municipal.
 * Refleja la estructura jerárquica de la imagen de referencia.
 */
export const organigramaMock: OrgTreeNode = {
  id: 'alcalde',
  label: 'ALCALDE',
  type: 'root',
  children: [
    { id: 'concejo', label: 'CONCEJO MUNICIPAL', type: 'advisory' },
    { id: 'juez', label: 'JUEZ DE POLICÍA LOCAL', type: 'advisory' },
    { id: 'control', label: 'DIRECCIÓN DE CONTROL INTERNO', type: 'advisory' },
    {
      id: 'dpto-educ',
      label: 'DEPARTAMENTO DE ADMINISTRACIÓN DE EDUCACIÓN MUNICIPAL',
      type: 'main',
      children: [
        { id: 'asesoria', label: 'ASESORÍA JURÍDICA', type: 'advisory' },
        {
          id: 'ut-pedagogica',
          label: 'UNIDAD TÉCNICO PEDAGÓGICA',
          type: 'unit',
          children: [
            {
              id: 'tcp-comunal',
              label: 'Unidad Técnica Pedagógica Comunal',
              type: 'staff',
            },
            {
              id: 'establecimientos',
              label: 'ESTABLECIMIENTOS EDUCACIONALES',
              type: 'department',
              children: [
                {
                  id: 'sep-faep',
                  label: 'COORDINACIÓN SEP, FAEP',
                  type: 'staff',
                },
                {
                  id: 'convivencia',
                  label: 'Equipos de Convivencia Escolar CCEE',
                  type: 'staff',
                },
                {
                  id: 'pie',
                  label: 'Coordinación PIE',
                  type: 'department',
                  children: [
                    {
                      id: 'integracion',
                      label: 'Equipos de Integración Escolar CCEE',
                      type: 'staff',
                    },
                    {
                      id: 'jardines',
                      label: 'Jardines Infantiles y VTF',
                      type: 'staff',
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'adm-finanzas',
          label: 'UNIDAD DE ADMINISTRACIÓN Y FINANZAS',
          type: 'unit',
          children: [
            {
              id: 'enc-adm',
              label: 'ENCARGADO DE UNIDAD',
              type: 'department',
            },
            { id: 'bbrr', label: 'BB.RR', type: 'staff' },
            {
              id: 'riesgos',
              label: 'Departamento de Proyectos de Riesgos',
              type: 'staff',
            },
            {
              id: 'inventario',
              label: 'INVENTARIO Y ARCHIVO',
              type: 'staff',
            },
            {
              id: 'adquisiciones',
              label: 'ADQUISICIONES Y MERCADO PÚBLICO',
              type: 'department',
              children: [
                {
                  id: 'finanzas-daem',
                  label: 'Encargada de Finanzas DAEM',
                  type: 'staff',
                },
                {
                  id: 'contadora',
                  label: 'CONTADORA DE APOYO',
                  type: 'staff',
                },
                {
                  id: 'sec-finanzas',
                  label: 'SECRETARIA FINANZAS',
                  type: 'staff',
                },
                {
                  id: 'of-admin',
                  label: 'Oficial Administrativo',
                  type: 'staff',
                },
                {
                  id: 'tics',
                  label: 'DEPARTAMENTO TICS',
                  type: 'staff',
                },
              ],
            },
          ],
        },
        {
          id: 'gestion-com',
          label: 'GESTIÓN Y COMUNICACIONES',
          type: 'unit',
          children: [
            {
              id: 'oficina-partes',
              label: 'OFICINA DE PARTES',
              type: 'staff',
            },
            {
              id: 'asistente-daem',
              label: 'ASISTENTE DAEM',
              type: 'staff',
            },
            {
              id: 'gestion-daem',
              label: 'Gestión y Comunicaciones DAEM',
              type: 'staff',
            },
            {
              id: 'asistente-apoyo',
              label: 'ASISTENTE DE APOYO',
              type: 'staff',
            },
            {
              id: 'extraescolar',
              label: 'DEPARTAMENTOS DE EXTRAESCOLAR DE LOS CENTROS EDUCATIVOS',
              type: 'department',
              children: [
                { id: 'folklore', label: 'FOLKLORE CHILENO', type: 'staff' },
                { id: 'artes', label: 'ARTES', type: 'staff' },
                { id: 'musica', label: 'MÚSICA', type: 'staff' },
                { id: 'deportes', label: 'DEPORTES', type: 'staff' },
                {
                  id: 'robotica',
                  label: 'ROBÓTICA Y TECNOLOGÍA EDUCATIVA',
                  type: 'staff',
                },
              ],
            },
          ],
        },
        {
          id: 'apoyo',
          label: 'APOYO',
          type: 'unit',
          children: [
            {
              id: 'enc-extraescolar',
              label: 'ENCARGADO EXTRAESCOLAR',
              type: 'staff',
            },
          ],
        },
        {
          id: 'obras-educ',
          label: 'UNIDAD DE OBRAS EDUCATIVAS',
          type: 'unit',
          children: [
            {
              id: 'enc-obras',
              label: 'ENCARGADO DE UNIDAD',
              type: 'department',
            },
            {
              id: 'proyectos-ccee',
              label: 'PROYECTOS E INFRAESTRUCTURA CCEE',
              type: 'department',
              children: [
                {
                  id: 'proy-educ',
                  label: 'Proyectos Educativos',
                  type: 'staff',
                },
                {
                  id: 'mantenimiento',
                  label: 'Mantenimiento y Operaciones CCEE',
                  type: 'staff',
                },
                {
                  id: 'movilizacion',
                  label: 'Encargado de Movilización',
                  type: 'staff',
                },
                {
                  id: 'conductores',
                  label: 'Conductores Auxiliares',
                  type: 'staff',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
