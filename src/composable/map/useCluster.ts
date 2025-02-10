import {type ShallowRef, shallowRef, watch} from "vue";

import {UTYPES} from "@index/utils/types";
import type {ClusterCard, Card, Cluster2D, Cluster3D} from "@/types/map";

import {useMapParams} from "./useMapParams";

type Position = {
  x : number
  y : number
  z?: number
}

export type ClusterCards = Array<{cluster_center: Position, card_list: ClusterCard[], id: string}>

function getCard(card: Card | null, card_id: number, label: string):ClusterCard {
	const {
		utype = UTYPES.UNKNOWN,
		uuid,
	} = card ?? {};

	return {
		utype,
		uuid,
		label,
		card_id,
		time: new Date().getTime()
	};
}

const cards = shallowRef<ClusterCards>([]);

export function useCluster(
	getTagLabel: (card_id: number, options: {control_by_setting: boolean}) => string,
	getCardInfo:(card_id: number) => Card
):{
  cards: ShallowRef<ClusterCards>
  onUpdateCluster2D: ((event: Cluster2D) => void)
  onUpdateCluster3D: ((event: Cluster3D) => void)
} {
	const {is_2d, is_3d, display_type, is_loading} = useMapParams();

	watch(is_loading, () => {
		if (is_loading.value) {
			cards.value = [];
		}
	});

	const onUpdateCluster2D = (event: Cluster2D) => {
		if (!event || !is_2d.value) return;
		const {cluster_list} = event;
		cards.value = cluster_list.map((cluster) => {
			const {card_list, cluster_center} = cluster;
			const list = card_list
				.map(card_id => {
					const card_data = getCardInfo(card_id);
					return getCard(card_data, card_id, getTagLabel(card_id, {control_by_setting: false}));
				}).sort((a, b) => a.card_id - b.card_id);

			return {
				cluster_center,
				card_list: list,
				id: list.sort()?.[0].card_id + ""
			};
		});
	};

	const onUpdateCluster3D = (event: Cluster3D) => {
		if (!event || !is_3d.value) return;
		cards.value = Object.entries(event).filter(([, cluster]) => {
			return cluster.card_list && cluster.card_list.length > 1;
		}).map(
			([, cluster]) => {
				const {card_list} = cluster;
				const list = card_list.map((card_id) => {
					const card_data = getCardInfo(card_id);
					return getCard(card_data, card_id, getTagLabel(card_id, {control_by_setting: false}));
				});
				return {
					cluster_center: cluster.cluster_center,
					card_list: list,
					id: list.sort()?.[0].card_id + ""

				};
			}
		);
	};

	watch(display_type, () => {
		cards.value = [];
	});
	return {
		cards,
		onUpdateCluster2D,
		onUpdateCluster3D
	};
}
