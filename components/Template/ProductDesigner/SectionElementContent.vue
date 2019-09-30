/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ElementContentBase
        :disabled="disabled"
        @mouseover.native="onMouseOver"
        @mouseout.native="onMouseOut">
        <div class="element-content__icon">
            <IconFontSize />
        </div>
        <div class="vertical-wrapper">
            <span
                :class="typeLabelClasses"
                v-text="element.type" />
            <span
                class="element-content__subheader txt--dark-graphite typo-subtitle"
                v-text="element.label" />
        </div>
        <div
            v-if="!disabled"
            :class="['element-content__contextual-menu', contextualMenuHoveStateClasses]">
            <ButtonSelect
                icon-path="Others/IconDots"
                :options="contextualMenuItems"
                @input="onSelectValue"
                @focus="onSelectFocus" />
        </div>
    </ElementContentBase>
</template>

<script>
import { mapActions } from 'vuex';
import ElementContentBase from '~/components/Template/ProductDesigner/ElementContentBase';
import IconFontSize from '~/components/Icon/Editor/IconFontSize';
import ButtonSelect from '~/components/Inputs/Select/ButtonSelect';

export default {
    name: 'SectionElementContent',
    components: {
        IconFontSize,
        ButtonSelect,
        ElementContentBase,
    },
    props: {
        index: {
            type: Number,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: true,
        },
        element: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            isContextualMenuActive: false,
            contextualMenuItems: ['Edit title', 'Remove'],
            isHovered: false,
        };
    },
    computed: {
        contextualMenuHoveStateClasses() {
            return { 'element-content__contextual-menu--hovered': this.isHovered };
        },
        typeLabelClasses() {
            return [
                'element-content__header',
                'txt--light-graphite',
                'typo-label',
                'l-spacing--half',
            ];
        },
    },
    methods: {
        ...mapActions('templateDesigner', [
            'removeLayoutElementAtIndex',
        ]),
        onSelectFocus(isFocused) {
            if (!isFocused) this.isHovered = false;

            this.isContextualMenuActive = isFocused;
        },
        onSelectValue(value) {
            switch (value) {
            case 'Remove':
                this.removeLayoutElementAtIndex(this.index);
                break;
            case 'Edit title':
                this.$emit('editTitle', this.index);
                break;
            default: break;
            }
        },
        onMouseOver() {
            if (!this.isHovered) this.isHovered = true;
        },
        onMouseOut() {
            if (!this.isContextualMenuActive) this.isHovered = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    .element-content {
        .vertical-wrapper {
            display: flex;
            flex: 1;
            flex-direction: column;
            padding: 6px 8px;
        }

        &__icon {
            display: flex;
            padding-top: 12px;
        }

        &__subheader {
            height: 20px;
        }

        &__header, &__subheader {
            text-overflow: ellipsis;
            overflow: hidden;
            word-break: break-all;
        }

        &__contextual-menu {
            flex: 0;
            align-items: flex-start;
            padding: 12px 0;
            opacity: 0;

            &--hovered {
                opacity: 1;
            }
        }
    }
</style>