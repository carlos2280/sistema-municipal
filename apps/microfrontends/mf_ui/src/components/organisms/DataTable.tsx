/**
 * DataTable — Organismo
 *
 * Tabla de datos estándar del sistema con:
 * - Skeleton loading
 * - Empty state
 * - Sorting por columnas
 * - Acciones en fila (visibles en hover)
 * - Paginación
 * - Density: compact / standard / comfortable
 * - Modo card-list en mobile (< sm)
 * - stickyHeader
 */

import {
  Box,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  alpha,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useCallback, type ReactNode } from "react";
import { EmptyState } from "../molecules/EmptyState";

// ============================================================================
// TYPES
// ============================================================================

export interface Column<T = Record<string, unknown>> {
  /** Identificador único de la columna */
  key: string;
  /** Texto del encabezado */
  label: string;
  /** Render personalizado. Si no se pasa, usa row[key] como string */
  render?: (value: unknown, row: T, index: number) => ReactNode;
  /** Permite ordenar por esta columna */
  sortable?: boolean;
  /** Ancho de la columna (CSS string o número en px) */
  width?: string | number;
  /** Alineación */
  align?: "left" | "center" | "right";
  /** Ocultar en mobile (< sm) */
  hideOnMobile?: boolean;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  /** Key única por fila para React key prop */
  rowKey?: keyof T | ((row: T) => string | number);
  loading?: boolean;
  /** Número de filas skeleton durante loading */
  skeletonRows?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  pagination?: PaginationConfig;
  onRowClick?: (row: T, index: number) => void;
  density?: "compact" | "standard" | "comfortable";
  stickyHeader?: boolean;
  /** Render de acciones por fila — aparecen en hover */
  renderRowActions?: (row: T, index: number) => ReactNode;
  /** Máxima altura de la tabla (para scroll interno) */
  maxHeight?: string | number;
}

type SortDirection = "asc" | "desc" | null;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${theme.palette.divider}`,
  "&::-webkit-scrollbar": { width: 6, height: 6 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-thumb": {
    background: alpha(theme.palette.text.primary, 0.12),
    borderRadius: 3,
    "&:hover": { background: alpha(theme.palette.text.primary, 0.25) },
  },
  scrollbarWidth: "thin",
  scrollbarColor: `${alpha(theme.palette.text.primary, 0.12)} transparent`,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
  "&:hover .row-actions": {
    opacity: 1,
  },
  "&:last-child td, &:last-child th": {
    borderBottom: 0,
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  "& .MuiTableCell-head": {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.grey[50]
        : alpha(theme.palette.common.white, 0.03),
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: "0.75rem",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    borderBottom: `2px solid ${theme.palette.divider}`,
    whiteSpace: "nowrap",
    userSelect: "none",
  },
}));

const SortButton = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  cursor: "pointer",
  color: active ? theme.palette.primary.main : "inherit",
  transition: "color 0.15s ease",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

const RowActions = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  opacity: 0,
  transition: "opacity 0.15s ease",
});

const MobileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${theme.palette.divider}`,
  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
  "&:hover": {
    boxShadow: theme.shadows[2],
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

// ============================================================================
// CELL PADDING POR DENSITY
// ============================================================================

const densityPadding = {
  compact: "6px 16px",
  standard: "12px 16px",
  comfortable: "18px 16px",
} as const;

// ============================================================================
// SKELETON ROW
// ============================================================================

function SkeletonRow({
  columns,
  density,
}: {
  columns: Column[];
  density: "compact" | "standard" | "comfortable";
}) {
  return (
    <TableRow>
      {columns.map((col) => (
        <TableCell
          key={col.key}
          align={col.align ?? "left"}
          sx={{ padding: densityPadding[density] }}
        >
          <Skeleton variant="text" width={col.align === "right" ? 60 : "80%"} height={20} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ============================================================================
// SORT ICON
// ============================================================================

function SortIcon({
  direction,
  size = 14,
}: {
  direction: SortDirection;
  size?: number;
}) {
  if (direction === "asc") return <ArrowUp size={size} strokeWidth={1.5} />;
  if (direction === "desc") return <ArrowDown size={size} strokeWidth={1.5} />;
  return <ArrowUpDown size={size} strokeWidth={1.5} style={{ opacity: 0.4 }} />;
}

// ============================================================================
// MOBILE CARD VIEW
// ============================================================================

function MobileCardList<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  onRowClick,
  renderRowActions,
}: Pick<
  DataTableProps<T>,
  "columns" | "data" | "rowKey" | "onRowClick" | "renderRowActions"
>) {
  const getKey = (row: T, index: number): string | number => {
    if (!rowKey) return index;
    if (typeof rowKey === "function") return rowKey(row);
    return row[rowKey] as string | number;
  };

  const primaryCol = columns[0];
  const restCols = columns.slice(1).filter((c) => !c.hideOnMobile);

  return (
    <Stack spacing={1.5}>
      {data.map((row, index) => (
        <MobileCard
          key={getKey(row, index)}
          elevation={0}
          onClick={() => onRowClick?.(row, index)}
          sx={{ cursor: onRowClick ? "pointer" : "default" }}
        >
          <Stack spacing={1}>
            {/* Primary field */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {primaryCol?.render ? (
                  primaryCol.render(
                    row[primaryCol.key],
                    row,
                    index,
                  )
                ) : (
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {String(row[primaryCol?.key ?? ""] ?? "")}
                  </Typography>
                )}
              </Box>
              {renderRowActions && (
                <Box sx={{ flexShrink: 0, ml: 1 }}>
                  {renderRowActions(row, index)}
                </Box>
              )}
            </Stack>

            {/* Rest of fields */}
            {restCols.length > 0 && (
              <Stack spacing={0.5}>
                {restCols.map((col) => (
                  <Stack key={col.key} direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ minWidth: 100, flexShrink: 0 }}
                    >
                      {col.label}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {col.render ? (
                        col.render(row[col.key], row, index)
                      ) : (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {String(row[col.key] ?? "—")}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </MobileCard>
      ))}
    </Stack>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  rowKey,
  loading = false,
  skeletonRows = 5,
  emptyTitle = "Sin resultados",
  emptyDescription = "No hay datos que mostrar con los filtros aplicados.",
  emptyAction,
  pagination,
  onRowClick,
  density = "standard",
  stickyHeader = false,
  renderRowActions,
  maxHeight,
}: DataTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (key: string) => {
      if (sortKey === key) {
        setSortDir((prev) =>
          prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
        );
        if (sortDir === "desc") setSortKey(null);
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey, sortDir],
  );

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    const cmp =
      String(valA ?? "").localeCompare(String(valB ?? ""), "es", {
        numeric: true,
      });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const getKey = (row: T, index: number): string | number => {
    if (!rowKey) return index;
    if (typeof rowKey === "function") return rowKey(row);
    return row[rowKey] as string | number;
  };

  const visibleColumns = isMobile
    ? columns.filter((c) => !c.hideOnMobile)
    : columns;

  // Mobile card view
  if (isMobile && !loading) {
    if (sortedData.length === 0) {
      return (
        <EmptyState
          variant="search"
          title={emptyTitle}
          description={emptyDescription}
        />
      );
    }

    return (
      <>
        <MobileCardList
          columns={visibleColumns}
          data={sortedData}
          rowKey={rowKey}
          onRowClick={onRowClick}
          renderRowActions={renderRowActions}
        />
        {pagination && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page}
            rowsPerPage={pagination.pageSize}
            onPageChange={(_, p) => pagination.onPageChange(p)}
            onRowsPerPageChange={(e) =>
              pagination.onPageSizeChange?.(Number(e.target.value))
            }
            rowsPerPageOptions={pagination.pageSizeOptions ?? [10, 25, 50]}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} de ${count}`
            }
            sx={{ borderTop: `1px solid ${theme.palette.divider}`, mt: 1 }}
          />
        )}
      </>
    );
  }

  return (
    <Box>
      <StyledTableContainer
        component={Paper}
        elevation={0}
        sx={{ maxHeight: maxHeight ?? "none" }}
      >
        <Table stickyHeader={stickyHeader} size={density === "compact" ? "small" : "medium"}>
          {/* HEAD */}
          <StyledTableHead>
            <TableRow>
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.key}
                  align={col.align ?? "left"}
                  sx={{
                    width: col.width,
                    padding: densityPadding[density],
                  }}
                >
                  {col.sortable ? (
                    <SortButton
                      active={sortKey === col.key && sortDir !== null}
                      onClick={() => handleSort(col.key)}
                      role="button"
                      aria-label={`Ordenar por ${col.label}`}
                    >
                      {col.label}
                      <SortIcon
                        direction={sortKey === col.key ? sortDir : null}
                      />
                    </SortButton>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {renderRowActions && (
                <TableCell
                  align="right"
                  sx={{ padding: densityPadding[density], width: 80 }}
                />
              )}
            </TableRow>
          </StyledTableHead>

          {/* BODY */}
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <SkeletonRow
                  key={i}
                  columns={visibleColumns}
                  density={density}
                />
              ))
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    visibleColumns.length + (renderRowActions ? 1 : 0)
                  }
                  sx={{ border: 0, p: 0 }}
                >
                  <EmptyState
                    variant="search"
                    title={emptyTitle}
                    description={emptyDescription}
                    size="small"
                  />
                  {emptyAction && (
                    <Box sx={{ display: "flex", justifyContent: "center", pb: 3 }}>
                      {emptyAction}
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <StyledTableRow
                  key={getKey(row, index)}
                  onClick={() => onRowClick?.(row, index)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {visibleColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align ?? "left"}
                      sx={{
                        padding: densityPadding[density],
                        maxWidth: col.width ?? 300,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render
                        ? col.render(row[col.key], row, index)
                        : (
                          <Typography
                            variant="body2"
                            noWrap
                            title={String(row[col.key] ?? "")}
                          >
                            {String(row[col.key] ?? "—")}
                          </Typography>
                        )}
                    </TableCell>
                  ))}

                  {renderRowActions && (
                    <TableCell
                      align="right"
                      sx={{ padding: densityPadding[density] }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions className="row-actions">
                        {renderRowActions(row, index)}
                      </RowActions>
                    </TableCell>
                  )}
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* PAGINATION */}
      {pagination && !loading && sortedData.length > 0 && (
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page}
          rowsPerPage={pagination.pageSize}
          onPageChange={(_, p) => pagination.onPageChange(p)}
          onRowsPerPageChange={(e) =>
            pagination.onPageSizeChange?.(Number(e.target.value))
          }
          rowsPerPageOptions={pagination.pageSizeOptions ?? [10, 25, 50]}
          labelRowsPerPage="Por página:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            "& .MuiTablePagination-toolbar": { minHeight: 48 },
          }}
        />
      )}
    </Box>
  );
}

export default DataTable;
