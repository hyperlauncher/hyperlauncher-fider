import React, { useCallback } from "react"
import { useFider } from "@fider/hooks"
import { Avatar, Dropdown } from "./common"
import { Trans } from "@lingui/react/macro"
import { usePrivy } from "@privy-io/react-auth"

export const UserMenu = () => {
  const fider = useFider()
  const { logout } = usePrivy()

  const handleLogout = useCallback(async () => {
    await logout()
    location.href = "/signout?redirect=/"
  }, [logout])

  return (
    <div className="c-menu-user">
      <Dropdown position="left" renderHandle={<Avatar user={fider.session.user} />}>
        <div className="p-2 text-medium uppercase">{fider.session.user.name}</div>
        <Dropdown.ListItem href="/settings">
          <Trans id="menu.mysettings">My Settings</Trans>
        </Dropdown.ListItem>
        <Dropdown.Divider />

        {fider.session.user.isCollaborator && (
          <>
            <div className="p-2 text-medium uppercase">
              <Trans id="menu.administration">Administration</Trans>
            </div>
            <Dropdown.ListItem href="/admin">
              <Trans id="menu.sitesettings">Site Settings</Trans>
            </Dropdown.ListItem>
            <Dropdown.Divider />
          </>
        )}
        <Dropdown.ListItem onClick={handleLogout}>
          <Trans id="menu.signout">Sign out</Trans>
        </Dropdown.ListItem>
      </Dropdown>
    </div>
  )
}
