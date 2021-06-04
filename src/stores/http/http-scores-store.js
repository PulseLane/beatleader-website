import createHttpStore from './http-store';
import apiRecentScoresProvider from '../../network/scoresaber/scores/api-recent'
import apiTopScoresProvider from '../../network/scoresaber/scores/api-top'
import beatSaverEnhancer from './enhancers/leaderboard/beatsaver'
import accEnhancer from './enhancers/scores/acc'
import beatSaviorEnhancer from './enhancers/scores/beatsavior'
import rankedsEnhancer from './enhancers/leaderboard/rankeds'
import diffEnhancer from './enhancers/scores/diff'
import {debounce} from '../../utils/debounce'
import {opt} from '../../utils/js'

const getProviderByType = type => type === 'top' ? apiTopScoresProvider : apiRecentScoresProvider;

export default (playerId = null, type = 'recent', page = 1, initialState = null) => {
  let currentPlayerId = playerId;
  let currentPage = page ? page : 1;
  let currentProvider = getProviderByType(type);

  let pendingProvider = null;

  const getCurrentEnhanceTaskId = () => `${currentPlayerId}/${currentPage}/${currentProvider.type}`;

  const onNewData = ({fetchParams, state, set}) => {
    currentPage = opt(fetchParams, 'page', 1);
    currentPlayerId = opt(fetchParams, 'playerId', null);

    if (pendingProvider) {
      currentProvider = pendingProvider;
      pendingProvider = null;
    }

    if (!state || !Array.isArray(state)) return;

    const debouncedSetState = debounce((enhanceTaskId, state) => {
      if (enhanceTaskId !== getCurrentEnhanceTaskId()) return;

      set(state);
    }, 100);

    const enhanceTaskId = getCurrentEnhanceTaskId();
    const newState = [...state];

    const setStateRow = (scoreRow, idx, fields = ['leaderboard', 'score']) => {
      if (enhanceTaskId !== getCurrentEnhanceTaskId() || !newState || !newState[idx] || !scoreRow) return null;

      fields = !Array.isArray(fields) ? [fields] : fields;

      fields.map(field => {
        const stateValue = opt(newState[idx], field, {});
        const rowValue = opt(scoreRow, field, {});

        newState[idx][field] = {...stateValue, ...rowValue};
      })

      debouncedSetState(enhanceTaskId, newState);

      return newState[idx];
    }

    for(const [idx, scoreRow] of newState.entries()) {
        beatSaverEnhancer(scoreRow)
          .then(enhancedScoreRow => accEnhancer(enhancedScoreRow, currentPlayerId, 'score'))
          .then(enhancedScoreRow => setStateRow(enhancedScoreRow, idx))
          .then(enhancedScoreRow => diffEnhancer(enhancedScoreRow, currentPlayerId, 'score'))
          .then(enhancedScoreRow => setStateRow(enhancedScoreRow, idx));

        beatSaviorEnhancer(scoreRow, currentPlayerId)
          .then(enhancedScoreRow => setStateRow(enhancedScoreRow, idx, 'leaderboard'));

        rankedsEnhancer(scoreRow, currentPlayerId)
          .then(enhancedScoreRow => setStateRow(enhancedScoreRow, idx, 'leaderboard'));
    }
  }

  const httpStore = createHttpStore(
    currentProvider,
    {playerId, page},
    initialState,
    {
      onInitialized: onNewData,
      onAfterStateChange: onNewData,
      onSetPending: ({fetchParams}) => ({...fetchParams, type: opt(pendingProvider, 'type', currentProvider.type)}),
    },
  );

  const fetch = async (page, type = currentProvider.type, playerId = currentPlayerId, force = false) => {
    if (page === currentPage && playerId === currentPlayerId && type === opt(currentProvider, 'type') && !force) return false;

    pendingProvider = getProviderByType(type);

    const shouldForce = force || opt(pendingProvider, 'type') !== opt(currentProvider, 'type');

    return httpStore.fetch({playerId, page}, shouldForce, pendingProvider);
  }

  return {
    ...httpStore,
    fetch,
    getPlayerId: () => currentPlayerId,
    getPage: () => currentPage,
    getType: () => currentProvider.type,
  }
}
