/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
import {
    getMappedGridConfiguration,
    getMappedCellValues,
    getMappedRowIds,
    getMappedColumn,
    getMappedColumns,
    getSortedColumnsByIDs,
    getMappedFilter,
} from '~/model/mappers/gridDataMapper';
import { swapItemPosition, insertValueAtIndex } from '~/model/arrayWrapper';
import { COLUMN_IDS } from '~/defaults/grid/cookies';
import { types } from './mutations';

export default {
    getData({ commit, state }, { path }) {
        const {
            columns: stateColumns,
            sortedByColumn,
            displayedPage,
            numberOfDisplayedElements,
            filter,
        } = state;
        const parsedFilter = getMappedFilter(filter);
        const isProductGrid = path.includes('products');
        const columnsID = isProductGrid
            ? this.$cookies.get(COLUMN_IDS) || stateColumns.map(col => col.id).join(',')
            : null;

        const params = {
            limit: numberOfDisplayedElements,
            offset: (displayedPage - 1) * numberOfDisplayedElements,
            columns: columnsID,
        };

        const isSorted = Object.keys(sortedByColumn).length;

        if (isSorted) {
            const { index, orderState } = sortedByColumn;

            params.field = index;
            params.order = orderState;
        }

        if (parsedFilter) {
            params.filter = parsedFilter;
        }

        return this.app.$axios.$get(path, { params }).then(({
            configuration, collection: rows, columns, info,
        }) => {
            const { count, filtered } = info;
            const columnsToMap = columnsID ? getSortedColumnsByIDs(columns, columnsID) : columns;
            const visibleColumns = columnsToMap.filter(col => col.visible);
            const { mappedColumns, pinnedColumns } = getMappedColumns(visibleColumns);
            const mappedConfiguration = getMappedGridConfiguration(configuration);

            this.$cookies.set(COLUMN_IDS, visibleColumns.map(col => col.id).join(','));

            const cellValues = getMappedCellValues(columns, rows);
            const rowIds = getMappedRowIds(rows);

            commit(types.SET_CONFIGURATION, mappedConfiguration);
            commit(types.SET_CELL_VALUES, cellValues);
            commit(types.SET_ROW_IDS, rowIds);
            commit(types.SET_COUNT, count);
            commit(types.SET_FILTERED, filtered);
            commit(types.SET_COLUMNS, mappedColumns);
            commit(types.SET_PINNED_COLUMNS, pinnedColumns);
        }).catch(err => console.log(err));
    },
    getColumnData({ commit, state }, {
        ghostIndex,
        columnId,
        path,
    }) {
        const {
            columns: stateColumns, displayedPage, numberOfDisplayedElements, sortedByColumn, filter,
        } = state;
        const stateColumnsID = stateColumns.filter(col => !(col.id.includes('extender') || col.id.includes('ghost'))).map(col => col.id);
        const parsedColumnsID = insertValueAtIndex(stateColumnsID, columnId, ghostIndex).join(',');
        const parsedFilter = getMappedFilter(filter);
        const params = {
            columns: parsedColumnsID,
            offset: (displayedPage - 1) * numberOfDisplayedElements,
            limit: numberOfDisplayedElements,
        };

        if (Object.keys(sortedByColumn).length) {
            const { index: colSortID, orderState } = sortedByColumn;

            params.field = colSortID;
            params.order = orderState;
        }

        if (parsedFilter) {
            params.filter = parsedFilter;
        }

        return this.app.$axios.$get(path, { params }).then(({
            collection: rows, columns,
        }) => {
            this.$cookies.set(COLUMN_IDS, parsedColumnsID);

            const draggedColumn = columns.find(col => col.id === columnId);
            let columnsWithoutGhost = stateColumns.filter(column => column.id !== 'ghost');

            columnsWithoutGhost = insertValueAtIndex(
                columnsWithoutGhost, getMappedColumn(draggedColumn), ghostIndex,
            );

            const cellValues = getMappedCellValues(columns, rows);
            const rowIds = getMappedRowIds(rows);

            commit(types.SET_COLUMNS, columnsWithoutGhost);
            commit(types.SET_CELL_VALUES, cellValues);
            commit(types.SET_ROW_IDS, rowIds);
        }).catch(err => console.log(err));
    },
    setGridData({ commit }, { columns, rows }) {
        const { mappedColumns } = getMappedColumns(columns, false);
        const cellValues = getMappedCellValues(columns, rows);
        const rowIds = getMappedRowIds(rows);

        commit(types.SET_COLUMNS, mappedColumns);
        commit(types.SET_CELL_VALUES, cellValues);
        commit(types.SET_ROW_IDS, rowIds);
    },
    setFilter({ commit, state }, { filter: filterToSet, id }) {
        // Remove selection on filter action
        commit(types.REMOVE_SELECTED_ROWS);
        commit(types.SET_SELECTION_FOR_ALL_ROWS, false);

        const isFilterExist = state.filter[id];

        if (!isFilterExist && !filterToSet) {
            return;
        }

        const isFilterToSetEmpty = filterToSet.length === 0;
        const removeFilterCondition = isFilterExist && isFilterToSetEmpty;

        if (removeFilterCondition) {
            commit(types.REMOVE_FILTER, id);
        } else {
            commit(types.SET_FILTER, { id, filter: filterToSet });
        }
    },
    setSortingState({ commit }, sortedColumn = {}) {
        commit(types.SET_SORTING_STATE, sortedColumn);
    },
    changeNumberOfDisplayingElements({ commit, state }, { number }) {
        commit(types.SET_NUMBER_OF_ELEMENTS_TO_DISPLAY, number);

        const { numberOfDisplayedElements, filtered, displayedPage } = state;

        if (numberOfDisplayedElements > filtered) {
            // We have only 1 page!
            commit(types.SET_CURRENT_PAGE, 1);
        } else {
            const page = Math.floor(filtered / numberOfDisplayedElements);
            commit(types.SET_CURRENT_PAGE, Math.min(page, displayedPage));
        }
    },
    updateColumnWidthAtIndex({ commit }, payload) {
        commit(types.SET_COLUMN_WIDTH_AT_INDEX, payload);
    },
    changeDisplayingPage({ commit }, page) {
        commit(types.SET_CURRENT_PAGE, page);
    },
    insertColumnAtIndex({ commit }, { column, index }) {
        commit(types.INSERT_COLUMN_AT_INDEX, { column, index });
    },
    removeColumnAtIndex({ commit }, { index }) {
        commit(types.REMOVE_COLUMN_AT_INDEX, index);
    },
    changeColumnPosition({ commit, state }, { from, to }) {
        const { columns } = state;
        const newOrderedColumns = [
            ...swapItemPosition(columns, from, to),
        ];
        const columnsWithoutExtender = newOrderedColumns.filter(column => column.id !== 'extender');
        this.$cookies.set(COLUMN_IDS, columnsWithoutExtender.map(column => column.id).join(','));

        commit(types.SET_COLUMNS, newOrderedColumns);
    },
    setEditingCellCoordinates({ commit }, editingCellCoordinates = {}) {
        commit(types.SET_EDITING_CELL_COORDINATES, editingCellCoordinates);
    },
    setSelectionForAllRows({ commit, state }, { isSelected }) {
        const { selectedRows } = state;
        const areSelectedRowsExist = Object.entries(selectedRows).length;

        if (areSelectedRowsExist) {
            commit(types.REMOVE_SELECTED_ROWS);
        } else {
            commit(types.SET_SELECTION_FOR_ALL_ROWS, isSelected);
        }
    },
    setSelectedRow({ commit, state }, { row, value }) {
        if (value) {
            commit(types.SET_SELECTED_ROW, row);
        } else {
            const { isSelectedAllRows, filtered } = state;

            commit(types.REMOVE_SELECTED_ROW, row);

            if (isSelectedAllRows) {
                // If we had chosen option with selected all of the options, we need to remove it
                // and mark visible rows as selected
                // +2 because we have 2 rows marked as a header and filter

                const rowsToSelect = {};

                for (let i = 2; i < filtered + 2; i += 1) {
                    if (i !== row) {
                        rowsToSelect[i] = true;
                    }
                }

                commit(types.SET_SELECTED_ROWS, rowsToSelect);
                commit(types.SET_SELECTION_FOR_ALL_ROWS, false);
            }
        }
    },
    addDraftToProduct({ commit, state }, { columnId, productId, value }) {
        const { columns } = state;
        const column = columns.find(col => col.id === columnId);
        let parsedValue = value;

        if (column.filter && column.filter.options) {
            const { options } = column.filter;

            if (Array.isArray(value)) {
                parsedValue = value.map(key => options[key] || 'No translation').join(', ');
            }
            if (typeof options[value] !== 'undefined') {
                parsedValue = options[value] || 'No translation';
            }
        }

        commit(types.ADD_PRODUCT_VALUE, {
            productId,
            columnId,
            value: parsedValue,
        });
    },
    addPinnedColumn({ commit, state }, column) {
        const { pinnedColumns } = state;
        const { length } = pinnedColumns;
        const [gridColumnToInsert] = column.position.split(' / ');

        for (let i = 0; i < length; i += 1) {
            const [gridColumn] = pinnedColumns[i].position.split(' / ');

            if (gridColumnToInsert < gridColumn) {
                commit(types.INSERT_PINNED_COLUMN_AT_INDEX, { index: i, column });
                break;
            }
        }
    },
    removePinnedColumn({ commit, state }, id) {
        const { pinnedColumns } = state;
        const index = pinnedColumns.findIndex(col => col.id === id);
        commit(types.REMOVE_PINNED_COLUMN_AT_INDEX, index);
    },
    updateRowValue({ commit }, payload) {
        commit(types.UPDATE_ROW_VALUE, payload);
    },
};
