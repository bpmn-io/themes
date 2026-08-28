import {
  CheckboxEntry,
  DropdownButton,
  ListEntry,
  SelectEntry,
  TextFieldEntry,
  ToggleSwitchEntry,
  TooltipEntry
} from '@bpmn-io/properties-panel';

import { h } from '@bpmn-io/properties-panel/preact';


const items = [
  {
    label: 'First value',
    value: 'first'
  },
  {
    label: 'Second value',
    value: 'second'
  }
];

const options = [
  {
    label: 'First option',
    value: 'first'
  },
  {
    label: 'Second option',
    value: 'second'
  }
];

const noOp = () => {};
const immediate = (fn) => fn;

export default {
  __init__: [ 'themeControlsProvider' ],
  themeControlsProvider: [ 'type', ThemeControlsProvider ]
};


function ThemeControlsProvider(propertiesPanel) {
  propertiesPanel.registerProvider(2000, this);
}

ThemeControlsProvider.$inject = [ 'propertiesPanel' ];

ThemeControlsProvider.prototype.getGroups = function() {
  return function(groups) {
    return [
      {
        id: 'theme-controls',
        label: 'Theme controls',
        open: true,
        entries: [
          {
            id: 'theme-focus',
            component: FocusText
          },
          {
            id: 'theme-error',
            component: ErrorText
          },
          {
            id: 'theme-warning',
            component: WarningText
          },
          {
            id: 'theme-badges',
            component: Badges
          },
          {
            id: 'theme-disabled',
            component: DisabledText
          },
          {
            id: 'theme-select',
            component: Select
          },
          {
            id: 'theme-checkbox',
            component: Checkbox
          },
          {
            id: 'theme-toggle',
            component: Toggle
          },
          {
            id: 'theme-tooltip',
            component: Tooltip
          },
          {
            id: 'theme-list',
            component: List
          },
          {
            id: 'theme-actions',
            component: Actions
          }
        ]
      },
      ...groups
    ];
  };
};

function FocusText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-focus',
    label: 'Focused text',
    debounce: immediate,
    getValue: () => 'Example value',
    setValue: noOp
  });
}

function ErrorText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-error',
    label: 'Invalid text',
    debounce: immediate,
    getValue: () => '',
    setValue: noOp,
    validate: () => 'A value is required.'
  });
}

// The base library ships the `has-warning` modifier and semantic list badges as
// CSS-only hooks (consumers such as linting integrations opt in), so we render
// the surfaces directly to exercise the warning/error/accent tokens.
function WarningText() {
  return h('div', {
    class: 'bio-properties-panel-entry has-warning',
    'data-entry-id': 'theme-warning'
  }, [
    h('div', { class: 'bio-properties-panel-textfield' }, [
      h('label', { class: 'bio-properties-panel-label' }, 'Warned text'),
      h('input', {
        class: 'bio-properties-panel-input',
        type: 'text',
        spellcheck: false,
        readOnly: true,
        value: 'Check this value'
      })
    ]),
    h('div', { class: 'bio-properties-panel-warning' }, 'This value may cause issues.')
  ]);
}

function Badges() {
  const badge = (variant, text) => h('span', {
    class: [ 'bio-properties-panel-list-badge', variant && `bio-properties-panel-list-badge--${variant}` ]
      .filter(Boolean)
      .join(' ')
  }, text);

  const dot = (variant) => h('span', {
    class: `bio-properties-panel-dot bio-properties-panel-dot--${variant}`
  });

  return h('div', {
    class: 'bio-properties-panel-entry',
    'data-entry-id': 'theme-badges'
  }, [
    h('div', { class: 'bio-properties-panel-label' }, 'Semantic badges'),
    h('div', {
      style: 'display: flex; align-items: center; flex-wrap: wrap; gap: 4px;'
    }, [
      badge(null, '5'),
      badge('accent', '3'),
      badge('warning', '2'),
      badge('error', '1'),
      dot('warning'),
      dot('error')
    ])
  ]);
}

function DisabledText(props) {
  return TextFieldEntry({
    ...props,
    id: 'theme-disabled',
    label: 'Disabled text',
    debounce: immediate,
    disabled: true,
    getValue: () => 'Unavailable',
    setValue: noOp
  });
}

function Select(props) {
  return SelectEntry({
    ...props,
    id: 'theme-select',
    label: 'Select value',
    getValue: () => 'first',
    setValue: noOp,
    getOptions: () => options
  });
}

function Checkbox(props) {
  return CheckboxEntry({
    ...props,
    id: 'theme-checkbox',
    label: 'Checked checkbox',
    getValue: () => true,
    setValue: noOp
  });
}

function Toggle(props) {
  return ToggleSwitchEntry({
    ...props,
    id: 'theme-toggle',
    label: 'Enabled toggle',
    switcherLabel: 'Enable themed controls',
    getValue: () => true,
    setValue: noOp
  });
}

function Tooltip() {
  return h('div', {
    class: 'bio-properties-panel-entry',
    'data-entry-id': 'theme-tooltip'
  }, h(TooltipEntry, {
    forId: 'theme-tooltip',
    value: 'Themed tooltip content.'
  }, h('span', {
    'data-theme-tooltip': true
  }, 'Tooltip content')));
}

function List(props) {
  return ListEntry({
    ...props,
    id: 'theme-list',
    label: 'List values',
    items,
    open: true,
    component: ListItem,
    onAdd: noOp,
    onRemove: noOp
  });
}

function ListItem(props) {
  const {
    id,
    index,
    item
  } = props;

  return TextFieldEntry({
    ...props,
    id: `${id}-${index}`,
    label: item.label,
    debounce: immediate,
    getValue: () => item.value,
    setValue: noOp
  });
}

function Actions() {
  return h('div', {
    class: 'bio-properties-panel-entry',
    'data-entry-id': 'theme-actions'
  }, h(DropdownButton, {
    menuItems: [
      {
        entry: 'First action',
        action: noOp
      },
      {
        separator: true
      },
      {
        entry: 'Second action',
        action: noOp
      }
    ]
  }, h('button', {
    class: 'bio-properties-panel-group-header-button bio-properties-panel-focus-ring',
    type: 'button'
  }, 'Actions')));
}
