"use client"
import { useState } from "react"
import type React from "react"

import { GiveawayEmailEntryForm } from "./GiveawayEmailEntryForm"
import { GiveawayBonusEntriesForm } from "./GiveawayBonusEntriesForm"
import { GiveawayEntrySuccessMessage } from "./GiveawayEntrySuccessMessage"

interface GiveawayEntryFormProps {
  onShowRules: () => void
  endDate: string
  onSubmit: (email: string) => Promise<void>
}

export function GiveawayEntryForm({ onShowRules, endDate, onSubmit }: GiveawayEntryFormProps) {
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [isFirstSubmission, setIsFirstSubmission] = useState(true)
  const [entries, setEntries] = useState({
    email: false,
    twitter: false,
    facebook: false,
    newsletter: false,
    earlyBirdBooks: false,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isExploding, setIsExploding] = useState(false)

  const totalEntries =
    (entries.email ? 1 : 0) +
    (entries.twitter ? 2 : 0) +
    (entries.facebook ? 2 : 0) +
    (entries.newsletter ? 1 : 0) +
    (entries.earlyBirdBooks ? 1 : 0)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setEmailSubmitted(true)
      setEntries({ ...entries, email: true })

      if (isFirstSubmission) {
        setTimeout(() => {
          window.scrollBy({
            top: 400,
            behavior: "smooth",
          })
        }, 100)
        setIsFirstSubmission(false)
      }
    }
  }

  const handleEditEmail = () => {
    setEmailSubmitted(false)
    setEntries({ ...entries, email: false })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && entries.email) {
      setIsSubmitted(true)
      setIsExploding(true)
      await onSubmit(email)
    }
  }

  const handleAddMoreEntries = () => {
    setIsSubmitted(false)
    setIsExploding(false)
  }

  return (
    <div className="w-full bg-card border border-t-0 rounded-t-none rounded-b-lg shadow-sm relative">
      <div className="space-y-2 pt-10 pb-8 px-6">
        {!isSubmitted ? (
          <>
            {!emailSubmitted ? (
              <GiveawayEmailEntryForm email={email} onEmailChange={setEmail} onSubmit={handleEmailSubmit} />
            ) : (
              <GiveawayBonusEntriesForm
                email={email}
                entries={entries}
                onEntriesChange={setEntries}
                onEditEmail={handleEditEmail}
                onSubmit={handleSubmit}
                totalEntries={totalEntries}
                isExploding={isExploding}
              />
            )}
          </>
        ) : (
          <GiveawayEntrySuccessMessage
            totalEntries={totalEntries}
            onAddMoreEntries={handleAddMoreEntries}
            isExploding={isExploding}
            onConfettiComplete={() => setIsExploding(false)}
          />
        )}
      </div>
    </div>
  )
}
