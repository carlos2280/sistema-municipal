import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
}

export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ChatErrorBoundary]', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            p: 3,
          }}
        >
          <Typography color="error" sx={{ fontSize: 14, textAlign: 'center' }}>
            {this.props.fallbackMessage || 'Ocurrió un error en el chat'}
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={this.handleRetry}
            sx={{ textTransform: 'none' }}
          >
            Reintentar
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}
