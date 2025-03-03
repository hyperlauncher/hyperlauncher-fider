import React from "react"
import { TenantLogo, NotificationIndicator, UserMenu } from "@fider/components"
import { useFider } from "@fider/hooks"
import { HStack } from "./layout"
import { LoginButton } from "./common/LoginButton"

export const Header = () => {
  const fider = useFider()

  return (
    <div id="c-header" className="bg-white">
      <HStack className="c-menu shadow p-4 w-full">
        <div className="container">
          <HStack justify="between">
            <a href="/" className="flex flex-x flex-items-center flex--spacing-2 h-8">
              <TenantLogo size={100} />
              <h1 className="text-header">{fider.session.tenant.name}</h1>
            </a>
            {fider.session.isAuthenticated && (
              <HStack spacing={2}>
                <NotificationIndicator />
                <UserMenu />
              </HStack>
            )}
            {!fider.session.isAuthenticated && <LoginButton />}
          </HStack>
        </div>
      </HStack>
    </div>
  )
}
