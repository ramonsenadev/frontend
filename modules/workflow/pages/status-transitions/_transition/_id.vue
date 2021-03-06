/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <TransitionPage
        :title="`${getParamId[0]} -> ${getParamId[1]}`"
        is-edit
        @dismiss="onDismiss"
        @remove="onRemove"
        @save="onSave" />
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { getMappedConditionSetData } from '~/model/mappers/conditionSetMapper';
import { getParentRoutePath } from '~/model/navigation/tabs';

export default {
    name: 'TransitionEdit',
    components: {
        TransitionPage: () => import('~/components/Pages/TransitionPage'),
    },
    computed: {
        ...mapState('transitions', {
            source: (state) => state.source,
            destination: (state) => state.destination,
            roles: (state) => state.roles,
            conditionSetId: (state) => state.conditionSetId,
        }),
        ...mapState('conditions', {
            conditionsValues: (state) => state.conditionsValues,
            conditions: (state) => state.conditions,
        }),
        getParamId() {
            const { id } = this.$route.params;
            return id.split('--');
        },
    },
    methods: {
        ...mapActions('conditions', {
            createConditionSet: 'createConditionSet',
            updateConditionSet: 'updateConditionSet',
            clearConditionSetStorage: 'clearStorage',
        }),
        ...mapActions('transitions', {
            updateTransition: 'updateTransition',
            removeTransition: 'removeTransition',
            clearTransitionStorage: 'clearStorage',
        }),
        ...mapActions('validations', [
            'onError',
            'removeValidationErrors',
        ]),
        onSave() {
            const propertiesToUpdate = {
                conditions: getMappedConditionSetData(this.conditionsValues, this.conditions),
            };

            this.removeValidationErrors();
            if (!this.conditionSetId) {
                this.createConditionSet({
                    data: propertiesToUpdate,
                    onSuccess: this.onConditionCreated,
                    onError: this.onError,
                });
            } else {
                this.updateConditionSet({
                    id: this.conditionSetId,
                    data: propertiesToUpdate,
                    onSuccess: () => {
                        this.updateTransition({
                            data: {
                                roles: this.roles.map((role) => role.key),
                            },
                            onSuccess: this.onTransitionUpdated,
                            onError: this.onError,
                        });
                    },
                    onError: this.onError,
                });
            }
        },
        onConditionCreated(conditionSetId) {
            const propertiesToUpdate = {
                condition_set: conditionSetId,
                roles: this.roles.map((role) => role.key),
            };

            this.updateTransition({
                data: propertiesToUpdate,
                onSuccess: this.onTransitionUpdated,
                onError: this.onError,
            });
        },
        onTransitionUpdated() {
            this.$addAlert({ type: 'success', message: 'Transition updated' });
            this.$router.push({ name: 'status-transitions' });
        },
        onDismiss() {
            this.$router.push(getParentRoutePath(this.$route));
        },
        onRemove() {
            const isConfirm = confirm('Are you sure you want to delete this transition?'); /* eslint-disable-line no-restricted-globals */
            if (isConfirm) {
                this.removeTransition({
                    onSuccess: this.onRemoveTransitionSuccess,
                });
            }
        },
        onRemoveTransitionSuccess() {
            this.$addAlert({ type: 'success', message: 'Transition removed' });
            this.$router.push({ name: 'status-transitions' });
        },
    },
    beforeDestroy() {
        this.clearTransitionStorage();
        this.clearConditionSetStorage();
    },
    async fetch({
        store, params,
    }) {
        await Promise.all([
            store.dispatch('transitions/clearStorage'),
            store.dispatch('productStatus/getProductStatuses', {
                limit: 9999,
                offset: 0,
            }),
            store.dispatch('roles/getRoles', {
                limit: 9999,
                offset: 0,
            }),
        ]);
        await store.dispatch('transitions/getTransitionById', params);
    },
};
</script>
