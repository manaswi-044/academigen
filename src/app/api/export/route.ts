// Perform null check before calling limit() on exportLimiter
if (exportLimiter != null) {
    exportLimiter.limit();
} else {
    // Handle the case when exportLimiter is null
    console.error('exportLimiter is null');
}