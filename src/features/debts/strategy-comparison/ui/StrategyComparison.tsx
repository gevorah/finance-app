'use client';

import { useState } from 'react';
import {
  DebtProjectionIssueCode,
  DebtStrategy,
  getAccountName,
  ProjectionReadiness,
  projectStrategies,
  StrategyProjection,
  useAccountStore,
} from '@/entities/account';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { NumberField } from '@/shared/components/ui/number-field';
import { formatCurrency } from '@/shared/lib/currency';
import { Money, toMinorUnits } from '@/shared/lib/money';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';

import './StrategyComparison.scss';

const MONEY_FORMAT = {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 2,
} as const;

const STRATEGY_LABELS: Record<DebtStrategy, string> = {
  snowball: 'Snowball',
  avalanche: 'Avalanche',
};

const STRATEGY_HINTS: Record<DebtStrategy, string> = {
  snowball: 'Smallest balance first - quicker wins.',
  avalanche: 'Highest interest first - cheaper overall.',
};

const ISSUE_LABELS: Record<DebtProjectionIssueCode, string> = {
  missing_payment_terms: 'Add how this debt is paid',
  missing_payment_amount: 'Add the monthly payment',
  missing_interest_terms: 'Re-save the interest rate',
  unknown_frequency: 'Set how often the payment is due',
  unsupported_frequency: 'Only monthly payments can be compared',
};

const MODEL_NOTICE =
  'Monthly estimates meant for comparing the two methods. Your lender may charge a different amount.';

function monthsLabel(months: number): string {
  return months === 1 ? '1 month' : `${months} months`;
}

interface StrategyColumnProps {
  projection: StrategyProjection;
  compareTo?: StrategyProjection;
  nameOf: (id: string) => string;
}

function getFirstPayoff(projection: StrategyProjection) {
  const firstMonth = Math.min(
    ...projection.perDebt.map((debt) => debt.paidOffInMonth),
  );

  const debt = projection.perDebt.find(
    (item) => item.paidOffInMonth === firstMonth,
  );

  return {
    month: firstMonth,
    debtId: debt?.id,
  };
}

function StrategyColumn({
  projection,
  compareTo,
  nameOf,
}: StrategyColumnProps) {
  const interestDifference = compareTo
    ? compareTo.totalInterest - projection.totalInterest
    : 0;

  const payoffDifference = compareTo ? compareTo.months - projection.months : 0;

  const firstPayoff = getFirstPayoff(projection);
  const otherFirstPayoff = compareTo ? getFirstPayoff(compareTo) : undefined;

  const firstPayoffDifference = otherFirstPayoff
    ? otherFirstPayoff.month - firstPayoff.month
    : 0;

  return (
    <Card className="strategy-column">
      <div className="strategy-column__head">
        <h5 className="strategy-column__name">
          {STRATEGY_LABELS[projection.strategy]}
        </h5>

        <p className="strategy-column__hint">
          {STRATEGY_HINTS[projection.strategy]}
        </p>
      </div>

      <div className="strategy-column__order">
        <p className="strategy-column__order-head">
          <span>Priority order</span>
          <span>Clears</span>
        </p>

        <ol className="strategy-column__list">
          {projection.perDebt.map((debt, index) => {
            const isFirstPayoff =
              firstPayoffDifference > 0 && debt.id === firstPayoff.debtId;

            return (
              <li className="strategy-column__debt" key={debt.id}>
                <span className="strategy-column__rank" aria-hidden="true">
                  {index + 1}
                </span>

                <span className="strategy-column__debt-name">
                  {nameOf(debt.id)}
                </span>

                <span className="strategy-column__payoff">
                  <span>month {debt.paidOffInMonth}</span>

                  {isFirstPayoff && (
                    <span
                      className="strategy-column__delta"
                      aria-label={`First payoff ${monthsLabel(
                        firstPayoffDifference,
                      )} sooner than ${
                        compareTo
                          ? STRATEGY_LABELS[compareTo.strategy]
                          : 'the other strategy'
                      }`}
                    >
                      {monthsLabel(firstPayoffDifference)} sooner
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <dl className="strategy-column__totals">
        <div className="strategy-column__total-row">
          <dt>Total interest</dt>

          <dd className="strategy-column__total-value">
            <span>{formatCurrency(projection.totalInterest)}</span>

            {interestDifference > 0 && (
              <span
                className="strategy-column__delta"
                aria-label={`${formatCurrency(
                  interestDifference,
                )} less interest than ${
                  compareTo
                    ? STRATEGY_LABELS[compareTo.strategy]
                    : 'the other strategy'
                }`}
              >
                {formatCurrency(interestDifference)} less
              </span>
            )}
          </dd>
        </div>

        <div className="strategy-column__total-row">
          <dt>Debt free in</dt>

          <dd className="strategy-column__total-value">
            <span>{monthsLabel(projection.months)}</span>

            {payoffDifference > 0 && (
              <span
                className="strategy-column__delta"
                aria-label={`${monthsLabel(payoffDifference)} sooner than ${
                  compareTo
                    ? STRATEGY_LABELS[compareTo.strategy]
                    : 'the other strategy'
                }`}
              >
                {monthsLabel(payoffDifference)} sooner
              </span>
            )}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

interface StrategyComparisonProps {
  readiness: ProjectionReadiness;
}

export function StrategyComparison({ readiness }: StrategyComparisonProps) {
  const { accounts } = useAccountStore();
  const router = useRouter();
  const [extraMajor, setExtraMajor] = useState<number | undefined>(0);

  const nameOf = (id: string) => getAccountName(accounts, id);

  if (readiness.status === 'incomplete') {
    const affected = new Set(readiness.issues.map((issue) => issue.accountId));

    return (
      <section className="strategy-comparison">
        <h4 className="strategy-comparison__title">Compare strategies</h4>
        <p className="strategy-comparison__setup-lead">
          {affected.size === 1
            ? 'One debt still needs its payment details before the two methods can be compared.'
            : `${affected.size} debts still need their payment details before the two methods can be compared.`}
        </p>

        <ul className="strategy-comparison__setup-list">
          {readiness.issues.map((issue) => (
            <li
              className="strategy-comparison__setup-item"
              key={`${issue.accountId}-${issue.code}`}
            >
              <span className="strategy-comparison__setup-text">
                <span className="strategy-comparison__setup-name">
                  {nameOf(issue.accountId)}
                </span>
                <span className="strategy-comparison__setup-todo">
                  {ISSUE_LABELS[issue.code]}
                </span>
              </span>
              <Button
                size="small"
                variant="secondary"
                border
                className="strategy-comparison__setup-action"
                onPress={() => router.push(`/accounts/${issue.accountId}/edit`)}
              >
                <Pencil size={14} /> Edit
              </Button>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (readiness.debts.length === 0) return null;

  const extraPayment: Money =
    extraMajor === undefined || extraMajor < 0 ? 0 : toMinorUnits(extraMajor);
  const minimumPayments = readiness.debts.reduce(
    (total, debt) => total + debt.minimumPayment,
    0,
  );
  const outcome = projectStrategies(readiness.debts, extraPayment);
  const onlyOneDebt = readiness.debts.length === 1;

  return (
    <section className="strategy-comparison">
      <h4 className="strategy-comparison__title">Compare strategies</h4>

      <Card className="strategy-plan">
        <div className="strategy-plan__head">
          <h5 className="strategy-plan__name">Your monthly plan</h5>
        </div>

        <div className="strategy-plan__body">
          <div className="strategy-plan__field">
            <NumberField
              label="Extra payment each month"
              description="Anything you can add on top of the minimums."
              minValue={0}
              value={extraMajor}
              onChange={setExtraMajor}
              formatOptions={MONEY_FORMAT}
            />
          </div>

          <div className="strategy-plan__summary" aria-live="polite">
            <p className="strategy-plan__label">Monthly payment</p>
            <p className="strategy-plan__value">
              {formatCurrency(minimumPayments + extraPayment)}
            </p>
            <p className="strategy-plan__breakdown">
              {`${formatCurrency(minimumPayments)} minimum + ${formatCurrency(extraPayment)} extra`}
            </p>
          </div>
        </div>
      </Card>

      {outcome.status === 'unsupported_negative_amortization' && (
        <div className="strategy-comparison__issue" role="status">
          <p className="strategy-comparison__issue-lead">
            We cannot project {outcome.accountIds.map(nameOf).join(', ')}.
          </p>
          <p className="strategy-comparison__issue-note">
            Its minimum payment does not cover its monthly interest, so the
            balance does not go down on its own.
          </p>
          <Button
            variant="ghost"
            size="small"
            className="strategy-comparison__issue-action"
            onPress={() =>
              router.push(`/accounts/${outcome.accountIds[0]}/edit`)
            }
          >
            Review debt
          </Button>
        </div>
      )}

      {outcome.status === 'no_amortization' && (
        <div className="strategy-comparison__issue" role="status">
          <p className="strategy-comparison__issue-lead">
            This plan only covers the interest.
          </p>
          <p className="strategy-comparison__issue-note">
            {formatCurrency(outcome.committedPayment)} a month goes entirely to
            interest ({formatCurrency(outcome.monthlyInterest)}), so the balance
            does not decrease. Increase the extra payment above.
          </p>
        </div>
      )}

      {outcome.status === 'horizon_exceeded' && (
        <div className="strategy-comparison__issue" role="status">
          <p className="strategy-comparison__issue-lead">
            {outcome.strategies.length === 2
              ? `Neither method clears these debts within ${
                  outcome.horizonMonths / 12
                } years.`
              : `${
                  STRATEGY_LABELS[outcome.strategies[0]]
                } runs past ${outcome.horizonMonths / 12} years.`}
          </p>
          <p className="strategy-comparison__issue-note">
            Increase the extra payment above to bring the payoff within range.
          </p>
        </div>
      )}

      {outcome.status === 'ok' && (
        <div className="strategy-comparison__columns">
          {onlyOneDebt ? (
            <StrategyColumn projection={outcome.snowball} nameOf={nameOf} />
          ) : (
            <>
              <StrategyColumn
                projection={outcome.snowball}
                compareTo={outcome.avalanche}
                nameOf={nameOf}
              />
              <StrategyColumn
                projection={outcome.avalanche}
                compareTo={outcome.snowball}
                nameOf={nameOf}
              />
            </>
          )}
        </div>
      )}

      <p className="strategy-comparison__notice">{MODEL_NOTICE}</p>
    </section>
  );
}
