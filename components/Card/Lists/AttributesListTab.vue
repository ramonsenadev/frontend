/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <VerticalTabBarListWrapper>
        <ListSearchSelectHeader
            v-if="isSelectLanguage"
            header="Attributes"
            :options="languageOptions"
            :selected-option="language.value"
            :is-expanded="isExpanded"
            @searchResult="onSearch"
            @selectOption="onSelect"
            @expand="onExpand" />
        <ListSearchHeader
            v-else
            header="Attributes"
            :is-expanded="isExpanded"
            @searchResult="onSearch"
            @expand="onExpand" />
        <AttributesList :language-code="language.key" />
        <div class="add-fab-button">
            <FabButton
                :disabled="!$hasAccess(['ATTRIBUTE_CREATE'])"
                @click.native="addAttribute">
                <template #icon="{ fillColor }">
                    <IconAdd :fill-color="fillColor" />
                </template>
            </FabButton>
        </div>
    </VerticalTabBarListWrapper>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { WHITE } from '~/assets/scss/_variables/_colors.scss';
import { getKeyByValue } from '~/model/objectWrapper';

export default {
    name: 'AttributesListTab',
    components: {
        VerticalTabBarListWrapper: () => import('~/core/components/Tab/VerticalTabBarListWrapper'),
        AttributesList: () => import('~/components/List/Attributes/AttributesList'),
        ListSearchSelectHeader: () => import('~/core/components/List/ListSearchSelectHeader'),
        ListSearchHeader: () => import('~/core/components/List/ListSearchHeader'),
        FabButton: () => import('~/core/components/Buttons/FabButton'),
        IconAdd: () => import('~/components/Icon/Actions/IconAdd'),
    },
    props: {
        isSelectLanguage: {
            type: Boolean,
            default: true,
        },
        isExpanded: {
            type: Boolean,
            required: true,
        },
    },
    data() {
        return {
            language: {},
        };
    },
    created() {
        this.language = {
            key: this.userLanguageCode,
            value: this.languages[this.userLanguageCode],
        };
    },
    computed: {
        ...mapState('authentication', {
            userLanguageCode: (state) => state.user.language,
        }),
        ...mapState('data', {
            languages: (state) => state.languages,
        }),
        whiteColor() {
            return WHITE;
        },
        languageOptions() {
            return Object.values(this.languages);
        },
        listDataType() {
            return 'attributes';
        },
    },
    methods: {
        ...mapActions('list', [
            'setFilter',
            'getGroups',
            'getElements',
        ]),
        onExpand(isExpanded) {
            this.$emit('expand', isExpanded);
        },
        onSearch(value) {
            this.setFilter(value);
            this.getElements({
                listType: this.listDataType,
                languageCode: this.language.key,
            });
        },
        onSelect(value) {
            this.language = {
                key: getKeyByValue(this.languages, value),
                value,
            };

            Promise.all([
                this.getGroups(this.language.key),
                this.getElements({
                    listType: this.listDataType,
                    languageCode: this.language.key,
                }),
            ]);
        },
        addAttribute() {
            this.$router.push({ name: 'attribute-new-general' });
        },
    },
};
</script>

<style lang="scss" scoped>
    .add-fab-button {
        position: absolute;
        bottom: 12px;
        right: 12px;
    }
</style>
