export async function logMonitoringEvent(event) {
  try {
    await fetch('/api/monitoring/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: event.type,
        severity: event.severity || 'info',
        details: event.details || '',
        participant: event.participant || '',
        interviewId: event.interviewId || null,
        time: new Date().toISOString()
      })
    });
  } catch (e) {
    // swallow errors to avoid breaking UX
    console.warn('Failed to log monitoring event', e);
  }
}


