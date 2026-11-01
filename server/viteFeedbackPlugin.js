export function feedbackApiPlugin() {
  return {
    name: 'feedback-and-quiz-api-plugin',
    // Only apply in development server mode, never during production static build
    apply: 'serve',
    async configureServer(server) {
      try {
        const { handleFeedbackApi } = await import('./feedbackRouter.js');
        const { handleQuizApi } = await import('./quizRouter.js');

        server.middlewares.use(async (req, res, next) => {
          try {
            const feedbackHandled = await handleFeedbackApi(req, res);
            if (feedbackHandled) return;

            const quizHandled = await handleQuizApi(req, res);
            if (quizHandled) return;

            next();
          } catch (err) {
            next(err);
          }
        });
      } catch (err) {
        console.warn('[viteFeedbackPlugin] Note: Backend API router could not be loaded:', err.message);
      }
    }
  };
}
