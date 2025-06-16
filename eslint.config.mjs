import { fixupConfigRules, fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import _import from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
})

export default defineConfig([
    {
        extends: fixupConfigRules(
            compat.extends(
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended',
                'plugin:import/recommended',
                'plugin:import/typescript',
                'plugin:prettier/recommended'
            )
        ),

        plugins: {
            '@typescript-eslint': fixupPluginRules(typescriptEslint),
            import: fixupPluginRules(_import),
            prettier: fixupPluginRules(prettier)
        },

        languageOptions: {
            globals: {
                ...globals.node
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module'
        },

        settings: {
            'import/resolver': {
                node: {
                    extensions: ['.js', '.ts']
                },
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json'
                },
                alias: {
                    map: [
                        ['@', './src'],
                        ['@types', './types'],
                        ['@classes', './src/classes']
                    ],
                    extensions: ['.ts', '.js']
                }
            },

            'import/parsers': {
                '@typescript-eslint/parser': ['.ts', '.tsx']
            }
        },

        rules: {
            'import/no-unresolved': 'error',
            'prettier/prettier': [
                'error',
                {
                    semi: false,
                    tabWidth: 4,
                    singleQuote: true,
                    printWidth: 100,
                    trailingComma: 'none'
                }
            ],

            '@typescript-eslint/no-explicit-any': [
                'off',
                {
                    ignoreRestArgs: true
                }
            ],

            'import/extensions': ['error', 'ignorePackages', { ts: 'never', js: 'never' }],

            'arrow-spacing': [
                'warn',
                {
                    before: true,
                    after: true
                }
            ],

            'brace-style': [
                'error',
                '1tbs',
                {
                    allowSingleLine: true
                }
            ],

            'comma-dangle': 'off',
            'comma-spacing': 'error',
            'comma-style': 'error',
            curly: ['error', 'multi-line'],
            'dot-location': ['error', 'property'],
            'handle-callback-err': 'off',
            indent: 'off',
            'keyword-spacing': 'error',

            'max-nested-callbacks': [
                'error',
                {
                    max: 4
                }
            ],

            'max-statements-per-line': [
                'error',
                {
                    max: 2
                }
            ],

            'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
            'no-empty-function': 'off',
            'no-floating-decimal': 'error',
            'no-lonely-if': 'error',
            'no-multi-spaces': 'error',

            'no-multiple-empty-lines': [
                'error',
                {
                    max: 2,
                    maxEOF: 1,
                    maxBOF: 0
                }
            ],

            'no-shadow': 'off',
            '@typescript-eslint/no-shadow': ['warn'],

            'no-trailing-spaces': ['error'],
            'no-var': 'error',
            'object-curly-spacing': ['error', 'always'],
            'prefer-const': 'error',
            quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
            semi: ['error', 'never'],
            'space-before-blocks': 'error',
            '@typescript-eslint/no-unused-vars': 'off',
            /*'@typescript-eslint/no-non-null-assertion': 'warning', */

            'space-before-function-paren': 'off',

            'space-in-parens': 'error',
            'space-infix-ops': 'error',
            'space-unary-ops': 'error',
            'spaced-comment': 'error',
            yoda: 'error'
        }
    }
])
