/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Form>
        <FormGroup title="General options">
            <TextField
                :value="code"
                solid
                required
                :error-messages="errorCodeMessage"
                :disabled="isDisabled || isDisabledByPrivileges"
                regular
                label="Code"
                hint="Attribute code must be unique"
                @input="setAttributeCode" />
            <TranslationSelect
                :value="groups"
                label="Groups"
                :solid="true"
                :regular="true"
                :multiselect="true"
                :clearable="true"
                :options="groupOptions"
                :disabled="isDisabledByPrivileges"
                :error-messages="errorGroupsMessage"
                @input="setAttributeGroups" />
            <Select
                :value="type"
                solid
                required
                label="Type"
                regular
                :disabled="isDisabled || isDisabledByPrivileges"
                :options="attributeTypeOptions"
                :error-messages="errorTypeMessage"
                @input="onTypeChange" />
        </FormGroup>
        <FormGroup
            v-if="isMultilingual || hasParams"
            title="Configuration">
            <FadeGroupTransition>
                <Toggler
                    v-if="isMultilingual"
                    key="attrMultilingual"
                    :value="multilingual"
                    :disabled="isDisabled || isDisabledByPrivileges"
                    label="Multilingual attribute"
                    @input="setMultilingualAttribute">
                    <template #append>
                        <InfoHint :hint="multilingualHint" />
                    </template>
                </Toggler>
                <Select
                    v-if="hasParams"
                    key="attrHasParams"
                    :value="parameter"
                    solid
                    required
                    regular
                    :label="paramsLabel"
                    :options="attributeParametersOptions"
                    :error-messages="errorParamsMessage"
                    :disabled="isDisabledByPrivileges"
                    @input="setAttributeParameter" />
                <AttributeOptionKeyValues
                    v-show="hasOptions"
                    key="attrHasOptions"
                    :disabled="isDisabledByPrivileges" />
            </FadeGroupTransition>
        </FormGroup>
    </Form>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { toCapitalize } from '~/model/stringWrapper';
import {
    hasParams, hasOptions, isMultilingual, getParamsKeyForType, getParamsOptionsForType,
} from '~/model/attributes/AttributeTypes';
import { getKeyByValue } from '~/model/objectWrapper';
import errorValidationMixin from '~/mixins/validations/errorValidationMixin';

export default {
    name: 'AttributeForm',
    components: {
        Form: () => import('~/core/components/Form/Form'),
        FormGroup: () => import('~/core/components/Form/FormGroup'),
        AttributeOptionKeyValues: () => import('~/components/Card/AttributeOptionKeyValues'),
        Toggler: () => import('~/core/components/Inputs/Toggler/Toggler'),
        InfoHint: () => import('~/core/components/Hints/InfoHint'),
        TextField: () => import('~/core/components/Inputs/TextField'),
        Select: () => import('~/core/components/Inputs/Select/Select'),
        TranslationSelect: () => import('~/core/components/Inputs/Select/TranslationSelect'),
        FadeGroupTransition: () => import('~/core/components/Transitions/FadeGroupTransition'),
    },
    mixins: [errorValidationMixin],
    data() {
        return {
            multilingualHint: 'Multilingual attribute is an attribute which has translations, by deselecting it attribute is going to display same values for each language.',
        };
    },
    computed: {
        ...mapState('authentication', {
            userLanguageCode: (state) => state.user.language,
        }),
        ...mapState('attribute', {
            attrID: (state) => state.id,
            code: (state) => state.code,
            groups: (state) => state.groups,
            groupOptions: (state) => state.groupOptions,
            type: (state) => state.type,
            parameter: (state) => state.parameter,
            multilingual: (state) => state.isMultilingual,
        }),
        ...mapState('data', {
            attrTypes: (state) => state.attrTypes,
        }),
        paramsLabel() {
            const paramsKey = getParamsKeyForType(this.typeKey);

            return toCapitalize(paramsKey);
        },
        isDisabled() {
            return Boolean(this.attrID);
        },
        isMultilingual() {
            return isMultilingual(this.typeKey);
        },
        isDisabledByPrivileges() {
            return (this.isDisabled && !this.$hasAccess(['ATTRIBUTE_UPDATE']))
            || (!this.isDisabled && !this.$hasAccess(['ATTRIBUTE_CREATE']));
        },
        hasParams() {
            return hasParams(this.typeKey);
        },
        typeKey() {
            return getKeyByValue(this.attrTypes, this.type);
        },
        params() {
            return getParamsOptionsForType(
                this.typeKey,
                this.$store.state.data,
            );
        },
        hasOptions() {
            return hasOptions(this.typeKey);
        },
        attributeTypeOptions() {
            return Object.values(this.attrTypes);
        },
        attributeParametersOptions() {
            return Object.values(this.params);
        },
        errorCodeMessage() {
            const codeIndex = 'code';
            return this.elementIsValidate(codeIndex);
        },
        errorTypeMessage() {
            const typeIndex = 'type';
            return this.elementIsValidate(typeIndex);
        },
        errorGroupsMessage() {
            const groupsIndex = 'groups';
            return this.elementIsValidate(groupsIndex);
        },
        errorParamsMessage() {
            const parametersIndex = `parameters_${this.paramsLabel.toLowerCase()}`;
            return this.elementIsValidate(parametersIndex);
        },
    },
    methods: {
        ...mapActions('attribute', [
            'setAttributeCode',
            'setAttributeGroups',
            'setAttributeType',
            'setAttributeParameter',
            'setMultilingualAttribute',
            'removeAttributeOptions',
            'clearStorage',
        ]),
        onTypeChange(type) {
            this.setAttributeType(type);
            this.setAttributeParameter();

            if (!this.hasOptions) {
                this.removeAttributeOptions();
            }
        },
    },
};
</script>
