import React, { useState } from "react"

import { Post, ImageUpload } from "@fider/models"
import { Avatar, UserName, Button, Form, MultiImageUploader } from "@fider/components"

import { cache, actions, Failure, Fider } from "@fider/services"
import { HStack } from "@fider/components/layout"
import { i18n } from "@lingui/core"
import { Trans } from "@lingui/react/macro"

import { CommentEditor } from "@fider/components"
import { useFider } from "@fider/hooks"
import { usePrivy } from "@privy-io/react-auth"

interface CommentInputProps {
  post: Post
}

const CACHE_TITLE_KEY = "CommentInput-Comment-"

export const CommentInput = (props: CommentInputProps) => {
  const getCacheKey = () => `${CACHE_TITLE_KEY}${props.post.id}`

  const getContentFromCache = () => {
    return cache.session.get(getCacheKey())
  }

  const fider = useFider()
  // const inputRef = useRef<HTMLTextAreaElement>()
  const { login } = usePrivy()
  const [content, setContent] = useState<string>((fider.session.isAuthenticated && getContentFromCache()) || "")
  const [attachments, setAttachments] = useState<ImageUpload[]>([])
  const [error, setError] = useState<Failure | undefined>(undefined)

  const clearError = () => setError(undefined)

  const submit = async () => {
    clearError()

    const result = await actions.createComment(props.post.number, content, attachments)
    if (result.ok) {
      cache.session.remove(getCacheKey())
      location.reload()
    } else {
      setError(result.error)
    }
  }

  const handleClick = () => {
    if (!fider.session.isAuthenticated) {
      login()
    }
  }

  const commentChanged = (newContent: string) => {
    setContent(newContent)
    cache.session.set(getCacheKey(), newContent)
  }

  const hasContent = content?.length > 0

  return (
    <>
      <HStack spacing={2} className="c-comment-input">
        {Fider.session.isAuthenticated && <Avatar user={Fider.session.user} />}
        <div className="flex-grow bg-gray-50 rounded-md p-2">
          <Form error={error} onClick={handleClick}>
            {Fider.session.isAuthenticated && (
              <div className="mb-1">
                <UserName user={Fider.session.user} />
              </div>
            )}
            <CommentEditor
              initialValue={content}
              onChange={commentChanged}
              readOnly={!Fider.session.isAuthenticated}
              placeholder={i18n._("showpost.commentinput.placeholder", { message: "Leave a comment" })}
            />
            {hasContent && (
              <>
                <MultiImageUploader field="attachments" maxUploads={2} onChange={setAttachments} />
                <Button variant="primary" onClick={submit}>
                  <Trans id="action.submit">Submit</Trans>
                </Button>
              </>
            )}
          </Form>
        </div>
      </HStack>
    </>
  )
}
