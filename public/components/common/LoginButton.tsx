import React, { useCallback } from "react"
import { useFider } from "@fider/hooks"
import { Trans } from "@lingui/react/macro"
import { useLogin, usePrivy } from "@privy-io/react-auth"

export const LoginButton = () => {
  const fider = useFider()
  const { ready, authenticated, logout } = usePrivy()
  const { login } = useLogin({
    onComplete: () => {
      if (!fider.session.isAuthenticated) {
        location.reload()
      }
    },
    onError: (error) => {
      console.error("Login failed:", error)
    },
  })

  const handleLogin = useCallback(async () => {
    if (ready && !fider.session.isAuthenticated && authenticated) {
      await logout()
    }
    login()
  }, [login, logout, ready, authenticated])

  return (
    <div onClick={handleLogin} className="uppercase text-sm py-2 px-2 clickable">
      <Trans id="action.signin">Sign in</Trans>
    </div>
  )
}
