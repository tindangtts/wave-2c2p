'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { BackHeader } from '@/components/layout/back-header'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useBankAccounts } from '@/hooks/use-bank-accounts'
import type { BankAccount } from '@/types'

function SkeletonList() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-[#E3F2FD] flex items-center justify-center mb-4">
        <Building2 className="w-8 h-8 text-[#0091EA]" />
      </div>
      <p className="text-base font-semibold text-foreground mb-1">No bank accounts saved</p>
      <p className="text-sm text-[#595959]">Add a bank account to start withdrawing</p>
    </div>
  )
}

interface BankAccountRowProps {
  account: BankAccount
  isLast: boolean
  onSelect: () => void
  onDelete: () => void
}

function BankAccountRow({ account, isLast, onSelect, onDelete }: BankAccountRowProps) {
  const maskedNumber = `****${account.account_number.slice(-4)}`

  return (
    <div
      className={`flex items-center gap-3 px-4 h-16 active:bg-gray-50 transition-colors cursor-pointer ${
        !isLast ? 'border-b border-border' : ''
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-[#0091EA]">
          {account.bank_name.slice(0, 3).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {account.bank_name} {maskedNumber}
        </p>
        <p className="text-xs text-[#595959] truncate">{account.account_name}</p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 active:bg-red-100 transition-colors flex-shrink-0"
        aria-label={`Delete ${account.bank_name} account`}
      >
        <Trash2 className="w-4 h-4 text-[#595959]" />
      </button>
    </div>
  )
}

export default function WithdrawPage() {
  const router = useRouter()
  const { data, isLoading, mutate } = useBankAccounts()
  const bankAccounts = data?.bank_accounts ?? []

  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleSelect(account: BankAccount) {
    router.push(`/withdraw/amount?bankAccountId=${account.id}`)
  }

  async function handleDelete() {
    if (!deletingId) return
    try {
      const res = await fetch(`/api/bank-accounts?id=${deletingId}`, { method: 'DELETE' })
      const json = await res.json()
      if (res.status === 409) {
        toast.error(json.error ?? 'Cannot delete — pending withdrawal exists.')
        setDeletingId(null)
        return
      }
      if (!res.ok) {
        toast.error('Failed to delete bank account.')
        setDeletingId(null)
        return
      }
      await mutate()
      toast.success('Bank account deleted.')
    } catch {
      toast.error('Connection error.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted">
      <BackHeader title="Withdraw" />
      <div className="flex-1 px-4 pt-4 pb-8">
        {/* Add bank account button */}
        <button
          type="button"
          onClick={() => router.push('/withdraw/add-bank')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-dashed border-[#0091EA] text-[#0091EA] font-medium text-sm mb-4 active:bg-blue-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Bank Account
        </button>

        {/* Bank account list */}
        {isLoading ? (
          <SkeletonList />
        ) : bankAccounts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden">
            {bankAccounts.map((account, index) => (
              <BankAccountRow
                key={account.id}
                account={account}
                isLast={index === bankAccounts.length - 1}
                onSelect={() => handleSelect(account)}
                onDelete={() => setDeletingId(account.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation AlertDialog */}
      <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bank Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
