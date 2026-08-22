'use client';

import { useState } from 'react';
import {
  Account,
  canDeleteAccount,
  getAccountBalance,
  getRealAccounts,
  useAccountStore,
} from '@/entities/account';
import {
  buildBalanceTransferPostings,
  useTransactionStore,
} from '@/entities/transaction';
import { Button } from '@/shared/components/ui/button';
import {
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Select, SelectItem } from '@/shared/components/ui/select';
import { formatCurrency } from '@/shared/lib/currency';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useRouter } from 'next/navigation';

import './CloseAccount.scss';

interface CloseAccountProps {
  account: Account;
}

export function CloseAccount({ account }: CloseAccountProps) {
  const router = useRouter();
  const { accounts, archiveAccount, deleteAccount } = useAccountStore();
  const { transactions, addTransaction } = useTransactionStore();
  const [destinationId, setDestinationId] = useState<string>();

  const balance = getAccountBalance(account, transactions);
  const canDelete = canDeleteAccount(account.id, transactions);
  const needsDestination = !canDelete && balance !== 0;

  /** Moving a debt onto an asset would hide it from what is owed. */
  const destinations = getRealAccounts(accounts).filter(
    (item) => item.id !== account.id && item.root === account.root,
  );

  const action = canDelete ? 'Delete' : 'Close account';

  const onConfirm = () => {
    if (canDelete) {
      deleteAccount(account.id);
      router.push('/accounts');
      return;
    }

    if (needsDestination && destinationId) {
      addTransaction({
        date: today(getLocalTimeZone()).toString(),
        description: `Closing ${account.name}`,
        postings: buildBalanceTransferPostings(
          account.id,
          destinationId,
          balance,
        ),
      });
    }

    archiveAccount(account.id);
    router.push('/accounts');
  };

  return (
    <DialogTrigger>
      <Button variant="ghost" size="medium" className="close-account__trigger">
        {action}
      </Button>
      <DialogOverlay>
        <DialogContent>
          <DialogTitle>
            {canDelete ? 'Delete this account?' : `Close ${account.name}?`}
          </DialogTitle>

          <div className="close-account">
            <p className="close-account__text">
              {canDelete
                ? 'It has no movements yet, so nothing else changes.'
                : 'Its movements stay in the ledger and past balances do not change. You will find it under Closed accounts.'}
            </p>

            {needsDestination && (
              <>
                <p className="close-account__text">
                  It still {balance < 0 ? 'owes' : 'holds'}{' '}
                  <strong>{formatCurrency(Math.abs(balance))}</strong>. Choose
                  where that goes.
                </p>
                <Select
                  label="Move the balance to"
                  placeholder="Select an account"
                  value={destinationId}
                  onChange={(value) => setDestinationId(String(value))}
                  items={destinations}
                >
                  {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
                </Select>
              </>
            )}
          </div>

          <div className="close-account__actions">
            <Button variant="secondary" size="medium" slot="close">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="medium"
              isDisabled={needsDestination && !destinationId}
              onPress={onConfirm}
            >
              {action}
            </Button>
          </div>
        </DialogContent>
      </DialogOverlay>
    </DialogTrigger>
  );
}
