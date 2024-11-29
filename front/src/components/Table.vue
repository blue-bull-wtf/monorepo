<template lang="pug">
table.mono(:class="tableClasses")
  thead
    tr
      th.py-1.cursor-pointer(v-for="(header, index) in headers" :key="index"
        :style="{ width: `${widths[index]}px` }"
        @click="sortColumn(index)")
        span.flex-h.y-center.g-2 {{ header }}
          template(v-if="sort?.column === index && headers[index]")
            template(v-if="sort.direction === 1")
              Svg.w-3.b3(icon="down")
            template(v-else)
              Svg.w-3.b3(icon="up")

  tbody
    template(v-for="i in sort?.mask" :key="i")
      tr(
        :class="{ 'active': activeTr === i}"
        :data-key="keys?.[i]"
        @mouseover="trHover(formattedRows[i], i, keys?.[i])"
        @mouseleave="trLeave(formattedRows[i], i, keys?.[i])"
      )
        td.align-middle(v-for="(cell, cellIndex) in formattedRows[i]" :key="cell")
          a.flex.tooltip(v-if="columnTypes?.[cellIndex] === 'link'" class="link" :href="cell.href" :data-tooltip="cell.href")
            | {{ cell.text }}
            Svg.b3.pl-2(icon="icons/to-top-right")
          span.content(v-else-if="columnTypes?.[cellIndex] === 'html'" v-html="cell")
          template(v-else-if="columnTypes?.[cellIndex] === 'image'")
            .py-1
              img.w-6.rounded-full.bordered.thick(v-if="cell.startsWith('data:image')" :src="cell")
              span.w-6.border-box.flex.round.bordered.thick(v-else v-html="cell")
          span(v-else) {{ cell }}
</template>

<script lang="ts">
import { computed, defineComponent, ref, toRefs } from 'vue';
import { DEFAULT_FORMATTER_BY_TYPE } from '../../../common/utils/format';
import { merge } from '../../../common/utils/reflexion';
import { ITable, ITableCellValue, Sort } from '../models/types';

const copyNotify = () => {
  // TODO: implement toast with copy notification
}

export default defineComponent({
  components: {},
  props: {
    table: {
      type: Object as () => ITable,
      required: true,
    },
    hoverable: {
      type: Boolean,
      default: true,
    },
    striped: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, context) {
    const { hoverable, striped } = toRefs(props);

    const tableClasses = computed(() => {
      const classes: string[] = ['table'];
      if (hoverable.value) classes.push('hoverable');
      if (striped.value) classes.push('striped');
      return classes;
    });

    const table = ref<ITable>(props.table);
    const headers = ref<string[]>(table.value.headers);
    const keys = ref<string[]>(table.value.keys || []);
    const activeTr = ref<number | null>(null);
    const widths = ref<number[]>(table.value.widths || []);
    const formattedRows = ref<any[]>(table.value.columns ?? []);
    const sort = ref<Sort>(
      merge(
        {
          mask: formattedRows.value.map((_, index) => index),
          get: (row: number) => formattedRows.value[row!],
          column: 1,
          direction: 1,
        },
        table.value.sort,
      ),
    );

    const columnTypes = ref(table.value.types);

    const formatCell = (cell: any, columnIndex: number) => {
      const formatter =
        table.value.formatters?.[columnIndex] ?? DEFAULT_FORMATTER_BY_TYPE?.[table.value.types![columnIndex]];
      return formatter ? formatter(cell) : cell;
    };

    const updateTableRows = (options: ITable | null = null) => {
      if (options) {
        table.value = options;
        headers.value = options.headers;
        keys.value = options.keys || [];
      }

      if (table.value.columns && table.value.columns[0]) {
        const rowCount = table.value.columns[0]!.values.length;
        table.value.rows = new Array(rowCount) as ITableCellValue[];
        for (const i in table.value.columns[0]!.values) {
          table.value.rows[i] = table.value.columns.map((column) => column.values[i]);
        }
      } else if (!table.value.rows) {
        throw new Error('Table must have either columns or rows');
      }

      // TODO: optimize/simplify
      formattedRows.value = table.value.rows.map((row: any) => {
        if (typeof row === 'object') {
          const { _key, formatter, ...rest } = row;
          keys.value.push(_key);
          row = Object.values(rest);
        }
        return row.map((cell: any, columnIndex: number) => formatCell(cell, columnIndex));
      });
      sort.value.mask = formattedRows.value.map((_, index) => index);
    };

    updateTableRows();
    const sortColumn = (columnIndex: number) => {
      sort.value ??= {
        mask: formattedRows.value.map((_, index) => index),
        get: (row: number) => {
          return formattedRows.value[sort.value?.mask[row!]!];
        },
      } as Sort;
      if (sort.value.column === columnIndex) {
        sort.value!.direction! *= -1;
      } else {
        sort.value.column = columnIndex;
        sort.value.direction = 1;
      }

      sort.value.mask.sort((a, b) => {
        const rowType = typeof table.value.rows![a];

        let rowA: ITableCellValue[], rowB: ITableCellValue[];
        if (rowType === 'object') {
          const { _key, ...restA } = table.value.rows![a] as any;
          const { _key: _key2, ...restB } = table.value.rows![b] as any;
          rowA = Object.values(restA) as ITableCellValue[];
          rowB = Object.values(restB) as ITableCellValue[];
        } else {
          rowA = table.value.rows![a] as ITableCellValue[];
          rowB = table.value.rows![b] as ITableCellValue[];
        }

        const valueA: any = rowA[columnIndex];
        const valueB: any = rowB[columnIndex];
        return sort.value!.direction! * (valueA < valueB ? -1 : valueA > valueB ? 1 : 0);
      });

      return sort.value;
    };

    const active = (index: number) => {
      return (activeTr.value = index);
    };

    const clearActive = () => {
      activeTr.value = null;
    };
    const activeByKey = (key: string) => {
      const index = keys.value.indexOf(key);
      if (undefined === index) return;
      active(index);
    };

    const trHover = (row: any, index: any, key: any) => {
      context.emit('tr-hover', key, row);
      active(index);
    };
    const trLeave = (row: any, index: any, key: any) => {
      context.emit('tr-leave', key, row);
      clearActive();
    };

    return {
      table,
      tableClasses,
      formattedRows,
      headers,
      widths,
      keys,
      sort,
      activeTr,
      columnTypes,
      active,
      trHover,
      clearActive,
      activeByKey,
      updateTableRows,
      trLeave,
      sortColumn,
      copyNotify,
    };
  },
});
</script>

<style lang="postcss" scoped>
.table {
  background-color: transparent;
  border-collapse: collapse;
  border-spacing: 0;
  width: 100%;

  text-align: left;

  &.rtl {
    text-align: right;
  }

  td,
  th {
    padding: var(--unit-1) var(--unit-2);
    height: var(--unit-6);
    line-height: var(--unit-6);
    border-bottom: .02rem solid var(--grey);
    /* border-bottom-width: $border-width-l; */
  }

  &.hoverable {
    tbody {
      tr {
        &:hover {
          /* background-color: var(--dark-grey); */
        }
      }
    }
  }

  &.scrollable {
    display: block;
    overflow-x: auto;
    padding-bottom: .75rem;
    white-space: nowrap;
  }

  &.striped {
    tbody {
      tr:nth-of-type(odd) {
        background-color: var(--bg-3);
      }

      tr {
        &.active {
          background-color: var(--bg-3);
        }
      }
    }

    td,
    th {
      border-bottom: none;
    }
  }
}
</style>
