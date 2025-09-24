export const PerformanceAdapter = {
  fromApi(apiData) {
    const { attended_by_agent, forwarded_human_support } = apiData;

    return {
      attendedByAgent: attended_by_agent,
      forwardedHumanSupport: forwarded_human_support,
    };
  },
};
