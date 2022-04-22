import createHttpStore from './http-store';
import createApiClansProvider from './providers/api-clans'
import {BL_API_URL} from '../../network/queues/beatleader/api-queue'
import stringify from 'json-stable-stringify'

export default (page = 1, filters = {}, initialState = null, initialStateType = 'initial') => {
  let currentPage = page ?? 1;
  let currentFilters = filters ?? {};

  const onNewData = ({fetchParams}) => {
    currentPage = fetchParams?.page ?? 1;
    currentFilters = fetchParams?.filters ?? {};
  }

  const provider = createApiClansProvider();

  const httpStore = createHttpStore(
    provider,
    {page, filters},
    initialState,
    {
      onInitialized: onNewData,
      onAfterStateChange: onNewData,
      onSetPending: ({fetchParams}) => ({...fetchParams}),
    },
    initialStateType
  );

  const fetch = async (page = currentPage, filters = currentFilters, force = false) => {
    if ((!page || page === currentPage) && (!filters || stringify(filters) === stringify(currentFilters)) && !force) return false;

    return httpStore.fetch({page, filters}, force, provider);
  }

  const acceptClanRequest = (id) => {
    fetch(BL_API_URL + "clan/accept?id=" + id, {credentials: 'include', method: 'POST'});
  }

  const rejectClanRequest = (id, ban = false) => {
    fetch(BL_API_URL + "clan/accept?id=" + id + "&ban=" + (ban ? "true" : "false"), {credentials: 'include', method: 'POST'});
  }

  const refresh = async () => fetch(currentPage, currentFilters, true);

  return {
    ...httpStore,
    fetch,
    refresh,
    getFilters: () => currentFilters,
    getPage: () => currentPage,
  }
}
