import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import * as React from 'react';
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
      >
        {sistemaActual?.nombre ?? 'Sistemas'}
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
