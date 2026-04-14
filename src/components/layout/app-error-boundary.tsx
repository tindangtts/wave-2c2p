'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface AppErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface AppErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  constructor(props: AppErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-[#FAFAFA] flex flex-col items-center justify-center px-4 min-h-dvh">
          <AlertCircle className="w-12 h-12 mb-4" style={{ color: '#F44336' }} />
          <h1 className="text-[20px] font-bold text-[#212121] text-center mb-2">
            Something went wrong
          </h1>
          <p className="text-[16px] font-normal text-[#757575] text-center mb-8">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-full bg-[#FFE600] text-[#212121] h-14 px-8 text-base font-medium"
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
