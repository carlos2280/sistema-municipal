import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import { AnimatePresence, motion } from 'framer-motion';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useAppSelector,
  selectSistemaId,
  useMisSistemasQuery,
  useCambiarSistemaMutation,
} from 'mf_store/store';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 220,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

export default function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const sistemaId = useAppSelector(selectSistemaId);
  const { data: sistemas = [] } = useMisSistemasQuery();
  const [cambiarSistema, { isLoading }] = useCambiarSistemaMutation();

  const sistemaActual = sistemas.find((s) => s.id === sistemaId);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const handleSelectSistema = async (id: number) => {
    handleClose();
    if (id === sistemaId) return;
    await cambiarSistema({ sistemaId: id });
  };

  return (
    <div>
      <Button
        id="sistemas-button"
        aria-controls={open ? 'sistemas-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="text"
        disableElevation
        onClick={handleClick}
        endIcon={isLoading ? <CircularProgress size={14} /> : <KeyboardArrowDownIcon />}
        disabled={isLoading}
        sx={{ minWidth: 260, justifyContent: 'space-between' }}
      >
        <span style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', minWidth: 210, height: '1.5em' }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={sistemaId ?? 'default'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: 'absolute', left: 0, whiteSpace: 'nowrap' }}
            >
              {sistemaActual?.nombre ?? 'Sistemas'}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
      <StyledMenu
        id="sistemas-menu"
        slotProps={{
          list: {
            'aria-labelledby': 'sistemas-button',
          },
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {sistemas.map((sistema) => (
          <MenuItem
            key={sistema.id}
            onClick={() => handleSelectSistema(sistema.id)}
            disableRipple
            selected={sistema.id === sistemaId}
          >
            {sistema.nombre}
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  );
}
