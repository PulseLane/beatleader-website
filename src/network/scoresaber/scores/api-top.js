import queue from '../../queues'
import process from '../common/process';

const get = async ({playerId, page = 1, signal = null} = {}) => queue.SCORESABER_API.topScores(playerId, page, signal, queue.PRIORITY.FG_HIGH);

export default {
  get,
  process,
  getProcessed: async ({playerId, page = 1, signal = null} = {}) => process(await get({playerId, page, signal})),
  type: 'top',
}