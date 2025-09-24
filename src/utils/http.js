export function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params)
      .filter(([_, value]) => {
        // Filter out undefined, null, empty strings
        if (value === undefined || value === null || value === '') {
          return false;
        }
        // Filter out empty arrays
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
      .map(([key, value]) => {
        // Convert arrays to comma-separated strings
        if (Array.isArray(value)) {
          return [key, value.join(',')];
        }
        return [key, value];
      }),
  );
}
