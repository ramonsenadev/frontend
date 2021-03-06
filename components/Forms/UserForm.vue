/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Form>
        <FormGroup>
            <TextField
                :value="email"
                solid
                required
                regular
                label="Email"
                :error-messages="errorEmailMessage"
                :disabled="isDisabled || isDisabledByPrivileges"
                @input="(email) => setAction({ key: 'email', value: email })" />
            <TextField
                :value="firstName"
                solid
                required
                regular
                label="First name"
                :error-messages="errorFirstNameMessage"
                :disabled="isDisabledByPrivileges"
                @input="(firstName) => setAction({ key: 'firstName', value: firstName })" />
            <TextField
                :value="lastName"
                solid
                required
                regular
                label="Last name"
                :error-messages="errorLastNameMessage"
                :disabled="isDisabledByPrivileges"
                @input="(lastName) => setAction({ key: 'lastName', value: lastName })" />
            <TextField
                :value="password"
                solid
                required
                regular
                type="password"
                label="Password"
                :input="{ type: 'password' }"
                :error-messages="errorPasswordMessage"
                :disabled="isDisabledByPrivileges"
                @input="(password) => setAction({ key: 'password', value: password })" />
            <TextField
                :value="passwordRepeat"
                solid
                required
                regular
                type="password"
                label="Password repeat"
                :input="{ type: 'password' }"
                :error-messages="errorPasswordRepeatMessage"
                :disabled="isDisabledByPrivileges"
                @input="(passwordRepeat) => setAction({
                    key: 'passwordRepeat',
                    value: passwordRepeat
                })" />
            <div class="horizontal-wrapper">
                <CheckBox
                    :value="isActive"
                    :disabled="isDisabledByPrivileges"
                    @input="onStatusChange" />
                <span class="font--medium-12-16">
                    The active status
                </span>
            </div>
            <Select
                :value="language"
                solid
                required
                regular
                label="Language"
                :options="languageOptions"
                :disabled="isDisabledByPrivileges"
                :error-messages="errorLanguageMessage"
                @input="onLanguageChange" />
            <TranslationSelect
                :value="role"
                :solid="true"
                :required="true"
                :regular="true"
                label="Role"
                :options="roles"
                :disabled="isDisabledByPrivileges"
                :error-messages="errorRoleMessage"
                @input="onRoleChange" />
        </FormGroup>
    </Form>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import errorValidationMixin from '~/mixins/validations/errorValidationMixin';

export default {
    name: 'UserForm',
    components: {
        Form: () => import('~/core/components/Form/Form'),
        FormGroup: () => import('~/core/components/Form/FormGroup'),
        TextField: () => import('~/core/components/Inputs/TextField'),
        CheckBox: () => import('~/core/components/Inputs/CheckBox'),
        Select: () => import('~/core/components/Inputs/Select/Select'),
        TranslationSelect: () => import('~/core/components/Inputs/Select/TranslationSelect'),
    },
    mixins: [errorValidationMixin],
    data() {
        return {
            activityStatuses: [
                { id: true, name: 'Active' },
                { id: false, name: 'Inactive' },
            ],
        };
    },
    computed: {
        ...mapState('data', {
            languages: (state) => state.languages,
        }),
        ...mapState('roles', {
            roles: (state) => state.roles,
        }),
        ...mapState('users', {
            userID: (state) => state.id,
            email: (state) => state.email,
            firstName: (state) => state.firstName,
            lastName: (state) => state.lastName,
            password: (state) => state.password,
            passwordRepeat: (state) => state.passwordRepeat,
            language: (state) => state.language,
            isActive: (state) => state.isActive,
            role: (state) => state.role,
        }),
        isUserAllowedToUpdate() {
            return this.$hasAccess(['USER_UPDATE']);
        },
        isDisabled() {
            return Boolean(this.userID);
        },
        isDisabledByPrivileges() {
            return (this.isDisabled && !this.$hasAccess(['USER_UPDATE']))
            || (!this.isDisabled && !this.$hasAccess(['USER_CREATE']));
        },
        languageOptions() {
            return Object.values(this.languages);
        },
        errorEmailMessage() {
            const emailIndex = 'email';
            return this.elementIsValidate(emailIndex);
        },
        errorFirstNameMessage() {
            const firstNameIndex = 'firstName';
            return this.elementIsValidate(firstNameIndex);
        },
        errorLastNameMessage() {
            const lastNameIndex = 'lastName';
            return this.elementIsValidate(lastNameIndex);
        },
        errorPasswordMessage() {
            const passwordIndex = 'password';
            return this.elementIsValidate(passwordIndex);
        },
        errorPasswordRepeatMessage() {
            const passwordRepeatIndex = 'passwordRepeat';
            return this.elementIsValidate(passwordRepeatIndex);
        },
        errorLanguageMessage() {
            const languageIndex = 'language';
            return this.elementIsValidate(languageIndex);
        },
        errorRoleMessage() {
            const roleIndex = 'roleId';
            return this.elementIsValidate(roleIndex);
        },
    },
    methods: {
        ...mapActions('users', [
            'setAction',
        ]),
        onLanguageChange(language) {
            this.setAction({ key: 'language', value: language });
        },
        onRoleChange(role) {
            this.setAction({ key: 'role', value: role });
        },
        onStatusChange(isActive) {
            this.setAction({ key: 'isActive', value: isActive });
        },
    },
};
</script>

<style lang="scss" scoped>
    .horizontal-wrapper {
        display: flex;
        align-items: center;

        span {
            margin-left: 8px;
            color: $GRAPHITE_DARK;
        }
    }
</style>
