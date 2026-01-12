// material-ui
import Box from '@mui/material/Box';

// project imports
import MainCard from '../../ui-compoment/cards/MainCard';

// ==============================|| AUTHENTICATION CARD WRAPPER ||============================== //

interface Props {
  children: React.ReactNode;
}
export default function AuthCardWrapper({ children, ...other }: Props) {
  return (
    <MainCard
      sx={{
        maxWidth: { xs: 400, lg: 475 },
        margin: { xs: 2.5, md: 3 },
        '& > *': {
          flexGrow: 1,
          flexBasis: '50%',
        },
      }}
      content={false}
      {...other}
    >
      <Box sx={{ p: { xs: 2, sm: 3, xl: 5 } }}>{children}</Box>
    </MainCard>
  );
}
