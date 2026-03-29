// simplified for public showcase
const SCHEDULER_INTERVAL_MS = 10 * 60 * 1000;

const triggerShowcaseScheduler = async () => {
  return {
    success: true,
    notice: "simplified for public showcase",
  };
};

export const startNotificationScheduler = () => {
  void triggerShowcaseScheduler();
  setInterval(() => {
    void triggerShowcaseScheduler();
  }, SCHEDULER_INTERVAL_MS);
};
