'use client';

import './settings.scss';

import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import {
  clearAllData,
  loadSampleData,
} from '@/features/settings/model/seed';

export default function Settings() {
  return (
    <main className="settings">
      <h1>Settings</h1>

      <section className="settings__section">
        <h2 className="settings__section-title">Data</h2>

        <div className="settings__actions">
          <div className="settings__action">
            <p className="settings__action-title">Load sample data</p>
            <p className="settings__action-description">
              Replaces your current data with example accounts, transactions,
              and budgets so you can explore the app.
            </p>
            <Dialog
              trigger={
                <Button variant="secondary" size="medium" border>
                  Load sample data
                </Button>
              }
              title="Load sample data?"
              description="This will replace all your current data with example data. You cannot undo this."
              confirmLabel="Load data"
              onConfirm={loadSampleData}
            />
          </div>

          <div className="settings__action">
            <p className="settings__action-title">Clear all data</p>
            <p className="settings__action-description">
              Deletes all accounts, transactions, and budgets. Starts fresh.
            </p>
            <Dialog
              trigger={
                <Button variant="primary" size="medium">
                  Clear everything
                </Button>
              }
              title="Clear all data?"
              description="This will permanently delete all your accounts, transactions, and budgets. This cannot be undone."
              confirmLabel="Clear all"
              onConfirm={clearAllData}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
