import React, { useState } from "react"

import { Button, Form, Icon, Input, LegalFooter, TenantLogo } from "@fider/components"
import { actions, Failure } from "@fider/services"
import { i18n } from "@lingui/core"
import { Trans } from "@lingui/react/macro"
import IconBack from "@fider/assets/images/heroicons-chevron-left.svg"

import "./CompleteSignInProfile.page.scss"
import { usePrivy } from "@privy-io/react-auth"

const CompleteSignInProfilePage = () => {
  const [name, setName] = useState("")
  const { logout } = usePrivy()
  const [error, setError] = useState<Failure | undefined>()

  const submit = async () => {
    const result = await actions.completePrivyProfile(name)
    if (result.ok) {
      location.href = "/"
    } else if (result.error) {
      setError(result.error)
    }
  }

  const onBackClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    await logout()
    location.href = "/"
  }

  return (
    <>
      <div id="p-complete-profile" className="page container w-max-6xl">
        <div>
          <div className="h-20 text-center mb-4">
            <TenantLogo size={100} />
          </div>
          <a className="text-link inline-flex flex-items-center" href="#" onClick={onBackClick}>
            <Icon sprite={IconBack} className="h-4 mr-1" />
            <Trans id="action.back">Back</Trans>
          </a>{" "}
          <p className="text-title mt-4">
            <Trans id="modal.completeprofile.header">Complete your profile</Trans>
          </p>
          <p>
            <Trans id="modal.completeprofile.text">Because this is your first sign in, please enter your name.</Trans>
          </p>
          <Form error={error}>
            <Input
              field="name"
              onChange={setName}
              maxLength={100}
              placeholder={i18n._("modal.completeprofile.name.placeholder", { message: "Name" })}
              suffix={
                <Button type="submit" onClick={submit} variant="primary" disabled={name === ""}>
                  <Trans id="action.submit">Submit</Trans>
                </Button>
              }
            />
          </Form>
          <LegalFooter />
        </div>
      </div>
    </>
  )
}

export default CompleteSignInProfilePage
