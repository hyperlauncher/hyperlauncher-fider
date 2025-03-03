import React, { useEffect, useState } from "react"
import { SignInControl, Button, DisplayError, Form, Input, Message, LegalAgreement } from "@fider/components"
import { actions, Failure, Fider } from "@fider/services"
import { Divider } from "@fider/components/layout"
import { useFider } from "@fider/hooks"
import { getAccessToken, useLogin, User, useLogout } from "@privy-io/react-auth"

interface SubdomainState {
  name: string
  isAvailable: boolean
  message: string
}

const SignUpPage = () => {
  const fider = useFider()

  const [isLegalAgreed, setIsLegalAgreed] = useState(false)
  const [tenantName, setTenantName] = useState("")
  const [userName, setUserName] = useState("")
  const [subdomain, setSubdomain] = useState<SubdomainState>({ name: "", isAvailable: false, message: "" })
  const [error, setError] = useState<Failure | undefined>()

  const { login } = useLogin({
    onComplete: ({ user }) => {
      submit(user)
    },
    onError: (error) => {
      console.error("Login failed:", error)
    },
  })

  const { logout } = useLogout()

  const submit = async (user: User) => {
    const authToken = await getAccessToken()
    if (!authToken) {
      throw new Error("Auth token is not empty")
    }

    const result = await actions.createTenant({
      privyToken: authToken,
      legalAgreement: isLegalAgreed,
      tenantName: tenantName,
      subdomain: subdomain.name,
      name: userName,
    })

    if (result.ok) {
      if (user) {
        if (fider.isSingleHostMode()) {
          location.reload()
        } else {
          let baseURL = `${location.protocol}//${subdomain.name}${fider.settings.domain}`
          if (location.port) {
            baseURL = `${baseURL}:${location.port}`
          }

          location.href = baseURL
        }
      }
    } else if (result.error) {
      setError(result.error)
      logout()
    }
  }

  const setSubdomainName = (value: string) => {
    setSubdomain({
      name: value,
      isAvailable: false,
      message: "",
    })
  }

  let timer: number | undefined
  useEffect(() => {
    setSubdomain({
      ...subdomain,
      isAvailable: false,
      message: "",
    })

    if (subdomain.name != "") {
      timer = window.setTimeout(() => {
        actions.checkAvailability(subdomain.name).then((result) => {
          setSubdomain({
            ...subdomain,
            isAvailable: !result.data.message,
            message: result.data.message,
          })
        })
      }, 500)
    }
    return () => {
      window.clearTimeout(timer)
    }
  }, [subdomain.name])

  return (
    <div id="p-signup" className="page container w-max-6xl">
      <div className="h-20 text-center mb-4">
        <img className="logo" alt="Logo" src="https://fider.io/images/logo-100x100.png" />
      </div>

      <h3 className="text-display mb-2">1. Who are you?</h3>
      <DisplayError fields={["token"]} error={error} />

      <p>We need to identify you to setup your new Fider account.</p>
      <SignInControl useEmail={false} />
      <Divider />
      <Form error={error}>
        <Input field="name" maxLength={100} onChange={setUserName} placeholder="Name" />
      </Form>

      <h3 className="text-display mb-2 mt-8">2. What is this Feedback Forum for?</h3>

      <Form error={error} className="mb-8">
        <Input field="tenantName" maxLength={60} onChange={setTenantName} placeholder="your company or product name" />
        {!Fider.isSingleHostMode() && (
          <Input field="subdomain" maxLength={40} onChange={setSubdomainName} placeholder="subdomain" suffix={fider.settings.domain}>
            {subdomain.isAvailable && (
              <Message className="mt-2" type="success" showIcon={true}>
                This subdomain is available!
              </Message>
            )}
            {subdomain.message && (
              <Message className="mt-2" type="error" showIcon={true}>
                {subdomain.message}
              </Message>
            )}
          </Input>
        )}

        <div className="mt-4">
          <LegalAgreement onChange={setIsLegalAgreed} />
        </div>
      </Form>

      <Button disabled={!userName || !tenantName} variant="primary" size="large" onClick={() => login()}>
        Login
      </Button>
      {fider.settings.isBillingEnabled && <div className="mt-2 text-muted">Your trial starts today and ends in 15 days.</div>}
    </div>
  )
}

export default SignUpPage
