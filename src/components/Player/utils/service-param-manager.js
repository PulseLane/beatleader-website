const STORE_SORTING_KEY = 'PlayerScoreSorting';
const STORE_ORDER_KEY = 'PlayerScoreOrder';

import keyValueRepository from '../../../db/repository/key-value';

export default () => {
	let currentService = null;
	let currentServiceParams = {};

	const getAllServices = () => ['beatleader', 'beatsavior', 'accsaber'];

	const get = () => ({service: currentService, params: currentServiceParams});

	const getDefaultParams = service => {
		switch (service) {
			case 'beatsavior':
				return {sort: 'date', order: 'desc', page: 1, filters: {}};

			case 'accsaber':
				return {type: 'overall', order: 'desc', sort: 'ap', page: 1, filters: {}};
			default:
				return {sort: 'pp', order: 'desc', page: 1, filters: {}};
		}
	};

	const update = (serviceParams = {}, service = currentService, init = false) => {
		const availableServices = getAllServices();
		if (!availableServices.includes(service)) service = availableServices?.[0] ?? 'beatleader';

		const defaultServiceParams = getDefaultParams(service);

		if (defaultServiceParams?.page && !Number.isFinite(serviceParams?.page)) {
			const val = parseInt(serviceParams?.page, 10);
			serviceParams.page = !isNaN(val) ? val : 1;
		}

		// preserve old filters
		serviceParams = {...serviceParams};
		serviceParams.filters = {
			...(currentServiceParams?.filters ?? {}),
			...(serviceParams?.filters ?? {}),
		};

		currentService = service;
		currentServiceParams = {...defaultServiceParams, ...currentServiceParams, ...serviceParams};

		if (!init && currentService == 'beatleader') {
			keyValueRepository().set(currentServiceParams.sort, STORE_SORTING_KEY);
			keyValueRepository().set(currentServiceParams.order, STORE_ORDER_KEY);
		}

		return get();
	};

	const clearServiceParams = () => (currentServiceParams = {});

	const initFromUrl = (url = null) => {
		const availableServices = getAllServices();
		const defaultService = availableServices?.[0] ?? 'beatleader';
		const paramsArr = url ? url.split('/') : [defaultService];

		const service = paramsArr[0] ?? 'beatleader';

		const serviceDefaultParams = getDefaultParams(service);

		switch (service) {
			case 'beatsavior':
				return update(
					{
						sort: paramsArr[1] ?? serviceDefaultParams?.sort,
						order: 'desc',
						page: paramsArr[2] ?? serviceDefaultParams?.page,
					},
					service,
					true
				);

			case 'accsaber':
				return update(
					{
						type: paramsArr[1] ?? serviceDefaultParams?.type,
						sort: paramsArr[2] ?? serviceDefaultParams?.sort,
						order: (paramsArr[2] ?? serviceDefaultParams?.sort) === 'rank' ? 'asc' : 'desc',
						page: paramsArr[3] ?? serviceDefaultParams?.page,
					},
					service,
					true
				);

			case 'beatleader':
			default:
				const urlParams = new URLSearchParams(window?.location?.search);
				let eventId = urlParams.get('eventId') ?? null;
				if (eventId?.length) {
					eventId = parseInt(eventId, 10);
					if (!isNaN(eventId)) update({filters: {eventId}});
				}

				return update(
					{
						sort: paramsArr[1] ?? serviceDefaultParams?.sort,
						order: paramsArr[2] ?? serviceDefaultParams?.order,
						page: paramsArr[3] ?? serviceDefaultParams?.page,
					},
					service,
					true
				);
		}
	};

	const getUrl = (service, params = {}, noPage = false) => {
		if (!service) return '';

		const serviceDefaultParams = getDefaultParams(service);

		switch (service) {
			case 'beatsavior':
				return `${service}/${params?.sort ?? serviceDefaultParams?.sort}${noPage ? '' : `/${params?.page ?? serviceDefaultParams?.page}`}`;

			case 'accsaber':
				return `${service}/${params?.type ?? serviceDefaultParams?.type}/${params?.sort ?? serviceDefaultParams?.sort}${
					noPage ? '' : `/${params?.page ?? serviceDefaultParams?.page}`
				}`;

			case 'beatleader':
				return `${service}/${params?.sort ?? serviceDefaultParams?.sort}/${params?.order ?? serviceDefaultParams?.order}${
					noPage ? '' : `/${params?.page ?? serviceDefaultParams?.page}`
				}`;
		}
	};

	const getCurrentServiceUrl = () => getUrl(currentService, currentServiceParams);
	const getCurrentServiceUrlWithoutPage = () => getUrl(currentService, currentServiceParams, true);
	const getDefaultServiceUrl = (service = currentService) => getUrl(service, {});

	return {
		getAvailableServices: getAllServices,
		initFromUrl,
		getDefaultServiceUrl,
		getCurrentServiceUrl,
		getCurrentServiceUrlWithoutPage,
		get,
		getService: () => currentService,
		getParams: () => currentServiceParams,
		update,
		clearServiceParams,
	};
};
