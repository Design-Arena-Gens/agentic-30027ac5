import { computeAccumulation } from '@/lib/accumulation';

export const revalidate = 0;

export default async function Page() {
  let errorMessage: string | null = null;
  let status: Awaited<
    ReturnType<typeof computeAccumulation>
  >['status'] = 'degraded';
  let entries: Awaited<ReturnType<typeof computeAccumulation>>['entries'] = [];
  let usedDates: string[] = [];
  let attempts: Awaited<
    ReturnType<typeof computeAccumulation>
  >['attempts'] = [];

  try {
    const report = await computeAccumulation();
    entries = report.entries;
    usedDates = report.usedDates;
    attempts = report.attempts;
    status = report.status;
    if (report.message) {
      errorMessage = report.message;
    }
  } catch (error) {
    errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to derive accumulation signals.';
  }

  const hasSignals = entries.length > 0;

  return (
    <main>
      <h1>Institutional Accumulation Radar</h1>
      <p>
        Autonomous flow watcher scanning the last five NSE cash sessions for
        stealth accumulation footprints. Signals combine turnover, demand bias
        and positive price displacement to surface names favoured by deep
        pockets.
      </p>

      <section className="dashboard">
        {errorMessage && (
          <article className="panel">
            <h2>Service Status</h2>
            <div className="note">
              {errorMessage}. The agent will retry on the next request after
              refreshing the NSE session handshake.
            </div>
          </article>
        )}

        <article className="panel">
          <h2>Observation Window</h2>
          <div className="date-strip">
            {usedDates.length > 0 ? (
              usedDates.map((label) => (
                <span className="date-chip" key={label}>
                  {label}
                </span>
              ))
            ) : (
              <span className="metric-chip">No sessions ingested</span>
            )}
          </div>
          <div className="note">
            Accumulation score blends rupee turnover (in crores), positive price
            drift versus previous close, closing strength inside the day&apos;s
            range and liquidity factors. Only equities in the EQ series with all
            five sessions available are considered.
          </div>
        </article>

        <article className="panel">
          <h2>Collection Audit Trail</h2>
          {attempts.length > 0 ? (
            <div className="leaderboard">
              {attempts.map((attempt, index) => (
                <div
                  className="stock-row"
                  key={`${attempt.date}-${attempt.success}-${index}`}
                >
                  <span className="rank">{attempt.success ? '✔' : '•'}</span>
                  <div className="stock-meta">
                    <h3>{attempt.date}</h3>
                    <div className="metric-chip">
                      {attempt.success
                        ? 'Bhavcopy ingested'
                        : attempt.reason ?? 'Skipped'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="note">No collection attempts recorded yet.</div>
          )}
        </article>

        <article className="panel">
          <h2>Top Accumulation Signals</h2>
          {hasSignals ? (
            <div className="leaderboard">
              {entries.map((entry, index) => (
                <div className="stock-row" key={entry.symbol}>
                  <span className="rank">{index + 1}</span>
                  <div className="stock-meta">
                    <h3>{entry.symbol}</h3>
                    <div className="metric-chip">
                      Flow score&nbsp;
                      <strong>{entry.accumulationScore.toFixed(2)}</strong>
                    </div>
                    <div className="note">
                      {entry.positiveSessions} of {entry.totalSessions} sessions
                      closed green · Avg swing{' '}
                      <span className="trend">
                        {entry.averagePriceChange.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="metric-grid">
                    <div className="metric-card">
                      <span>Avg Turnover</span>
                      <strong>{entry.averageTurnover.toFixed(2)} cr</strong>
                    </div>
                    <div className="metric-card">
                      <span>5-Day Turnover</span>
                      <strong>{entry.turnoverFiveDay.toFixed(2)} cr</strong>
                    </div>
                    <div className="metric-card">
                      <span>Last Close</span>
                      <strong>₹{entry.lastClose.toFixed(2)}</strong>
                    </div>
                    <div className="metric-card">
                      <span>Session Intensity</span>
                      <strong>
                        {entry.sessions
                          .map((s) => s.accumulationScore.toFixed(2))
                          .join(' · ')}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="note">
              No qualifying equities across the latest sessions. NSE may not have
              published complete data yet—retry shortly.
            </div>
          )}
        </article>

        {hasSignals && (
          <article className="panel">
            <h2>Session Breakdown</h2>
            <div className="leaderboard">
              {entries.map((entry) => (
                <details key={`${entry.symbol}-breakdown`} className="metric-card">
                  <summary>
                    <strong>{entry.symbol}</strong> · Flow score{' '}
                    {entry.accumulationScore.toFixed(2)}
                  </summary>
                  <div className="leaderboard" style={{ marginTop: '1rem' }}>
                    {entry.sessions.map((session) => (
                      <div className="stock-row" key={`${entry.symbol}-${session.date}`}>
                        <span className="rank">↳</span>
                        <div className="stock-meta">
                          <h3>{session.label}</h3>
                          <div className="metric-chip">
                            Δ {session.priceChangePct.toFixed(2)}% · Demand{' '}
                            {session.demandPositionPct.toFixed(1)}%
                          </div>
                        </div>
                        <div className="metric-grid">
                          <div className="metric-card">
                            <span>Turnover</span>
                            <strong>{session.turnoverCrore.toFixed(2)} cr</strong>
                          </div>
                          <div className="metric-card">
                            <span>Flow Slice</span>
                            <strong>{session.accumulationScore.toFixed(2)}</strong>
                          </div>
                          <div className="metric-card">
                            <span>Close</span>
                            <strong>₹{session.close.toFixed(2)}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
