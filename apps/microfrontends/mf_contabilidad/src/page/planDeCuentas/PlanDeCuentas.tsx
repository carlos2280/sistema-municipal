import { Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { JSX } from 'react';
import { AccountForm } from '../../components/AccountForm';
import { PlanDeCuentasTree } from '../../components/PlanDeCuentasTree';
import useCreatePlanCuenta from '../../hooks/planesCuentas/useCreatePlanCuenta';
import { usePlanDeCuentas } from '../../hooks/planesCuentas/usePlanDeCuentas';
import FormularioBase from './formulario/FormularioBase';
// import { highlightSearchTerm as highlightRaw } from "../../utils/planDeCuentasUtils";

export const PlanDeCuentas = () => {
  const { ui, actions } = usePlanDeCuentas();
  const {
    methods,
    onCrearPlanesCuenta,
    actions: actionsCreate,
  } = useCreatePlanCuenta();

  // const highlight = (text: string, term: string) => (
  // 	<span
  // 		// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
  // 		dangerouslySetInnerHTML={{
  // 			__html: highlightRaw(text, term, theme.palette),
  // 		}}
  // 	/>
  // );

  const highlightSearchTerm = (text: string, term: string): JSX.Element => {
    if (!term.trim()) return <span>{text}</span>;

    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <Box
              key={`${part}-${i.toString()}`}
              component="span"
              sx={{
                backgroundColor: (theme) =>
                  alpha(theme.palette.primary.dark, 0.08),
                color: (theme) => theme.palette.primary.main,
                fontWeight: 500,
                padding: '1px 2px',
                borderRadius: '2px',
                fontStyle: 'italic',
              }}
            >
              {part}
            </Box>
          ) : (
            <span key={`${part}-${i.toString()}`}>{part}</span>
          ),
        )}
      </span>
    );
  };
  // console.log({ tipo: ui.formType });
  return (
    <Box
      sx={{
        display: 'flex',
        height: '88%',
        width: '100%',
        maxWidth: '100%',
        gap: 1,
      }}
    >
      <PlanDeCuentasTree
        year={2025}
        treeData={ui.filteredTreeData}
        expandedItems={ui.expandedItems}
        autoExpandedItems={ui.autoExpandedItems}
        searchTerm={ui.searchTerm}
        setExpandedItems={actions.setExpandedItems}
        setSearchTerm={actions.setSearchTerm}
        onCreate={actionsCreate.handleCrearCuenta}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        highlight={highlightSearchTerm}
      />
      <AccountForm
        open={ui.showForm}
        formType={ui.formType}
        formData={ui.formData}
        onClose={actions.handleCloseForm}
        onSubmit={actions.handleFormSubmit}
        onChange={actions.handleInputChange}
      />

      <FormularioBase
        methods={methods}
        onSubmit={onCrearPlanesCuenta}
        open={actionsCreate.showForm}
        onClose={actionsCreate.handleCloseForm}
      />
    </Box>
  );
};
export default PlanDeCuentas;
