import { Paper, Typography } from '@mui/material';
import type React from 'react';

interface Props {
  children: React.ReactNode;
  title: string;
}
const AppPageLayout = ({ children, title }: Props) => {
  return (
    <>
      <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
        {title}
      </Typography>
      <Paper elevation={0} sx={{ p: 2 }}>
        {children}
      </Paper>
    </>
  );
};

export default AppPageLayout;
