/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ResponsiveCenteredViewTemplate>
        <template #content>
            <Grid
                :columns="columns"
                :data-count="filtered"
                :cell-values="cellValues"
                :row-ids="rowIds"
                :is-basic-filters="true"
                @fetchData="getGridData" />
        </template>
    </ResponsiveCenteredViewTemplate>
</template>

<script>
import ResponsiveCenteredViewTemplate from '~/core/components/Layout/Templates/ResponsiveCenteredViewTemplate';
import gridDataMixin from '~/mixins/grid/gridDataMixin';

export default {
    name: 'UsersActivityLogsGridTab',
    mixins: [gridDataMixin({ path: 'accounts/log' })],
    components: {
        ResponsiveCenteredViewTemplate,
        Grid: () => import('~/core/components/Grid/Grid'),
    },
};
</script>
