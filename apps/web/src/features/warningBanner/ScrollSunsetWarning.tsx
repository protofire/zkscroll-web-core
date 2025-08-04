import ErrorMessage from '@/components/tx/ErrorMessage'
import { Typography } from '@mui/material'
import ExternalLink from '@/components/common/ExternalLink'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'

export const ZkScrollSunsetWarning = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.ZKSCROLL_MAINNET_SUNSET_BANNER)

  if (!isFeatureEnabled) return null

  return (
    <ErrorMessage level="warning" title="Safe on Scroll Sunsetting">
      <Typography display="inline" mr={1}>
        Dear users, Our Support for Safe on Scroll will end on August 31th, 2025.
      </Typography>
      <Typography display="inline">
        You can proceed using Scroll through the {' '}
        <ExternalLink href="https://app.safe.global/welcome">
          Safe Global 
        </ExternalLink>{' '}
        and Scroll testnet through the{' '}
        <ExternalLink href="https://docs.safe.global/advanced/cli-overview">
          Safe CLI
        </ExternalLink>{' '} utility
      </Typography>
    </ErrorMessage>
  )
}
