import {formatNumber} from '../../utils/format';

export const WEIGHT_COEFFICIENT = 0.965;

export const getTotalPpFromSortedPps = (ppArray, startIdx = 0) =>
	ppArray.reduce((cum, pp, idx) => cum + Math.pow(WEIGHT_COEFFICIENT, idx + startIdx) * pp, 0);

export const getFCPPTitle = (fcPp, suffix) => {
	if (!fcPp | (fcPp <= 0)) {
		return '';
	}
	return `Full combo PP: ${formatNumber(fcPp)}${suffix}`;
};

const pointList = [
	[1.0, 7.424],
	[0.999, 6.241],
	[0.9975, 5.158],
	[0.995, 4.01],
	[0.9925, 3.241],
	[0.99, 2.7],
	[0.9875, 2.303],
	[0.985, 2.007],
	[0.9825, 1.786],
	[0.98, 1.618],
	[0.9775, 1.49],
	[0.975, 1.392],
	[0.9725, 1.315],
	[0.97, 1.256],
	[0.965, 1.167],
	[0.96, 1.101],
	[0.955, 1.047],
	[0.95, 1.0],
	[0.94, 0.919],
	[0.93, 0.847],
	[0.92, 0.786],
	[0.91, 0.734],
	[0.9, 0.692],
	[0.875, 0.606],
	[0.85, 0.537],
	[0.825, 0.48],
	[0.8, 0.429],
	[0.75, 0.345],
	[0.7, 0.286],
	[0.65, 0.246],
	[0.6, 0.217],
	[0.0, 0.0],
];

const Curve2 = acc => {
	var i = 0;
	for (; i < pointList.length; i++) {
		if (pointList[i][0] <= acc) {
			break;
		}
	}

	if (i == 0) {
		i = 1;
	}

	var middle_dis = (acc - pointList[i - 1][0]) / (pointList[i][0] - pointList[i - 1][0]);
	return pointList[i - 1][1] + middle_dis * (pointList[i][1] - pointList[i - 1][1]);
};

function Inflate(peepee) {
	return (650 * Math.pow(peepee, 1.3)) / Math.pow(650, 1.3);
}

export const buildCurve = (accuracy, passRating, accRating, techRating) => {
	var passPP = 15.2 * Math.exp(Math.pow(passRating, 1 / 2.62)) - 15.2;
	var accPP = Curve2(accuracy) * accRating * 34;
	var techPP = Math.exp(1.9 * accuracy) * techRating;
	return Inflate(passPP + accPP + techPP);
};

export const getPPFromAcc = (acc, passRating, accRating, techRating, mode) => {
	return mode == 'rhythmgamestandard' ? acc * passRating * 55 : buildCurve(acc, passRating, accRating, techRating);
};

export const computeModifiedRating = (rating, ratingName, modifiersRating, mods) => {
	// Make sure we have a valid modifiers array
	rating = rating ?? 0;
	if (!mods || !Array.isArray(mods) || mods.length === 0) {
		return rating;
	}

	if (modifiersRating) {
		for (let index = 0; index < mods.length; index++) {
			const mod = mods[index];
			if (modifiersRating[mod.name.toLowerCase() + ratingName]) {
				rating = modifiersRating[mod.name.toLowerCase() + ratingName];
				mods = mods.filter(m => m != mod);
				break;
			}
		}
	}

	const positiveModifiersSum = mods?.reduce((sum, mod) => sum + (mod.value > 0 ? mod.value : 0), 0) ?? 0;
	const negativeModifiersSum = mods?.reduce((sum, mod) => sum + (mod.value < 0 ? mod.value : 0), 0) ?? 0;
	return rating * (1 + positiveModifiersSum + negativeModifiersSum);
};
