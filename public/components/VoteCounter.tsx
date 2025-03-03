import "./VoteCounter.scss"

import React, { useState } from "react"
import { Post, PostStatus } from "@fider/models"
import { actions, classSet } from "@fider/services"
import { Icon } from "@fider/components"
import { useFider } from "@fider/hooks"
import FaCaretUp from "@fider/assets/images/fa-caretup.svg"
import { usePrivy } from "@privy-io/react-auth"

export interface VoteCounterProps {
  post: Post
}

export const VoteCounter = (props: VoteCounterProps) => {
  const fider = useFider()
  const { login } = usePrivy()
  const [hasVoted, setHasVoted] = useState(props.post.hasVoted)
  const [votesCount, setVotesCount] = useState(props.post.votesCount)

  const voteOrUndo = async () => {
    if (!fider.session.isAuthenticated) {
      login()
      return
    }

    const action = hasVoted ? actions.removeVote : actions.addVote

    const response = await action(props.post.number)
    if (response.ok) {
      setVotesCount(votesCount + (hasVoted ? -1 : 1))
      setHasVoted(!hasVoted)
    }
  }

  const status = PostStatus.Get(props.post.status)
  const isDisabled = status.closed || fider.isReadOnly

  const className = classSet({
    "border-gray-200 border rounded-md bg-gray-100": true,
    "c-vote-counter__button": true,
    "c-vote-counter__button--voted": !status.closed && hasVoted,
    "c-vote-counter__button--disabled": isDisabled,
  })

  const vote = (
    <button className={className} onClick={voteOrUndo}>
      <Icon sprite={FaCaretUp} height="16" width="16" />
      {votesCount}
    </button>
  )

  const disabled = (
    <button className={className}>
      <Icon sprite={FaCaretUp} height="16" width="16" />
      {votesCount}
    </button>
  )

  return (
    <>
      <div className="c-vote-counter">{isDisabled ? disabled : vote}</div>
    </>
  )
}
