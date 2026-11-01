import { handleFeedbackApi } from './feedbackRouter.js';
import { handleQuizApi } from './quizRouter.js';

export function feedbackApiPlugin() {
  return {
    name: 'feedback-and-quiz-api-plugin',
    configureServer(server) {
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
    }
  };
}
