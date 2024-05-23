import { Button, Checkbox, FormControlLabel, Grid, Typography } from '@mui/material'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { ReactElement } from 'react'

import { CustomTooltip } from '@/components/common/CustomTooltip'
import { AppRoutes } from '@/config/routes'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import useWallet from '@/hooks/wallets/useWallet'
import useDebounce from '@/hooks/useDebounce'
import css from './styles.module.css'
import ExternalLink from '@/components/common/ExternalLink'
import { useRouter } from 'next/router'

const DISMISS_MIGRATION_BANNER_KEY = 'dismissMigrationBanner'
const BANNER_DELAY = 2000

const useDismissMigrationBanner = () => {
  const { safe } = useSafeInfo()

  const [dismissedBannerPerChain = {}, setDismissedBannerPerChain] = useLocalStorage<{
    [chainId: string]: { [safeAddress: string]: boolean }
  }>(DISMISS_MIGRATION_BANNER_KEY)

  const dismissMigrationBanner = (chainId: string) => {
    setDismissedBannerPerChain((prev) => ({
      ...prev,
      [chainId]: {
        ...dismissedBannerPerChain[chainId],
        [safe.address.value]: true,
      },
    }))
  }

  const isMigrationBannerDismissed = !!dismissedBannerPerChain[safe.chainId]?.[safe.address.value]

  return {
    dismissMigrationBanner,
    isMigrationBannerDismissed,
  }
}

export const MigrationBanner = ({ children }: { children?: ReactElement }): ReactElement => {
  const isMigrationBannerEnabled = useHasFeature(FEATURES.MIGRATION_BANNER)
  const { safe } = useSafeInfo()
  const { query } = useRouter()
  const wallet = useWallet()
  const { dismissMigrationBanner, isMigrationBannerDismissed } = useDismissMigrationBanner()
  const [acknowledgement, setAcknowledgement] = useState(isMigrationBannerDismissed)

  useEffect(() => {
    setAcknowledgement(false)
  }, [safe])

  const shouldShowBanner = useDebounce(
    isMigrationBannerEnabled && !isMigrationBannerDismissed && !!wallet,
    BANNER_DELAY,
  )

  const dismissBanner = useCallback(() => {
    dismissMigrationBanner(safe.chainId)
  }, [dismissMigrationBanner, safe.chainId])

  const onDismiss = () => {
    dismissBanner()
  }

  const handleChangeAcknowledgement = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAcknowledgement(event.target.checked)
  }

  if (!shouldShowBanner || isMigrationBannerDismissed) {
    return children ?? <></>
  }

  return (
    <>
      <CustomTooltip
        className={css.banner}
        title={
          <Grid container className={css.container}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={700}>
                Scroll Mainnet is on the {'Safe{Wallet}'}!
              </Typography>
              <Typography mt={1} mb={1.5} variant="body2">
                Scroll Mainnet is now available on the official Safe app at{' '}
                <ExternalLink href="https://app.safe.global/welcome?chain=scr" noIcon>
                  app.safe.global
                </ExternalLink>
                ! Created safes are already available there; to transfer local data (address book, settings, and
                variables), use the Export/Import functionality found on the{' '}
                <Link style={{ textDecoration: 'underline' }} href={{ pathname: AppRoutes.settings.data, query }}>
                  Settings {'>'} Data page
                </Link>
                . Mainnet will no longer be supported here after June 20th, if you have unfinished transactions here,
                please finalize them before then! The Scroll Sepolia will remain supported on our interface.
              </Typography>
              <div className={css.buttons}>
                <FormControlLabel
                  required
                  control={
                    <Checkbox
                      checked={acknowledgement}
                      onChange={handleChangeAcknowledgement}
                      inputProps={{ 'aria-label': 'controlled' }}
                    />
                  }
                  label="I have read the information above and I will take care of my safes"
                />

                <Button
                  disabled={!acknowledgement}
                  variant="outlined"
                  size="small"
                  className={css.button}
                  onClick={onDismiss}
                >
                  Close
                </Button>
              </div>
            </Grid>
          </Grid>
        }
        open
      >
        <span>{children}</span>
      </CustomTooltip>
    </>
  )
}
