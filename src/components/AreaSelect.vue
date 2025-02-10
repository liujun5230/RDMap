<template>
<el-cascader
	ref="area_cascader_ref"
	v-model="areas"
	:options="area_select_data"
	:show-all-levels="false"
	:props="{ checkStrictly: true, expandTrigger:'hover' }"
	filterable
	@change="changeArea"
/>
</template>

<script>
import {getCascaderArea} from "@/api/area/area";
import {AreaType} from "@/types/global";

export default {
	name: "AreaSelect",
	props: {
		value: {
			type: Object,
			default() {
				return undefined;
			}
		},
		typeIdList: {
			type: Array,
			default() {
				return [AreaType.VIRTUAL_FENCE];
			}
		}
	},
	data() {
		return {
			area_select_data: [
				{value: "all", label: this.$t("common.select_option.select_all")},
			],
			is_cascade: true,
			area_group_data: Object.freeze({})
		};
	},
	computed: {
		areas: {
			get() {
				if (!this.value) return ["all"];
				const keys = Object.keys(this.value);
				const values = Object.values(this.value);
				if (keys.length && values.length) {
					if (this.is_cascade) {
						const arr = [parseInt(keys[0])];
						if (values[0].length) {
							arr.push(values[0][0]);
						}
						return arr;
					} else { // 只有未分组
						if (values[0].length) {
							return values[0][0];
						}
					}
				}
				return ["all"];
			},
			set(val) {
				const emit_data = this.formatAreas((this.is_cascade || val[0] === "all") ? val : [-1, val[0]]);
				this.$emit("input", emit_data, this.getSelectAreaLabel(emit_data));
			}
		}
	},
	mounted() {
		this.getAreaGroup();
	},
	methods: {
		getAreaGroup() {
			getCascaderArea({type_id_list: this.typeIdList}).then((res) => {
				if (res.data.type === 1) {
					const data = res.data.result;
					this.area_group_data = Object.freeze(data);
					if (data.length === 1 && data[0].id === -1) { // 只有未分组时 去掉级联
						data[0].rel_area.forEach(item => {
							this.area_select_data.push({
								value: item.id,
								label: item.name,
							});
						});
						this.is_cascade = false;
					} else {
						for (const i in data) {
							if (data[i].rel_area) {
								const children = [];
								const item = data[i].rel_area;
								for (const j in item) {
									children.push({
										value: item[j].id,
										label: item[j].name,
									});
								}
								this.area_select_data.push({
									value: data[i].id,
									label: data[i].name,
									children,
								});
							}
						}
						this.is_cascade = true;
					}
				}
			});
		},

		changeArea() {
			this.$refs.area_cascader_ref.toggleDropDownVisible(false);
		},

		formatAreas(val) {
			return val[0] === "all" ? undefined : {[val[0]]: (val[1] ? [val[1]] : [])};
		},

		getSelectAreaLabel(select_data) {
			if (select_data === undefined) {
				return undefined;
			}
			const [area_group_id, area_ids] = Object.entries(select_data)[0];
			const find_one = this.area_group_data.find((item) => item.id === parseInt(area_group_id));
			if (!find_one) return undefined;
			const area_group_label = find_one.name;
			const area_labels = area_ids.flatMap((id) => {
				const find_item = find_one.rel_area.find((item) => item.id === id);
				return find_item ? [find_item.name] : [];
			});
			return {[area_group_label]: area_labels};
		}
	}
};
</script>

<style scoped>

</style>
